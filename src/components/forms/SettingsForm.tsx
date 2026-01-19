"use client";

import { useState } from "react";
import { Card, CardTitle, CardContent } from "@/components/ui/Card";
import { Input, Button } from "@/components/ui";
import type { ApiKeys } from "@/types";

interface SettingsFormProps {
  initialValues?: ApiKeys | null;
  onSave: (values: ApiKeys) => void;
  onReset: () => void;
  isSaving?: boolean;
}

const emptyApiKeys: ApiKeys = {
  coupang: {
    accessKey: "",
    secretKey: "",
    partnerId: "",
  },
  wordpress: {
    url: "",
    username: "",
    applicationPassword: "",
  },
  claude: "",
  gemini: "",
};

export default function SettingsForm({
  initialValues,
  onSave,
  onReset,
  isSaving = false,
}: SettingsFormProps) {
  const [values, setValues] = useState<ApiKeys>(initialValues || emptyApiKeys);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(values);
  };

  const updateCoupang = (field: keyof ApiKeys["coupang"], value: string) => {
    setValues((prev) => ({
      ...prev,
      coupang: { ...prev.coupang, [field]: value },
    }));
  };

  const updateWordpress = (field: keyof ApiKeys["wordpress"], value: string) => {
    setValues((prev) => ({
      ...prev,
      wordpress: { ...prev.wordpress, [field]: value },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 쿠팡 파트너스 API */}
      <Card>
        <CardTitle>쿠팡 파트너스 API</CardTitle>
        <CardContent className="space-y-4">
          <Input
            label="Access Key"
            type="password"
            value={values.coupang.accessKey}
            onChange={(e) => updateCoupang("accessKey", e.target.value)}
            placeholder="Access Key 입력"
          />
          <Input
            label="Secret Key"
            type="password"
            value={values.coupang.secretKey}
            onChange={(e) => updateCoupang("secretKey", e.target.value)}
            placeholder="Secret Key 입력"
          />
          <Input
            label="Partner ID (Sub ID)"
            type="text"
            value={values.coupang.partnerId}
            onChange={(e) => updateCoupang("partnerId", e.target.value)}
            placeholder="Partner ID 입력"
          />
        </CardContent>
      </Card>

      {/* 워드프레스 설정 */}
      <Card>
        <CardTitle>워드프레스 설정</CardTitle>
        <CardContent className="space-y-4">
          <Input
            label="사이트 URL"
            type="url"
            value={values.wordpress.url}
            onChange={(e) => updateWordpress("url", e.target.value)}
            placeholder="https://your-site.com"
          />
          <Input
            label="사용자명"
            type="text"
            value={values.wordpress.username}
            onChange={(e) => updateWordpress("username", e.target.value)}
            placeholder="WordPress 사용자명"
          />
          <Input
            label="Application Password"
            type="password"
            value={values.wordpress.applicationPassword}
            onChange={(e) => updateWordpress("applicationPassword", e.target.value)}
            placeholder="Application Password 입력"
            hint="워드프레스 관리자 > 사용자 > 프로필 > Application Passwords에서 생성"
          />
        </CardContent>
      </Card>

      {/* AI API 키 */}
      <Card>
        <CardTitle>AI API 키</CardTitle>
        <CardContent className="space-y-4">
          <Input
            label="Claude API 키"
            type="password"
            value={values.claude}
            onChange={(e) => setValues((prev) => ({ ...prev, claude: e.target.value }))}
            placeholder="sk-ant-..."
          />
          <Input
            label="Gemini API 키"
            type="password"
            value={values.gemini}
            onChange={(e) => setValues((prev) => ({ ...prev, gemini: e.target.value }))}
            placeholder="AIza..."
          />
        </CardContent>
      </Card>

      {/* 버튼 */}
      <div className="flex gap-4">
        <Button type="submit" size="lg" className="flex-1" isLoading={isSaving}>
          저장하기
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={onReset}>
          초기화
        </Button>
      </div>

      {/* 안내 문구 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">보안 안내</h3>
            <p className="mt-1 text-sm text-blue-700">
              API 키는 브라우저의 로컬 스토리지에 저장됩니다. 공용 컴퓨터에서는
              사용을 권장하지 않습니다.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
