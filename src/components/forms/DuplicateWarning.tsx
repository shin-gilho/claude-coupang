"use client";

import type { DuplicateKeywordInfo } from "@/types";

interface DuplicateWarningProps {
  duplicates: DuplicateKeywordInfo[];
  onDismiss: () => void;
}

export default function DuplicateWarning({
  duplicates,
  onDismiss,
}: DuplicateWarningProps) {
  if (duplicates.length === 0) return null;

  // 날짜 포맷
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>

        <div className="flex-1">
          <h4 className="text-sm font-medium text-amber-800 mb-2">
            이전에 사용한 키워드가 있습니다
          </h4>

          <ul className="space-y-1 mb-3">
            {duplicates.map((dup, index) => (
              <li key={index} className="text-sm text-amber-700">
                <span className="font-medium">{dup.keyword}</span>
                <span className="text-amber-600">
                  {" "}
                  - {formatDate(dup.lastExecutedAt)}에 실행됨
                </span>
                {dup.postUrl && (
                  <a
                    href={dup.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-amber-600 hover:text-amber-800 underline"
                  >
                    글 보기
                  </a>
                )}
              </li>
            ))}
          </ul>

          <button
            onClick={onDismiss}
            className="text-sm font-medium text-amber-800 hover:text-amber-900 underline"
          >
            무시하고 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}
