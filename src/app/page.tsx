"use client";

import { useState } from "react";
import { Header, Container } from "@/components/layout";
import { KeywordForm, PublishSettings } from "@/components/forms";
import { ProgressBar, StepIndicator, StatusMessage } from "@/components/progress";
import { Button, Card, CardTitle, CardContent } from "@/components/ui";
import { DEFAULT_PUBLISH_SETTINGS } from "@/constants";
import type { AiModel, PublishSettings as PublishSettingsType, WorkflowState } from "@/types";

export default function Home() {
  // 키워드 및 AI 모델 상태
  const [keywords, setKeywords] = useState<string[]>([]);
  const [aiModel, setAiModel] = useState<AiModel>("claude");

  // 발행 설정 상태
  const [publishSettings, setPublishSettings] = useState<PublishSettingsType>(
    DEFAULT_PUBLISH_SETTINGS
  );

  // 워크플로우 상태
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    status: "idle",
    currentKeywordIndex: 0,
    totalKeywords: 0,
    currentStep: "",
    progress: 0,
    results: [],
  });

  const isRunning = workflowState.status !== "idle" &&
                    workflowState.status !== "completed" &&
                    workflowState.status !== "error";

  const handleExecute = async () => {
    if (keywords.length === 0) {
      alert("키워드를 입력해주세요.");
      return;
    }

    // TODO: Phase 3, 4에서 실제 워크플로우 구현
    // 현재는 UI 테스트용 시뮬레이션
    setWorkflowState({
      status: "collecting",
      currentKeywordIndex: 0,
      totalKeywords: keywords.length,
      currentStep: `"${keywords[0]}" 상품 수집 중...`,
      progress: 10,
      results: [],
    });

    // 시뮬레이션: 2초 후 다음 단계
    setTimeout(() => {
      setWorkflowState((prev) => ({
        ...prev,
        status: "generating",
        currentStep: `"${keywords[0]}" 글 작성 중...`,
        progress: 40,
      }));
    }, 2000);

    setTimeout(() => {
      setWorkflowState((prev) => ({
        ...prev,
        status: "uploading",
        currentStep: `"${keywords[0]}" 업로드 중...`,
        progress: 70,
      }));
    }, 4000);

    setTimeout(() => {
      setWorkflowState((prev) => ({
        ...prev,
        status: "completed",
        currentStep: "완료",
        progress: 100,
        results: [
          {
            keyword: keywords[0],
            success: true,
            postUrl: "https://example.com/post/1",
            scheduledTime: new Date().toISOString(),
          },
        ],
      }));
    }, 6000);
  };

  const handleReset = () => {
    setWorkflowState({
      status: "idle",
      currentKeywordIndex: 0,
      totalKeywords: 0,
      currentStep: "",
      progress: 0,
      results: [],
    });
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="py-8">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 키워드 입력 */}
            <KeywordForm
              keywords={keywords}
              onKeywordsChange={setKeywords}
              aiModel={aiModel}
              onAiModelChange={setAiModel}
              disabled={isRunning}
            />

            {/* 발행 설정 */}
            <PublishSettings
              settings={publishSettings}
              onSettingsChange={setPublishSettings}
              disabled={isRunning}
            />
          </div>

          {/* 실행 버튼 */}
          <div className="mt-6 flex gap-4">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleExecute}
              disabled={isRunning || keywords.length === 0}
              isLoading={isRunning}
            >
              {isRunning ? "실행 중..." : "실행하기"}
            </Button>
            {(workflowState.status === "completed" || workflowState.status === "error") && (
              <Button size="lg" variant="secondary" onClick={handleReset}>
                초기화
              </Button>
            )}
          </div>

          {/* 진행 상황 */}
          <Card className="mt-8">
            <CardTitle>진행 상황</CardTitle>
            <CardContent className="space-y-6">
              {workflowState.status !== "idle" && (
                <>
                  <StepIndicator currentStatus={workflowState.status} />
                  <ProgressBar
                    progress={workflowState.progress}
                    variant={
                      workflowState.status === "error"
                        ? "error"
                        : workflowState.status === "completed"
                        ? "success"
                        : "primary"
                    }
                  />
                </>
              )}
              <StatusMessage
                status={workflowState.status}
                currentStep={workflowState.currentStep}
                currentKeywordIndex={workflowState.currentKeywordIndex}
                totalKeywords={workflowState.totalKeywords}
                error={workflowState.error}
              />

              {/* 결과 목록 */}
              {workflowState.results.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    처리 결과
                  </h4>
                  <div className="space-y-2">
                    {workflowState.results.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          result.success ? "bg-success-50" : "bg-error-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <svg
                              className="w-4 h-4 text-success"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 text-error"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                          <span className="text-sm font-medium">
                            {result.keyword}
                          </span>
                        </div>
                        {result.success && result.postUrl && (
                          <a
                            href={result.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            글 보기
                          </a>
                        )}
                        {!result.success && result.error && (
                          <span className="text-sm text-error">
                            {result.error}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Container>
      </main>
    </div>
  );
}
