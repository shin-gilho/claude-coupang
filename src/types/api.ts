/**
 * API 에러 코드
 */
export type ApiErrorCode =
  | "COUPANG_API_ERROR"
  | "CLAUDE_API_ERROR"
  | "GEMINI_API_ERROR"
  | "WORDPRESS_API_ERROR"
  | "NETWORK_ERROR"
  | "VALIDATION_ERROR"
  | "UNKNOWN_ERROR";

/**
 * API 에러 인터페이스
 */
export interface ApiError {
  code: ApiErrorCode;
  message: string;
  status?: number;
  details?: unknown;
}

/**
 * API 응답 래퍼
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * 사용자 친화적 에러 메시지
 */
export const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  COUPANG_API_ERROR:
    "쿠팡 API 호출에 실패했습니다. API 키를 확인해주세요.",
  CLAUDE_API_ERROR:
    "Claude API 호출에 실패했습니다. API 키와 잔여 크레딧을 확인해주세요.",
  GEMINI_API_ERROR:
    "Gemini API 호출에 실패했습니다. API 키를 확인해주세요.",
  WORDPRESS_API_ERROR:
    "워드프레스 업로드에 실패했습니다. URL과 인증 정보를 확인해주세요.",
  NETWORK_ERROR:
    "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
  VALIDATION_ERROR: "입력값이 올바르지 않습니다.",
  UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.",
};

/**
 * API 에러 생성 헬퍼
 */
export function createApiError(
  code: ApiErrorCode,
  message?: string,
  status?: number,
  details?: unknown
): ApiError {
  return {
    code,
    message: message || ERROR_MESSAGES[code],
    status,
    details,
  };
}
