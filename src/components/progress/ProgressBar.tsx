"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "success" | "error";
}

export default function ProgressBar({
  progress,
  className,
  showLabel = true,
  size = "md",
  variant = "primary",
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">진행률</span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
      <div
        className={cn("w-full bg-gray-200 rounded-full overflow-hidden", {
          "h-1.5": size === "sm",
          "h-2.5": size === "md",
          "h-4": size === "lg",
        })}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-300 ease-out", {
            "bg-primary": variant === "primary",
            "bg-success": variant === "success",
            "bg-error": variant === "error",
          })}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
