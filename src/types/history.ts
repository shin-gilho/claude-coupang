/**
 * 키워드 히스토리 관련 타입 정의
 */

import type { AiModel } from "./settings";

/**
 * 키워드 히스토리 항목
 */
export interface KeywordHistoryEntry {
  /** 고유 ID */
  id: string;
  /** 키워드 */
  keyword: string;
  /** 실행 일시 (ISO 8601) */
  executedAt: string;
  /** 실행 결과 */
  status: "success" | "error";
  /** 사용된 AI 모델 */
  aiModel: AiModel;
  /** 워드프레스 글 URL (성공 시) */
  postUrl?: string;
  /** 에러 메시지 (실패 시) */
  errorMessage?: string;
}

/**
 * 중복 키워드 정보
 */
export interface DuplicateKeywordInfo {
  keyword: string;
  lastExecutedAt: string;
  postUrl?: string;
}
