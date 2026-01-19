"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * 로컬 스토리지와 동기화되는 상태 관리 훅
 *
 * @param key - 로컬 스토리지 키
 * @param initialValue - 초기값
 * @returns [값, 값 설정 함수, 값 삭제 함수]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // SSR 대응: 초기값은 initialValue 사용
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // 클라이언트에서 로컬 스토리지 값으로 초기화
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }

    setIsInitialized(true);
  }, [key]);

  // 값 설정 함수
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;

        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(key, JSON.stringify(newValue));
          } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
          }
        }

        return newValue;
      });
    },
    [key]
  );

  // 값 삭제 함수
  const removeValue = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing localStorage key "${key}":`, error);
      }
    }
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * 로컬 스토리지 초기화 상태 확인 훅
 * SSR 환경에서 하이드레이션 미스매치 방지
 */
export function useIsStorageReady(): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return isReady;
}

export default useLocalStorage;
