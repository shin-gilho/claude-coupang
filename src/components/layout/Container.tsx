"use client";

import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Container({
  children,
  className,
  size = "lg",
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-4",
        {
          "max-w-2xl": size === "sm",
          "max-w-3xl": size === "md",
          "max-w-5xl": size === "lg",
          "max-w-7xl": size === "xl",
        },
        className
      )}
    >
      {children}
    </div>
  );
}
