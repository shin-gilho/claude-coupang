"use client";

import { useState, useMemo } from "react";
import { Header, Container } from "@/components/layout";
import { Button, Card, CardTitle, CardContent, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/Modal";
import { useKeywordHistory } from "@/hooks";

export default function HistoryPage() {
  const { addToast } = useToast();
  const { history, isLoading, deleteEntry, clearAll, searchHistory } = useKeywordHistory();

  const [searchQuery, setSearchQuery] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 검색 결과
  const filteredHistory = useMemo(() => {
    return searchHistory(searchQuery);
  }, [searchHistory, searchQuery]);

  // 날짜 포맷
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 개별 삭제
  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      const success = deleteEntry(deletingId);
      if (success) {
        addToast("success", "히스토리 항목이 삭제되었습니다.");
      }
      setDeletingId(null);
    }
  };

  // 전체 삭제
  const handleClearAll = () => {
    setShowClearModal(true);
  };

  const confirmClearAll = () => {
    clearAll();
    addToast("success", "모든 히스토리가 삭제되었습니다.");
    setShowClearModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="키워드 히스토리" showBackButton showSettingsButton={false} />
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
      <Header title="키워드 히스토리" showBackButton showSettingsButton={false} />

      <main className="py-8">
        <Container>
          <Card>
            <CardTitle className="flex items-center justify-between">
              <span>실행 기록</span>
              <span className="text-sm font-normal text-gray-500">
                총 {history.length}개
              </span>
            </CardTitle>
            <CardContent>
              {/* 검색 및 전체 삭제 */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="키워드 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                {history.length > 0 && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleClearAll}
                    className="shrink-0"
                  >
                    전체 삭제
                  </Button>
                )}
              </div>

              {/* 히스토리 테이블 */}
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="w-12 h-12 text-gray-300 mx-auto mb-4"
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
                  <p className="text-gray-500">
                    {searchQuery
                      ? "검색 결과가 없습니다."
                      : "아직 실행 기록이 없습니다."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                          키워드
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                          실행일시
                        </th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-700">
                          상태
                        </th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-700">
                          AI
                        </th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-700">
                          글 링크
                        </th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-700">
                          삭제
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-2">
                            <span className="font-medium text-gray-900">
                              {entry.keyword}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-sm text-gray-600">
                              {formatDate(entry.executedAt)}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            {entry.status === "success" ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                성공
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                                title={entry.errorMessage}
                              >
                                실패
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="text-sm text-gray-600 capitalize">
                              {entry.aiModel}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            {entry.postUrl ? (
                              <a
                                href={entry.postUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm"
                              >
                                보기
                              </a>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              title="삭제"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 검색 결과 수 표시 */}
              {searchQuery && filteredHistory.length > 0 && (
                <p className="text-sm text-gray-500 mt-4">
                  {filteredHistory.length}개의 검색 결과
                </p>
              )}
            </CardContent>
          </Card>
        </Container>
      </main>

      {/* 개별 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="항목 삭제"
        message="이 히스토리 항목을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
      />

      {/* 전체 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={confirmClearAll}
        title="전체 히스토리 삭제"
        message={`모든 히스토리(${history.length}개)가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`}
        confirmText="전체 삭제"
        cancelText="취소"
        variant="danger"
      />
    </div>
  );
}
