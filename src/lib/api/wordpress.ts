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
} from "@/types";
import { createApiError } from "@/types";

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
 * 외부 이미지 URL에서 이미지 데이터 가져오기
 */
async function fetchImageAsBuffer(imageUrl: string): Promise<{
  buffer: Buffer;
  contentType: string;
}> {
  const response = await axios.get(imageUrl, {
    responseType: "arraybuffer",
    timeout: 30000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  const contentType = response.headers["content-type"] || "image/jpeg";
  return {
    buffer: Buffer.from(response.data),
    contentType,
  };
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
 * 전체 상품 이미지를 워드프레스에 업로드
 * 첫 번째 이미지는 Featured Image로 사용
 */
export async function uploadProductImages(
  config: WordPressConfig,
  products: CoupangProduct[]
): Promise<{ featuredMediaId: number | null; uploadedImages: UploadedImage[] }> {
  const uploadedImages: UploadedImage[] = [];
  let featuredMediaId: number | null = null;

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

      // 첫 번째 이미지를 Featured Image로 설정
      if (i === 0) {
        featuredMediaId = result.id;
      }

      // 요청 간 딜레이 (API 부하 방지)
      if (i < products.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      // 상세 에러 로깅
      if (axios.isAxiosError(error)) {
        console.error(`Failed to upload image for product ${product.productId}:`, {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          imageUrl: product.productImage.substring(0, 100) + '...',
        });
      } else {
        console.error(`Failed to upload image for product ${product.productId}:`, error);
      }
      // 개별 이미지 업로드 실패 시 계속 진행
    }
  }

  return { featuredMediaId, uploadedImages };
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
  ): Promise<{ featuredMediaId: number | null; uploadedImages: UploadedImage[] }> {
    return uploadProductImages(this.config, products);
  }

  async testConnection(): Promise<boolean> {
    return testWordPressConnection(this.config);
  }
}

export default WordPressApiClient;
