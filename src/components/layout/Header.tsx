"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showSettingsButton?: boolean;
}

export default function Header({
  title = "쿠팡 파트너스 자동 블로그",
  showBackButton = false,
  showSettingsButton = true,
}: HeaderProps) {
  const pathname = usePathname();
  const isSettingsPage = pathname === "/settings";
  const isHistoryPage = pathname === "/history";

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Link
              href="/"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors -ml-2"
              title="뒤로 가기"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
          )}
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>

        {showSettingsButton && !isSettingsPage && !isHistoryPage && (
          <div className="flex items-center gap-1">
            {/* 히스토리 버튼 */}
            <Link
              href="/history"
              className={cn(
                "p-2 rounded-lg transition-colors",
                "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
              title="키워드 히스토리"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Link>

            {/* 설정 버튼 */}
            <Link
              href="/settings"
              className={cn(
                "p-2 rounded-lg transition-colors",
                "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
              title="설정"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
