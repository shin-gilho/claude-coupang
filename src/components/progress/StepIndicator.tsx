"use client";

import { cn } from "@/lib/utils";
import type { WorkflowStatus } from "@/types";

interface Step {
  id: number;
  label: string;
}

const steps: Step[] = [
  { id: 1, label: "상품 수집" },
  { id: 2, label: "글 작성" },
  { id: 3, label: "일정 계산" },
  { id: 4, label: "발행" },
];

interface StepIndicatorProps {
  currentStep: number;
  status: WorkflowStatus;
  className?: string;
}

export default function StepIndicator({
  currentStep,
  status,
  className,
}: StepIndicatorProps) {
  const getStepState = (stepId: number): "completed" | "current" | "upcoming" | "error" => {
    if (status === "error" && stepId === currentStep) {
      return "error";
    }

    if (status === "completed") {
      return "completed";
    }

    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "current";
    return "upcoming";
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const state = getStepState(step.id);

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    {
                      "bg-success text-white": state === "completed",
                      "bg-primary text-white animate-pulse": state === "current",
                      "bg-gray-200 text-gray-500": state === "upcoming",
                      "bg-error text-white": state === "error",
                    }
                  )}
                >
                  {state === "completed" ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : state === "error" ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn("mt-2 text-xs font-medium", {
                    "text-success": state === "completed",
                    "text-primary": state === "current",
                    "text-gray-500": state === "upcoming",
                    "text-error": state === "error",
                  })}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn("flex-1 h-0.5 mx-2", {
                    "bg-success": step.id < currentStep || status === "completed",
                    "bg-gray-200": step.id >= currentStep && status !== "completed",
                  })}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
