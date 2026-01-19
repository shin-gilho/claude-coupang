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
