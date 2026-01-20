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
