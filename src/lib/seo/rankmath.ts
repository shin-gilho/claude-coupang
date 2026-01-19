/**
 * Rank Math SEO 메타데이터 유틸리티
 */

import type { BlogPost, RankMathMeta } from "@/types";

/**
 * Rank Math 메타 데이터 생성
 */
export function createRankMathMeta(blogPost: BlogPost): RankMathMeta {
  return {
    rank_math_focus_keyword: blogPost.focusKeyword,
    rank_math_description: generateMetaDescription(blogPost),
  };
}

/**
 * SEO 최적화된 메타 설명 생성
 * 최대 160자로 제한
 */
export function generateMetaDescription(blogPost: BlogPost): string {
  // 이미 메타 설명이 있으면 사용
  if (blogPost.metaDescription && blogPost.metaDescription.length <= 160) {
    return blogPost.metaDescription;
  }

  // 키워드 기반으로 자동 생성
  const keyword = blogPost.focusKeyword;
  const productCount = blogPost.products?.length || 0;

  // 기본 템플릿
  let description = `${keyword} 추천 상품 TOP ${productCount}! 가격, 성능, 후기를 비교 분석하여 최적의 제품을 선정했습니다.`;

  // 160자 초과 시 잘라내기
  if (description.length > 160) {
    description = description.substring(0, 157) + "...";
  }

  return description;
}

/**
 * Focus Keyword 최적화
 * 불필요한 공백 제거, 특수문자 처리
 */
export function optimizeFocusKeyword(keyword: string): string {
  return keyword
    .trim()
    .replace(/\s+/g, " ") // 연속 공백 제거
    .toLowerCase();
}

/**
 * 키워드 밀도 계산 (선택적 사용)
 */
export function calculateKeywordDensity(
  content: string,
  keyword: string
): number {
  const words = content
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const keywordLower = keyword.toLowerCase();
  const keywordCount = words.filter((w) => w.includes(keywordLower)).length;

  if (words.length === 0) return 0;
  return (keywordCount / words.length) * 100;
}

/**
 * SEO 점수 간단 계산
 */
export interface SeoScore {
  score: number;
  suggestions: string[];
}

export function calculateSeoScore(blogPost: BlogPost): SeoScore {
  const suggestions: string[] = [];
  let score = 100;

  // 제목 검사
  if (!blogPost.title.toLowerCase().includes(blogPost.focusKeyword.toLowerCase())) {
    score -= 15;
    suggestions.push("제목에 포커스 키워드를 포함하세요.");
  }

  if (blogPost.title.length > 60) {
    score -= 10;
    suggestions.push("제목을 60자 이내로 줄이세요.");
  }

  // 메타 설명 검사
  if (!blogPost.metaDescription) {
    score -= 15;
    suggestions.push("메타 설명을 추가하세요.");
  } else if (blogPost.metaDescription.length > 160) {
    score -= 10;
    suggestions.push("메타 설명을 160자 이내로 줄이세요.");
  }

  // 콘텐츠 길이 검사
  const wordCount = blogPost.content.split(/\s+/).length;
  if (wordCount < 300) {
    score -= 20;
    suggestions.push("콘텐츠 길이를 최소 300단어 이상으로 늘리세요.");
  }

  // 키워드 밀도 검사
  const density = calculateKeywordDensity(blogPost.content, blogPost.focusKeyword);
  if (density < 0.5) {
    score -= 10;
    suggestions.push("본문에 포커스 키워드를 더 자연스럽게 포함하세요.");
  } else if (density > 3) {
    score -= 10;
    suggestions.push("키워드 밀도가 너무 높습니다. 자연스럽게 분산하세요.");
  }

  return {
    score: Math.max(0, score),
    suggestions,
  };
}

export default {
  createRankMathMeta,
  generateMetaDescription,
  optimizeFocusKeyword,
  calculateKeywordDensity,
  calculateSeoScore,
};
