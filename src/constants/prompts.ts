/**
 * AI 프롬프트 템플릿
 */

export const BLOG_POST_SYSTEM_PROMPT = `당신은 10년차 제품 리뷰 블로거입니다.
실제 제품을 사용해본 것처럼 생생하고 구체적인 리뷰를 작성합니다.
독자와 공감대를 형성하며, 장점을 중심으로 제품을 소개합니다.
반말 체("~해요", "~이에요")를 사용하여 친근하게 작성합니다.
구체적인 숫자와 사례를 활용하여 신뢰감을 줍니다.
현재 연도는 2026년입니다.`;

export const BLOG_POST_USER_PROMPT = `## 키워드
{keyword}

## 상품 정보
{products}

## 가격대 정보
{priceRanges}

## 현재 연도
2026년

## 요구사항
2500~3000자 분량의 블로그 글을 다음 구조로 작성하세요:

### 0. 쿠팡 파트너스 고지문 (필수, 맨 처음에)
반드시 글의 맨 처음에 다음 HTML을 포함하세요:
<div class="quote-box">
  <p>이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
</div>

### 1. 제목 반복
고지문 바로 다음에 블로그 제목을 p 태그로 작성하세요.
예시: <p><strong>나이키더플백 추천 TOP7 2026년 가성비 좋은 제품 총정리</strong></p>
제목 p 태그 이후 빈 줄 하나를 넣고 도입부를 시작하세요.

### 2. 도입부 (약 300자)
- 제목 p 태그와 빈 줄 다음에 바로 p 태그로 시작
- 독자가 겪는 상황/고민에 공감하는 내용
- 본인의 경험을 언급하며 공감대 형성
- "이런 고민 있으시죠?" 형태로 자연스럽게 시작

### 3. 선택 기준 (h2 필수)
- 다양한 h2 문구 사용: "OOO 현명하게 고르는 법", "무슨 기준으로 OOO를 선택할까?", "OOO 선택 시 체크포인트" 등
- 가격대별 비교 테이블 (HTML table 태그 사용)
- 구매 시 체크포인트 설명

### 4. 각 상품 상세 리뷰
각 상품에 대해:
- 5줄 이내의 간결한 설명 (p 태그 1개, 약 100~150자)
  - 이 제품의 핵심 소구점
  - 실제 사용 경험이 담긴 장점
  - 어떤 사람에게 추천하는지
- 장점 3가지 (bullet point)
- 단점은 작성하지 않음
- 가격 정보는 본문에 포함하지 않음
- 상품 카드 HTML 포함

### 5. 결론 (약 200자)
- 용도별 선택 가이드
- 독자에게 공감하는 마무리 멘트

## 상품 HTML 형식
각 상품 카드는 아래 순서로 작성 (상품명 h3 → 이미지 → 버튼):
<div class="product-card" style="text-align:center;">
  <h3>상품명</h3>
  <img src="{{PRODUCT_IMAGE_N}}" alt="상품명" style="display:block;margin:0 auto;" />
  <a href="{{PRODUCT_LINK_N}}" class="wp-button-animated" target="_blank" rel="noopener noreferrer">버튼명</a>
</div>

버튼명은 다음 3가지를 상품마다 순환하며 사용:
1번 상품: "최저가 확인하기"
2번 상품: "이 가격에 구매하기"
3번 상품: "할인가 확인하기"
4번 상품: "최저가 확인하기" (반복)
...

## 제목 작성 규칙
- 30~60자
- 키워드 포함
- 연도는 반드시 2026년
- 상품 개수 표기: "10선" 사용 금지, "TOP10", "TOP5" 형식 사용
  - 예시: "나이키더플백 추천 TOP10 2026년 가성비 좋은 제품 총정리"

## 작성 규칙
- 반말 사용 ("~해요", "~이에요", "~거든요")
- 실제 사용 경험처럼 작성
- 구체적인 숫자와 사례 활용
- h2, h3, p, ul, li, table 태그 사용
- 각 상품에 이미지와 구매 링크 필수 포함
- 단점/cons는 절대 작성하지 않음
- 가격 정보는 상품 설명에 포함하지 않음

## 출력 형식
반드시 아래 구분자 형식으로 응답하세요:

---TITLE---
블로그 제목
---CONTENT---
<html>본문</html>
---FOCUS_KEYWORD---
Focus Keyword
---META_DESCRIPTION---
메타 설명 (150자 이내)
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

/**
 * 파트 1 프롬프트 (도입부 + 선택기준 + 상품 1~4)
 */
export const BLOG_POST_PART1_PROMPT = `## 키워드
{keyword}

## 전체 상품 수
총 {totalCount}개 상품 (이 파트에서는 1~4번만 작성, 나머지는 다음 파트에서 작성)

## 상품 정보 (1~4번 상품)
{products}

## 가격대 정보
{priceRanges}

## 현재 연도
2026년

## 요구사항
다음 구조로 블로그 글을 작성하세요 (이 응답에서는 상품 1~4번까지만 작성):

### 0. 쿠팡 파트너스 고지문 (필수, 맨 처음에)
반드시 글의 맨 처음에 다음 HTML을 포함하세요:
<div class="quote-box">
  <p>이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
</div>

### 1. 제목 반복
고지문 바로 다음에 블로그 제목을 p 태그로 작성하세요.
예시: <p><strong>나이키더플백 추천 TOP7 2026년 가성비 좋은 제품 총정리</strong></p>

### 2. 도입부 (약 300자)
- 제목 p 태그 다음에 바로 p 태그로 시작
- 독자가 겪는 상황/고민에 공감하는 내용
- "이런 고민 있으시죠?" 형태로 자연스럽게 시작

### 3. 선택 기준 (h2 필수)
- 다양한 h2 문구 사용: "OOO 현명하게 고르는 법" 등
- 가격대별 비교 테이블 (HTML table 태그 사용)
- 구매 시 체크포인트 설명

### 4. 상품 1~4번 상세 리뷰
각 상품에 대해:
- 5줄 이내의 간결한 설명 (p 태그 1개, 약 100~150자)
  - 이 제품의 핵심 소구점
  - 실제 사용 경험이 담긴 장점
  - 어떤 사람에게 추천하는지
- 장점 3가지 (bullet point)
- 단점은 작성하지 않음
- 가격 정보는 본문에 포함하지 않음
- 상품 카드 HTML 포함

## 상품 HTML 형식
각 상품 카드는 아래 순서로 작성 (상품명 h3 → 이미지 → 버튼):
<div class="product-card" style="text-align:center;">
  <h3>상품명</h3>
  <img src="{{PRODUCT_IMAGE_N}}" alt="상품명" style="display:block;margin:0 auto;" />
  <a href="{{PRODUCT_LINK_N}}" class="wp-button-animated" target="_blank" rel="noopener noreferrer">버튼명</a>
</div>

버튼명은 다음 3가지를 상품마다 순환하며 사용:
1번 상품: "최저가 확인하기"
2번 상품: "이 가격에 구매하기"
3번 상품: "할인가 확인하기"
4번 상품: "최저가 확인하기" (반복)

## 제목 작성 규칙
- 30~60자
- 키워드 포함
- 연도는 반드시 2026년
- 상품 개수 표기: "TOP{totalCount}" 형식 사용 (예: 7개 상품이면 TOP7)
- 주의: 이 파트에서 4개만 작성하더라도 제목은 반드시 전체 상품 수({totalCount}개) 기준으로 작성
- 파트, 순위 범위 등 부가 정보를 제목에 절대 포함하지 마세요
  - 잘못된 예: "무선 이어폰 추천 TOP7 (첫 번째 파트: 1~4위)"
  - 올바른 예: "무선 이어폰 추천 TOP7 2026년 가성비 좋은 제품"

## 작성 규칙
- 반말 사용 ("~해요", "~이에요", "~거든요")
- 실제 사용 경험처럼 작성
- h2, h3, p, ul, li, table 태그 사용

## 출력 형식
---TITLE---
블로그 제목 (파트 정보 없이, 예: "무선 이어폰 추천 TOP7 2026년 가성비 좋은 제품")
---CONTENT---
<html>본문 (고지문 + 제목p + 도입부 + 선택기준 + 상품 1~4 리뷰)</html>
---END---`;

/**
 * 파트 2 프롬프트 (상품 5~N + 결론)
 */
export const BLOG_POST_PART2_PROMPT = `## 키워드
{keyword}

## 이전 파트 제목
{title}

## 남은 상품 정보 ({startIndex}번부터)
{products}

## 현재 연도
2026년

## 중요: 이어서 작성하기
이 파트는 이전 파트의 **연속**입니다.
- 제목을 다시 작성하지 마세요
- 서론/도입부를 다시 작성하지 마세요
- 선택 기준을 다시 작성하지 마세요
- 바로 상품 {startIndex}번 리뷰부터 시작하세요

## 요구사항
### 상품 {startIndex}~{endIndex}번 상세 리뷰
각 상품에 대해:
- 5줄 이내의 간결한 설명 (p 태그 1개, 약 100~150자)
  - 이 제품의 핵심 소구점
  - 실제 사용 경험이 담긴 장점
  - 어떤 사람에게 추천하는지
- 장점 3가지 (bullet point)
- 단점은 작성하지 않음
- 가격 정보는 본문에 포함하지 않음
- 상품 카드 HTML 포함

### 결론 (약 200자)
- 용도별 선택 가이드
- 독자에게 공감하는 마무리 멘트

## 상품 HTML 형식 (Part 1과 동일하게 유지)
상품명은 반드시 h3 태그, 순서는 h3 → 이미지 → 버튼:
<div class="product-card" style="text-align:center;">
  <h3>상품명</h3>  <!-- 반드시 h3 사용 -->
  <img src="{{PRODUCT_IMAGE_N}}" alt="상품명" style="display:block;margin:0 auto;" />
  <a href="{{PRODUCT_LINK_N}}" class="wp-button-animated" target="_blank" rel="noopener noreferrer">버튼명</a>
</div>

버튼명은 상품 번호에 따라 순환:
5번 상품: "이 가격에 구매하기" (5 % 3 = 2)
6번 상품: "할인가 확인하기" (6 % 3 = 0 → 3번째)
7번 상품: "최저가 확인하기" (7 % 3 = 1)
...

## 작성 규칙
- 반말 사용 ("~해요", "~이에요", "~거든요")
- 실제 사용 경험처럼 작성
- 상품명은 반드시 h3 태그 사용 (h2는 섹션 제목에만 사용)
- 제목, 서론, 선택기준은 절대 다시 작성하지 않음

## 출력 형식
---CONTENT---
<html>본문 (상품 {startIndex}~{endIndex} 리뷰 + 결론만, 제목/서론 없이)</html>
---END---`;

/**
 * 파트 1 프롬프트 빌더 (상품 1~4)
 */
export function buildPart1Prompt(
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
  } | null,
  totalCount?: number
): string {
  const total = totalCount || products.length;
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

  return BLOG_POST_PART1_PROMPT.replace("{keyword}", keyword)
    .replace(/{totalCount}/g, String(total))
    .replace("{products}", productsText)
    .replace("{priceRanges}", priceRangesText);
}

/**
 * 파트 2 프롬프트 빌더 (상품 5~N)
 */
export function buildPart2Prompt(
  keyword: string,
  title: string,
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
  startIndex: number = 5
): string {
  const endIndex = startIndex + products.length - 1;
  const productsText = products
    .map(
      (p, i) => `
상품 ${startIndex + i}:
- 상품명: ${p.productName}
- 가격: ${p.productPrice.toLocaleString()}원
- 이미지 플레이스홀더: {{PRODUCT_IMAGE_${startIndex + i}}}
- 링크 플레이스홀더: {{PRODUCT_LINK_${startIndex + i}}}${p.isRocket ? "\n- 로켓배송: 지원" : ""}${p.categoryName ? `\n- 카테고리: ${p.categoryName}` : ""}`
    )
    .join("\n");

  return BLOG_POST_PART2_PROMPT.replace("{keyword}", keyword)
    .replace("{title}", title)
    .replace(/{startIndex}/g, String(startIndex))
    .replace(/{endIndex}/g, String(endIndex))
    .replace("{products}", productsText);
}
