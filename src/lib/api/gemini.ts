/**
 * Gemini API 클라이언트
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CoupangProduct, BlogPost } from "@/types";
import { createApiError } from "@/types";
import { BLOG_POST_SYSTEM_PROMPT, buildBlogPostPrompt } from "@/constants";

/**
 * 가격대 정보 타입
 */
interface PriceRanges {
  low: { min: number; max: number; count: number };
  mid: { min: number; max: number; count: number };
  high: { min: number; max: number; count: number };
}

/**
 * Gemini API를 사용해 블로그 글 생성
 */
export async function generateBlogPostWithGemini(
  apiKey: string,
  keyword: string,
  products: CoupangProduct[],
  priceRanges?: PriceRanges | null
): Promise<BlogPost> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const userPrompt = buildBlogPostPrompt(keyword, products, priceRanges);
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
 * 플레이스홀더를 실제 상품 URL/이미지로 교체
 */
function replacePlaceholders(content: string, products: CoupangProduct[]): string {
  let result = content;
  products.forEach((p, i) => {
    const index = i + 1;
    // URL 플레이스홀더 교체 (다양한 형식 지원)
    result = result.replace(new RegExp(`\\{\\{PRODUCT_LINK_${index}\\}\\}`, 'g'), p.productUrl);
    result = result.replace(new RegExp(`\\{\\{PRODUCT_IMAGE_${index}\\}\\}`, 'g'), p.productImage);
  });
  return result;
}

/**
 * 구분자 기반 섹션 추출
 */
function extractSection(text: string, sectionName: string): string {
  const startMarker = `---${sectionName}---`;
  const startIndex = text.indexOf(startMarker);
  if (startIndex === -1) return '';

  const contentStart = startIndex + startMarker.length;

  // 다음 구분자 찾기
  const nextMarkerMatch = text.slice(contentStart).match(/---[A-Z_]+---/);
  const endIndex = nextMarkerMatch
    ? contentStart + (nextMarkerMatch.index ?? text.length)
    : text.length;

  return text.slice(contentStart, endIndex).trim();
}

/**
 * AI 응답 파싱 (구분자 형식)
 */
function parseAiResponse(
  text: string,
  keyword: string,
  products: CoupangProduct[]
): BlogPost {
  try {
    // 구분자 형식으로 파싱 시도
    const title = extractSection(text, 'TITLE');
    const content = extractSection(text, 'CONTENT');
    const focusKeyword = extractSection(text, 'FOCUS_KEYWORD');
    const metaDescription = extractSection(text, 'META_DESCRIPTION');

    // 구분자 형식이 제대로 파싱되었는지 확인
    if (content) {
      console.log('[Gemini] 구분자 형식 파싱 성공');
      const processedContent = replacePlaceholders(content, products);

      return {
        title: title || `${keyword} 추천 TOP ${products.length}`,
        content: processedContent,
        focusKeyword: focusKeyword || keyword,
        metaDescription: metaDescription || `${keyword} 관련 최고의 상품을 비교 분석했습니다.`,
        products,
        keyword,
      };
    }

    // 구분자 형식 실패 시 JSON 파싱 시도 (하위 호환)
    console.log('[Gemini] 구분자 형식 실패, JSON 파싱 시도...');
    let cleanText = text;
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      cleanText = codeBlockMatch[1].trim();
    }

    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const processedContent = replacePlaceholders(parsed.content || '', products);

      return {
        title: parsed.title || `${keyword} 추천 TOP ${products.length}`,
        content: processedContent || text,
        focusKeyword: parsed.focusKeyword || keyword,
        metaDescription: parsed.metaDescription || `${keyword} 관련 최고의 상품을 비교 분석했습니다.`,
        products,
        keyword,
      };
    }

    // 모든 파싱 실패 시 텍스트 그대로 사용
    console.error('[Gemini] 파싱 실패: 구분자/JSON 형식을 찾을 수 없습니다.');
    return {
      title: `${keyword} 추천 TOP ${products.length}`,
      content: replacePlaceholders(text, products),
      focusKeyword: keyword,
      metaDescription: `${keyword} 관련 최고의 상품을 비교 분석했습니다.`,
      products,
      keyword,
    };
  } catch (error) {
    console.error('[Gemini] 파싱 에러:', error);
    return {
      title: `${keyword} 추천 TOP ${products.length}`,
      content: replacePlaceholders(text, products),
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
    products: CoupangProduct[],
    priceRanges?: PriceRanges | null
  ): Promise<BlogPost> {
    return generateBlogPostWithGemini(this.apiKey, keyword, products, priceRanges);
  }
}

export default GeminiApiClient;
