import { NextRequest, NextResponse } from "next/server";
import { createWordPressPost } from "@/lib/api/wordpress";
import type { WordPressConfig } from "@/types";

/**
 * 워드프레스 테스트 포스트 생성 API
 * POST /api/wordpress/test
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

    // 테스트 포스트 데이터
    const testPost = {
      title: "🧪 워드프레스 연결 테스트",
      content: `
<h2>테스트 성공!</h2>
<p>이 글은 쿠팡 블로그 생성기에서 자동으로 작성된 테스트 글입니다.</p>
<p>생성 시간: ${new Date().toLocaleString("ko-KR")}</p>
<ul>
  <li>워드프레스 REST API 연결: ✅ 정상</li>
  <li>글 작성 권한: ✅ 정상</li>
  <li>인증: ✅ 정상</li>
</ul>
<p>이 글은 삭제하셔도 됩니다.</p>
      `.trim(),
      status: "draft" as const,
      date: new Date().toISOString(),
      meta: {
        rank_math_focus_keyword: "테스트",
        rank_math_description: "워드프레스 연결 테스트 글입니다.",
      },
    };

    const result = await createWordPressPost(config, testPost);

    return NextResponse.json({
      success: true,
      message: "테스트 포스트가 성공적으로 생성되었습니다!",
      data: result,
    });
  } catch (error) {
    console.error("WordPress Test Error:", error);

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
