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
  const handleChange = (field: keyof PublishSettingsType, value: string | number) => {
    onSettingsChange({
      ...settings,
      [field]: value,
    });
  };

  return (
    <Card>
      <CardTitle>발행 설정</CardTitle>
      <CardContent className="space-y-4">
        <Input
          label="발행 간격 (분)"
          type="number"
          value={settings.intervalMinutes}
          onChange={(e) =>
            handleChange("intervalMinutes", parseInt(e.target.value) || 10)
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

        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          <p>
            <strong>{settings.startTime}</strong> ~ <strong>{settings.endTime}</strong> 사이에
          </p>
          <p>
            <strong>{settings.intervalMinutes}분</strong> 간격으로 발행됩니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
