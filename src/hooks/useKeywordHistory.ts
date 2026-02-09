/**
 * 키워드 히스토리 관리 훅
 */

import { useState, useEffect, useCallback } from "react";
import {
  getKeywordHistory,
  addKeywordHistoryEntry,
  findDuplicateKeywords,
  deleteHistoryEntry,
  clearKeywordHistory,
} from "@/lib/storage/localStorage";
import type { KeywordHistoryEntry, DuplicateKeywordInfo, AiModel } from "@/types";

export interface UseKeywordHistoryReturn {
  /** 히스토리 목록 */
  history: KeywordHistoryEntry[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 히스토리 새로고침 */
  refresh: () => void;
  /** 히스토리 항목 추가 */
  addEntry: (entry: {
    keyword: string;
    status: "success" | "error";
    aiModel: AiModel;
    postUrl?: string;
    errorMessage?: string;
  }) => KeywordHistoryEntry;
  /** 중복 키워드 확인 */
  checkDuplicates: (keywords: string[]) => DuplicateKeywordInfo[];
  /** 항목 삭제 */
  deleteEntry: (id: string) => boolean;
  /** 전체 삭제 */
  clearAll: () => void;
  /** 검색 필터링된 히스토리 */
  searchHistory: (query: string) => KeywordHistoryEntry[];
}

export function useKeywordHistory(): UseKeywordHistoryReturn {
  const [history, setHistory] = useState<KeywordHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 히스토리 로드
  const refresh = useCallback(() => {
    const data = getKeywordHistory();
    // 최신순 정렬
    const sorted = [...data].sort(
      (a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
    );
    setHistory(sorted);
    setIsLoading(false);
  }, []);

  // 초기 로드
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 항목 추가
  const addEntry = useCallback(
    (entry: {
      keyword: string;
      status: "success" | "error";
      aiModel: AiModel;
      postUrl?: string;
      errorMessage?: string;
    }) => {
      const newEntry = addKeywordHistoryEntry(entry);
      refresh();
      return newEntry;
    },
    [refresh]
  );

  // 중복 확인
  const checkDuplicates = useCallback((keywords: string[]) => {
    return findDuplicateKeywords(keywords);
  }, []);

  // 항목 삭제
  const deleteEntry = useCallback(
    (id: string) => {
      const result = deleteHistoryEntry(id);
      if (result) {
        refresh();
      }
      return result;
    },
    [refresh]
  );

  // 전체 삭제
  const clearAll = useCallback(() => {
    clearKeywordHistory();
    refresh();
  }, [refresh]);

  // 검색 필터링
  const searchHistory = useCallback(
    (query: string): KeywordHistoryEntry[] => {
      if (!query.trim()) {
        return history;
      }

      const normalizedQuery = query.toLowerCase().trim();
      return history.filter((entry) =>
        entry.keyword.toLowerCase().includes(normalizedQuery)
      );
    },
    [history]
  );

  return {
    history,
    isLoading,
    refresh,
    addEntry,
    checkDuplicates,
    deleteEntry,
    clearAll,
    searchHistory,
  };
}

export default useKeywordHistory;
