"use client";

import { useState, useCallback, useMemo } from "react";
import type { WorkflowState, WorkflowStatus } from "@/types";

/**
 * 진행 단계 정의
 */
export interface ProgressStep {
  id: number;
  label: string;
  description: string;
  status: "pending" | "active" | "completed" | "error";
}

/**
 * 진행 상황 관리 훅 반환 타입
 */
export interface UseProgressReturn {
  steps: ProgressStep[];
  currentStep: number;
  progress: number;
  status: WorkflowStatus;
  message: string;
  updateFromWorkflowState: (state: WorkflowState) => void;
  reset: () => void;
}

/**
 * 기본 워크플로우 단계 정의
 */
const DEFAULT_STEPS: Omit<ProgressStep, "status">[] = [
  { id: 1, label: "상품 검색", description: "쿠팡에서 관련 상품을 검색합니다" },
  { id: 2, label: "글 생성", description: "AI가 블로그 글을 작성합니다" },
  { id: 3, label: "일정 계산", description: "발행 일정을 계산합니다" },
  { id: 4, label: "발행", description: "워드프레스에 글을 발행합니다" },
];

/**
 * 진행 상황 관리 훅
 */
export function useProgress(): UseProgressReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<WorkflowStatus>("idle");
  const [message, setMessage] = useState("대기 중...");
  const [errorStep, setErrorStep] = useState<number | null>(null);

  /**
   * 단계 상태 계산
   */
  const steps = useMemo<ProgressStep[]>(() => {
    return DEFAULT_STEPS.map((step) => {
      let stepStatus: ProgressStep["status"] = "pending";

      if (errorStep !== null && step.id === errorStep) {
        stepStatus = "error";
      } else if (step.id < currentStep) {
        stepStatus = "completed";
      } else if (step.id === currentStep && status === "running") {
        stepStatus = "active";
      } else if (status === "completed" && step.id <= currentStep) {
        stepStatus = "completed";
      }

      return { ...step, status: stepStatus };
    });
  }, [currentStep, status, errorStep]);

  /**
   * 진행률 계산
   */
  const progress = useMemo(() => {
    if (status === "completed") return 100;
    if (status === "idle") return 0;
    return Math.round((currentStep / DEFAULT_STEPS.length) * 100);
  }, [currentStep, status]);

  /**
   * 워크플로우 상태로부터 업데이트
   */
  const updateFromWorkflowState = useCallback((state: WorkflowState) => {
    setCurrentStep(state.currentStep);
    setStatus(state.status);
    setMessage(state.message);

    if (state.status === "error") {
      setErrorStep(state.currentStep);
    } else {
      setErrorStep(null);
    }
  }, []);

  /**
   * 상태 초기화
   */
  const reset = useCallback(() => {
    setCurrentStep(0);
    setStatus("idle");
    setMessage("대기 중...");
    setErrorStep(null);
  }, []);

  return {
    steps,
    currentStep,
    progress,
    status,
    message,
    updateFromWorkflowState,
    reset,
  };
}

export default useProgress;
