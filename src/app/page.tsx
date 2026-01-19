import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            쿠팡 파트너스 자동 블로그
          </h1>
          <Link
            href="/settings"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="설정"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 키워드 입력 섹션 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              키워드 입력
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="keywords"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  키워드 (줄바꿈으로 구분)
                </label>
                <textarea
                  id="keywords"
                  rows={6}
                  className="input resize-none"
                  placeholder="무선 이어폰&#10;블루투스 스피커&#10;게이밍 마우스"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI 모델 선택
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="aiModel"
                      value="claude"
                      defaultChecked
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Claude</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="aiModel"
                      value="gemini"
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Gemini</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 발행 설정 섹션 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              발행 설정
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="interval"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  발행 간격 (분)
                </label>
                <input
                  type="number"
                  id="interval"
                  defaultValue={10}
                  min={1}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    시작 시간
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    defaultValue="09:00"
                    className="input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    종료 시간
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    defaultValue="18:00"
                    className="input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 실행 버튼 */}
        <div className="mt-6">
          <button className="btn-primary w-full py-3 text-base">
            실행하기
          </button>
        </div>

        {/* 진행 상황 섹션 (추후 구현) */}
        <div className="mt-8 card bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            진행 상황
          </h2>
          <div className="text-center py-8 text-gray-500">
            실행 버튼을 클릭하면 진행 상황이 여기에 표시됩니다.
          </div>
        </div>
      </main>
    </div>
  );
}
