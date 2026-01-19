import { NextRequest, NextResponse } from "next/server";
import {
  createWordPressPost,
  testWordPressConnection,
} from "@/lib/api/wordpress";
import type { WordPressConfig, WordPressPost } from "@/types";

// 포스트 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { post, config } = body as {
      post: WordPressPost;
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

    if (!post?.title || !post?.content) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "포스트 제목과 내용이 필요합니다.",
          },
        },
        { status: 400 }
      );
    }

    const result = await createWordPressPost(config, post);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("WordPress API Error:", error);

    const apiError = error as { code?: string; message?: string };
    if (apiError.code) {
      return NextResponse.json(
        { error: { code: apiError.code, message: apiError.message || "오류가 발생했습니다." } },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "WORDPRESS_API_ERROR",
          message: "워드프레스 API 호출에 실패했습니다.",
        },
      },
      { status: 500 }
    );
  }
}

// 연결 테스트
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const username = searchParams.get("username");
    const password = searchParams.get("password");

    if (!url || !username || !password) {
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

    const isConnected = await testWordPressConnection({
      url,
      username,
      applicationPassword: password,
    });

    return NextResponse.json({ success: true, data: { connected: isConnected } });
  } catch (error) {
    console.error("WordPress Connection Test Error:", error);

    return NextResponse.json(
      {
        error: {
          code: "WORDPRESS_API_ERROR",
          message: "워드프레스 연결 테스트에 실패했습니다.",
        },
      },
      { status: 500 }
    );
  }
}
