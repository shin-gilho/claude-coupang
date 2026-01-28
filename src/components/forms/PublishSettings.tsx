"use client";

import { Card, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui";
import type { PublishSettings as PublishSettingsType } from "@/types";

interface PublishSettingsProps {
  settings: PublishSettingsType;
  onSettingsChange: (settings: PublishSettingsType) => void;
  disabled?: boolean;
}

export default function PublishSettings({
  settings,
  onSettingsChange,
  disabled = false,
}: PublishSettingsProps) {
  const handleChange = (field: keyof PublishSettingsType, value: string | number | boolean) => {
    onSettingsChange({
      ...settings,
      [field]: value,
    });
  };

  return (
    <Card>
      <CardTitle>발행 설정</CardTitle>
      <CardContent className="space-y-4">
        {/* 예약 발행 토글 */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => handleChange("enabled", e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
          />
          <span className="text-sm font-medium text-gray-700">발행 예약 사용</span>
        </label>

        {settings.enabled ? (
          <>
            <Input
              label="발행 간격 (분)"
              type="number"
              value={settings.intervalMinutes}
              onChange={(e) =>
                handleChange("intervalMinutes", parseInt(e.target.value) || 60)
              }
              min={1}
              max={1440}
              disabled={disabled}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="시작 시간"
                type="time"
                value={settings.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                disabled={disabled}
              />
              <Input
                label="종료 시간"
                type="time"
                value={settings.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
              <p>
                <strong>{settings.startTime}</strong> ~ <strong>{settings.endTime}</strong> 사이에
              </p>
              <p>
                <strong>{settings.intervalMinutes}분</strong> 간격으로 발행됩니다.
              </p>
              <p className="mt-2 text-xs text-blue-600">
                ※ 브라우저 탭을 열어둬야 예약 발행이 실행됩니다.
              </p>
            </div>
          </>
        ) : (
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            <p>모든 키워드를 즉시 연속 발행합니다.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
