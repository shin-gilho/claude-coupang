import { NextRequest, NextResponse } from "next/server";
import {
  uploadProductImages,
  replaceImageUrls,
} from "@/lib/api/wordpress";
import type { WordPressConfig, CoupangProduct } from "@/types";

/**
 * 상품 이미지 업로드 API
 * POST /api/wordpress/media
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products, config, content } = body as {
      products: CoupangProduct[];
      config: WordPressConfig;
      content?: string; // 이미지 URL 교체할 콘텐츠 (선택)
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

    if (!products || products.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "업로드할 상품 이미지가 없습니다.",
          },
        },
        { status: 400 }
      );
    }

    // 이미지 업로드
    const { featuredMediaId, uploadedImages } = await uploadProductImages(
      config,
      products
    );

    // 콘텐츠 내 이미지 URL 교체 (선택적)
    let updatedContent: string | undefined;
    if (content && uploadedImages.length > 0) {
      updatedContent = replaceImageUrls(content, products, uploadedImages);
    }

    return NextResponse.json({
      success: true,
      data: {
        featuredMediaId,
        uploadedImages,
        updatedContent,
      },
    });
  } catch (error) {
    console.error("WordPress Media Upload Error:", error);

    const apiError = error as { code?: string; message?: string };
    if (apiError.code) {
      return NextResponse.json(
        {
          error: {
            code: apiError.code,
            message: apiError.message || "이미지 업로드 중 오류가 발생했습니다.",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "WORDPRESS_API_ERROR",
          message: "워드프레스 이미지 업로드에 실패했습니다.",
        },
      },
      { status: 500 }
    );
  }
}
