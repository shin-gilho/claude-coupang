import type { CoupangProduct } from "./product";

/**
 * AI가 생성한 블로그 포스트
 */
export interface BlogPost {
  title: string;
  content: string; // HTML
  focusKeyword: string;
  metaDescription: string;
  products: CoupangProduct[];
  keyword: string;
}

/**
 * 워드프레스 포스트 발행 상태
 */
export type WordPressPostStatus = "future" | "publish" | "draft" | "pending";

/**
 * Rank Math SEO 메타데이터
 */
export interface RankMathMeta {
  rank_math_focus_keyword: string;
  rank_math_description: string;
}

/**
 * 워드프레스에 업로드할 포스트 데이터
 */
export interface WordPressPost {
  title: string;
  content: string;
  status: WordPressPostStatus;
  date: string; // ISO 8601 format
  meta: RankMathMeta;
  featured_media?: number; // 대표 이미지 미디어 ID
}

/**
 * 워드프레스 API 응답
 */
export interface WordPressPostResponse {
  id: number;
  link: string;
  date: string;
  status: string;
  title: {
    rendered: string;
  };
}

/**
 * 워드프레스 미디어 업로드 응답
 */
export interface WordPressMediaResponse {
  id: number;
  source_url: string;
  title: {
    rendered: string;
  };
  alt_text: string;
}

/**
 * 업로드된 이미지 정보
 */
export interface UploadedImage {
  productId: string;
  mediaId: number;
  sourceUrl: string;
}

/**
 * 이미지 업로드 에러 정보
 */
export interface ImageUploadError {
  productId: string;
  imageUrl: string;
  errorCode: ImageUploadErrorCode;
  errorMessage: string;
  retryCount: number;
}

/**
 * 이미지 업로드 에러 코드
 */
export type ImageUploadErrorCode =
  | "FETCH_FAILED"         // 이미지 다운로드 실패
  | "INVALID_IMAGE"        // 유효하지 않은 이미지 데이터
  | "UPLOAD_FAILED"        // 워드프레스 업로드 실패
  | "TIMEOUT"              // 타임아웃
  | "NETWORK_ERROR";       // 네트워크 에러

/**
 * 이미지 업로드 결과 (통계 포함)
 */
export interface ImageUploadResult {
  featuredMediaId: number | null;
  uploadedImages: UploadedImage[];
  failedImages: ImageUploadError[];
  totalCount: number;
  successCount: number;
  failedCount: number;
}

/**
 * 이미지 압축 결과
 */
export interface ImageCompressionResult {
  buffer: Buffer;
  format: string;         // "webp" | "jpeg" | "png"
  contentType: string;    // MIME type (예: "image/webp")
  originalSize: number;   // 원본 크기 (bytes)
  compressedSize: number; // 압축 후 크기 (bytes)
  width: number;          // 결과 너비
  height: number;         // 결과 높이
}
