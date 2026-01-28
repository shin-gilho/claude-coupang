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
  enabled: false, // 기본: 즉시 발행
  intervalMinutes: 60, // 1시간 간격
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
  LIMIT: 7,
  SORT_BY: "RATING", // 평점순
} as const;

// AI 모델 옵션
export const AI_MODEL_OPTIONS = {
  CLAUDE: [
    { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4 (권장)", description: "균형 잡힌 성능" },
    { value: "claude-opus-4-20250514", label: "Claude Opus 4", description: "최고 품질" },
    { value: "claude-haiku-3-5-20250620", label: "Claude Haiku 3.5", description: "빠른 응답" },
  ],
  GEMINI: [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (권장)", description: "빠른 속도" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", description: "최고 품질" },
    { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", description: "비용 효율" },
  ],
} as const;

// AI 모델 설정
export const AI_MODEL_SETTINGS = {
  CLAUDE: {
    defaultModel: "claude-sonnet-4-20250514",
    maxTokens: 4096,
  },
  GEMINI: {
    defaultModel: "gemini-2.5-flash",
    maxTokens: 4096,
  },
} as const;

// 이미지 업로드 설정
export const IMAGE_UPLOAD_SETTINGS = {
  // 재시도 설정
  MAX_RETRIES: 3,
  INITIAL_RETRY_DELAY_MS: 1000,
  // 타임아웃 설정
  FETCH_TIMEOUT_MS: 30000,
  // 요청 간 딜레이
  UPLOAD_DELAY_MS: 500,
  // 지원 확장자
  SUPPORTED_EXTENSIONS: ["jpg", "jpeg", "png", "gif", "webp"],
  // 이미지 magic bytes (유효성 검증용)
  MAGIC_BYTES: {
    JPEG: [0xff, 0xd8, 0xff],
    PNG: [0x89, 0x50, 0x4e, 0x47],
    GIF: [0x47, 0x49, 0x46],
    WEBP_RIFF: [0x52, 0x49, 0x46, 0x46], // RIFF header
  },
} as const;

// 쿠팡 이미지 다운로드 헤더 (핫링크 방지 우회)
export const COUPANG_IMAGE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
  "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  Referer: "https://www.coupang.com/",
  "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "image",
  "sec-fetch-mode": "no-cors",
  "sec-fetch-site": "cross-site",
} as const;

// 이미지 압축 설정
export const IMAGE_COMPRESSION_SETTINGS = {
  QUALITY: 80,           // 품질 (0-100)
  MAX_WIDTH: 1200,       // 최대 너비 (픽셀)
  MAX_HEIGHT: 1200,      // 최대 높이 (픽셀)
  CONVERT_TO_WEBP: true, // WebP 변환 여부 (용량 절감)
} as const;
