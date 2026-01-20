"use client";

import { useState, useEffect } from "react";
import { Header, Container } from "@/components/layout";
import { SettingsForm } from "@/components/forms";
import { Button, Card, CardTitle, CardContent } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/Modal";
import { STORAGE_KEYS } from "@/constants";
import type { ApiKeys } from "@/types";

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    data?: unknown;
  } | null>(null);
  const { addToast } = useToast();

  // 로컬 스토리지에서 API 키 불러오기
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    if (stored) {
      try {
        setApiKeys(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse API keys:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const handleSave = (values: ApiKeys) => {
    setIsSaving(true);

    // 시뮬레이션: 저장 딜레이
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(values));
      setApiKeys(values);
      setIsSaving(false);
      addToast("success", "설정이 저장되었습니다.");
    }, 500);
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    localStorage.removeItem(STORAGE_KEYS.API_KEYS);
    setApiKeys(null);
    setShowResetModal(false);
    addToast("info", "설정이 초기화되었습니다.");
  };

  // 워드프레스 테스트
  const handleWordPressTest = async () => {
    if (!apiKeys?.wordpress?.url || !apiKeys?.wordpress?.username || !apiKeys?.wordpress?.applicationPassword) {
      addToast("error", "워드프레스 설정을 먼저 입력해주세요.");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/wordpress/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            url: apiKeys.wordpress.url,
            username: apiKeys.wordpress.username,
            applicationPassword: apiKeys.wordpress.applicationPassword,
          },
        }),
      });

      const data = await response.json();
      console.log("워드프레스 테스트 결과:", data);

      if (data.success) {
        setTestResult({
          success: true,
          message: `테스트 성공! 임시글이 생성되었습니다. (ID: ${data.data?.id})`,
          data: data.data,
        });
        addToast("success", "워드프레스 연결 테스트 성공!");
      } else {
        setTestResult({
          success: false,
          message: data.error?.message || "테스트 실패",
          data: data.error,
        });
        addToast("error", data.error?.message || "워드프레스 테스트 실패");
      }
    } catch (error) {
      console.error("워드프레스 테스트 에러:", error);
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "알 수 없는 오류",
      });
      addToast("error", "워드프레스 테스트 중 오류 발생");
    } finally {
      setIsTesting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen">
        <Header title="API 키 설정" showBackButton showSettingsButton={false} />
        <main className="py-8">
          <Container size="md">
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
      <Header title="API 키 설정" showBackButton showSettingsButton={false} />

      <main className="py-8">
        <Container size="md">
          <SettingsForm
            initialValues={apiKeys}
            onSave={handleSave}
            onReset={handleReset}
            isSaving={isSaving}
          />

          {/* 워드프레스 테스트 섹션 */}
          <Card className="mt-6">
            <CardTitle>워드프레스 연결 테스트</CardTitle>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                워드프레스에 테스트 글(임시글)을 작성하여 연결 상태를 확인합니다.
              </p>

              <Button
                onClick={handleWordPressTest}
                disabled={isTesting || !apiKeys?.wordpress?.url}
                isLoading={isTesting}
                variant="secondary"
              >
                {isTesting ? "테스트 중..." : "워드프레스 테스트"}
              </Button>

              {testResult && (
                <div
                  className={`mt-4 p-4 rounded-lg ${
                    testResult.success
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      testResult.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {testResult.success ? "✅ " : "❌ "}
                    {testResult.message}
                  </p>
                  {testResult.data != null && (
                    <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-32">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </Container>
      </main>

      <ConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={confirmReset}
        title="설정 초기화"
        message="저장된 모든 API 키가 삭제됩니다. 계속하시겠습니까?"
        confirmText="초기화"
        cancelText="취소"
        variant="danger"
      />
    </div>
  );
}
