"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header, Container } from "@/components/layout";
import { KeywordForm, PublishSettings } from "@/components/forms";
import { ProgressBar, StepIndicator, StatusMessage } from "@/components/progress";
import { Button, Card, CardTitle, CardContent } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { DEFAULT_PUBLISH_SETTINGS, STORAGE_KEYS, PRODUCT_SEARCH_SETTINGS, AI_MODEL_SETTINGS } from "@/constants";
import { useWorkflow } from "@/hooks";
import type { AiModel, AiModelVersion, PublishSettings as PublishSettingsType, ApiKeys } from "@/types";

export default function Home() {
  const router = useRouter();
  const { addToast } = useToast();

  // 키워드 및 AI 모델 상태
  const [keywords, setKeywords] = useState<string[]>([]);
  const [aiModel, setAiModel] = useState<AiModel>("claude");
  const [modelVersion, setModelVersion] = useState<AiModelVersion>(
    AI_MODEL_SETTINGS.CLAUDE.defaultModel as AiModelVersion
  );

  // AI 모델 변경 시 기본 모델 버전으로 초기화
  const handleAiModelChange = (model: AiModel) => {
    setAiModel(model);
    const defaultModel = model === "claude"
      ? AI_MODEL_SETTINGS.CLAUDE.defaultModel
      : AI_MODEL_SETTINGS.GEMINI.defaultModel;
    setModelVersion(defaultModel as AiModelVersion);
  };

  // 발행 설정 상태
  const [publishSettings, setPublishSettings] = useState<PublishSettingsType>(
    DEFAULT_PUBLISH_SETTINGS
  );

  // API 키 상태
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 워크플로우 훅
  const { state: workflowState, isRunning, keywordResults, run, stop, reset } = useWorkflow();

  // 로컬 스토리지에서 설정 불러오기
  useEffect(() => {
    const storedKeys = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    const storedSettings = localStorage.getItem(STORAGE_KEYS.PUBLISH_SETTINGS);

    if (storedKeys) {
      try {
        setApiKeys(JSON.parse(storedKeys));
      } catch (e) {
        console.error("Failed to parse API keys:", e);
      }
    }

    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        // 기존 설정에 enabled 필드가 없는 경우 기본값으로 병합
        setPublishSettings({
          ...DEFAULT_PUBLISH_SETTINGS,
          ...parsed,
        });
      } catch (e) {
        console.error("Failed to parse publish settings:", e);
      }
    }

    setIsLoaded(true);
  }, []);

  // 발행 설정 저장
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.PUBLISH_SETTINGS, JSON.stringify(publishSettings));
    }
  }, [publishSettings, isLoaded]);

  // API 키 유효성 확인
  const hasValidApiKeys = () => {
    if (!apiKeys) return false;

    // 쿠팡 API 키 필수
    if (!apiKeys.coupang?.accessKey || !apiKeys.coupang?.secretKey || !apiKeys.coupang?.partnerId) {
      return false;
    }

    // 선택한 AI 모델의 API 키 필수
    if (aiModel === "claude" && !apiKeys.claude) return false;
    if (aiModel === "gemini" && !apiKeys.gemini) return false;

    // 워드프레스 설정 필수
    if (!apiKeys.wordpress?.url || !apiKeys.wordpress?.username || !apiKeys.wordpress?.applicationPassword) {
      return false;
    }

    return true;
  };

  const handleExecute = async () => {
    if (keywords.length === 0) {
      addToast("error", "키워드를 입력해주세요.");
      return;
    }

    if (!hasValidApiKeys()) {
      addToast("error", "API 키를 먼저 설정해주세요.");
      router.push("/settings");
      return;
    }

    try {
      await run({
        keywords, // 모든 키워드 전달
        productCount: PRODUCT_SEARCH_SETTINGS.LIMIT,
        aiModel,
        modelVersion,
        apiKeys: apiKeys!,
        publishSettings,
      });

      addToast("success", `${keywords.length}개 키워드 처리가 완료되었습니다!`);
    } catch (error) {
      console.error("Workflow error:", error);
      addToast("error", "예상치 못한 오류가 발생했습니다.");
    }
  };

  const handleStop = () => {
    stop();
    addToast("info", "워크플로우를 중단합니다...");
  };

  const handleReset = () => {
    reset();
    addToast("info", "워크플로우가 초기화되었습니다.");
  };

  const progress = workflowState.totalSteps > 0
    ? Math.round((workflowState.currentStep / workflowState.totalSteps) * 100)
    : 0;

  if (!isLoaded) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-8">
          <Container>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </Container>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="py-8">
        <Container>
          {/* API 키 미설정 경고 */}
          {!hasValidApiKeys() && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800">API 키가 설정되지 않았습니다</p>
                  <p className="text-sm text-amber-600">
                    워크플로우를 실행하려면{" "}
                    <button
                      onClick={() => router.push("/settings")}
                      className="underline font-medium hover:text-amber-800"
                    >
                      설정 페이지
                    </button>
                    에서 API 키를 먼저 입력해주세요.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* 키워드 입력 */}
            <KeywordForm
              keywords={keywords}
              onKeywordsChange={setKeywords}
              aiModel={aiModel}
              onAiModelChange={handleAiModelChange}
              modelVersion={modelVersion}
              onModelVersionChange={setModelVersion}
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
            {!isRunning ? (
              <Button
                size="lg"
                className="flex-1"
                onClick={handleExecute}
                disabled={keywords.length === 0}
              >
                실행하기
              </Button>
            ) : (
              <Button
                size="lg"
                variant="danger"
                className="flex-1"
                onClick={handleStop}
              >
                중단하기
              </Button>
            )}
            {(workflowState.status === "completed" || workflowState.status === "error") && !isRunning && (
              <Button size="lg" variant="secondary" onClick={handleReset}>
                초기화
              </Button>
            )}
          </div>

          {/* 진행 상황 */}
          <Card className="mt-8">
            <CardTitle>진행 상황</CardTitle>
            <CardContent className="space-y-6">
              {/* 다중 키워드 진행 상황 */}
              {workflowState.totalKeywords && workflowState.totalKeywords > 1 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      키워드 진행률
                    </span>
                    <span className="text-sm text-gray-500">
                      {(workflowState.currentKeywordIndex ?? 0) + 1} / {workflowState.totalKeywords}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(((workflowState.currentKeywordIndex ?? 0) + 1) / workflowState.totalKeywords) * 100}%`,
                      }}
                    />
                  </div>
                  {workflowState.nextScheduledTime && (
                    <p className="text-xs text-gray-500 mt-2">
                      다음 실행 예정: {workflowState.nextScheduledTime.toLocaleString("ko-KR")}
                    </p>
                  )}
                </div>
              )}

              {workflowState.status !== "idle" && (
                <>
                  <StepIndicator currentStep={workflowState.currentStep} status={workflowState.status} />
                  <ProgressBar
                    progress={progress}
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
                message={workflowState.message}
                error={workflowState.error}
              />

              {/* 키워드별 결과 표시 */}
              {keywordResults.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    키워드별 결과
                  </h4>
                  <div className="space-y-2">
                    {keywordResults.map((kr, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg flex items-center justify-between ${
                          kr.status === "completed"
                            ? "bg-green-50 border border-green-200"
                            : kr.status === "error"
                            ? "bg-red-50 border border-red-200"
                            : kr.status === "running"
                            ? "bg-blue-50 border border-blue-200"
                            : kr.status === "waiting"
                            ? "bg-yellow-50 border border-yellow-200"
                            : "bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* 상태 아이콘 */}
                          {kr.status === "completed" && (
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {kr.status === "error" && (
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {kr.status === "running" && (
                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          )}
                          {kr.status === "waiting" && (
                            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {kr.status === "pending" && (
                            <div className="w-5 h-5 rounded-full bg-gray-300" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{kr.keyword}</p>
                            {kr.scheduledTime && kr.status === "waiting" && (
                              <p className="text-xs text-gray-500">
                                예정: {kr.scheduledTime.toLocaleTimeString("ko-KR")}
                              </p>
                            )}
                            {kr.error && (
                              <p className="text-xs text-red-500">{kr.error}</p>
                            )}
                          </div>
                        </div>
                        {kr.result?.wordpressResponse?.link && (
                          <a
                            href={kr.result.wordpressResponse.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            글 보기
                          </a>
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
