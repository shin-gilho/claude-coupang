import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="뒤로 가기"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">API 키 설정</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <form className="space-y-6">
          {/* 쿠팡 파트너스 API */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              쿠팡 파트너스 API
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="coupangAccessKey"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Access Key
                </label>
                <input
                  type="password"
                  id="coupangAccessKey"
                  className="input"
                  placeholder="Access Key 입력"
                />
              </div>
              <div>
                <label
                  htmlFor="coupangSecretKey"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Secret Key
                </label>
                <input
                  type="password"
                  id="coupangSecretKey"
                  className="input"
                  placeholder="Secret Key 입력"
                />
              </div>
              <div>
                <label
                  htmlFor="coupangPartnerId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Partner ID (Sub ID)
                </label>
                <input
                  type="text"
                  id="coupangPartnerId"
                  className="input"
                  placeholder="Partner ID 입력"
                />
              </div>
            </div>
          </div>

          {/* 워드프레스 설정 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              워드프레스 설정
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="wpUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  사이트 URL
                </label>
                <input
                  type="url"
                  id="wpUrl"
                  className="input"
                  placeholder="https://your-site.com"
                />
              </div>
              <div>
                <label
                  htmlFor="wpUsername"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  사용자명
                </label>
                <input
                  type="text"
                  id="wpUsername"
                  className="input"
                  placeholder="WordPress 사용자명"
                />
              </div>
              <div>
                <label
                  htmlFor="wpAppPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Application Password
                </label>
                <input
                  type="password"
                  id="wpAppPassword"
                  className="input"
                  placeholder="Application Password 입력"
                />
                <p className="mt-1 text-sm text-gray-500">
                  워드프레스 관리자 &gt; 사용자 &gt; 프로필 &gt; Application
                  Passwords에서 생성
                </p>
              </div>
            </div>
          </div>

          {/* AI API 키 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              AI API 키
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="claudeApiKey"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Claude API 키
                </label>
                <input
                  type="password"
                  id="claudeApiKey"
                  className="input"
                  placeholder="sk-ant-..."
                />
              </div>
              <div>
                <label
                  htmlFor="geminiApiKey"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Gemini API 키
                </label>
                <input
                  type="password"
                  id="geminiApiKey"
                  className="input"
                  placeholder="AIza..."
                />
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex gap-4">
            <button type="submit" className="btn-primary flex-1 py-3 text-base">
              저장하기
            </button>
            <button type="button" className="btn-secondary py-3 px-6 text-base">
              초기화
            </button>
          </div>

          {/* 안내 문구 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5"
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
                <h3 className="text-sm font-medium text-blue-800">
                  보안 안내
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  API 키는 브라우저의 로컬 스토리지에 저장됩니다. 공용 컴퓨터에서는
                  사용을 권장하지 않습니다.
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
