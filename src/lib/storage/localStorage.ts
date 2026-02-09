/**
 * 로컬 스토리지 관리 유틸리티
 */

import { STORAGE_KEYS, HISTORY_SETTINGS } from "@/constants";
import type { ApiKeys, PublishSettings, AiModel, KeywordHistoryEntry, DuplicateKeywordInfo } from "@/types";

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
// 키워드 히스토리 관리
// ============================================

/**
 * 고유 ID 생성
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 오래된 히스토리 항목 정리 (보관 기간 초과 + 최대 개수 제한)
 */
function cleanupHistory(history: KeywordHistoryEntry[]): KeywordHistoryEntry[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - HISTORY_SETTINGS.RETENTION_DAYS);

  // 보관 기간 초과 항목 제거
  let filtered = history.filter((entry) => {
    const entryDate = new Date(entry.executedAt);
    return entryDate >= cutoffDate;
  });

  // 최대 개수 제한 (가장 오래된 것부터 제거)
  if (filtered.length > HISTORY_SETTINGS.MAX_ENTRIES) {
    filtered = filtered.slice(-HISTORY_SETTINGS.MAX_ENTRIES);
  }

  return filtered;
}

/**
 * 키워드 히스토리 가져오기
 */
export function getKeywordHistory(): KeywordHistoryEntry[] {
  const history = getItem<KeywordHistoryEntry[]>(STORAGE_KEYS.KEYWORD_HISTORY);
  return history || [];
}

/**
 * 키워드 히스토리 항목 추가
 */
export function addKeywordHistoryEntry(
  entry: Omit<KeywordHistoryEntry, "id" | "executedAt">
): KeywordHistoryEntry {
  const history = getKeywordHistory();

  const newEntry: KeywordHistoryEntry = {
    ...entry,
    id: generateId(),
    executedAt: new Date().toISOString(),
  };

  const updatedHistory = cleanupHistory([...history, newEntry]);
  setItem(STORAGE_KEYS.KEYWORD_HISTORY, updatedHistory);

  return newEntry;
}

/**
 * 중복 키워드 찾기
 */
export function findDuplicateKeywords(keywords: string[]): DuplicateKeywordInfo[] {
  const history = getKeywordHistory();
  const duplicates: DuplicateKeywordInfo[] = [];

  const normalizedKeywords = keywords.map((k) => k.toLowerCase().trim());

  for (const keyword of normalizedKeywords) {
    // 가장 최근 실행 기록 찾기
    const matchingEntries = history
      .filter((entry) => entry.keyword.toLowerCase().trim() === keyword)
      .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime());

    if (matchingEntries.length > 0) {
      const latest = matchingEntries[0];
      duplicates.push({
        keyword: latest.keyword,
        lastExecutedAt: latest.executedAt,
        postUrl: latest.postUrl,
      });
    }
  }

  return duplicates;
}

/**
 * 개별 히스토리 항목 삭제
 */
export function deleteHistoryEntry(id: string): boolean {
  const history = getKeywordHistory();
  const filtered = history.filter((entry) => entry.id !== id);

  if (filtered.length !== history.length) {
    setItem(STORAGE_KEYS.KEYWORD_HISTORY, filtered);
    return true;
  }

  return false;
}

/**
 * 전체 키워드 히스토리 삭제
 */
export function clearKeywordHistory(): void {
  removeItem(STORAGE_KEYS.KEYWORD_HISTORY);
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
  clearKeywordHistory();
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
  getKeywordHistory,
  addKeywordHistoryEntry,
  findDuplicateKeywords,
  deleteHistoryEntry,
  clearKeywordHistory,
  clearAllStorage,
};

export default LocalStorageManager;
