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
import { removeAllExternalImages } from "@/lib/api/wordpress";
import { generateScheduleSlots } from "./scheduler";
import { selectProducts, calculatePriceRanges } from "@/lib/product";

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
  | "selecting"
  | "generating"
  | "uploading"
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
    totalSteps: 5, // 5단계: 검색 → 선별 → AI생성 → 이미지업로드 → WP발행
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
 * 상품 테이블 HTML 생성
 */
function generateProductTable(products: CoupangProduct[]): string {
  const rows = products.map((p, i) => {
    return `
    <tr>
      <td style="padding:12px;text-align:center;vertical-align:middle;border-bottom:1px solid #eee;">
        <img src="${p.productImage}" alt="${p.productName}" style="width:80px;height:80px;object-fit:contain;" />
      </td>
      <td style="padding:12px;vertical-align:middle;border-bottom:1px solid #eee;">
        <strong>${i + 1}. ${p.productName}</strong>
        ${p.isRocket ? '<span style="display:inline-block;background:#0073e6;color:white;padding:2px 6px;border-radius:4px;font-size:11px;margin-left:8px;">로켓배송</span>' : ''}
      </td>
      <td style="padding:12px;text-align:right;vertical-align:middle;font-weight:bold;white-space:nowrap;border-bottom:1px solid #eee;">
        ${p.productPrice.toLocaleString()}원
      </td>
      <td style="padding:12px;text-align:center;vertical-align:middle;border-bottom:1px solid #eee;">
        <a href="${p.productUrl}" style="display:inline-block;padding:10px 20px;background-color:#e53935;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;" target="_blank" rel="noopener noreferrer">쿠팡에서 보기</a>
      </td>
    </tr>
  `;
  }).join('');

  return `
<h2 style="margin-top:40px;margin-bottom:20px;font-size:24px;border-bottom:2px solid #333;padding-bottom:10px;">📦 추천 상품 보러가기</h2>
<table style="width:100%;border-collapse:collapse;margin:20px 0;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.1);border-radius:8px;overflow:hidden;">
  <tbody>
    ${rows}
  </tbody>
</table>
`;
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
  apiKeys: ApiKeys,
  priceRanges?: {
    low: { min: number; max: number; count: number };
    mid: { min: number; max: number; count: number };
    high: { min: number; max: number; count: number };
  } | null
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
      priceRanges,
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
 * 이미지 업로드 결과 타입
 */
interface ImageUploadApiResult {
  featuredMediaId: number | null;
  updatedContent: string;
  stats: {
    total: number;
    success: number;
    failed: number;
  };
  warning?: string;
}

/**
 * 이미지 업로드 API 호출
 */
async function uploadImages(
  products: CoupangProduct[],
  content: string,
  apiKeys: ApiKeys
): Promise<ImageUploadApiResult> {
  const response = await fetch("/api/wordpress/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      products,
      content,
      config: {
        url: apiKeys.wordpress.url,
        username: apiKeys.wordpress.username,
        applicationPassword: apiKeys.wordpress.applicationPassword,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "이미지 업로드에 실패했습니다.");
  }

  const result = await response.json();
  return {
    featuredMediaId: result.data.featuredMediaId,
    updatedContent: result.data.updatedContent || content,
    stats: result.data.stats || { total: products.length, success: 0, failed: 0 },
    warning: result.warning,
  };
}

/**
 * 워드프레스 발행 API 호출
 * TODO: 테스트 완료 후 status를 "future"로 변경
 */
async function publishToWordPress(
  blogPost: BlogPost,
  scheduledDate: Date,
  apiKeys: ApiKeys,
  featuredMediaId?: number | null
): Promise<WordPressPostResponse> {
  const postData: Record<string, unknown> = {
    title: blogPost.title,
    content: blogPost.content,
    status: "draft", // 테스트용 임시저장 (원래: "future")
    date: scheduledDate.toISOString(),
    meta: {
      rank_math_focus_keyword: blogPost.focusKeyword,
      rank_math_description: blogPost.metaDescription,
    },
  };

  if (featuredMediaId) {
    postData.featured_media = featuredMediaId;
  }

  const response = await fetch("/api/wordpress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      post: postData,
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
    // 단계 1: 쿠팡 상품 검색 (API limit이 10이므로 최대 10개씩 요청)
    notify({
      status: "running",
      currentStep: 1,
      message: `"${keyword}" 관련 상품을 검색 중입니다...`,
    });

    // 쿠팡 API limit은 최대 10, 선별을 위해 가능한 많이 가져오기
    const maxApiLimit = 10;
    const rawProducts = await searchProducts(keyword, maxApiLimit, apiKeys);

    if (rawProducts.length === 0) {
      throw new Error("검색된 상품이 없습니다.");
    }

    notify({
      currentStep: 1,
      message: `${rawProducts.length}개의 상품을 찾았습니다. 최적의 상품을 선별합니다...`,
    });

    // 단계 2: 상품 선별 (평점, 리뷰, 가격대 다양성 고려)
    notify({
      currentStep: 2,
      message: "평점, 리뷰 수, 가격대를 고려하여 상품을 선별 중입니다...",
    });

    const selectedProducts = selectProducts(rawProducts, {
      targetCount: productCount,
      minRating: 4.0,
      fallbackMinRating: 3.5,
    });

    const priceRanges = calculatePriceRanges(selectedProducts);

    notify({
      currentStep: 2,
      message: `${selectedProducts.length}개의 최적 상품을 선별했습니다.`,
      products: selectedProducts,
    });

    // 단계 3: AI 블로그 글 생성
    notify({
      currentStep: 3,
      message: `${aiModel === "claude" ? "Claude" : "Gemini"}로 블로그 글을 생성 중입니다...`,
    });

    const blogPost = await generateBlogPost(
      keyword,
      selectedProducts,
      aiModel,
      apiKeys,
      priceRanges
    );

    // 상품 테이블 HTML을 콘텐츠 끝에 추가
    const productTableHtml = generateProductTable(selectedProducts);
    const blogPostWithTable = {
      ...blogPost,
      content: blogPost.content + productTableHtml,
    };

    notify({
      currentStep: 3,
      message: "블로그 글 생성이 완료되었습니다.",
      blogPost: blogPostWithTable,
    });

    // 단계 4: 이미지 업로드
    notify({
      currentStep: 4,
      message: `${selectedProducts.length}개의 상품 이미지를 업로드 중입니다...`,
    });

    let featuredMediaId: number | null = null;
    let finalContent = blogPostWithTable.content;

    try {
      const uploadResult = await uploadImages(
        selectedProducts,
        blogPostWithTable.content,
        apiKeys
      );
      featuredMediaId = uploadResult.featuredMediaId;
      finalContent = uploadResult.updatedContent;

      // 업로드 결과 메시지
      const { stats, warning } = uploadResult;
      if (warning) {
        // 일부 또는 전체 실패 시 경고 메시지 표시
        notify({
          currentStep: 4,
          message: `이미지 업로드: ${stats.success}/${stats.total}개 성공. ${warning}`,
        });
      } else {
        notify({
          currentStep: 4,
          message: `${stats.success}개의 이미지를 업로드했습니다.`,
        });
      }
    } catch (uploadError) {
      // 이미지 업로드 API 자체 실패 시 외부 이미지 제거 후 진행
      console.error("Image upload API failed:", uploadError);

      // 쿠팡 외부 이미지 태그 모두 제거 (핫링크 방지 문제 방지)
      finalContent = removeAllExternalImages(blogPostWithTable.content);

      notify({
        currentStep: 4,
        message: "이미지 업로드에 실패했습니다. 이미지 없이 발행을 진행합니다.",
      });
    }

    // 발행 일정 계산
    const scheduleSlots = generateScheduleSlots(1, publishSettings);
    const scheduledDate = scheduleSlots[0]?.date || new Date();

    // 단계 5: 워드프레스 발행
    notify({
      currentStep: 5,
      message: "워드프레스에 포스트를 발행 중입니다...",
    });

    // 업데이트된 콘텐츠로 blogPost 수정
    const finalBlogPost = {
      ...blogPostWithTable,
      content: finalContent,
    };

    const postResponse = await publishToWordPress(
      finalBlogPost,
      scheduledDate,
      apiKeys,
      featuredMediaId
    );

    // 완료
    notify({
      status: "completed",
      currentStep: 5,
      message: "워크플로우가 성공적으로 완료되었습니다!",
    });

    return {
      success: true,
      products: selectedProducts,
      blogPost: finalBlogPost,
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
    2: "상품 선별",
    3: "블로그 글 생성",
    4: "이미지 업로드",
    5: "워드프레스 발행",
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
