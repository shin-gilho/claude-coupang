/**
 * Claude API 클라이언트
 */

import Anthropic from "@anthropic-ai/sdk";
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
 * Claude API를 사용해 블로그 글 생성
 * 상품 4개 초과 시 자동으로 분할 호출
 */
export async function generateBlogPostWithClaude(
  apiKey: string,
  keyword: string,
  products: CoupangProduct[],
  priceRanges?: PriceRanges | null
): Promise<BlogPost> {
  const client = new Anthropic({ apiKey });

  try {
    // 상품이 4개 초과면 분할 호출로 콘텐츠 잘림 방지
    if (products.length > 4) {
      console.log(`[Claude] 상품 ${products.length}개 - 분할 호출 사용`);
      return await generateBlogPostInChunks(client, keyword, products, priceRanges);
    }

    // 4개 이하면 기존 단일 호출
    console.log(`[Claude] 상품 ${products.length}개 - 단일 호출 사용`);
    const userPrompt = buildBlogPostPrompt(keyword, products, priceRanges);

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: BLOG_POST_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw createApiError("CLAUDE_API_ERROR", "예상치 못한 응답 형식입니다.");
    }

    return parseAiResponse(content.text, keyword, products);
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw createApiError(
        "CLAUDE_API_ERROR",
        error.message || "Claude API 호출에 실패했습니다.",
        error.status
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
  client: Anthropic,
  keyword: string,
  products: CoupangProduct[],
  priceRanges?: PriceRanges | null
): Promise<BlogPost> {
  const CHUNK_SIZE = 4; // 파트1에 4개 상품

  const firstChunk = products.slice(0, CHUNK_SIZE);
  const secondChunk = products.slice(CHUNK_SIZE);

  console.log(`[Claude] 분할 호출 시작: 파트1(${firstChunk.length}개), 파트2(${secondChunk.length}개)`);

  // 파트 1 호출: 도입부 + 선택기준 + 상품 1-4
  const part1Prompt = buildPart1Prompt(keyword, firstChunk, priceRanges);
  const part1Response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: BLOG_POST_SYSTEM_PROMPT,
    messages: [{ role: "user", content: part1Prompt }],
  });

  const part1Text = part1Response.content[0].type === 'text'
    ? part1Response.content[0].text : '';
  const title = extractSection(part1Text, 'TITLE');
  const part1Content = extractSection(part1Text, 'CONTENT');

  console.log('[Claude] 파트1 완료, 제목:', title?.slice(0, 50) || '(없음)');

  // 파트 2 호출: 상품 5-7 + 결론
  let part2Content = '';
  if (secondChunk.length > 0) {
    const part2Prompt = buildPart2Prompt(keyword, title || keyword, secondChunk, CHUNK_SIZE + 1);
    const part2Response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: BLOG_POST_SYSTEM_PROMPT,
      messages: [{ role: "user", content: part2Prompt }],
    });

    const part2Text = part2Response.content[0].type === 'text'
      ? part2Response.content[0].text : '';
    part2Content = extractSection(part2Text, 'CONTENT');

    console.log('[Claude] 파트2 완료, 콘텐츠 길이:', part2Content?.length || 0);
  }

  // 콘텐츠 병합
  const mergedContent = part1Content + '\n\n' + part2Content;
  let processedContent = replacePlaceholders(mergedContent, products);
  processedContent = removeStandaloneImageUrls(processedContent);

  console.log('[Claude] 분할 호출 완료, 총 콘텐츠 길이:', processedContent.length);

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
      console.log('[Claude] 구분자 형식 파싱 성공');
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
    console.log('[Claude] 구분자 형식 실패, JSON 파싱 시도...');
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
    console.error('[Claude] 파싱 실패: 구분자/JSON 형식을 찾을 수 없습니다.');
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
    console.error('[Claude] 파싱 에러:', error);
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
 * Claude API 클라이언트 클래스
 */
export class ClaudeApiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateBlogPost(
    keyword: string,
    products: CoupangProduct[],
    priceRanges?: PriceRanges | null
  ): Promise<BlogPost> {
    return generateBlogPostWithClaude(this.apiKey, keyword, products, priceRanges);
  }
}

export default ClaudeApiClient;
