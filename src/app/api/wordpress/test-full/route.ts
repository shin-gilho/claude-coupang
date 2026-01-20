import { NextRequest, NextResponse } from "next/server";
import { createWordPressPost } from "@/lib/api/wordpress";
import type { WordPressConfig, CoupangProduct } from "@/types";

/**
 * AI 응답 없이 전체 워크플로우 테스트 API
 * POST /api/wordpress/test-full
 *
 * 사용법: 브라우저 콘솔에서
 * fetch('/api/wordpress/test-full', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     config: {
 *       url: 'YOUR_WP_URL',
 *       username: 'YOUR_USERNAME',
 *       applicationPassword: 'YOUR_APP_PASSWORD'
 *     }
 *   })
 * }).then(r => r.json()).then(console.log)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config } = body as {
      config: WordPressConfig;
    };

    if (!config?.url || !config?.username || !config?.applicationPassword) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "워드프레스 설정이 필요합니다.",
          },
        },
        { status: 400 }
      );
    }

    // 테스트용 가짜 상품 데이터
    const mockProducts: CoupangProduct[] = [
      {
        productId: "test-001",
        productName: "테스트 무선 이어폰 프로",
        productPrice: 89000,
        productImage: "https://via.placeholder.com/200x200?text=Product1",
        productUrl: "https://link.coupang.com/test-product-1",
        rating: 4.5,
        reviewCount: 1234,
        isRocket: true,
        categoryName: "이어폰",
      },
      {
        productId: "test-002",
        productName: "테스트 블루투스 헤드폰",
        productPrice: 129000,
        productImage: "https://via.placeholder.com/200x200?text=Product2",
        productUrl: "https://link.coupang.com/test-product-2",
        rating: 4.3,
        reviewCount: 567,
        isRocket: true,
        categoryName: "헤드폰",
      },
      {
        productId: "test-003",
        productName: "테스트 유선 이어폰 베이직",
        productPrice: 29000,
        productImage: "https://via.placeholder.com/200x200?text=Product3",
        productUrl: "https://link.coupang.com/test-product-3",
        rating: 4.1,
        reviewCount: 890,
        isRocket: false,
        categoryName: "이어폰",
      },
    ];

    // 상품 테이블 HTML 생성
    const productTableHtml = generateProductTable(mockProducts);

    // 테스트용 블로그 본문 (AI가 생성한 것처럼)
    const testContent = `
<h2>🎧 무선 이어폰, 어떤 걸 사야 할까?</h2>
<p>요즘 무선 이어폰 종류가 너무 많아서 뭘 사야 할지 고민되시죠? 저도 처음엔 그랬어요. 그래서 직접 여러 제품을 써보고 비교해봤어요.</p>

<h2>💰 가격대별 추천</h2>
<table style="width:100%;border-collapse:collapse;margin:20px 0;">
  <thead>
    <tr style="background:#f5f5f5;">
      <th style="padding:10px;border:1px solid #ddd;">가격대</th>
      <th style="padding:10px;border:1px solid #ddd;">추천 대상</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid #ddd;">3만원 이하</td>
      <td style="padding:10px;border:1px solid #ddd;">가성비 중시, 입문용</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid #ddd;">5~10만원</td>
      <td style="padding:10px;border:1px solid #ddd;">음질과 가격의 균형</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid #ddd;">10만원 이상</td>
      <td style="padding:10px;border:1px solid #ddd;">프리미엄 음질, 노이즈캔슬링</td>
    </tr>
  </tbody>
</table>

<h2>📦 추천 상품 상세 리뷰</h2>

<h3>1. 테스트 무선 이어폰 프로</h3>
<p>이 제품은 가격 대비 음질이 정말 좋아요. 노이즈캔슬링도 꽤 괜찮고요.</p>
<ul>
  <li>✅ 장점: 뛰어난 음질</li>
  <li>✅ 장점: 안정적인 연결</li>
  <li>✅ 장점: 긴 배터리 수명</li>
  <li>❌ 단점: 케이스가 좀 커요</li>
</ul>
<div class="product-card" style="border:1px solid #eee;padding:15px;margin:15px 0;border-radius:8px;">
  <img src="${mockProducts[0].productImage}" alt="${mockProducts[0].productName}" style="width:150px;height:150px;object-fit:contain;" />
  <h4>${mockProducts[0].productName}</h4>
  <p style="font-weight:bold;color:#ff5722;">${mockProducts[0].productPrice.toLocaleString()}원</p>
  <a href="${mockProducts[0].productUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#ff5722;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;">쿠팡에서 보기</a>
</div>

<h3>2. 테스트 블루투스 헤드폰</h3>
<p>오버이어 타입으로 장시간 착용해도 편해요. 출퇴근용으로 딱이에요.</p>
<ul>
  <li>✅ 장점: 편안한 착용감</li>
  <li>✅ 장점: 강력한 노이즈캔슬링</li>
  <li>✅ 장점: 고급스러운 디자인</li>
  <li>❌ 단점: 휴대성이 떨어져요</li>
</ul>
<div class="product-card" style="border:1px solid #eee;padding:15px;margin:15px 0;border-radius:8px;">
  <img src="${mockProducts[1].productImage}" alt="${mockProducts[1].productName}" style="width:150px;height:150px;object-fit:contain;" />
  <h4>${mockProducts[1].productName}</h4>
  <p style="font-weight:bold;color:#ff5722;">${mockProducts[1].productPrice.toLocaleString()}원</p>
  <a href="${mockProducts[1].productUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#ff5722;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;">쿠팡에서 보기</a>
</div>

<h3>3. 테스트 유선 이어폰 베이직</h3>
<p>충전 걱정 없이 쓰고 싶은 분들께 추천해요. 가격도 착하고요.</p>
<ul>
  <li>✅ 장점: 저렴한 가격</li>
  <li>✅ 장점: 충전 불필요</li>
  <li>✅ 장점: 가벼운 무게</li>
  <li>❌ 단점: 선이 불편할 수 있어요</li>
</ul>
<div class="product-card" style="border:1px solid #eee;padding:15px;margin:15px 0;border-radius:8px;">
  <img src="${mockProducts[2].productImage}" alt="${mockProducts[2].productName}" style="width:150px;height:150px;object-fit:contain;" />
  <h4>${mockProducts[2].productName}</h4>
  <p style="font-weight:bold;color:#ff5722;">${mockProducts[2].productPrice.toLocaleString()}원</p>
  <a href="${mockProducts[2].productUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#ff5722;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;">쿠팡에서 보기</a>
</div>

<h2>🎯 결론</h2>
<p>예산과 용도에 맞게 선택하시면 돼요. 가성비를 원하시면 3번, 음질을 중시하시면 1번, 노이즈캔슬링이 필요하시면 2번을 추천드려요!</p>

${productTableHtml}
    `.trim();

    // 워드프레스에 발행
    const testPost = {
      title: "🧪 [테스트] 2024 무선 이어폰 추천 TOP 3 - AI 워크플로우 테스트",
      content: testContent,
      status: "draft" as const,
      date: new Date().toISOString(),
      meta: {
        rank_math_focus_keyword: "무선 이어폰 추천",
        rank_math_description: "2024년 가성비 최고의 무선 이어폰을 비교 분석했습니다. 가격대별 추천 제품을 확인하세요.",
      },
    };

    const result = await createWordPressPost(config, testPost);

    return NextResponse.json({
      success: true,
      message: "테스트 포스트가 성공적으로 생성되었습니다! 워드프레스에서 확인하세요.",
      data: {
        ...result,
        note: "이 글은 AI API를 사용하지 않고 생성된 테스트 글입니다. 삭제하셔도 됩니다.",
      },
    });
  } catch (error) {
    console.error("WordPress Full Test Error:", error);

    const apiError = error as { code?: string; message?: string; status?: number };
    return NextResponse.json(
      {
        error: {
          code: apiError.code || "WORDPRESS_API_ERROR",
          message: apiError.message || "워드프레스 테스트에 실패했습니다.",
        },
      },
      { status: apiError.status || 500 }
    );
  }
}

/**
 * 상품 테이블 HTML 생성
 */
function generateProductTable(products: CoupangProduct[]): string {
  const rows = products.map((p, i) => `
    <tr>
      <td style="padding:12px;text-align:center;vertical-align:middle;border-bottom:1px solid #eee;">
        <img src="${p.productImage}" alt="${p.productName}" style="width:80px;height:80px;object-fit:contain;" />
      </td>
      <td style="padding:12px;vertical-align:middle;border-bottom:1px solid #eee;">
        <strong>${i + 1}. ${p.productName}</strong>
        ${p.isRocket ? '<span style="display:inline-block;background:#0073e6;color:white;padding:2px 6px;border-radius:4px;font-size:11px;margin-left:8px;">로켓배송</span>' : ''}
      </td>
      <td style="padding:12px;text-align:right;vertical-align:middle;font-weight:bold;white-space:nowrap;border-bottom:1px solid #eee;">
        ${p.productPrice.toLocaleString()}원
      </td>
      <td style="padding:12px;text-align:center;vertical-align:middle;border-bottom:1px solid #eee;">
        <a href="${p.productUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#ff5722;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:13px;">쿠팡에서 보기</a>
      </td>
    </tr>
  `).join('');

  return `
<h2 style="margin-top:40px;margin-bottom:20px;font-size:24px;border-bottom:2px solid #333;padding-bottom:10px;">📦 추천 상품 보러가기</h2>
<table style="width:100%;border-collapse:collapse;margin:20px 0;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.1);border-radius:8px;overflow:hidden;">
  <tbody>
    ${rows}
  </tbody>
</table>
<p style="font-size:12px;color:#888;margin-top:10px;">※ 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
`;
}
