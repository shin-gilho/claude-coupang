import { NextRequest, NextResponse } from "next/server";
import { generateBlogPostWithGemini } from "@/lib/api/gemini";
import type { CoupangProduct } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, products, apiKey } = body as {
      keyword: string;
      products: CoupangProduct[];
      apiKey: string;
    };

    if (!keyword) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "키워드가 필요합니다." } },
        { status: 400 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "상품 정보가 필요합니다.",
          },
        },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Gemini API 키가 필요합니다.",
          },
        },
        { status: 400 }
      );
    }

    const blogPost = await generateBlogPostWithGemini(apiKey, keyword, products);

    return NextResponse.json({ success: true, data: blogPost });
  } catch (error) {
    console.error("Gemini API Error:", error);

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
          code: "GEMINI_API_ERROR",
          message: "Gemini API 호출에 실패했습니다.",
        },
      },
      { status: 500 }
    );
  }
}
