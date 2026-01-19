/**
 * 발행 예약 스케줄러
 */

import type { PublishSettings } from "@/types";

export interface ScheduleSlot {
  date: Date;
  index: number;
}

/**
 * 시간 문자열(HH:mm)에서 시간 추출
 */
function parseHour(timeString: string): number {
  const [hour] = timeString.split(":").map(Number);
  return hour || 0;
}

/**
 * 발행 시간대 내에 있는지 확인
 */
export function isWithinPublishHours(
  date: Date,
  startHour: number,
  endHour: number
): boolean {
  const hour = date.getHours();
  return hour >= startHour && hour < endHour;
}

/**
 * 다음 발행 가능 시간 계산
 */
export function getNextAvailableTime(
  currentTime: Date,
  startHour: number,
  endHour: number
): Date {
  const next = new Date(currentTime);

  // 현재 시간이 시작 시간 전이면 당일 시작 시간으로
  if (next.getHours() < startHour) {
    next.setHours(startHour, 0, 0, 0);
    return next;
  }

  // 현재 시간이 종료 시간 이후이면 다음 날 시작 시간으로
  if (next.getHours() >= endHour) {
    next.setDate(next.getDate() + 1);
    next.setHours(startHour, 0, 0, 0);
    return next;
  }

  // 발행 시간대 내라면 현재 시간 반환
  return next;
}

/**
 * 인터벌 기반 발행 시간 슬롯 생성
 */
export function generateScheduleSlots(
  count: number,
  settings: PublishSettings,
  startTime?: Date
): ScheduleSlot[] {
  const slots: ScheduleSlot[] = [];
  const { intervalMinutes } = settings;
  const startHour = parseHour(settings.startTime);
  const endHour = parseHour(settings.endTime);

  // 시작 시간 설정
  let currentTime = startTime
    ? new Date(startTime)
    : getNextAvailableTime(new Date(), startHour, endHour);

  for (let i = 0; i < count; i++) {
    // 현재 시간이 발행 가능 시간대인지 확인
    currentTime = getNextAvailableTime(currentTime, startHour, endHour);

    slots.push({
      date: new Date(currentTime),
      index: i,
    });

    // 다음 슬롯 시간 계산
    currentTime = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
  }

  return slots;
}

/**
 * 하루에 발행 가능한 최대 개수 계산
 */
export function calculateDailyCapacity(settings: PublishSettings): number {
  const { intervalMinutes } = settings;
  const startHour = parseHour(settings.startTime);
  const endHour = parseHour(settings.endTime);
  const availableMinutes = (endHour - startHour) * 60;
  return Math.floor(availableMinutes / intervalMinutes);
}

/**
 * 발행 완료까지 필요한 일수 계산
 */
export function calculateRequiredDays(
  postCount: number,
  settings: PublishSettings
): number {
  const dailyCapacity = calculateDailyCapacity(settings);
  if (dailyCapacity === 0) return 0;
  return Math.ceil(postCount / dailyCapacity);
}

/**
 * 스케줄 요약 정보 생성
 */
export interface ScheduleSummary {
  totalPosts: number;
  dailyCapacity: number;
  requiredDays: number;
  firstPublishTime: Date;
  lastPublishTime: Date;
}

export function createScheduleSummary(
  slots: ScheduleSlot[],
  settings: PublishSettings
): ScheduleSummary | null {
  if (slots.length === 0) return null;

  return {
    totalPosts: slots.length,
    dailyCapacity: calculateDailyCapacity(settings),
    requiredDays: calculateRequiredDays(slots.length, settings),
    firstPublishTime: slots[0].date,
    lastPublishTime: slots[slots.length - 1].date,
  };
}

/**
 * 시간을 한국어 형식으로 포맷
 */
export function formatKoreanDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  return `${year}년 ${month}월 ${day}일 ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

export default {
  isWithinPublishHours,
  getNextAvailableTime,
  generateScheduleSlots,
  calculateDailyCapacity,
  calculateRequiredDays,
  createScheduleSummary,
  formatKoreanDateTime,
};
