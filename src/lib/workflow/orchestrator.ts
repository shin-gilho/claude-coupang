/**
 * 메인 워크플로우 오케스트레이터
 */

import type {
  WorkflowState,
  WorkflowStatus,
  WorkflowResult,
  ApiKeys,
  PublishSettings,
  CoupangProduct,
  BlogPost,
  WordPressPostResponse,
  AiModel,
} from "@/types";
import { generateScheduleSlots } from "./scheduler";

/**
 * 워크플로우 진행 콜백 타입
 */
export type WorkflowProgressCallback = (state: WorkflowState) => void;

/**
 * 워크플로우 단계
 */
export type WorkflowStep =
  | "idle"
  | "searching"
  | "generating"
  | "publishing"
  | "completed"
  | "error";

/**
 * 워크플로우 설정
 */
export interface WorkflowConfig {
  keyword: string;
  productCount: number;
  aiModel: AiModel;
  apiKeys: ApiKeys;
  publishSettings: PublishSettings;
  onProgress?: WorkflowProgressCallback;
}

/**
 * 초기 워크플로우 상태 생성
 */
export function createInitialState(): WorkflowState {
  return {
    status: "idle" as WorkflowStatus,
    currentStep: 0,
    totalSteps: 4,
    message: "대기 중...",
  };
}

/**
 * 워크플로우 상태 업데이트
 */
function updateState(
  state: WorkflowState,
  updates: Partial<WorkflowState>
): WorkflowState {
  return { ...state, ...updates };
}

/**
 * 쿠팡 상품 검색 API 호출
 */
async function searchProducts(
  keyword: string,
  limit: number,
  apiKeys: ApiKeys
): Promise<CoupangProduct[]> {
  const response = await fetch("/api/coupang", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      keyword,
      limit,
      config: {
        accessKey: apiKeys.coupang.accessKey,
        secretKey: apiKeys.coupang.secretKey,
        partnerId: apiKeys.coupang.partnerId,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "쿠팡 상품 검색에 실패했습니다.");
  }

  const result = await response.json();
  return result.data;
}

/**
 * AI 블로그 글 생성 API 호출
 */
async function generateBlogPost(
  keyword: string,
  products: CoupangProduct[],
  model: AiModel,
  apiKeys: ApiKeys
): Promise<BlogPost> {
  const endpoint = model === "claude" ? "/api/ai/claude" : "/api/ai/gemini";
  const apiKey = model === "claude" ? apiKeys.claude : apiKeys.gemini;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      keyword,
      products,
      apiKey,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "블로그 글 생성에 실패했습니다.");
  }

  const result = await response.json();
  return result.data;
}

/**
 * 워드프레스 발행 API 호출
 */
async function publishToWordPress(
  blogPost: BlogPost,
  scheduledDate: Date,
  apiKeys: ApiKeys
): Promise<WordPressPostResponse> {
  const response = await fetch("/api/wordpress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      post: {
        title: blogPost.title,
        content: blogPost.content,
        status: "future",
        date: scheduledDate.toISOString(),
        meta: {
          rank_math_focus_keyword: blogPost.focusKeyword,
          rank_math_description: blogPost.metaDescription,
        },
      },
      config: {
        url: apiKeys.wordpress.url,
        username: apiKeys.wordpress.username,
        applicationPassword: apiKeys.wordpress.applicationPassword,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "워드프레스 발행에 실패했습니다.");
  }

  const result = await response.json();
  return result.data;
}

/**
 * 메인 워크플로우 실행
 */
export async function executeWorkflow(
  config: WorkflowConfig
): Promise<WorkflowResult> {
  const { keyword, productCount, aiModel, apiKeys, publishSettings, onProgress } =
    config;

  let state = createInitialState();

  const notify = (updates: Partial<WorkflowState>) => {
    state = updateState(state, updates);
    onProgress?.(state);
  };

  try {
    // 단계 1: 쿠팡 상품 검색
    notify({
      status: "running",
      currentStep: 1,
      message: `"${keyword}" 관련 상품을 검색 중입니다...`,
    });

    const products = await searchProducts(keyword, productCount, apiKeys);

    if (products.length === 0) {
      throw new Error("검색된 상품이 없습니다.");
    }

    notify({
      currentStep: 1,
      message: `${products.length}개의 상품을 찾았습니다.`,
      products,
    });

    // 단계 2: AI 블로그 글 생성
    notify({
      currentStep: 2,
      message: `${aiModel === "claude" ? "Claude" : "Gemini"}로 블로그 글을 생성 중입니다...`,
    });

    const blogPost = await generateBlogPost(keyword, products, aiModel, apiKeys);

    notify({
      currentStep: 2,
      message: "블로그 글 생성이 완료되었습니다.",
      blogPost,
    });

    // 단계 3: 발행 일정 계산
    notify({
      currentStep: 3,
      message: "발행 일정을 계산 중입니다...",
    });

    const scheduleSlots = generateScheduleSlots(1, publishSettings);
    const scheduledDate = scheduleSlots[0]?.date || new Date();

    // 단계 4: 워드프레스 발행
    notify({
      currentStep: 4,
      message: "워드프레스에 포스트를 발행 중입니다...",
    });

    const postResponse = await publishToWordPress(
      blogPost,
      scheduledDate,
      apiKeys
    );

    // 완료
    notify({
      status: "completed",
      currentStep: 4,
      message: "워크플로우가 성공적으로 완료되었습니다!",
    });

    return {
      success: true,
      products,
      blogPost,
      wordpressResponse: postResponse,
      scheduledDate,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    notify({
      status: "error",
      message: errorMessage,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 워크플로우 상태 메시지 생성
 */
export function getStepMessage(step: number): string {
  const messages: Record<number, string> = {
    1: "쿠팡 상품 검색",
    2: "블로그 글 생성",
    3: "발행 일정 계산",
    4: "워드프레스 발행",
  };
  return messages[step] || "처리 중";
}

/**
 * 워크플로우 진행률 계산
 */
export function calculateProgress(currentStep: number, totalSteps: number): number {
  if (totalSteps === 0) return 0;
  return Math.round((currentStep / totalSteps) * 100);
}

export default {
  createInitialState,
  executeWorkflow,
  getStepMessage,
  calculateProgress,
};
