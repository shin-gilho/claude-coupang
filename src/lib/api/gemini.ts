/**
 * Gemini API 클라이언트
 */

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import type { CoupangProduct, BlogPost } from "@/types";
import { createApiError } from "@/types";
import { BLOG_POST_SYSTEM_PROMPT, buildBlogPostPrompt, buildPart1Prompt, buildPart2Prompt } from "@/constants";

/**
 * 가격대 정보 타입
 */
interface PriceRanges {
  low: { min: number; max: number; count: number };
  mid: { min: number; max: number; count: number };
  high: { min: number; max: number; count: number };
}

/**
 * 포커스 키워드 포맷팅 ("키워드 추천" 형식)
 */
function formatFocusKeyword(keyword: string, parsedKeyword?: string): string {
  const baseKeyword = parsedKeyword || keyword;
  if (baseKeyword.endsWith('추천')) {
    return baseKeyword;
  }
  return `${baseKeyword} 추천`;
}

/**
 * Gemini API를 사용해 블로그 글 생성
 * 상품 4개 초과 시 자동으로 분할 호출
 */
export async function generateBlogPostWithGemini(
  apiKey: string,
  keyword: string,
  products: CoupangProduct[],
  priceRanges?: PriceRanges | null,
  modelVersion: string = "gemini-2.5-flash"
): Promise<BlogPost> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelVersion });

  try {
    // 상품이 4개 초과면 분할 호출로 콘텐츠 잘림 방지
    if (products.length > 4) {
      console.log(`[Gemini] 상품 ${products.length}개 - 분할 호출 사용`);
      return await generateBlogPostInChunks(model, keyword, products, priceRanges);
    }

    // 4개 이하면 기존 단일 호출
    console.log(`[Gemini] 상품 ${products.length}개 - 단일 호출 사용`);
    const userPrompt = buildBlogPostPrompt(keyword, products, priceRanges);
    const fullPrompt = `${BLOG_POST_SYSTEM_PROMPT}\n\n${userPrompt}`;

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
 * img/a 태그 외부의 standalone 이미지 URL 제거
 * AI가 플레이스홀더를 텍스트로 출력한 경우 처리
 */
function removeStandaloneImageUrls(content: string): string {
  // 줄 전체가 이미지 URL인 경우 제거
  const lines = content.split('\n');
  const cleanedLines = lines.map(line => {
    // 줄 전체가 URL인 경우 제거 (img src 또는 a href 내부가 아닌 경우)
    if (/^\s*https?:\/\/[^\s]+\.(webp|jpg|jpeg|png|gif)\s*$/i.test(line)) {
      return '';
    }
    return line;
  });

  // 연속된 빈 줄 정리
  return cleanedLines.join('\n').replace(/\n{3,}/g, '\n\n');
}

/**
 * API 분할 호출로 블로그 글 생성 (콘텐츠 잘림 방지)
 * 상품 4개 초과 시 자동으로 2번에 나눠 호출
 */
async function generateBlogPostInChunks(
  model: GenerativeModel,
  keyword: string,
  products: CoupangProduct[],
  priceRanges?: PriceRanges | null
): Promise<BlogPost> {
  const CHUNK_SIZE = 4; // 파트1에 4개 상품

  const firstChunk = products.slice(0, CHUNK_SIZE);
  const secondChunk = products.slice(CHUNK_SIZE);

  console.log(`[Gemini] 분할 호출 시작: 파트1(${firstChunk.length}개), 파트2(${secondChunk.length}개), 총 ${products.length}개`);

  // 파트 1 호출: 도입부 + 선택기준 + 상품 1-4
  // 전체 상품 수를 전달하여 제목에 정확한 TOP 숫자가 표시되도록 함
  const part1Prompt = buildPart1Prompt(keyword, firstChunk, priceRanges, products.length);
  const part1FullPrompt = `${BLOG_POST_SYSTEM_PROMPT}\n\n${part1Prompt}`;
  const part1Result = await model.generateContent(part1FullPrompt);
  const part1Response = await part1Result.response;
  const part1Text = part1Response.text();

  const title = extractSection(part1Text, 'TITLE');
  const part1Content = extractSection(part1Text, 'CONTENT');

  console.log('[Gemini] 파트1 완료, 제목:', title?.slice(0, 50) || '(없음)');

  // 파트 2 호출: 상품 5-7 + 결론
  let part2Content = '';
  if (secondChunk.length > 0) {
    const part2Prompt = buildPart2Prompt(keyword, title || keyword, secondChunk, CHUNK_SIZE + 1);
    const part2FullPrompt = `${BLOG_POST_SYSTEM_PROMPT}\n\n${part2Prompt}`;
    const part2Result = await model.generateContent(part2FullPrompt);
    const part2Response = await part2Result.response;
    const part2Text = part2Response.text();

    part2Content = extractSection(part2Text, 'CONTENT');

    console.log('[Gemini] 파트2 완료, 콘텐츠 길이:', part2Content?.length || 0);
  }

  // 콘텐츠 병합
  const mergedContent = part1Content + '\n\n' + part2Content;
  let processedContent = replacePlaceholders(mergedContent, products);
  processedContent = removeStandaloneImageUrls(processedContent);

  console.log('[Gemini] 분할 호출 완료, 총 콘텐츠 길이:', processedContent.length);

  return {
    title: title || `${keyword} 추천 TOP ${products.length}`,
    content: processedContent,
    focusKeyword: formatFocusKeyword(keyword),
    metaDescription: `${keyword} 관련 최고의 상품을 비교 분석했습니다.`,
    products,
    keyword,
  };
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
      let processedContent = replacePlaceholders(content, products);
      processedContent = removeStandaloneImageUrls(processedContent);

      return {
        title: title || `${keyword} 추천 TOP ${products.length}`,
        content: processedContent,
        focusKeyword: formatFocusKeyword(keyword, focusKeyword),
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
      let processedContent = replacePlaceholders(parsed.content || '', products);
      processedContent = removeStandaloneImageUrls(processedContent);

      return {
        title: parsed.title || `${keyword} 추천 TOP ${products.length}`,
        content: processedContent || text,
        focusKeyword: formatFocusKeyword(keyword, parsed.focusKeyword),
        metaDescription: parsed.metaDescription || `${keyword} 관련 최고의 상품을 비교 분석했습니다.`,
        products,
        keyword,
      };
    }

    // 모든 파싱 실패 시 텍스트 그대로 사용
    console.error('[Gemini] 파싱 실패: 구분자/JSON 형식을 찾을 수 없습니다.');
    let fallbackContent = replacePlaceholders(text, products);
    fallbackContent = removeStandaloneImageUrls(fallbackContent);
    return {
      title: `${keyword} 추천 TOP ${products.length}`,
      content: fallbackContent,
      focusKeyword: formatFocusKeyword(keyword),
      metaDescription: `${keyword} 관련 최고의 상품을 비교 분석했습니다.`,
      products,
      keyword,
    };
  } catch (error) {
    console.error('[Gemini] 파싱 에러:', error);
    let errorContent = replacePlaceholders(text, products);
    errorContent = removeStandaloneImageUrls(errorContent);
    return {
      title: `${keyword} 추천 TOP ${products.length}`,
      content: errorContent,
      focusKeyword: formatFocusKeyword(keyword),
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
    priceRanges?: PriceRanges | null,
    modelVersion?: string
  ): Promise<BlogPost> {
    return generateBlogPostWithGemini(this.apiKey, keyword, products, priceRanges, modelVersion);
  }
}

export default GeminiApiClient;
