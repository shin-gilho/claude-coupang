import { NextRequest, NextResponse } from "next/server";
import { searchCoupangProducts } from "@/lib/api/coupang";
import type { CoupangApiKeys } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, limit, config } = body as {
      keyword: string;
      limit?: number;
      config: CoupangApiKeys;
    };

    if (!keyword) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "키워드가 필요합니다." } },
        { status: 400 }
      );
    }

    if (!config?.accessKey || !config?.secretKey || !config?.partnerId) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "쿠팡 API 설정이 필요합니다.",
          },
        },
        { status: 400 }
      );
    }

    const products = await searchCoupangProducts(keyword, config, limit);

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("Coupang API Error:", error);

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
          code: "COUPANG_API_ERROR",
          message: "쿠팡 API 호출에 실패했습니다.",
        },
      },
      { status: 500 }
    );
  }
}
