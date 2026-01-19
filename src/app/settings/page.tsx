"use client";

import { useState, useEffect } from "react";
import { Header, Container } from "@/components/layout";
import { SettingsForm } from "@/components/forms";
import { useToast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/Modal";
import { STORAGE_KEYS } from "@/constants";
import type { ApiKeys } from "@/types";

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
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
