/**
 * 쿠팡 파트너스 API 클라이언트
 */

import crypto from "crypto";
import axios from "axios";
import type { CoupangProduct, CoupangApiKeys } from "@/types";
import { createApiError } from "@/types";

const COUPANG_API_BASE = "https://api-gateway.coupang.com";

/**
 * GMT 날짜 포맷 생성 (yyMMddTHHmmssZ 형식)
 * 쿠팡 API 공식 가이드에 따른 형식
 */
function formatDatetime(): string {
  const now = new Date();
  const yy = String(now.getUTCFullYear()).slice(-2);
  const MM = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const HH = String(now.getUTCHours()).padStart(2, "0");
  const mm = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  return `${yy}${MM}${dd}T${HH}${mm}${ss}Z`;
}

/**
 * HMAC 서명 생성
 * 메시지 형식: datetime + method + path + query
 */
function generateSignature(
  method: string,
  path: string,
  query: string,
  secretKey: string,
  datetime: string
): string {
  const message = datetime + method + path + query;
  return crypto.createHmac("sha256", secretKey).update(message).digest("hex");
}

/**
 * Authorization 헤더 생성
 * @param method HTTP 메서드 (GET, POST 등)
 * @param uri 전체 URI (path?query 형태)
 * @param accessKey 쿠팡 Access Key
 * @param secretKey 쿠팡 Secret Key
 */
function generateAuthHeader(
  method: string,
  uri: string,
  accessKey: string,
  secretKey: string
): string {
  const parts = uri.split("?");
  const path = parts[0];
  const query = parts.length > 1 ? parts[1] : "";

  const datetime = formatDatetime();
  const signature = generateSignature(method, path, query, secretKey, datetime);

  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`;
}

/**
 * 쿠팡 상품 검색
 */
export async function searchCoupangProducts(
  keyword: string,
  config: CoupangApiKeys,
  limit: number = 5
): Promise<CoupangProduct[]> {
  const path = `/v2/providers/affiliate_open_api/apis/openapi/v1/products/search`;

  const params = new URLSearchParams({
    keyword,
    limit: String(limit),
    subId: config.partnerId,
  });

  const fullPath = `${path}?${params.toString()}`;

  try {
    const response = await axios.get(`${COUPANG_API_BASE}${path}`, {
      params: {
        keyword,
        limit,
        subId: config.partnerId,
      },
      headers: {
        Authorization: generateAuthHeader(
          "GET",
          fullPath,
          config.accessKey,
          config.secretKey
        ),
        "Content-Type": "application/json",
      },
    });

    if (response.data.rCode !== "0") {
      throw createApiError(
        "COUPANG_API_ERROR",
        response.data.rMessage || "쿠팡 API 오류가 발생했습니다."
      );
    }

    const products = response.data.data?.productData || [];

    return products.map(transformProduct);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.rMessage ||
        error.message ||
        "쿠팡 API 호출에 실패했습니다.";
      throw createApiError("COUPANG_API_ERROR", message, error.response?.status);
    }
    throw error;
  }
}

/**
 * 쿠팡 API 응답을 CoupangProduct 타입으로 변환
 */
function transformProduct(raw: Record<string, unknown>): CoupangProduct {
  return {
    productId: String(raw.productId || ""),
    productName: String(raw.productName || ""),
    productPrice: Number(raw.productPrice) || 0,
    productImage: String(raw.productImage || ""),
    productUrl: String(raw.productUrl || ""),
    rating: Number(raw.rating) || 0,
    reviewCount: Number(raw.reviewCount) || 0,
    isRocket: Boolean(raw.isRocket),
    isFreeShipping: Boolean(raw.isFreeShipping),
    categoryName: String(raw.categoryName || ""),
  };
}

/**
 * 쿠팡 API 클라이언트 클래스
 */
export class CoupangApiClient {
  private config: CoupangApiKeys;

  constructor(config: CoupangApiKeys) {
    this.config = config;
  }

  async searchProducts(keyword: string, limit?: number): Promise<CoupangProduct[]> {
    return searchCoupangProducts(keyword, this.config, limit);
  }
}

export default CoupangApiClient;
