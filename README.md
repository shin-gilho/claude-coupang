# 쿠팡 파트너스 자동 블로그 작성 시스템

키워드 기반으로 쿠팡 파트너스 상품을 자동 수집하고, AI를 활용해 블로그 글을 작성한 후 워드프레스에 자동 업로드하는 시스템입니다.

## 주요 기능

- **쿠팡 상품 검색**: 키워드 기반 상위 5개 상품 자동 수집
- **AI 글 작성**: Claude 또는 Gemini API로 블로그 글 자동 생성
- **워드프레스 발행**: REST API를 통한 자동 업로드 및 예약 발행
- **Rank Math SEO**: Focus Keyword, Meta Description 자동 설정
- **발행 스케줄링**: 사용자 설정 간격 및 시간대에 맞춰 예약 발행

## 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **API 연동**: 쿠팡 파트너스, Claude (Anthropic), Gemini (Google), WordPress REST API
- **저장소**: 브라우저 LocalStorage (API 키 및 설정)

## 시작하기

### 요구사항

- Node.js 18.17 이상
- npm 또는 yarn
- 쿠팡 파트너스 API 키
- Claude 또는 Gemini API 키
- WordPress 사이트 (Rank Math 플러그인 설치 권장)

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/coupang-auto-blog.git
cd coupang-auto-blog

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

### 환경 변수 설정

`.env.local` 파일을 생성하고 필요한 환경 변수를 설정합니다:

```env
# 필수 환경 변수는 없음 (모든 API 키는 브라우저 설정 페이지에서 입력)
# 서버 사이드에서 사용할 기본값이 필요한 경우 아래 추가
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 사용 방법

### 1. API 키 설정

1. 우측 상단 설정 아이콘(톱니바퀴)을 클릭합니다
2. 필요한 API 키를 입력합니다:
   - **쿠팡 파트너스**: Access Key, Secret Key, Partner ID
   - **WordPress**: 사이트 URL, 사용자명, Application Password
   - **Claude API**: Anthropic API Key
   - **Gemini API**: Google AI API Key
3. "저장" 버튼을 클릭합니다

### 2. 블로그 글 작성

1. 메인 페이지에서 키워드를 입력합니다 (줄바꿈으로 여러 개 입력 가능)
2. AI 모델을 선택합니다 (Claude 또는 Gemini)
3. 발행 설정을 조정합니다:
   - 발행 간격 (분)
   - 발행 시간대 (시작~종료)
4. "실행하기" 버튼을 클릭합니다

### 3. 진행 상황 확인

- 화면 하단에서 실시간 진행 상황을 확인할 수 있습니다
- 완료 시 WordPress 글 링크가 표시됩니다

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── ai/           # AI API (Claude, Gemini)
│   │   ├── coupang/      # 쿠팡 API
│   │   └── wordpress/    # WordPress API
│   ├── settings/         # 설정 페이지
│   └── page.tsx          # 메인 페이지
├── components/            # React 컴포넌트
│   ├── forms/            # 폼 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   ├── progress/         # 진행 상황 컴포넌트
│   └── ui/               # 기본 UI 컴포넌트
├── constants/             # 상수 및 설정
├── hooks/                 # React Hooks
├── lib/                   # 유틸리티 및 API 클라이언트
│   ├── api/              # API 클라이언트
│   ├── seo/              # SEO 유틸리티
│   ├── storage/          # LocalStorage 유틸리티
│   └── workflow/         # 워크플로우 오케스트레이터
└── types/                 # TypeScript 타입 정의
```

## API 키 발급 방법

### 쿠팡 파트너스

1. [쿠팡 파트너스](https://partners.coupang.com/) 가입
2. API 키 발급 신청
3. Access Key, Secret Key, Partner ID 확인

### Claude API

1. [Anthropic Console](https://console.anthropic.com/) 가입
2. API Keys에서 새 키 생성

### Gemini API

1. [Google AI Studio](https://ai.google.dev/) 접속
2. Get API Key에서 키 발급

### WordPress Application Password

1. WordPress 관리자 > 사용자 > 프로필
2. Application Passwords 섹션에서 새 비밀번호 생성
3. 생성된 비밀번호 복사 (공백 포함)

## 배포

### Vercel 배포

```bash
npm install -g vercel
vercel
```

### 수동 빌드

```bash
npm run build
npm start
```

## 주의사항

- API 키는 브라우저 LocalStorage에 저장되므로, 공용 컴퓨터에서 사용 시 주의하세요
- 쿠팡 파트너스 API 사용 정책을 준수하세요
- AI API 사용량에 따른 비용이 발생할 수 있습니다
- WordPress REST API가 활성화되어 있어야 합니다

## 라이선스

MIT License

## 문의

이슈가 있거나 기능 요청이 있으시면 GitHub Issues를 이용해주세요.
