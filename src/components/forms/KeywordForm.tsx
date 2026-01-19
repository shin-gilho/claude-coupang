"use client";

import { useState } from "react";
import { Card, CardTitle, CardContent } from "@/components/ui/Card";
import { Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { AiModel } from "@/types";

interface KeywordFormProps {
  onKeywordsChange: (keywords: string[]) => void;
  onAiModelChange: (model: AiModel) => void;
  keywords: string[];
  aiModel: AiModel;
  disabled?: boolean;
}

export default function KeywordForm({
  onKeywordsChange,
  onAiModelChange,
  keywords,
  aiModel,
  disabled = false,
}: KeywordFormProps) {
  const [keywordText, setKeywordText] = useState(keywords.join("\n"));

  const handleKeywordsChange = (value: string) => {
    setKeywordText(value);
    const newKeywords = value
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    onKeywordsChange(newKeywords);
  };

  const keywordCount = keywords.length;

  return (
    <Card>
      <CardTitle>키워드 입력</CardTitle>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="keywords"
              className="block text-sm font-medium text-gray-700"
            >
              키워드 (줄바꿈으로 구분)
            </label>
            {keywordCount > 0 && (
              <span className="text-sm text-gray-500">
                {keywordCount}개 키워드
              </span>
            )}
          </div>
          <Textarea
            id="keywords"
            rows={6}
            value={keywordText}
            onChange={(e) => handleKeywordsChange(e.target.value)}
            placeholder={"무선 이어폰\n블루투스 스피커\n게이밍 마우스"}
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI 모델 선택
          </label>
          <div className="flex gap-4">
            <label
              className={cn(
                "flex items-center cursor-pointer",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <input
                type="radio"
                name="aiModel"
                value="claude"
                checked={aiModel === "claude"}
                onChange={() => onAiModelChange("claude")}
                disabled={disabled}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Claude</span>
            </label>
            <label
              className={cn(
                "flex items-center cursor-pointer",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <input
                type="radio"
                name="aiModel"
                value="gemini"
                checked={aiModel === "gemini"}
                onChange={() => onAiModelChange("gemini")}
                disabled={disabled}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Gemini</span>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
