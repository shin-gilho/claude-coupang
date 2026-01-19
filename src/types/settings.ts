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
  intervalMinutes: number;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

/**
 * AI 모델 선택
 */
export type AiModel = "claude" | "gemini";

/**
 * 워크플로우 실행 설정
 */
export interface WorkflowExecutionConfig {
  keywords: string[];
  aiModel: AiModel;
  publishSettings: PublishSettings;
}
