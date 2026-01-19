/**
 * 워드프레스 콘텐츠 최적화 유틸리티
 */

import type { CoupangProduct, BlogPost } from "@/types";

/**
 * HTML 콘텐츠 정리 및 최적화
 */
export function sanitizeHtmlContent(content: string): string {
  return content
    // 연속 줄바꿈 정리
    .replace(/\n{3,}/g, "\n\n")
    // 연속 공백 정리
    .replace(/[ \t]+/g, " ")
    // 빈 태그 제거
    .replace(/<(\w+)[^>]*>\s*<\/\1>/g, "")
    // 공백만 있는 문단 제거
    .replace(/<p>\s*<\/p>/g, "")
    .trim();
}

/**
 * 쿠팡 상품 이미지 URL 처리
 * 이미지 URL 최적화 및 lazy loading 속성 추가
 */
export function processProductImages(products: CoupangProduct[]): CoupangProduct[] {
  return products.map((product) => ({
    ...product,
    productImage: optimizeImageUrl(product.productImage),
  }));
}

/**
 * 이미지 URL 최적화
 */
export function optimizeImageUrl(url: string): string {
  // URL이 유효하지 않으면 그대로 반환
  if (!url || !url.startsWith("http")) {
    return url;
  }

  // 쿠팡 이미지인 경우 처리
  if (url.includes("coupangcdn.com") || url.includes("coupa.ng")) {
    // HTTPS 강제
    url = url.replace(/^http:/, "https:");
  }

  return url;
}

/**
 * 상품 정보를 HTML 형식으로 변환
 */
export function formatProductHtml(product: CoupangProduct, rank: number): string {
  const priceText = product.productPrice.toLocaleString("ko-KR");

  return `
<div class="product-card" style="border: 1px solid #e0e0e0; padding: 20px; margin: 15px 0; border-radius: 8px;">
  <h3 style="margin-bottom: 10px;">${rank}위. ${escapeHtml(product.productName)}</h3>
  <div style="display: flex; gap: 20px; align-items: flex-start;">
    <img src="${escapeHtml(product.productImage)}" alt="${escapeHtml(product.productName)}"
         style="width: 200px; height: auto; border-radius: 4px;" loading="lazy" />
    <div style="flex: 1;">
      <p style="font-size: 1.2em; font-weight: bold; color: #e53935; margin: 10px 0;">
        ${priceText}원
      </p>
      ${product.isRocket ? '<span style="background: #1976D2; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.9em;">로켓배송</span>' : ""}
      ${product.isFreeShipping ? '<span style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.9em; margin-left: 5px;">무료배송</span>' : ""}
      <p style="margin-top: 15px;">
        <a href="${escapeHtml(product.productUrl)}" target="_blank" rel="noopener sponsored"
           style="display: inline-block; background: #FF5722; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          쿠팡에서 보기
        </a>
      </p>
    </div>
  </div>
</div>`.trim();
}

/**
 * HTML 특수문자 이스케이프
 */
export function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

/**
 * 블로그 포스트 콘텐츠 최종 빌드
 */
export function buildFinalContent(blogPost: BlogPost): string {
  let content = blogPost.content;

  // 쿠팡 파트너스 고지문 추가
  const disclosure = `
<div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; font-size: 0.9em; color: #666;">
  <p>이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
</div>`;

  // 콘텐츠 끝에 고지문 추가
  content = sanitizeHtmlContent(content) + disclosure;

  return content;
}

/**
 * 예약 발행 날짜 생성
 */
export function createScheduledDate(
  baseDate: Date,
  offsetMinutes: number = 0
): Date {
  const scheduledDate = new Date(baseDate.getTime() + offsetMinutes * 60 * 1000);
  return scheduledDate;
}

/**
 * 워드프레스 ISO 날짜 형식으로 변환
 */
export function formatWordPressDate(date: Date): string {
  return date.toISOString();
}

/**
 * 다음 발행 가능 시간 계산
 */
export function getNextPublishTime(
  settings: { startHour: number; endHour: number; intervalMinutes: number },
  lastPublishTime?: Date
): Date {
  const now = new Date();
  const { startHour, endHour, intervalMinutes } = settings;

  let nextTime: Date;

  if (lastPublishTime) {
    // 마지막 발행 시간 + 인터벌
    nextTime = new Date(lastPublishTime.getTime() + intervalMinutes * 60 * 1000);
  } else {
    // 현재 시간 기준
    nextTime = new Date(now);
  }

  // 발행 가능 시간대 확인
  const hour = nextTime.getHours();

  if (hour < startHour) {
    // 시작 시간 전이면 시작 시간으로 설정
    nextTime.setHours(startHour, 0, 0, 0);
  } else if (hour >= endHour) {
    // 종료 시간 이후면 다음 날 시작 시간으로 설정
    nextTime.setDate(nextTime.getDate() + 1);
    nextTime.setHours(startHour, 0, 0, 0);
  }

  return nextTime;
}

export default {
  sanitizeHtmlContent,
  processProductImages,
  optimizeImageUrl,
  formatProductHtml,
  escapeHtml,
  buildFinalContent,
  createScheduledDate,
  formatWordPressDate,
  getNextPublishTime,
};
