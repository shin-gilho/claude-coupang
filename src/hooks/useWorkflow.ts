"use client";

import { useState, useCallback, useRef } from "react";
import type {
  WorkflowState,
  WorkflowResult,
  KeywordResult,
  ApiKeys,
  PublishSettings,
  AiModel,
  AiModelVersion,
} from "@/types";
import {
  executeWorkflow,
  createInitialState,
  type WorkflowConfig,
} from "@/lib/workflow";

/**
 * 워크플로우 훅 반환 타입
 */
export interface UseWorkflowReturn {
  state: WorkflowState;
  isRunning: boolean;
  result: WorkflowResult | null;
  keywordResults: KeywordResult[];
  run: (params: WorkflowParams) => Promise<void>;
  stop: () => void;
  reset: () => void;
}

/**
 * 워크플로우 실행 파라미터 (다중 키워드 지원)
 */
export interface WorkflowParams {
  keywords: string[]; // 복수 키워드
  productCount?: number;
  aiModel: AiModel;
  modelVersion: AiModelVersion;
  apiKeys: ApiKeys;
  publishSettings: PublishSettings;
}

/**
 * 예약 시간 슬롯 생성
 */
function generateScheduleSlots(
  keywordCount: number,
  settings: PublishSettings
): Date[] {
  const now = new Date();
  const slots: Date[] = [];

  // 시작/종료 시간 파싱
  const [startHour, startMin] = settings.startTime.split(":").map(Number);
  const [endHour, endMin] = settings.endTime.split(":").map(Number);

  // 첫 번째 슬롯 시간 계산
  let currentSlot = new Date(now);
  currentSlot.setSeconds(0, 0);

  // 현재 시간이 시작 시간 이전이면 시작 시간으로 설정
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (currentMinutes < startMinutes) {
    // 시작 시간 이전: 오늘 시작 시간으로
    currentSlot.setHours(startHour, startMin, 0, 0);
  } else if (currentMinutes >= endMinutes) {
    // 종료 시간 이후: 다음 날 시작 시간으로
    currentSlot.setDate(currentSlot.getDate() + 1);
    currentSlot.setHours(startHour, startMin, 0, 0);
  }
  // 시간대 내: 현재 시간 유지 (첫 번째는 즉시 실행)

  for (let i = 0; i < keywordCount; i++) {
    slots.push(new Date(currentSlot));

    // 다음 슬롯 계산
    currentSlot = new Date(currentSlot.getTime() + settings.intervalMinutes * 60 * 1000);

    // 종료 시간 넘으면 다음 날 시작 시간으로
    const slotMinutes = currentSlot.getHours() * 60 + currentSlot.getMinutes();
    if (slotMinutes >= endMinutes) {
      currentSlot.setDate(currentSlot.getDate() + 1);
      currentSlot.setHours(startHour, startMin, 0, 0);
    }
  }

  return slots;
}

/**
 * sleep 유틸리티
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 워크플로우 실행 훅
 */
export function useWorkflow(): UseWorkflowReturn {
  const [state, setState] = useState<WorkflowState>(createInitialState());
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [keywordResults, setKeywordResults] = useState<KeywordResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef(false);

  const run = useCallback(
    async (params: WorkflowParams): Promise<void> => {
      const { keywords, publishSettings, ...rest } = params;

      if (keywords.length === 0) return;

      setIsRunning(true);
      setResult(null);
      abortRef.current = false;

      // 키워드 결과 초기화
      const initialResults: KeywordResult[] = keywords.map((keyword) => ({
        keyword,
        status: "pending" as const,
      }));
      setKeywordResults(initialResults);

      // 예약 모드일 경우 슬롯 생성
      const slots = publishSettings.enabled
        ? generateScheduleSlots(keywords.length, publishSettings)
        : null;

      // 슬롯 시간을 결과에 반영
      if (slots) {
        const resultsWithSlots = initialResults.map((r, i) => ({
          ...r,
          scheduledTime: slots[i],
        }));
        setKeywordResults(resultsWithSlots);
      }

      try {
        for (let i = 0; i < keywords.length; i++) {
          if (abortRef.current) {
            setState((prev) => ({
              ...prev,
              status: "error",
              message: "사용자에 의해 중단되었습니다.",
            }));
            break;
          }

          const keyword = keywords[i];
          const scheduledTime = slots?.[i];

          // 예약 모드: 슬롯 시간까지 대기
          if (scheduledTime && publishSettings.enabled) {
            const waitTime = scheduledTime.getTime() - Date.now();

            if (waitTime > 0) {
              // 대기 상태 업데이트
              setKeywordResults((prev) =>
                prev.map((r, idx) =>
                  idx === i ? { ...r, status: "waiting" as const } : r
                )
              );
              setState({
                ...createInitialState(),
                status: "running",
                currentKeywordIndex: i,
                totalKeywords: keywords.length,
                nextScheduledTime: scheduledTime,
                message: `다음 실행까지 대기 중... (${scheduledTime.toLocaleTimeString("ko-KR")})`,
              });

              // 대기 (1초 간격으로 체크하여 중단 가능하게)
              const checkInterval = 1000;
              let remaining = waitTime;
              while (remaining > 0 && !abortRef.current) {
                await sleep(Math.min(checkInterval, remaining));
                remaining -= checkInterval;

                // 남은 시간 업데이트
                setState((prev) => ({
                  ...prev,
                  message: `다음 실행까지 대기 중... (${scheduledTime.toLocaleTimeString("ko-KR")})`,
                }));
              }

              if (abortRef.current) break;
            }
          }

          // 실행 상태 업데이트
          setKeywordResults((prev) =>
            prev.map((r, idx) =>
              idx === i ? { ...r, status: "running" as const } : r
            )
          );
          setState({
            ...createInitialState(),
            status: "running",
            currentKeywordIndex: i,
            totalKeywords: keywords.length,
            message: `키워드 "${keyword}" 처리 중...`,
          });

          // 워크플로우 실행
          const config: WorkflowConfig = {
            keyword,
            productCount: rest.productCount || 5,
            aiModel: rest.aiModel,
            modelVersion: rest.modelVersion,
            apiKeys: rest.apiKeys,
            publishSettings,
            onProgress: (newState) => {
              setState({
                ...newState,
                currentKeywordIndex: i,
                totalKeywords: keywords.length,
              });
            },
          };

          try {
            const workflowResult = await executeWorkflow(config);

            // 결과 업데이트
            setKeywordResults((prev) =>
              prev.map((r, idx) =>
                idx === i
                  ? {
                      ...r,
                      status: workflowResult.success ? "completed" : "error",
                      result: workflowResult,
                      error: workflowResult.error,
                    }
                  : r
              )
            );

            // 마지막 결과 저장
            if (i === keywords.length - 1 || !workflowResult.success) {
              setResult(workflowResult);
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
            setKeywordResults((prev) =>
              prev.map((r, idx) =>
                idx === i ? { ...r, status: "error" as const, error: errorMessage } : r
              )
            );
            // 에러가 발생해도 다음 키워드 계속 진행
          }
        }

        // 모든 키워드 처리 완료
        if (!abortRef.current) {
          setState((prev) => ({
            ...prev,
            status: "completed",
            message: `총 ${keywords.length}개 키워드 처리 완료`,
          }));
        }
      } finally {
        setIsRunning(false);
      }
    },
    []
  );

  const stop = useCallback(() => {
    abortRef.current = true;
  }, []);

  const reset = useCallback(() => {
    setState(createInitialState());
    setResult(null);
    setKeywordResults([]);
    setIsRunning(false);
    abortRef.current = false;
  }, []);

  return {
    state,
    isRunning,
    result,
    keywordResults,
    run,
    stop,
    reset,
  };
}

export default useWorkflow;
