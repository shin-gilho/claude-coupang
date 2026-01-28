/**
 * API 키 설정 타입
 */
export interface CoupangApiKeys {
  accessKey: string;
  secretKey: string;
  partnerId: string;
}

export interface WordPressConfig {
  url: string;
  username: string;
  applicationPassword: string;
}

export interface ApiKeys {
  coupang: CoupangApiKeys;
  wordpress: WordPressConfig;
  claude: string;
  gemini: string;
}

/**
 * 발행 설정 타입
 */
export interface PublishSettings {
  enabled: boolean; // 예약 발행 사용 여부
  intervalMinutes: number;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

/**
 * AI 모델 선택
 */
export type AiModel = "claude" | "gemini";

/**
 * Claude 모델 버전
 */
export type ClaudeModel =
  | "claude-sonnet-4-20250514"
  | "claude-opus-4-20250514"
  | "claude-haiku-3-5-20250620";

/**
 * Gemini 모델 버전
 */
export type GeminiModel =
  | "gemini-2.5-flash"
  | "gemini-2.5-pro"
  | "gemini-2.5-flash-lite";

/**
 * AI 모델 버전 (Claude 또는 Gemini)
 */
export type AiModelVersion = ClaudeModel | GeminiModel;

/**
 * 워크플로우 실행 설정
 */
export interface WorkflowExecutionConfig {
  keywords: string[];
  aiModel: AiModel;
  aiModelVersion: AiModelVersion;
  publishSettings: PublishSettings;
}
