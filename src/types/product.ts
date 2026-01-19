/**
 * 쿠팡 상품 데이터 타입
 */
export interface CoupangProduct {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string; // 파트너스 링크
  rating: number;
  reviewCount: number;
  isRocket: boolean;
  categoryName: string;
}

/**
 * 쿠팡 API 응답 타입
 */
export interface CoupangApiResponse {
  rCode: string;
  rMessage: string;
  data: {
    productData: CoupangProductRaw[];
  };
}

/**
 * 쿠팡 API 원본 상품 데이터
 */
export interface CoupangProductRaw {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string;
  rating?: number;
  reviewCount?: number;
  isRocket?: boolean;
  categoryName?: string;
}
