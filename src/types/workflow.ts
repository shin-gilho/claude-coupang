/**
 * 워크플로우 상태 타입
 */

import type { CoupangProduct, BlogPost, WordPressPostResponse } from "./";

/**
 * 워크플로우 상태
 */
export type WorkflowStatus =
  | "idle"
  | "running"
  | "completed"
  | "error";

/**
 * 워크플로우 전체 상태
 */
export interface WorkflowState {
  status: WorkflowStatus;
  currentStep: number;
  totalSteps: number;
  message: string;
  error?: string;
  products?: CoupangProduct[];
  blogPost?: BlogPost;
  // 다중 키워드 관련
  currentKeywordIndex?: number;
  totalKeywords?: number;
  nextScheduledTime?: Date;
  keywordResults?: KeywordResult[];
}

/**
 * 키워드별 실행 결과
 */
export interface KeywordResult {
  keyword: string;
  status: "pending" | "waiting" | "running" | "completed" | "error";
  scheduledTime?: Date;
  result?: WorkflowResult;
  error?: string;
}

/**
 * 워크플로우 실행 결과
 */
export interface WorkflowResult {
  success: boolean;
  products?: CoupangProduct[];
  blogPost?: BlogPost;
  wordpressResponse?: WordPressPostResponse;
  scheduledDate?: Date;
  error?: string;
}

/**
 * 진행 상황 콜백 타입
 */
export type ProgressCallback = (state: WorkflowState) => void;
