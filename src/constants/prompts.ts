/**
 * AI 프롬프트 템플릿
 */

export const BLOG_POST_SYSTEM_PROMPT = `당신은 쿠팡 파트너스 블로그 글 작성 전문가입니다.
주어진 키워드와 상품 정보를 바탕으로 SEO에 최적화된 블로그 글을 작성합니다.
글은 자연스럽고 정보가 풍부하며, 독자가 구매 결정을 내리는 데 도움이 되어야 합니다.`;

export const BLOG_POST_USER_PROMPT = `## 키워드
{keyword}

## 상품 정보
{products}

## 요구사항
1. 매력적이고 클릭을 유도하는 제목 작성 (키워드 포함)
2. 1500-2000자 분량의 본문 작성
3. 각 상품별 특징, 장단점 비교
4. 구매 가이드 및 추천 포함
5. HTML 형식으로 출력 (h2, h3, p, ul, li 태그 사용)
6. 각 상품에 이미지와 구매 링크 포함

## 상품 HTML 형식
각 상품은 다음 형식으로 포함하세요:
<div class="product-card">
  <img src="상품이미지URL" alt="상품명" />
  <h3>상품명</h3>
  <p class="price">가격원</p>
  <p class="rating">평점: X.X (리뷰 N개)</p>
  <a href="상품링크" target="_blank" rel="noopener">쿠팡에서 보기</a>
</div>

## 출력 형식
반드시 아래 JSON 형식으로만 응답하세요:
{
  "title": "블로그 제목",
  "content": "<html>본문</html>",
  "focusKeyword": "Focus Keyword (키워드 기반)",
  "metaDescription": "메타 설명 (150자 이내, 키워드 포함)"
}`;

/**
 * 프롬프트 빌더 함수
 */
export function buildBlogPostPrompt(
  keyword: string,
  products: Array<{
    productName: string;
    productPrice: number;
    productImage: string;
    productUrl: string;
    rating: number;
    reviewCount: number;
  }>
): string {
  const productsText = products
    .map(
      (p, i) => `
상품 ${i + 1}:
- 상품명: ${p.productName}
- 가격: ${p.productPrice.toLocaleString()}원
- 이미지: ${p.productImage}
- 링크: ${p.productUrl}
- 평점: ${p.rating}
- 리뷰 수: ${p.reviewCount}개`
    )
    .join("\n");

  return BLOG_POST_USER_PROMPT.replace("{keyword}", keyword).replace(
    "{products}",
    productsText
  );
}
