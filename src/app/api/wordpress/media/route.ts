import { NextRequest, NextResponse } from "next/server";
import {
  replaceImageUrls,
  removeFailedImageTags,
  removeFailedImagesFromTable,
} from "@/lib/api/wordpress";
import { uploadProductImagesWithCompression } from "@/lib/api/wordpress-server";
import type { WordPressConfig, CoupangProduct } from "@/types";

/**
 * 상품 이미지 업로드 API
 * POST /api/wordpress/media
 *
 * 응답에 업로드 통계 및 실패 정보 포함
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

    // 이미지 업로드 (압축 + 통계 포함)
    const uploadResult = await uploadProductImagesWithCompression(config, products);

    const {
      featuredMediaId,
      uploadedImages,
      failedImages,
      totalCount,
      successCount,
      failedCount,
    } = uploadResult;

    // 콘텐츠 처리
    let updatedContent: string | undefined;
    if (content) {
      // 1. 성공한 이미지 URL 교체
      updatedContent = uploadedImages.length > 0
        ? replaceImageUrls(content, products, uploadedImages)
        : content;

      // 2. 실패한 이미지 태그 제거 (외부 URL 폴백 방지)
      if (failedImages.length > 0) {
        updatedContent = removeFailedImageTags(updatedContent, products, uploadedImages);
        updatedContent = removeFailedImagesFromTable(updatedContent, products, uploadedImages);
      }
    }

    // 부분 성공/실패에 대한 상세 응답
    const response = {
      success: successCount > 0 || failedCount === 0,
      data: {
        featuredMediaId,
        uploadedImages,
        updatedContent,
        // 업로드 통계
        stats: {
          total: totalCount,
          success: successCount,
          failed: failedCount,
        },
        // 실패 정보 (디버깅용)
        failedImages: failedImages.map((f) => ({
          productId: f.productId,
          errorCode: f.errorCode,
          errorMessage: f.errorMessage,
        })),
      },
    };

    // 모든 이미지가 실패한 경우 경고 포함
    if (successCount === 0 && totalCount > 0) {
      return NextResponse.json({
        ...response,
        warning: "모든 이미지 업로드에 실패했습니다. 콘텐츠에서 이미지가 제거됩니다.",
      });
    }

    // 일부 실패한 경우
    if (failedCount > 0) {
      return NextResponse.json({
        ...response,
        warning: `${failedCount}개의 이미지 업로드에 실패했습니다. 해당 이미지는 콘텐츠에서 제거됩니다.`,
      });
    }

    return NextResponse.json(response);
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
