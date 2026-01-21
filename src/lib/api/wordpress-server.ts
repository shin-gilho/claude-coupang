/**
 * 워드프레스 서버 사이드 전용 기능
 * 주의: 이 파일은 API Route에서만 import해야 합니다.
 * Sharp 라이브러리를 사용하므로 클라이언트 번들에 포함되면 빌드 에러가 발생합니다.
 */

import axios from "axios";
import type {
  WordPressConfig,
  WordPressMediaResponse,
  CoupangProduct,
  ImageUploadError,
  ImageUploadErrorCode,
  ImageUploadResult,
  UploadedImage,
} from "@/types";
import { createApiError } from "@/types";
import {
  IMAGE_UPLOAD_SETTINGS,
  COUPANG_IMAGE_HEADERS,
  IMAGE_COMPRESSION_SETTINGS,
} from "@/constants/config";
import { compressImage, updateFilenameExtension } from "@/lib/image";

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
      maxRedirects: 5,
    });

    const buffer = Buffer.from(response.data);

    // 이미지 유효성 검사
    const validation = validateImageBuffer(buffer);
    if (!validation.valid) {
      throw new Error("유효하지 않은 이미지 데이터입니다.");
    }

    const contentType = validation.detectedType ||
      response.headers["content-type"] ||
      "image/jpeg";

    return { buffer, contentType };
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount);
      console.log(`Image fetch failed, retrying in ${delayMs}ms (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
      await delay(delayMs);
      return fetchImageAsBuffer(imageUrl, retryCount + 1);
    }
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
  const safeName = productName
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 20) || "product";
  const timestamp = Date.now();
  return `${safeName}-${index + 1}-${timestamp}.${extension}`;
}

/**
 * 단일 이미지를 워드프레스에 업로드 (압축 포함)
 * 서버 사이드 전용 - Sharp 라이브러리 사용
 */
export async function uploadImageWithCompression(
  config: WordPressConfig,
  imageUrl: string,
  filename: string,
  altText: string
): Promise<WordPressMediaResponse> {
  const mediaUrl = `${config.url.replace(/\/$/, "")}/wp-json/wp/v2/media`;

  try {
    // 이미지 데이터 가져오기
    const { buffer } = await fetchImageAsBuffer(imageUrl);

    // 이미지 압축 (WebP 변환 포함)
    const compressed = await compressImage(buffer);

    // 파일명 확장자 업데이트 (WebP 변환된 경우)
    let uploadFilename = filename;
    if (IMAGE_COMPRESSION_SETTINGS.CONVERT_TO_WEBP) {
      uploadFilename = updateFilenameExtension(filename, compressed.format);
    }

    // 워드프레스에 업로드
    const response = await axios.post(mediaUrl, compressed.buffer, {
      headers: {
        Authorization: createAuthHeader(
          config.username,
          config.applicationPassword
        ),
        "Content-Type": compressed.contentType,
        "Content-Disposition": `attachment; filename="${uploadFilename}"`,
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
 * 전체 상품 이미지를 워드프레스에 업로드 (압축 포함)
 * 첫 번째 이미지는 Featured Image로 사용
 * 서버 사이드 전용 - Sharp 라이브러리 사용
 */
export async function uploadProductImagesWithCompression(
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

      const result = await uploadImageWithCompression(
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

      console.error(`Failed to upload image for product ${product.productId}:`, {
        errorCode,
        errorMessage,
        imageUrl: product.productImage.substring(0, 100) + "...",
      });

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
