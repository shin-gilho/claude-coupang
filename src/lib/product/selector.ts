/**
 * 상품 선별 로직
 * 평점, 리뷰 수, 가격대 다양성을 고려하여 최적의 상품을 선별합니다.
 */

import type { CoupangProduct } from "@/types";

/**
 * 상품 선별 옵션
 */
export interface ProductSelectionOptions {
  targetCount: number; // 목표 선별 개수
  minRating: number; // 최소 평점
  fallbackMinRating: number; // 대체 최소 평점 (상품 부족 시)
  priceDistribution: {
    low: number; // 저가 비율 (0-1)
    mid: number; // 중가 비율 (0-1)
    high: number; // 고가 비율 (0-1)
  };
}

/**
 * 기본 선별 옵션
 */
export const DEFAULT_SELECTION_OPTIONS: ProductSelectionOptions = {
  targetCount: 7,
  minRating: 4.0,
  fallbackMinRating: 3.5,
  priceDistribution: {
    low: 0.3, // 30%
    mid: 0.4, // 40%
    high: 0.3, // 30%
  },
};

/**
 * 가격대별 분류
 */
export interface PriceRange {
  min: number;
  max: number;
  label: string;
}

/**
 * 상품을 가격대별로 분류
 */
function classifyByPriceRange(
  products: CoupangProduct[]
): { low: CoupangProduct[]; mid: CoupangProduct[]; high: CoupangProduct[] } {
  if (products.length === 0) {
    return { low: [], mid: [], high: [] };
  }

  const prices = products.map((p) => p.productPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  // 3분위로 분류 (1/3씩)
  const lowThreshold = minPrice + priceRange / 3;
  const highThreshold = minPrice + (priceRange * 2) / 3;

  return {
    low: products.filter((p) => p.productPrice <= lowThreshold),
    mid: products.filter(
      (p) => p.productPrice > lowThreshold && p.productPrice <= highThreshold
    ),
    high: products.filter((p) => p.productPrice > highThreshold),
  };
}

/**
 * 리뷰 수 기준으로 정렬
 */
function sortByReviewCount(products: CoupangProduct[]): CoupangProduct[] {
  return [...products].sort((a, b) => b.reviewCount - a.reviewCount);
}

/**
 * 평점 필터링
 */
function filterByRating(
  products: CoupangProduct[],
  minRating: number
): CoupangProduct[] {
  return products.filter((p) => p.rating >= minRating);
}

/**
 * 가격대별로 상품 선택 (다양성 보장)
 */
function selectWithPriceDiversity(
  products: CoupangProduct[],
  options: ProductSelectionOptions
): CoupangProduct[] {
  const { targetCount, priceDistribution } = options;
  const classified = classifyByPriceRange(products);

  // 각 가격대별 목표 개수 계산
  const lowCount = Math.round(targetCount * priceDistribution.low);
  const midCount = Math.round(targetCount * priceDistribution.mid);
  const highCount = targetCount - lowCount - midCount;

  // 각 가격대에서 리뷰 수 기준으로 선택
  const lowSorted = sortByReviewCount(classified.low);
  const midSorted = sortByReviewCount(classified.mid);
  const highSorted = sortByReviewCount(classified.high);

  const selected: CoupangProduct[] = [];

  // 저가 상품 선택
  selected.push(...lowSorted.slice(0, lowCount));

  // 중가 상품 선택
  selected.push(...midSorted.slice(0, midCount));

  // 고가 상품 선택
  selected.push(...highSorted.slice(0, highCount));

  // 목표 개수에 미달하면 남은 상품에서 보충
  if (selected.length < targetCount) {
    const selectedIds = new Set(selected.map((p) => p.productId));
    const remaining = sortByReviewCount(products).filter(
      (p) => !selectedIds.has(p.productId)
    );
    const needed = targetCount - selected.length;
    selected.push(...remaining.slice(0, needed));
  }

  // 가격순으로 최종 정렬 (저가 → 고가)
  return selected.sort((a, b) => a.productPrice - b.productPrice);
}

/**
 * 메인 상품 선별 함수
 * 1. 평점 4.0 이상 필터링 (부족시 3.5로 완화)
 * 2. 리뷰 개수 많은 순 정렬
 * 3. 가격대 다양성 보장 (저가 30%, 중가 40%, 고가 30%)
 * 4. 최종 10개 반환
 */
export function selectProducts(
  products: CoupangProduct[],
  options: Partial<ProductSelectionOptions> = {}
): CoupangProduct[] {
  const opts: ProductSelectionOptions = {
    ...DEFAULT_SELECTION_OPTIONS,
    ...options,
  };

  if (products.length === 0) {
    return [];
  }

  // 1단계: 평점 필터링
  let filtered = filterByRating(products, opts.minRating);

  // 평점 필터링 후 상품이 부족하면 fallback 평점 사용
  if (filtered.length < opts.targetCount) {
    filtered = filterByRating(products, opts.fallbackMinRating);
  }

  // 여전히 부족하면 전체 상품 사용
  if (filtered.length < opts.targetCount) {
    filtered = products;
  }

  // 2단계: 가격대 다양성을 고려하여 선택
  const selected = selectWithPriceDiversity(filtered, {
    ...opts,
    targetCount: Math.min(opts.targetCount, filtered.length),
  });

  return selected;
}

/**
 * 선별된 상품의 가격대 정보 계산
 */
export interface PriceRangeInfo {
  low: { min: number; max: number; count: number };
  mid: { min: number; max: number; count: number };
  high: { min: number; max: number; count: number };
}

export function calculatePriceRanges(
  products: CoupangProduct[]
): PriceRangeInfo | null {
  if (products.length === 0) {
    return null;
  }

  const classified = classifyByPriceRange(products);

  const getRange = (items: CoupangProduct[]) => {
    if (items.length === 0) {
      return { min: 0, max: 0, count: 0 };
    }
    const prices = items.map((p) => p.productPrice);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      count: items.length,
    };
  };

  return {
    low: getRange(classified.low),
    mid: getRange(classified.mid),
    high: getRange(classified.high),
  };
}

/**
 * 가격대별 추천 대상 텍스트 생성
 */
export function getPriceRangeRecommendations(
  priceRanges: PriceRangeInfo
): string {
  const formatPrice = (price: number) =>
    price.toLocaleString("ko-KR") + "원";

  const lines: string[] = [];

  if (priceRanges.low.count > 0) {
    lines.push(
      `- 저가 (${formatPrice(priceRanges.low.min)} ~ ${formatPrice(priceRanges.low.max)}): 가성비를 중시하는 분들께 추천`
    );
  }

  if (priceRanges.mid.count > 0) {
    lines.push(
      `- 중가 (${formatPrice(priceRanges.mid.min)} ~ ${formatPrice(priceRanges.mid.max)}): 합리적인 가격과 품질의 균형을 원하는 분들께 추천`
    );
  }

  if (priceRanges.high.count > 0) {
    lines.push(
      `- 고가 (${formatPrice(priceRanges.high.min)} ~ ${formatPrice(priceRanges.high.max)}): 프리미엄 품질을 원하는 분들께 추천`
    );
  }

  return lines.join("\n");
}

export default {
  selectProducts,
  calculatePriceRanges,
  getPriceRangeRecommendations,
  DEFAULT_SELECTION_OPTIONS,
};
