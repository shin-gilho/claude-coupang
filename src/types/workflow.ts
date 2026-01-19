/**
 * 워크플로우 상태
 */
export type WorkflowStatus =
  | "idle"
  | "collecting" // 쿠팡 상품 수집 중
  | "generating" // AI 글 작성 중
  | "uploading" // 워드프레스 업로드 중
  | "completed" // 완료
  | "error"; // 에러

/**
 * 워크플로우 전체 상태
 */
export interface WorkflowState {
  status: WorkflowStatus;
  currentKeywordIndex: number;
  totalKeywords: number;
  currentStep: string;
  progress: number; // 0-100
  error?: string;
  results: WorkflowResult[];
}

/**
 * 단일 키워드 처리 결과
 */
export interface WorkflowResult {
  keyword: string;
  success: boolean;
  postUrl?: string;
  scheduledTime?: string;
  error?: string;
}

/**
 * 진행 상황 콜백 타입
 */
export type ProgressCallback = (state: WorkflowState) => void;
