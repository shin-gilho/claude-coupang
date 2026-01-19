"use client";

import { cn } from "@/lib/utils";
import type { WorkflowStatus } from "@/types";

interface Step {
  id: WorkflowStatus;
  label: string;
}

const steps: Step[] = [
  { id: "collecting", label: "상품 수집" },
  { id: "generating", label: "글 작성" },
  { id: "uploading", label: "업로드" },
  { id: "completed", label: "완료" },
];

interface StepIndicatorProps {
  currentStatus: WorkflowStatus;
  className?: string;
}

export default function StepIndicator({
  currentStatus,
  className,
}: StepIndicatorProps) {
  const getStepState = (stepId: WorkflowStatus): "completed" | "current" | "upcoming" | "error" => {
    if (currentStatus === "error") {
      const currentIndex = steps.findIndex((s) => s.id === stepId);
      const errorIndex = steps.findIndex((s) => s.id === currentStatus);
      if (currentIndex < errorIndex) return "completed";
      if (currentIndex === errorIndex) return "error";
      return "upcoming";
    }

    if (currentStatus === "idle") return "upcoming";

    const statusOrder: WorkflowStatus[] = ["collecting", "generating", "uploading", "completed"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
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
                    index + 1
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
                    "bg-success": getStepState(steps[index + 1].id) !== "upcoming",
                    "bg-gray-200": getStepState(steps[index + 1].id) === "upcoming",
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
