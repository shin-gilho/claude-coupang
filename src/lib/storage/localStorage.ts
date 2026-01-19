/**
 * 로컬 스토리지 관리 유틸리티
 */

import { STORAGE_KEYS } from "@/constants";
import type { ApiKeys, PublishSettings, AiModel } from "@/types";

/**
 * 클라이언트 환경 체크
 */
function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * 로컬 스토리지에서 값 가져오기
 */
function getItem<T>(key: string): T | null {
  if (!isClient()) return null;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * 로컬 스토리지에 값 저장하기
 */
function setItem<T>(key: string, value: T): void {
  if (!isClient()) return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

/**
 * 로컬 스토리지에서 값 삭제하기
 */
function removeItem(key: string): void {
  if (!isClient()) return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

// ============================================
// API 키 관리
// ============================================

/**
 * API 키 가져오기
 */
export function getApiKeys(): ApiKeys | null {
  return getItem<ApiKeys>(STORAGE_KEYS.API_KEYS);
}

/**
 * API 키 저장하기
 */
export function setApiKeys(keys: ApiKeys): void {
  setItem(STORAGE_KEYS.API_KEYS, keys);
}

/**
 * API 키 삭제하기
 */
export function removeApiKeys(): void {
  removeItem(STORAGE_KEYS.API_KEYS);
}

/**
 * API 키가 유효한지 확인
 */
export function hasValidApiKeys(): boolean {
  const keys = getApiKeys();
  if (!keys) return false;

  // 최소한 쿠팡 API 키가 있어야 함
  return !!(
    keys.coupang.accessKey &&
    keys.coupang.secretKey &&
    keys.coupang.partnerId
  );
}

/**
 * 워드프레스 설정이 유효한지 확인
 */
export function hasValidWordPressConfig(): boolean {
  const keys = getApiKeys();
  if (!keys) return false;

  return !!(
    keys.wordpress.url &&
    keys.wordpress.username &&
    keys.wordpress.applicationPassword
  );
}

/**
 * AI API 키가 설정되어 있는지 확인
 */
export function hasAiApiKey(model: AiModel): boolean {
  const keys = getApiKeys();
  if (!keys) return false;

  return model === "claude" ? !!keys.claude : !!keys.gemini;
}

// ============================================
// 발행 설정 관리
// ============================================

/**
 * 발행 설정 가져오기
 */
export function getPublishSettings(): PublishSettings | null {
  return getItem<PublishSettings>(STORAGE_KEYS.PUBLISH_SETTINGS);
}

/**
 * 발행 설정 저장하기
 */
export function setPublishSettings(settings: PublishSettings): void {
  setItem(STORAGE_KEYS.PUBLISH_SETTINGS, settings);
}

/**
 * 발행 설정 삭제하기
 */
export function removePublishSettings(): void {
  removeItem(STORAGE_KEYS.PUBLISH_SETTINGS);
}

// ============================================
// 마지막 사용 AI 모델
// ============================================

/**
 * 마지막 사용 AI 모델 가져오기
 */
export function getLastUsedAiModel(): AiModel | null {
  return getItem<AiModel>(STORAGE_KEYS.LAST_USED_AI);
}

/**
 * 마지막 사용 AI 모델 저장하기
 */
export function setLastUsedAiModel(model: AiModel): void {
  setItem(STORAGE_KEYS.LAST_USED_AI, model);
}

// ============================================
// 전체 초기화
// ============================================

/**
 * 모든 저장된 데이터 삭제
 */
export function clearAllStorage(): void {
  removeApiKeys();
  removePublishSettings();
  removeItem(STORAGE_KEYS.LAST_USED_AI);
}

// LocalStorageManager 클래스 (레거시 지원)
export const LocalStorageManager = {
  getApiKeys,
  setApiKeys,
  removeApiKeys,
  hasValidApiKeys,
  hasValidWordPressConfig,
  hasAiApiKey,
  getPublishSettings,
  setPublishSettings,
  removePublishSettings,
  getLastUsedAiModel,
  setLastUsedAiModel,
  clearAllStorage,
};

export default LocalStorageManager;
