/**
 * 워드프레스 REST API 클라이언트
 */

import axios from "axios";
import type {
  WordPressConfig,
  WordPressPost,
  WordPressPostResponse,
  WordPressMediaResponse,
  UploadedImage,
  BlogPost,
  CoupangProduct,
  ImageUploadError,
  ImageUploadErrorCode,
  ImageUploadResult,
} from "@/types";
import { createApiError } from "@/types";
import {
  IMAGE_UPLOAD_SETTINGS,
  COUPANG_IMAGE_HEADERS,
} from "@/constants/config";

/**
 * Basic Auth 헤더 생성
 */
function createAuthHeader(username: string, applicationPassword: string): string {
  const credentials = Buffer.from(`${username}:${applicationPassword}`).toString(
    "base64"
  );
  return `Basic ${credentials}`;
}

/**
 * 워드프레스에 포스트 생성
 */
export async function createWordPressPost(
  config: WordPressConfig,
  post: WordPressPost
): Promise<WordPressPostResponse> {
  const url = `${config.url.replace(/\/$/, "")}/wp-json/wp/v2/posts`;

  try {
    const postData: Record<string, unknown> = {
      title: post.title,
      content: post.content,
      status: post.status,
      date: post.date,
      meta: post.meta,
    };

    // featured_media가 있으면 추가
    if (post.featured_media) {
      postData.featured_media = post.featured_media;
    }

    const response = await axios.post(url, postData, {
      headers: {
        Authorization: createAuthHeader(
          config.username,
          config.applicationPassword
        ),
        "Content-Type": "application/json",
      },
    });

    return {
      id: response.data.id,
      link: response.data.link,
      date: response.data.date,
      status: response.data.status,
      title: response.data.title,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "워드프레스 포스트 생성에 실패했습니다.";
      throw createApiError(
        "WORDPRESS_API_ERROR",
        message,
        error.response?.status
      );
    }
    throw error;
  }
}

/**
 * BlogPost를 WordPressPost로 변환
 */
export function prepareWordPressPost(
  blogPost: BlogPost,
  scheduledDate: Date,
  featuredMediaId?: number
): WordPressPost {
  const post: WordPressPost = {
    title: blogPost.title,
    content: blogPost.content,
    status: "future",
    date: scheduledDate.toISOString(),
    meta: {
      rank_math_focus_keyword: blogPost.focusKeyword,
      rank_math_description: blogPost.metaDescription,
    },
  };

  if (featuredMediaId) {
    post.featured_media = featuredMediaId;
  }

  return post;
}

/**
 * 워드프레스 연결 테스트
 */
export async function testWordPressConnection(
  config: WordPressConfig
): Promise<boolean> {
  const url = `${config.url.replace(/\/$/, "")}/wp-json/wp/v2/users/me`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: createAuthHeader(
          config.username,
          config.applicationPassword
        ),
      },
    });

    return response.status === 200;
  } catch {
    return false;
  }
}

/**
 * 이미지 버퍼의 유효성 검사 (magic bytes 체크)
 */
function validateImageBuffer(buffer: Buffer): { valid: boolean; detectedType: string | null } {
  if (buffer.length < 4) {
    return { valid: false, detectedType: null };
  }

  const bytes = Array.from(buffer.subarray(0, 12));
  const { MAGIC_BYTES } = IMAGE_UPLOAD_SETTINGS;

  // JPEG 체크
  if (
    bytes[0] === MAGIC_BYTES.JPEG[0] &&
    bytes[1] === MAGIC_BYTES.JPEG[1] &&
    bytes[2] === MAGIC_BYTES.JPEG[2]
  ) {
    return { valid: true, detectedType: "image/jpeg" };
  }

  // PNG 체크
  if (
    bytes[0] === MAGIC_BYTES.PNG[0] &&
    bytes[1] === MAGIC_BYTES.PNG[1] &&
    bytes[2] === MAGIC_BYTES.PNG[2] &&
    bytes[3] === MAGIC_BYTES.PNG[3]
  ) {
    return { valid: true, detectedType: "image/png" };
  }

  // GIF 체크
  if (
    bytes[0] === MAGIC_BYTES.GIF[0] &&
    bytes[1] === MAGIC_BYTES.GIF[1] &&
    bytes[2] === MAGIC_BYTES.GIF[2]
  ) {
    return { valid: true, detectedType: "image/gif" };
  }

  // WebP 체크 (RIFF....WEBP)
  if (
    bytes[0] === MAGIC_BYTES.WEBP_RIFF[0] &&
    bytes[1] === MAGIC_BYTES.WEBP_RIFF[1] &&
    bytes[2] === MAGIC_BYTES.WEBP_RIFF[2] &&
    bytes[3] === MAGIC_BYTES.WEBP_RIFF[3] &&
    bytes[8] === 0x57 && // W
    bytes[9] === 0x45 && // E
    bytes[10] === 0x42 && // B
    bytes[11] === 0x50    // P
  ) {
    return { valid: true, detectedType: "image/webp" };
  }

  return { valid: false, detectedType: null };
}

/**
 * 지연 함수 (지수 백오프용)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 외부 이미지 URL에서 이미지 데이터 가져오기 (재시도 로직 포함)
 */
async function fetchImageAsBuffer(
  imageUrl: string,
  retryCount = 0
): Promise<{
  buffer: Buffer;
  contentType: string;
}> {
  const { MAX_RETRIES, INITIAL_RETRY_DELAY_MS, FETCH_TIMEOUT_MS } = IMAGE_UPLOAD_SETTINGS;

  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: FETCH_TIMEOUT_MS,
      headers: COUPANG_IMAGE_HEADERS,
      // 리다이렉트 허용
      maxRedirects: 5,
    });

    const buffer = Buffer.from(response.data);

    // 이미지 유효성 검사
    const validation = validateImageBuffer(buffer);
    if (!validation.valid) {
      throw new Error("유효하지 않은 이미지 데이터입니다.");
    }

    // Content-Type이 없거나 잘못된 경우 감지된 타입 사용
    const contentType = validation.detectedType ||
      response.headers["content-type"] ||
      "image/jpeg";

    return { buffer, contentType };
  } catch (error) {
    // 재시도 가능한 경우
    if (retryCount < MAX_RETRIES) {
      const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount);
      console.log(`Image fetch failed, retrying in ${delayMs}ms (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
      await delay(delayMs);
      return fetchImageAsBuffer(imageUrl, retryCount + 1);
    }

    // 최대 재시도 횟수 초과
    throw error;
  }
}

/**
 * 파일 확장자 추출
 */
function getExtensionFromUrl(url: string): string {
  const match = url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
  return match ? match[1].toLowerCase() : "jpg";
}

/**
 * 이미지 파일명 생성 (ASCII만 사용)
 */
function generateImageFilename(
  productName: string,
  index: number,
  extension: string
): string {
  // 한글/특수문자 제거하고 영문+숫자만 남기기
  const safeName = productName
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 20) || "product";
  const timestamp = Date.now();
  return `${safeName}-${index + 1}-${timestamp}.${extension}`;
}

/**
 * 단일 이미지를 워드프레스에 업로드
 * 이미지 압축은 API Route에서 별도로 처리해야 합니다.
 */
export async function uploadImageToWordPress(
  config: WordPressConfig,
  imageUrl: string,
  filename: string,
  altText: string
): Promise<WordPressMediaResponse> {
  const mediaUrl = `${config.url.replace(/\/$/, "")}/wp-json/wp/v2/media`;

  try {
    // 이미지 데이터 가져오기
    const { buffer, contentType } = await fetchImageAsBuffer(imageUrl);

    // 워드프레스에 업로드
    const response = await axios.post(mediaUrl, buffer, {
      headers: {
        Authorization: createAuthHeader(
          config.username,
          config.applicationPassword
        ),
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

    // alt 텍스트 업데이트
    if (response.data.id) {
      await axios.post(
        `${mediaUrl}/${response.data.id}`,
        { alt_text: altText },
        {
          headers: {
            Authorization: createAuthHeader(
              config.username,
              config.applicationPassword
            ),
            "Content-Type": "application/json",
          },
        }
      );
    }

    return {
      id: response.data.id,
      source_url: response.data.source_url,
      title: response.data.title,
      alt_text: altText,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "이미지 업로드에 실패했습니다.";
      throw createApiError(
        "WORDPRESS_API_ERROR",
        message,
        error.response?.status
      );
    }
    throw error;
  }
}

/**
 * 에러에서 에러 코드 추출
 */
function getErrorCode(error: unknown): ImageUploadErrorCode {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return "TIMEOUT";
    }
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      return "NETWORK_ERROR";
    }
    if (error.response?.status) {
      return "UPLOAD_FAILED";
    }
    return "FETCH_FAILED";
  }
  if (error instanceof Error && error.message.includes("유효하지 않은 이미지")) {
    return "INVALID_IMAGE";
  }
  return "FETCH_FAILED";
}

/**
 * 전체 상품 이미지를 워드프레스에 업로드
 * 첫 번째 이미지는 Featured Image로 사용
 * 실패한 이미지에 대한 상세 에러 정보도 반환
 */
export async function uploadProductImages(
  config: WordPressConfig,
  products: CoupangProduct[]
): Promise<ImageUploadResult> {
  const uploadedImages: UploadedImage[] = [];
  const failedImages: ImageUploadError[] = [];
  let featuredMediaId: number | null = null;
  const { UPLOAD_DELAY_MS, MAX_RETRIES } = IMAGE_UPLOAD_SETTINGS;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    try {
      const extension = getExtensionFromUrl(product.productImage);
      const filename = generateImageFilename(product.productName, i, extension);

      const result = await uploadImageToWordPress(
        config,
        product.productImage,
        filename,
        product.productName
      );

      uploadedImages.push({
        productId: product.productId,
        mediaId: result.id,
        sourceUrl: result.source_url,
      });

      // 첫 번째 성공 이미지를 Featured Image로 설정
      if (featuredMediaId === null) {
        featuredMediaId = result.id;
      }

      // 요청 간 딜레이 (API 부하 방지)
      if (i < products.length - 1) {
        await delay(UPLOAD_DELAY_MS);
      }
    } catch (error) {
      const errorCode = getErrorCode(error);
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";

      // 상세 에러 로깅
      console.error(`Failed to upload image for product ${product.productId}:`, {
        errorCode,
        errorMessage,
        imageUrl: product.productImage.substring(0, 100) + "...",
      });

      // 실패 정보 기록
      failedImages.push({
        productId: product.productId,
        imageUrl: product.productImage,
        errorCode,
        errorMessage,
        retryCount: MAX_RETRIES,
      });
    }
  }

  return {
    featuredMediaId,
    uploadedImages,
    failedImages,
    totalCount: products.length,
    successCount: uploadedImages.length,
    failedCount: failedImages.length,
  };
}

/**
 * 블로그 콘텐츠 내 이미지 URL을 업로드된 URL로 교체
 */
export function replaceImageUrls(
  content: string,
  products: CoupangProduct[],
  uploadedImages: UploadedImage[]
): string {
  let updatedContent = content;

  for (const uploaded of uploadedImages) {
    const product = products.find((p) => p.productId === uploaded.productId);
    if (product) {
      // 원본 이미지 URL을 업로드된 URL로 교체
      updatedContent = updatedContent.replace(
        new RegExp(escapeRegExp(product.productImage), "g"),
        uploaded.sourceUrl
      );
    }
  }

  return updatedContent;
}

/**
 * 정규식 특수문자 이스케이프
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 콘텐츠에서 업로드 실패한 이미지의 img 태그 제거
 * 외부 URL을 사용하는 이미지를 제거하여 핫링크 문제 방지
 */
export function removeFailedImageTags(
  content: string,
  products: CoupangProduct[],
  uploadedImages: UploadedImage[]
): string {
  let updatedContent = content;
  const uploadedProductIds = new Set(uploadedImages.map((img) => img.productId));

  for (const product of products) {
    // 이미 업로드 성공한 이미지는 건너뛰기
    if (uploadedProductIds.has(product.productId)) {
      continue;
    }

    // 이 상품의 이미지를 포함하는 img 태그 제거
    const imageUrl = escapeRegExp(product.productImage);

    // <img ... src="이미지URL" ... /> 형태 제거
    const imgTagRegex = new RegExp(
      `<img[^>]*src=["']${imageUrl}["'][^>]*\\/?>`,
      "gi"
    );
    updatedContent = updatedContent.replace(imgTagRegex, "");

    // <figure>...</figure> 내 img 태그도 제거 (figure 전체 제거)
    const figureRegex = new RegExp(
      `<figure[^>]*>[\\s\\S]*?<img[^>]*src=["']${imageUrl}["'][^>]*\\/?>[\\s\\S]*?<\\/figure>`,
      "gi"
    );
    updatedContent = updatedContent.replace(figureRegex, "");
  }

  // 빈 p 태그 정리 (이미지 제거 후 남은 빈 태그)
  updatedContent = updatedContent.replace(/<p>\s*<\/p>/gi, "");

  return updatedContent;
}

/**
 * 상품 테이블에서 업로드 실패한 이미지 셀 처리
 * 이미지 셀을 제거하거나 텍스트로 대체
 */
export function removeFailedImagesFromTable(
  content: string,
  products: CoupangProduct[],
  uploadedImages: UploadedImage[]
): string {
  let updatedContent = content;
  const uploadedProductIds = new Set(uploadedImages.map((img) => img.productId));

  for (const product of products) {
    // 이미 업로드 성공한 이미지는 건너뛰기
    if (uploadedProductIds.has(product.productId)) {
      continue;
    }

    const imageUrl = escapeRegExp(product.productImage);

    // 테이블 내 이미지 셀을 "이미지 없음" 텍스트로 대체
    const tableCellWithImgRegex = new RegExp(
      `<td[^>]*>[\\s\\S]*?<img[^>]*src=["']${imageUrl}["'][^>]*\\/?>\\s*<\\/td>`,
      "gi"
    );
    updatedContent = updatedContent.replace(
      tableCellWithImgRegex,
      '<td style="padding:12px;text-align:center;vertical-align:middle;border-bottom:1px solid #eee;color:#999;">-</td>'
    );
  }

  return updatedContent;
}

/**
 * 모든 외부 이미지 태그 제거 (업로드되지 않은 모든 외부 이미지)
 * 워드프레스에서 핫링크 방지로 표시되지 않는 문제 해결
 */
export function removeAllExternalImages(content: string): string {
  let updatedContent = content;

  // coupang.com 도메인 이미지 태그 제거
  const coupangImgRegex = /<img[^>]*src=["'][^"']*coupang\.com[^"']*["'][^>]*\/?>/gi;
  updatedContent = updatedContent.replace(coupangImgRegex, "");

  // figure 내 coupang 이미지도 제거
  const coupangFigureRegex = /<figure[^>]*>[\s\S]*?<img[^>]*src=["'][^"']*coupang\.com[^"']*["'][^>]*\/?>[\s\S]*?<\/figure>/gi;
  updatedContent = updatedContent.replace(coupangFigureRegex, "");

  // 테이블 내 coupang 이미지 셀 처리
  const coupangTableCellRegex = /<td[^>]*>[\s\S]*?<img[^>]*src=["'][^"']*coupang\.com[^"']*["'][^>]*\/?>[\s\S]*?<\/td>/gi;
  updatedContent = updatedContent.replace(
    coupangTableCellRegex,
    '<td style="padding:12px;text-align:center;vertical-align:middle;border-bottom:1px solid #eee;color:#999;">-</td>'
  );

  // 빈 p 태그 정리
  updatedContent = updatedContent.replace(/<p>\s*<\/p>/gi, "");

  return updatedContent;
}

/**
 * 워드프레스 API 클라이언트 클래스
 */
export class WordPressApiClient {
  private config: WordPressConfig;

  constructor(config: WordPressConfig) {
    this.config = config;
  }

  async createPost(post: WordPressPost): Promise<WordPressPostResponse> {
    return createWordPressPost(this.config, post);
  }

  async publishBlogPost(
    blogPost: BlogPost,
    scheduledDate: Date,
    featuredMediaId?: number
  ): Promise<WordPressPostResponse> {
    const wpPost = prepareWordPressPost(blogPost, scheduledDate, featuredMediaId);
    return this.createPost(wpPost);
  }

  async uploadImage(
    imageUrl: string,
    filename: string,
    altText: string
  ): Promise<WordPressMediaResponse> {
    return uploadImageToWordPress(this.config, imageUrl, filename, altText);
  }

  async uploadProductImages(
    products: CoupangProduct[]
  ): Promise<ImageUploadResult> {
    return uploadProductImages(this.config, products);
  }

  async testConnection(): Promise<boolean> {
    return testWordPressConnection(this.config);
  }
}

export default WordPressApiClient;
