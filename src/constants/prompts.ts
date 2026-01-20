/**
 * AI 프롬프트 템플릿
 */

export const BLOG_POST_SYSTEM_PROMPT = `당신은 10년차 제품 리뷰 블로거입니다.
실제 제품을 사용해본 것처럼 생생하고 구체적인 리뷰를 작성합니다.
독자와 공감대를 형성하며, 장단점을 균형있게 제시합니다.
반말 체("~해요", "~이에요")를 사용하여 친근하게 작성합니다.
구체적인 숫자와 사례를 활용하여 신뢰감을 줍니다.`;

export const BLOG_POST_USER_PROMPT = `## 키워드
{keyword}

## 상품 정보
{products}

## 가격대 정보
{priceRanges}

## 요구사항
2500~3000자 분량의 블로그 글을 다음 구조로 작성하세요:

### 1. 도입부 (약 300자)
- 독자의 고민/문제에 공감
- "이런 고민 있으시죠?" 형태로 시작
- 본인의 경험을 언급하며 공감대 형성

### 2. 구매 가이드 (약 200자 + 테이블)
- 가격대별 비교 테이블 (HTML table 태그 사용)
- 각 가격대별 추천 대상 명시
- 구매 시 체크포인트 간략히 설명

### 3. 각 상품 상세 리뷰 (상품당 약 350~400자)
각 상품에 대해:
- 제품 간략 설명 (150~200자)
- 장점 3가지 (bullet point)
- 단점 1~2가지 (bullet point)
- 상품 카드 HTML 포함

### 4. 결론 (약 200자)
- 가격대별/용도별 선택 가이드
- 독자에게 공감하는 마무리 멘트

## 상품 HTML 형식
각 상품은 반드시 다음 형식으로 포함하세요 (N은 상품 번호, 1부터 시작):
<div class="product-card">
  <img src="{{PRODUCT_IMAGE_N}}" alt="상품명" />
  <h3>상품명</h3>
  <p class="price">가격원</p>
  <a href="{{PRODUCT_LINK_N}}" target="_blank" rel="noopener noreferrer">쿠팡에서 보기</a>
</div>

## 작성 규칙
- 반말 사용 ("~해요", "~이에요", "~거든요")
- 실제 사용 경험처럼 작성
- 구체적인 숫자와 사례 활용
- h2, h3, p, ul, li, table 태그 사용
- 각 상품에 이미지와 구매 링크 필수 포함

## 출력 형식
반드시 아래 구분자 형식으로 응답하세요. 각 섹션은 구분자로 시작하고 다음 구분자 전까지가 해당 내용입니다:

---TITLE---
블로그 제목 (키워드 포함, 30~60자, 숫자와 연도 포함)
---CONTENT---
<html>본문</html>
---FOCUS_KEYWORD---
Focus Keyword (키워드 기반)
---META_DESCRIPTION---
메타 설명 (150자 이내, 키워드 포함)
---END---`;

/**
 * 가격대 정보 문자열 생성
 */
function formatPriceRanges(
  priceRanges: {
    low: { min: number; max: number; count: number };
    mid: { min: number; max: number; count: number };
    high: { min: number; max: number; count: number };
  } | null
): string {
  if (!priceRanges) {
    return "가격대 정보 없음";
  }

  const formatPrice = (price: number) => price.toLocaleString("ko-KR") + "원";
  const lines: string[] = [];

  if (priceRanges.low.count > 0) {
    lines.push(
      `- 저가 (${formatPrice(priceRanges.low.min)} ~ ${formatPrice(priceRanges.low.max)}): 가성비 중시하는 분께 추천`
    );
  }

  if (priceRanges.mid.count > 0) {
    lines.push(
      `- 중가 (${formatPrice(priceRanges.mid.min)} ~ ${formatPrice(priceRanges.mid.max)}): 가격과 품질의 균형을 원하는 분께 추천`
    );
  }

  if (priceRanges.high.count > 0) {
    lines.push(
      `- 고가 (${formatPrice(priceRanges.high.min)} ~ ${formatPrice(priceRanges.high.max)}): 프리미엄 품질을 원하는 분께 추천`
    );
  }

  return lines.length > 0 ? lines.join("\n") : "가격대 정보 없음";
}

/**
 * 프롬프트 빌더 함수
 */
export function buildBlogPostPrompt(
  keyword: string,
  products: Array<{
    productId?: string;
    productName: string;
    productPrice: number;
    productImage: string;
    productUrl: string;
    rating: number;
    reviewCount: number;
    isRocket?: boolean;
    categoryName?: string;
  }>,
  priceRanges?: {
    low: { min: number; max: number; count: number };
    mid: { min: number; max: number; count: number };
    high: { min: number; max: number; count: number };
  } | null
): string {
  const productsText = products
    .map(
      (p, i) => `
상품 ${i + 1}:
- 상품명: ${p.productName}
- 가격: ${p.productPrice.toLocaleString()}원
- 이미지 플레이스홀더: {{PRODUCT_IMAGE_${i + 1}}}
- 링크 플레이스홀더: {{PRODUCT_LINK_${i + 1}}}${p.isRocket ? "\n- 로켓배송: 지원" : ""}${p.categoryName ? `\n- 카테고리: ${p.categoryName}` : ""}`
    )
    .join("\n");

  const priceRangesText = formatPriceRanges(priceRanges || null);

  return BLOG_POST_USER_PROMPT.replace("{keyword}", keyword)
    .replace("{products}", productsText)
    .replace("{priceRanges}", priceRangesText);
}
