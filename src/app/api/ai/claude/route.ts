import { NextRequest, NextResponse } from "next/server";
import { generateBlogPostWithClaude } from "@/lib/api/claude";
import type { CoupangProduct } from "@/types";

interface PriceRanges {
  low: { min: number; max: number; count: number };
  mid: { min: number; max: number; count: number };
  high: { min: number; max: number; count: number };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, products, apiKey, priceRanges } = body as {
      keyword: string;
      products: CoupangProduct[];
      apiKey: string;
      priceRanges?: PriceRanges | null;
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
            message: "Claude API 키가 필요합니다.",
          },
        },
        { status: 400 }
      );
    }

    const blogPost = await generateBlogPostWithClaude(apiKey, keyword, products, priceRanges);

    return NextResponse.json({ success: true, data: blogPost });
  } catch (error) {
    console.error("Claude API Error:", error);

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
          code: "CLAUDE_API_ERROR",
          message: "Claude API 호출에 실패했습니다.",
        },
      },
      { status: 500 }
    );
  }
}
