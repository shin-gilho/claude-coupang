/**
 * Claude API 클라이언트
 */

import Anthropic from "@anthropic-ai/sdk";
import type { CoupangProduct, BlogPost } from "@/types";
import { createApiError } from "@/types";
import { BLOG_POST_SYSTEM_PROMPT, buildBlogPostPrompt } from "@/constants";

/**
 * Claude API를 사용해 블로그 글 생성
 */
export async function generateBlogPostWithClaude(
  apiKey: string,
  keyword: string,
  products: CoupangProduct[]
): Promise<BlogPost> {
  const client = new Anthropic({ apiKey });

  const userPrompt = buildBlogPostPrompt(keyword, products);

  try {
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
 * Claude API 클라이언트 클래스
 */
export class ClaudeApiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateBlogPost(
    keyword: string,
    products: CoupangProduct[]
  ): Promise<BlogPost> {
    return generateBlogPostWithClaude(this.apiKey, keyword, products);
  }
}

export default ClaudeApiClient;
