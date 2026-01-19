# Coupang Auto Blog Generator - 개발 가이드

## 프로젝트 개요

쿠팡 파트너스 자동 블로그 작성 시스템입니다. 키워드 기반으로 쿠팡 상품을 수집하고, AI를 활용해 블로그 글을 작성한 후 워드프레스에 자동 업로드합니다.

---

## 프로젝트 구조

```
claude-coupang/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # 루트 레이아웃
│   ├── page.tsx                 # 메인 페이지 (키워드 입력 & 실행)
│   ├── settings/
│   │   └── page.tsx             # API 키 설정 페이지
│   ├── api/                     # API Routes
│   │   ├── coupang/
│   │   │   └── route.ts         # 쿠팡 파트너스 API
│   │   ├── ai/
│   │   │   ├── claude/
│   │   │   │   └── route.ts     # Claude API
│   │   │   └── gemini/
│   │   │       └── route.ts     # Gemini API
│   │   ├── wordpress/
│   │   │   └── route.ts         # 워드프레스 REST API
│   │   └── workflow/
│   │       └── route.ts         # 워크플로우 실행 API
│   └── globals.css              # 전역 스타일
├── components/                   # React 컴포넌트
│   ├── ui/                      # 기본 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   ├── layout/                  # 레이아웃 컴포넌트
│   │   ├── Header.tsx
│   │   └── Container.tsx
│   ├── forms/                   # 폼 컴포넌트
│   │   ├── KeywordForm.tsx
│   │   ├── SettingsForm.tsx
│   │   └── PublishSettings.tsx
│   └── progress/                # 진행 상황 컴포넌트
│       ├── ProgressBar.tsx
│       ├── StepIndicator.tsx
│       └── StatusMessage.tsx
├── lib/                         # 유틸리티 및 비즈니스 로직
│   ├── api/                     # API 클라이언트
│   │   ├── coupang.ts           # 쿠팡 파트너스 API 클라이언트
│   │   ├── claude.ts            # Claude API 클라이언트
│   │   ├── gemini.ts            # Gemini API 클라이언트
│   │   └── wordpress.ts         # 워드프레스 API 클라이언트
│   ├── workflow/                # 워크플로우 로직
│   │   ├── orchestrator.ts      # 메인 워크플로우 오케스트레이터
│   │   ├── scheduler.ts         # 발행 예약 스케줄러
│   │   └── prompts.ts           # AI 프롬프트 템플릿
│   ├── storage/                 # 스토리지 관리
│   │   ├── localStorage.ts      # 로컬 스토리지 유틸리티
│   │   └── encryption.ts        # 암호화 유틸리티
│   ├── seo/                     # SEO 관련 로직
│   │   └── rankmath.ts          # Rank Math SEO 설정
│   └── utils/                   # 공통 유틸리티
│       ├── validation.ts        # 입력 검증
│       └── formatters.ts        # 데이터 포맷터
├── types/                       # TypeScript 타입 정의
│   ├── api.ts                   # API 관련 타입
│   ├── product.ts               # 상품 관련 타입
│   ├── post.ts                  # 블로그 포스트 타입
│   ├── workflow.ts              # 워크플로우 타입
│   └── settings.ts              # 설정 관련 타입
├── hooks/                       # 커스텀 React Hooks
│   ├── useLocalStorage.ts       # 로컬 스토리지 훅
│   ├── useWorkflow.ts           # 워크플로우 실행 훅
│   └── useProgress.ts           # 진행 상황 관리 훅
├── constants/                   # 상수 정의
│   ├── prompts.ts               # AI 프롬프트 상수
│   └── config.ts                # 설정 상수
├── .env.local                   # 환경 변수 (git 제외)
├── .env.example                 # 환경 변수 예시
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── PRD.md                       # 제품 요구사항 문서
├── TODO.md                      # 작업 체크리스트
├── claude.md                    # 이 문서 (개발 가이드)
└── AGENTS.md                    # Sub Agents 설계 문서
```

---

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **State Management**: React Hooks (useState, useEffect, useReducer)
- **HTTP Client**: Axios

### Backend
- **API Routes**: Next.js API Routes (serverless functions)
- **Runtime**: Node.js

### 외부 서비스
- 쿠팡 파트너스 API
- Claude API (Anthropic)
- Gemini API (Google)
- 워드프레스 REST API + Rank Math SEO

### 데이터 저장
- 브라우저 로컬 스토리지 (API 키)
- 데이터베이스 없음 (Phase 1)

---

## 코딩 컨벤션

### 파일 네이밍
- 컴포넌트: PascalCase (예: `KeywordForm.tsx`)
- 유틸리티/훅: camelCase (예: `useLocalStorage.ts`)
- 타입 정의: camelCase (예: `product.ts`)
- API 라우트: `route.ts`

### 컴포넌트 구조
```typescript
// 1. imports
import { useState } from 'react';
import type { ComponentProps } from '@/types';

// 2. 타입 정의 (필요시)
interface Props {
  // ...
}

// 3. 컴포넌트
export default function ComponentName({ prop1, prop2 }: Props) {
  // hooks
  const [state, setState] = useState();

  // handlers
  const handleClick = () => {};

  // render
  return (
    <div>
      {/* content */}
    </div>
  );
}
```

### TypeScript 규칙
- 모든 함수에 타입 정의 필수
- `any` 타입 사용 금지 (불가피한 경우 주석으로 사유 설명)
- interface 사용 (type보다 선호)
- 엄격한 null 체크

### Tailwind CSS 규칙
- 인라인 스타일 사용 금지
- 클래스 순서: 레이아웃 → 박스모델 → 타이포그래피 → 비주얼 → 기타
- 반복되는 스타일은 `@apply`로 추출

### 에러 처리
- 모든 API 호출에 try-catch 필수
- 사용자 친화적 에러 메시지 제공
- 에러 발생 시 전체 워크플로우 중단

---

## TypeScript 인터페이스

### API 키 설정
```typescript
// types/settings.ts
interface ApiKeys {
  coupang: {
    accessKey: string;
    secretKey: string;
    partnerId: string;
  };
  wordpress: {
    url: string;
    username: string;
    applicationPassword: string;
  };
  claude: string;
  gemini: string;
}

interface PublishSettings {
  intervalMinutes: number;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}
```

### 쿠팡 상품
```typescript
// types/product.ts
interface CoupangProduct {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string; // 파트너스 링크
  rating: number;
  reviewCount: number;
  isRocket: boolean;
  categoryName: string;
}
```

### 블로그 포스트
```typescript
// types/post.ts
interface BlogPost {
  title: string;
  content: string; // HTML
  focusKeyword: string;
  metaDescription: string;
  products: CoupangProduct[];
  keyword: string;
}

interface WordPressPost {
  title: string;
  content: string;
  status: 'future' | 'publish' | 'draft';
  date: string; // ISO 8601
  meta: {
    rank_math_focus_keyword: string;
    rank_math_description: string;
  };
}
```

### 워크플로우
```typescript
// types/workflow.ts
type WorkflowStatus =
  | 'idle'
  | 'collecting'      // 쿠팡 상품 수집 중
  | 'generating'      // AI 글 작성 중
  | 'uploading'       // 워드프레스 업로드 중
  | 'completed'       // 완료
  | 'error';          // 에러

interface WorkflowState {
  status: WorkflowStatus;
  currentKeywordIndex: number;
  totalKeywords: number;
  currentStep: string;
  progress: number; // 0-100
  error?: string;
  results: WorkflowResult[];
}

interface WorkflowResult {
  keyword: string;
  success: boolean;
  postUrl?: string;
  scheduledTime?: string;
  error?: string;
}
```

---

## API 연동 가이드

### 1. 쿠팡 파트너스 API

```typescript
// lib/api/coupang.ts
import crypto from 'crypto';
import axios from 'axios';

const COUPANG_API_BASE = 'https://api-gateway.coupang.com';

export async function searchProducts(
  keyword: string,
  accessKey: string,
  secretKey: string,
  partnerId: string
): Promise<CoupangProduct[]> {
  const timestamp = Date.now();
  const path = `/v2/providers/affiliate_open_api/apis/openapi/v1/products/search`;

  // HMAC 서명 생성
  const message = `${timestamp}${path}`;
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('hex');

  const response = await axios.get(`${COUPANG_API_BASE}${path}`, {
    params: {
      keyword,
      limit: 5,
      subId: partnerId,
    },
    headers: {
      'Authorization': `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${timestamp}, signature=${signature}`,
    },
  });

  return response.data.data.productData;
}
```

### 2. Claude API

```typescript
// lib/api/claude.ts
import Anthropic from '@anthropic-ai/sdk';

export async function generateBlogPost(
  apiKey: string,
  keyword: string,
  products: CoupangProduct[]
): Promise<BlogPost> {
  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: buildPrompt(keyword, products),
    }],
  });

  return parseResponse(message.content[0].text);
}
```

### 3. Gemini API

```typescript
// lib/api/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateBlogPost(
  apiKey: string,
  keyword: string,
  products: CoupangProduct[]
): Promise<BlogPost> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const result = await model.generateContent(buildPrompt(keyword, products));
  const response = await result.response;

  return parseResponse(response.text());
}
```

### 4. 워드프레스 REST API

```typescript
// lib/api/wordpress.ts
import axios from 'axios';

export async function createPost(
  siteUrl: string,
  username: string,
  appPassword: string,
  post: WordPressPost
): Promise<{ id: number; link: string }> {
  const credentials = Buffer.from(`${username}:${appPassword}`).toString('base64');

  const response = await axios.post(
    `${siteUrl}/wp-json/wp/v2/posts`,
    {
      title: post.title,
      content: post.content,
      status: post.status,
      date: post.date,
      meta: post.meta,
    },
    {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return {
    id: response.data.id,
    link: response.data.link,
  };
}
```

---

## Rank Math SEO 설정

워드프레스에서 Rank Math 플러그인이 설치되어 있어야 합니다.

### REST API 메타 필드 활성화
1. Rank Math > General Settings > Edit with Rest API 활성화
2. 필수 메타 필드:
   - `rank_math_focus_keyword`: Focus Keyword
   - `rank_math_description`: Meta Description

### 사용 예시
```typescript
const postData = {
  title: '2024년 최고의 무선 이어폰 추천 TOP 5',
  content: '<p>블로그 본문...</p>',
  status: 'future',
  date: '2024-01-20T09:00:00',
  meta: {
    rank_math_focus_keyword: '무선 이어폰 추천',
    rank_math_description: '2024년 가성비 최고의 무선 이어폰을 비교 분석했습니다. 에어팟, 갤럭시버즈 등 인기 제품의 장단점을 확인하세요.',
  },
};
```

---

## 발행 예약 로직

### 스케줄러 구현
```typescript
// lib/workflow/scheduler.ts
export function calculateScheduledTimes(
  keywordCount: number,
  intervalMinutes: number,
  startTime: string, // "09:00"
  endTime: string    // "18:00"
): Date[] {
  const scheduledTimes: Date[] = [];
  let currentTime = getNextAvailableTime(startTime, endTime);

  for (let i = 0; i < keywordCount; i++) {
    scheduledTimes.push(new Date(currentTime));
    currentTime = addMinutes(currentTime, intervalMinutes);

    // 시간대를 벗어나면 다음 날로
    if (isAfterEndTime(currentTime, endTime)) {
      currentTime = getNextDayStartTime(currentTime, startTime);
    }
  }

  return scheduledTimes;
}
```

### 시간대 처리 규칙
1. 첫 번째 글: 현재 시간이 시간대 내면 다음 간격, 아니면 다음 가능 시간
2. 시간대를 벗어나면 다음 날 시작 시간부터 계속
3. 모든 시간은 한국 시간(KST) 기준

---

## 로컬 스토리지 사용

### 저장 구조
```typescript
// localStorage keys
const STORAGE_KEYS = {
  API_KEYS: 'coupang-blog-api-keys',
  PUBLISH_SETTINGS: 'coupang-blog-publish-settings',
};
```

### 암호화 (선택사항)
```typescript
// lib/storage/encryption.ts
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'user-device-id-or-fixed-key';

export function encrypt(data: string): string {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
}

export function decrypt(encryptedData: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

### useLocalStorage 훅
```typescript
// hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue] as const;
}
```

---

## 에러 핸들링 전략

### 에러 타입 정의
```typescript
// types/api.ts
interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

type ErrorCode =
  | 'COUPANG_API_ERROR'
  | 'CLAUDE_API_ERROR'
  | 'GEMINI_API_ERROR'
  | 'WORDPRESS_API_ERROR'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR';
```

### 에러 처리 패턴
```typescript
// 워크플로우에서의 에러 처리
async function executeWorkflow(keywords: string[]) {
  try {
    for (const keyword of keywords) {
      // 1. 쿠팡 상품 수집
      const products = await collectProducts(keyword);
      if (!products.length) {
        throw new Error(`'${keyword}'에 대한 상품을 찾을 수 없습니다.`);
      }

      // 2. AI 글 작성
      const post = await generatePost(keyword, products);

      // 3. 워드프레스 업로드
      await uploadToWordPress(post);
    }
  } catch (error) {
    // 에러 발생 시 즉시 중단
    updateStatus('error', error.message);
    throw error;
  }
}
```

### 사용자 에러 메시지
```typescript
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  COUPANG_API_ERROR: '쿠팡 API 호출에 실패했습니다. API 키를 확인해주세요.',
  CLAUDE_API_ERROR: 'Claude API 호출에 실패했습니다. API 키와 잔여 크레딧을 확인해주세요.',
  GEMINI_API_ERROR: 'Gemini API 호출에 실패했습니다. API 키를 확인해주세요.',
  WORDPRESS_API_ERROR: '워드프레스 업로드에 실패했습니다. URL과 인증 정보를 확인해주세요.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
  VALIDATION_ERROR: '입력값이 올바르지 않습니다.',
};
```

---

## 보안 고려사항

### API 키 관리
1. **클라이언트 사이드**: 로컬 스토리지에 저장 (암호화 권장)
2. **서버 사이드**: 환경 변수 사용 (`.env.local`)
3. **외부 API 호출**: 반드시 서버 사이드(API Routes)에서 실행

### .env.local 예시
```env
# 서버 사이드에서만 사용되는 키 (선택적)
COUPANG_ACCESS_KEY=your-access-key
COUPANG_SECRET_KEY=your-secret-key
CLAUDE_API_KEY=your-claude-key
```

### 보안 체크리스트
- [ ] `.env.local`이 `.gitignore`에 포함되어 있는지 확인
- [ ] 클라이언트에서 API 키가 노출되지 않는지 확인
- [ ] 워드프레스 Application Password 사용
- [ ] HTTPS 연결 필수

---

## 워크플로우 설계

### 전체 흐름
```
키워드 입력
    ↓
[1] 쿠팡 상품 수집 (5개)
    ↓
[2] AI 글 작성 (Claude/Gemini)
    ↓
[3] 워드프레스 업로드 + SEO 설정
    ↓
[4] 발행 예약
    ↓
완료 (또는 다음 키워드로 반복)
```

### 상태 전이
```
idle → collecting → generating → uploading → completed
                                          ↘ error (어느 단계에서든)
```

### 실시간 진행 상황
- 각 단계 진입 시 상태 업데이트
- 프로그레스 바: `(현재 키워드 / 전체 키워드) * 100`
- 상세 메시지: "키워드 3/10 - AI 글 작성 중..."

---

## Git 규칙

### 커밋 메시지 형식 (Conventional Commits)
```
<type>: <description>

[optional body]

[optional footer]
```

### 타입
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `style`: UI/스타일 변경
- `docs`: 문서 수정
- `refactor`: 리팩토링
- `chore`: 빌드, 설정 등 기타 작업
- `test`: 테스트 추가/수정

### 예시
```
feat: implement Coupang API client with error handling
fix: resolve timezone issue in scheduler
style: update button styles for better UX
docs: add API integration guide to claude.md
```

### 작업 규칙
1. 각 TODO 항목 완료 시 커밋
2. TODO.md 업데이트도 같은 커밋에 포함
3. 의미 있는 단위로 커밋 (기능 단위)

---

## Sub Agents 역할 및 활용

이 프로젝트는 5개의 Sub Agent로 나뉘어 개발됩니다. 자세한 내용은 `AGENTS.md` 참조.

| Agent | 담당 영역 | 주요 파일 |
|-------|----------|----------|
| ui-developer | UI 컴포넌트 | `/app`, `/components` |
| api-integrator | API 연동 | `/lib/api`, `/app/api` |
| workflow-orchestrator | 워크플로우 | `/lib/workflow` |
| seo-specialist | SEO/워드프레스 | `/lib/seo`, 워드프레스 연동 |
| storage-manager | 스토리지 관리 | `/lib/storage`, `/hooks` |

### 협업 방식
1. 각 Agent는 담당 영역만 수정
2. 타입 정의(`/types`)는 공유 영역
3. 인터페이스 변경 시 관련 Agent에 알림
4. 통합 테스트는 workflow-orchestrator가 주도

---

## 디자인 가이드

### 색상
```css
:root {
  --primary: #3B82F6;    /* 블루 - 메인 액션 */
  --secondary: #6B7280;  /* 그레이 - 보조 */
  --success: #10B981;    /* 그린 - 성공 */
  --error: #EF4444;      /* 레드 - 에러 */
  --background: #F9FAFB; /* 배경 */
  --foreground: #111827; /* 텍스트 */
}
```

### Tailwind 설정
```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        success: '#10B981',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', 'sans-serif'],
      },
    },
  },
};
```

### 컴포넌트 스타일 가이드
- 버튼: 패딩 `px-4 py-2`, 라운드 `rounded-lg`
- 카드: 패딩 `p-6`, 그림자 `shadow-sm`, 라운드 `rounded-xl`
- 입력 필드: 테두리 `border border-gray-300`, 포커스 `focus:ring-2 focus:ring-primary`

---

## 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env.local
# .env.local 편집

# 3. 개발 서버 실행
npm run dev

# 4. 빌드
npm run build

# 5. 프로덕션 실행
npm start
```

---

## 참고 자료

- [쿠팡 파트너스 API](https://developers.coupangcorps.com/)
- [Claude API](https://docs.anthropic.com/)
- [Gemini API](https://ai.google.dev/)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [Rank Math REST API](https://rankmath.com/kb/rest-api/)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
