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

### 4. 각 상품 상세 리뷰 (상품당 약 400~450자)
각 상품에 대해:
- 소구점을 정확히 파악한 2문단 설명 (각 문단 150~200자)
  - 첫 문단: 이 제품의 핵심 특징과 장점
  - 둘째 문단: 어떤 사람에게 적합한지, 실사용 시나리오
- 장점 3가지 (bullet point)
- 단점은 작성하지 않음
- 가격 정보는 본문에 포함하지 않음
- 상품 카드 HTML 포함

### 5. 결론 (약 200자)
- 용도별 선택 가이드
- 독자에게 공감하는 마무리 멘트

## 상품 HTML 형식
각 상품 이미지는 가운데 정렬, 버튼은 wp-button-animated 클래스 사용:
<div class="product-card" style="text-align:center;">
  <img src="{{PRODUCT_IMAGE_N}}" alt="상품명" style="display:block;margin:0 auto;" />
  <h3>상품명</h3>
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

## 상품 정보 (1~4번 상품)
{products}

## 가격대 정보
{priceRanges}

## 현재 연도
2026년

## 요구사항
블로그 글의 **첫 번째 파트**를 작성하세요:

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

### 4. 상품 1~4번 상세 리뷰 (상품당 약 400~450자)
각 상품에 대해:
- 소구점을 정확히 파악한 2문단 설명
- 장점 3가지 (bullet point)
- 단점은 작성하지 않음
- 가격 정보는 본문에 포함하지 않음
- 상품 카드 HTML 포함

## 상품 HTML 형식
<div class="product-card" style="text-align:center;">
  <img src="{{PRODUCT_IMAGE_N}}" alt="상품명" style="display:block;margin:0 auto;" />
  <h3>상품명</h3>
  <a href="{{PRODUCT_LINK_N}}" class="wp-button-animated" target="_blank" rel="noopener noreferrer">쿠팡에서 보기</a>
</div>

## 제목 작성 규칙
- 30~60자
- 키워드 포함
- 연도는 반드시 2026년
- 상품 개수 표기: "TOP7" 형식 사용

## 작성 규칙
- 반말 사용 ("~해요", "~이에요", "~거든요")
- 실제 사용 경험처럼 작성
- h2, h3, p, ul, li, table 태그 사용

## 출력 형식
---TITLE---
블로그 제목
---CONTENT---
<html>본문 (고지문 + 제목p + 도입부 + 선택기준 + 상품 1~4 리뷰)</html>
---END---`;

/**
 * 파트 2 프롬프트 (상품 5~7 + 결론)
 */
export const BLOG_POST_PART2_PROMPT = `## 키워드
{keyword}

## 이전 파트 제목
{title}

## 남은 상품 정보 (5~7번 상품)
{products}

## 현재 연도
2026년

## 요구사항
블로그 글의 **두 번째 파트**를 작성하세요.
이전 파트와 동일한 톤과 스타일을 유지하세요.

### 상품 5~7번 상세 리뷰 (상품당 약 400~450자)
각 상품에 대해:
- 소구점을 정확히 파악한 2문단 설명
- 장점 3가지 (bullet point)
- 단점은 작성하지 않음
- 가격 정보는 본문에 포함하지 않음
- 상품 카드 HTML 포함

### 결론 (약 200자)
- 용도별 선택 가이드
- 독자에게 공감하는 마무리 멘트

## 상품 HTML 형식
<div class="product-card" style="text-align:center;">
  <img src="{{PRODUCT_IMAGE_N}}" alt="상품명" style="display:block;margin:0 auto;" />
  <h3>상품명</h3>
  <a href="{{PRODUCT_LINK_N}}" class="wp-button-animated" target="_blank" rel="noopener noreferrer">쿠팡에서 보기</a>
</div>

## 작성 규칙
- 반말 사용 ("~해요", "~이에요", "~거든요")
- 실제 사용 경험처럼 작성
- h2, h3, p, ul, li 태그 사용

## 출력 형식
---CONTENT---
<html>본문 (상품 5~7 리뷰 + 결론)</html>
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

  return BLOG_POST_PART1_PROMPT.replace("{keyword}", keyword)
    .replace("{products}", productsText)
    .replace("{priceRanges}", priceRangesText);
}

/**
 * 파트 2 프롬프트 빌더 (상품 5~7)
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
    .replace("{products}", productsText);
}
