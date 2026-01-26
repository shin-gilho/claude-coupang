"use client";

import { useState, useCallback } from "react";
import type {
  WorkflowState,
  WorkflowResult,
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
  run: (params: WorkflowParams) => Promise<WorkflowResult>;
  reset: () => void;
}

/**
 * 워크플로우 실행 파라미터
 */
export interface WorkflowParams {
  keyword: string;
  productCount?: number;
  aiModel: AiModel;
  modelVersion: AiModelVersion;
  apiKeys: ApiKeys;
  publishSettings: PublishSettings;
}

/**
 * 워크플로우 실행 훅
 */
export function useWorkflow(): UseWorkflowReturn {
  const [state, setState] = useState<WorkflowState>(createInitialState());
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const run = useCallback(
    async (params: WorkflowParams): Promise<WorkflowResult> => {
      setIsRunning(true);
      setResult(null);
      setState(createInitialState());

      const config: WorkflowConfig = {
        keyword: params.keyword,
        productCount: params.productCount || 5,
        aiModel: params.aiModel,
        modelVersion: params.modelVersion,
        apiKeys: params.apiKeys,
        publishSettings: params.publishSettings,
        onProgress: (newState) => {
          setState(newState);
        },
      };

      try {
        const workflowResult = await executeWorkflow(config);
        setResult(workflowResult);
        return workflowResult;
      } finally {
        setIsRunning(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState(createInitialState());
    setResult(null);
    setIsRunning(false);
  }, []);

  return {
    state,
    isRunning,
    result,
    run,
    reset,
  };
}

export default useWorkflow;
