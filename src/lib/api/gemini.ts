/**
 * Gemini API 클라이언트
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CoupangProduct, BlogPost } from "@/types";
import { createApiError } from "@/types";
import { BLOG_POST_SYSTEM_PROMPT, buildBlogPostPrompt } from "@/constants";

/**
 * Gemini API를 사용해 블로그 글 생성
 */
export async function generateBlogPostWithGemini(
  apiKey: string,
  keyword: string,
  products: CoupangProduct[]
): Promise<BlogPost> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const userPrompt = buildBlogPostPrompt(keyword, products);
  const fullPrompt = `${BLOG_POST_SYSTEM_PROMPT}\n\n${userPrompt}`;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return parseAiResponse(text, keyword, products);
  } catch (error) {
    if (error instanceof Error) {
      throw createApiError(
        "GEMINI_API_ERROR",
        error.message || "Gemini API 호출에 실패했습니다."
      );
    }
    throw error;
  }
}

/**
 * AI 응답 파싱
 */
function parseAiResponse(
  text: string,
  keyword: string,
  products: CoupangProduct[]
): BlogPost {
  try {
    // JSON 블록 추출 시도
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || `${keyword} 추천 TOP ${products.length}`,
        content: parsed.content || text,
        focusKeyword: parsed.focusKeyword || keyword,
        metaDescription:
          parsed.metaDescription ||
          `${keyword} 관련 최고의 상품을 비교 분석했습니다.`,
        products,
        keyword,
      };
    }

    // JSON 파싱 실패 시 텍스트 그대로 사용
    return {
      title: `${keyword} 추천 TOP ${products.length}`,
      content: text,
      focusKeyword: keyword,
      metaDescription: `${keyword} 관련 최고의 상품을 비교 분석했습니다.`,
      products,
      keyword,
    };
  } catch {
    // 파싱 실패해도 기본값으로 반환
    return {
      title: `${keyword} 추천 TOP ${products.length}`,
      content: text,
      focusKeyword: keyword,
      metaDescription: `${keyword} 관련 최고의 상품을 비교 분석했습니다.`,
      products,
      keyword,
    };
  }
}

/**
 * Gemini API 클라이언트 클래스
 */
export class GeminiApiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateBlogPost(
    keyword: string,
    products: CoupangProduct[]
  ): Promise<BlogPost> {
    return generateBlogPostWithGemini(this.apiKey, keyword, products);
  }
}

export default GeminiApiClient;
