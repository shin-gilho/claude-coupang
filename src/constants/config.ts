/**
 * 애플리케이션 설정 상수
 */

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  API_KEYS: "coupang-blog-api-keys",
  PUBLISH_SETTINGS: "coupang-blog-publish-settings",
  LAST_USED_AI: "coupang-blog-last-ai",
} as const;

// 기본 발행 설정
export const DEFAULT_PUBLISH_SETTINGS = {
  intervalMinutes: 10,
  startTime: "09:00",
  endTime: "18:00",
} as const;

// API 엔드포인트
export const API_ENDPOINTS = {
  COUPANG: "https://api-gateway.coupang.com",
  CLAUDE: "https://api.anthropic.com",
  GEMINI: "https://generativelanguage.googleapis.com",
} as const;

// 상품 검색 설정
export const PRODUCT_SEARCH_SETTINGS = {
  LIMIT: 5,
  SORT_BY: "RATING", // 평점순
} as const;

// AI 모델 설정
export const AI_MODEL_SETTINGS = {
  CLAUDE: {
    model: "claude-sonnet-4-20250514",
    maxTokens: 4096,
  },
  GEMINI: {
    model: "gemini-1.5-pro",
    maxTokens: 4096,
  },
} as const;
