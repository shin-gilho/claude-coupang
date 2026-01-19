"use client";

import { cn } from "@/lib/utils";
import type { WorkflowStatus } from "@/types";

interface StatusMessageProps {
  status: WorkflowStatus;
  message: string;
  error?: string;
  className?: string;
}

export default function StatusMessage({
  status,
  message,
  error,
  className,
}: StatusMessageProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "idle":
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "running":
        return (
          <svg className="w-5 h-5 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      case "completed":
        return (
          <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "error":
        return (
          <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const displayMessage = status === "error" && error ? error : message;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg",
        {
          "bg-gray-50": status === "idle",
          "bg-blue-50": status === "running",
          "bg-success-50": status === "completed",
          "bg-error-50": status === "error",
        },
        className
      )}
    >
      {getStatusIcon()}
      <p
        className={cn("text-sm font-medium", {
          "text-gray-600": status === "idle",
          "text-primary": status === "running",
          "text-success-700": status === "completed",
          "text-error-700": status === "error",
        })}
      >
        {displayMessage}
      </p>
    </div>
  );
}
