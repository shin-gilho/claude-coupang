# Sub Agents 설계 문서

> 쿠팡 파트너스 자동 블로그 작성 시스템 개발을 위한 Sub Agent 역할 정의

---

## 개요

이 프로젝트는 5개의 전문화된 Sub Agent로 나뉘어 개발됩니다. 각 Agent는 특정 도메인을 담당하며, 명확한 책임 범위와 인터페이스를 가집니다.

```
┌─────────────────────────────────────────────────────────────┐
│                    Main Orchestrator                         │
│                  (전체 프로젝트 관리)                         │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ ui-developer  │   │api-integrator │   │   workflow-   │
│               │   │               │   │ orchestrator  │
└───────────────┘   └───────────────┘   └───────────────┘
                              │                     │
                    ┌─────────┴─────────┐         │
                    ▼                   ▼         │
            ┌───────────────┐   ┌───────────────┐ │
            │seo-specialist │   │storage-manager│ │
            └───────────────┘   └───────────────┘ │
                    │                   │         │
                    └───────────────────┴─────────┘
```

---

## 1. ui-developer

### 역할
UI 컴포넌트와 스타일을 담당하는 프론트엔드 전문 Agent입니다.

### 책임 범위
- React 컴포넌트 개발
- Tailwind CSS 스타일링
- 반응형 디자인 구현
- 사용자 인터랙션 처리

### 담당 파일/폴더
```
/app/
├── layout.tsx
├── page.tsx
├── settings/
│   └── page.tsx
└── globals.css

/components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Select.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── Toast.tsx
├── layout/
│   ├── Header.tsx
│   └── Container.tsx
├── forms/
│   ├── KeywordForm.tsx
│   ├── SettingsForm.tsx
│   └── PublishSettings.tsx
└── progress/
    ├── ProgressBar.tsx
    ├── StepIndicator.tsx
    └── StatusMessage.tsx
```

### 가이드라인

#### 스타일링 규칙
```typescript
// Tailwind 클래스 순서
// 1. 레이아웃 (flex, grid, position)
// 2. 박스모델 (w, h, p, m)
// 3. 타이포그래피 (text, font)
// 4. 비주얼 (bg, border, shadow)
// 5. 기타 (transition, cursor)

// 예시
<button className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-600 transition-colors">
  클릭
</button>
```

#### 컴포넌트 구조
```typescript
// components/ui/Button.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          {
            'bg-primary text-white hover:bg-blue-600 focus:ring-primary': variant === 'primary',
            'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500': variant === 'secondary',
            'bg-error text-white hover:bg-red-600 focus:ring-error': variant === 'danger',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
            'opacity-50 cursor-not-allowed': props.disabled || isLoading,
          },
          className
        )}
        disabled={props.disabled || isLoading}
        {...props}
      >
        {isLoading && <Spinner className="mr-2" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
```

#### 디자인 토큰
```css
/* 색상 */
--primary: #3B82F6;
--secondary: #6B7280;
--success: #10B981;
--error: #EF4444;

/* 간격 */
--spacing-xs: 0.25rem;  /* 4px */
--spacing-sm: 0.5rem;   /* 8px */
--spacing-md: 1rem;     /* 16px */
--spacing-lg: 1.5rem;   /* 24px */
--spacing-xl: 2rem;     /* 32px */

/* 라운드 */
--radius-sm: 0.25rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
```

#### 반응형 기준
```
Desktop-first 접근
- lg (1024px+): 기본
- md (768px-1023px): 태블릿
- sm (640px-767px): 모바일 가로
- xs (~639px): 모바일 세로
```

### 협업 인터페이스
- `workflow-orchestrator`로부터 진행 상황 데이터 수신
- `storage-manager`로부터 저장된 설정 데이터 수신
- 사용자 입력을 `workflow-orchestrator`에 전달

---

## 2. api-integrator

### 역할
외부 API 연동을 전문으로 담당하는 백엔드 Agent입니다.

### 책임 범위
- 외부 API 클라이언트 구현
- API Route 핸들러 구현
- 인증 및 서명 처리
- 에러 핸들링 및 재시도 로직

### 담당 파일/폴더
```
/lib/api/
├── coupang.ts        # 쿠팡 파트너스 API 클라이언트
├── claude.ts         # Claude API 클라이언트
├── gemini.ts         # Gemini API 클라이언트
└── wordpress.ts      # 워드프레스 API 클라이언트

/app/api/
├── coupang/
│   └── route.ts
├── ai/
│   ├── claude/
│   │   └── route.ts
│   └── gemini/
│       └── route.ts
└── wordpress/
    └── route.ts
```

### 가이드라인

#### 쿠팡 파트너스 API
```typescript
// lib/api/coupang.ts
import crypto from 'crypto';
import axios from 'axios';
import type { CoupangProduct } from '@/types/product';

const COUPANG_API_BASE = 'https://api-gateway.coupang.com';

interface CoupangApiConfig {
  accessKey: string;
  secretKey: string;
  partnerId: string;
}

export class CoupangApiClient {
  private config: CoupangApiConfig;

  constructor(config: CoupangApiConfig) {
    this.config = config;
  }

  private generateSignature(method: string, path: string, timestamp: number): string {
    const message = `${timestamp}${method}${path}`;
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(message)
      .digest('hex');
  }

  async searchProducts(keyword: string, limit: number = 5): Promise<CoupangProduct[]> {
    const timestamp = Date.now();
    const path = '/v2/providers/affiliate_open_api/apis/openapi/v1/products/search';
    const signature = this.generateSignature('GET', path, timestamp);

    try {
      const response = await axios.get(`${COUPANG_API_BASE}${path}`, {
        params: {
          keyword,
          limit,
          subId: this.config.partnerId,
        },
        headers: {
          'Authorization': `CEA algorithm=HmacSHA256, access-key=${this.config.accessKey}, signed-date=${timestamp}, signature=${signature}`,
        },
      });

      return this.transformProducts(response.data.data.productData);
    } catch (error) {
      throw this.handleError(error, 'COUPANG_API_ERROR');
    }
  }

  private transformProducts(rawProducts: any[]): CoupangProduct[] {
    return rawProducts.map(p => ({
      productId: p.productId,
      productName: p.productName,
      productPrice: p.productPrice,
      productImage: p.productImage,
      productUrl: p.productUrl,
      rating: p.rating || 0,
      reviewCount: p.reviewCount || 0,
      isRocket: p.isRocket || false,
      categoryName: p.categoryName || '',
    }));
  }

  private handleError(error: any, code: string): Error {
    const message = error.response?.data?.message || error.message;
    const apiError = new Error(message);
    (apiError as any).code = code;
    return apiError;
  }
}
```

#### Claude API
```typescript
// lib/api/claude.ts
import Anthropic from '@anthropic-ai/sdk';
import type { BlogPost } from '@/types/post';
import type { CoupangProduct } from '@/types/product';

export class ClaudeApiClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateBlogPost(keyword: string, products: CoupangProduct[]): Promise<BlogPost> {
    const prompt = this.buildPrompt(keyword, products);

    try {
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      return this.parseResponse(content.text, keyword, products);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private buildPrompt(keyword: string, products: CoupangProduct[]): string {
    // prompts.ts에서 가져온 템플릿 사용
    return `...`;
  }

  private parseResponse(text: string, keyword: string, products: CoupangProduct[]): BlogPost {
    // JSON 파싱 또는 구조화된 응답 추출
    return { ... };
  }
}
```

#### 에러 처리 패턴
```typescript
// 공통 에러 타입
interface ApiError extends Error {
  code: string;
  status?: number;
  details?: unknown;
}

// 에러 핸들링 유틸리티
export function createApiError(code: string, message: string, status?: number): ApiError {
  const error = new Error(message) as ApiError;
  error.code = code;
  error.status = status;
  return error;
}

// API Route에서의 에러 응답
export function errorResponse(error: ApiError) {
  return Response.json(
    { error: { code: error.code, message: error.message } },
    { status: error.status || 500 }
  );
}
```

### 협업 인터페이스
- `workflow-orchestrator`에게 API 클라이언트 함수 제공
- `seo-specialist`에게 워드프레스 API 클라이언트 제공
- `storage-manager`로부터 API 키 수신

---

## 3. workflow-orchestrator

### 역할
전체 워크플로우 로직을 담당하는 핵심 Agent입니다.

### 책임 범위
- 워크플로우 상태 관리
- 단계별 실행 오케스트레이션
- 에러 발생 시 전체 중단
- 진행 상황 실시간 업데이트
- 발행 예약 스케줄링

### 담당 파일/폴더
```
/lib/workflow/
├── orchestrator.ts    # 메인 워크플로우 오케스트레이터
├── scheduler.ts       # 발행 예약 스케줄러
└── prompts.ts         # AI 프롬프트 빌더

/app/api/workflow/
└── route.ts           # 워크플로우 실행 API

/hooks/
├── useWorkflow.ts     # 워크플로우 실행 훅
└── useProgress.ts     # 진행 상황 관리 훅

/constants/
└── prompts.ts         # AI 프롬프트 템플릿
```

### 가이드라인

#### 워크플로우 오케스트레이터
```typescript
// lib/workflow/orchestrator.ts
import type { WorkflowState, WorkflowResult } from '@/types/workflow';
import type { CoupangProduct } from '@/types/product';
import type { BlogPost } from '@/types/post';

export type ProgressCallback = (state: WorkflowState) => void;

export interface WorkflowConfig {
  keywords: string[];
  aiModel: 'claude' | 'gemini';
  publishSettings: {
    intervalMinutes: number;
    startTime: string;
    endTime: string;
  };
  apiKeys: {
    coupang: CoupangApiConfig;
    ai: string;
    wordpress: WordPressConfig;
  };
}

export class WorkflowOrchestrator {
  private state: WorkflowState;
  private onProgress: ProgressCallback;

  constructor(onProgress: ProgressCallback) {
    this.onProgress = onProgress;
    this.state = this.initState();
  }

  private initState(): WorkflowState {
    return {
      status: 'idle',
      currentKeywordIndex: 0,
      totalKeywords: 0,
      currentStep: '',
      progress: 0,
      results: [],
    };
  }

  async execute(config: WorkflowConfig): Promise<WorkflowResult[]> {
    this.state.totalKeywords = config.keywords.length;
    const scheduledTimes = this.calculateSchedule(config);

    try {
      for (let i = 0; i < config.keywords.length; i++) {
        this.state.currentKeywordIndex = i;
        const keyword = config.keywords[i];
        const scheduledTime = scheduledTimes[i];

        const result = await this.processKeyword(keyword, config, scheduledTime);
        this.state.results.push(result);

        if (!result.success) {
          throw new Error(result.error);
        }
      }

      this.updateState('completed', '모든 작업 완료');
      return this.state.results;
    } catch (error) {
      this.updateState('error', error.message);
      throw error;
    }
  }

  private async processKeyword(
    keyword: string,
    config: WorkflowConfig,
    scheduledTime: Date
  ): Promise<WorkflowResult> {
    try {
      // Step 1: 쿠팡 상품 수집
      this.updateState('collecting', `"${keyword}" 상품 수집 중...`);
      const products = await this.collectProducts(keyword, config.apiKeys.coupang);

      // Step 2: AI 글 작성
      this.updateState('generating', `"${keyword}" 글 작성 중...`);
      const post = await this.generatePost(keyword, products, config);

      // Step 3: 워드프레스 업로드
      this.updateState('uploading', `"${keyword}" 업로드 중...`);
      const uploadResult = await this.uploadPost(post, scheduledTime, config.apiKeys.wordpress);

      return {
        keyword,
        success: true,
        postUrl: uploadResult.link,
        scheduledTime: scheduledTime.toISOString(),
      };
    } catch (error) {
      return {
        keyword,
        success: false,
        error: error.message,
      };
    }
  }

  private updateState(status: WorkflowStatus, step: string) {
    this.state.status = status;
    this.state.currentStep = step;
    this.state.progress = this.calculateProgress();
    this.onProgress({ ...this.state });
  }

  private calculateProgress(): number {
    const { currentKeywordIndex, totalKeywords, status } = this.state;
    const baseProgress = (currentKeywordIndex / totalKeywords) * 100;
    const stepBonus = status === 'completed' ? 100 :
                      status === 'uploading' ? 15 :
                      status === 'generating' ? 10 : 5;
    return Math.min(baseProgress + stepBonus / totalKeywords, 100);
  }
}
```

#### 스케줄러
```typescript
// lib/workflow/scheduler.ts
export function calculateScheduledTimes(
  count: number,
  intervalMinutes: number,
  startTime: string,
  endTime: string
): Date[] {
  const times: Date[] = [];
  let current = getNextAvailableTime(startTime, endTime);

  for (let i = 0; i < count; i++) {
    times.push(new Date(current));
    current = addMinutes(current, intervalMinutes);

    if (isAfterEndTime(current, endTime)) {
      current = getNextDayStartTime(current, startTime);
    }
  }

  return times;
}

function getNextAvailableTime(startTime: string, endTime: string): Date {
  const now = new Date();
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startToday = new Date(now);
  startToday.setHours(startHour, startMin, 0, 0);

  const endToday = new Date(now);
  endToday.setHours(endHour, endMin, 0, 0);

  if (now < startToday) {
    return startToday;
  } else if (now >= startToday && now < endToday) {
    // 현재 시간에서 다음 간격으로
    return now;
  } else {
    // 다음 날 시작 시간
    const tomorrow = new Date(startToday);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
}
```

#### 프롬프트 템플릿
```typescript
// constants/prompts.ts
export const BLOG_POST_PROMPT = `
당신은 쿠팡 파트너스 블로그 글 작성 전문가입니다.
주어진 키워드와 상품 정보를 바탕으로 SEO에 최적화된 블로그 글을 작성해주세요.

## 키워드
{keyword}

## 상품 정보
{products}

## 요구사항
1. 매력적이고 클릭을 유도하는 제목 작성
2. 1500-2000자 분량의 본문 작성
3. 각 상품별 특징, 장단점 비교
4. 구매 가이드 및 추천 포함
5. HTML 형식으로 출력 (h2, h3, p, ul, li 태그 사용)
6. 상품 이미지와 링크 포함

## 출력 형식 (JSON)
{
  "title": "블로그 제목",
  "content": "<html>본문</html>",
  "focusKeyword": "Focus Keyword",
  "metaDescription": "메타 설명 (150자 이내)"
}
`;
```

### 협업 인터페이스
- `api-integrator`의 API 클라이언트 사용
- `seo-specialist`에게 SEO 메타데이터 설정 위임
- `ui-developer`에게 진행 상황 데이터 전달
- `storage-manager`로부터 설정 데이터 수신

---

## 4. seo-specialist

### 역할
SEO 및 워드프레스 연동을 전문으로 담당하는 Agent입니다.

### 책임 범위
- Rank Math SEO 메타데이터 설정
- Focus Keyword 자동 설정
- Meta Description 생성/설정
- 워드프레스 포스트 데이터 최적화

### 담당 파일/폴더
```
/lib/seo/
└── rankmath.ts        # Rank Math SEO 설정

/lib/api/wordpress.ts  # (api-integrator와 협업)
```

### 가이드라인

#### Rank Math 메타데이터
```typescript
// lib/seo/rankmath.ts
import type { BlogPost, WordPressPost } from '@/types/post';

export interface RankMathMeta {
  rank_math_focus_keyword: string;
  rank_math_description: string;
  rank_math_title?: string;
  rank_math_robots?: string[];
}

export function createRankMathMeta(post: BlogPost): RankMathMeta {
  return {
    rank_math_focus_keyword: sanitizeFocusKeyword(post.focusKeyword),
    rank_math_description: truncateDescription(post.metaDescription, 150),
  };
}

function sanitizeFocusKeyword(keyword: string): string {
  // 특수문자 제거, 공백 정리
  return keyword
    .trim()
    .replace(/[^\w\s가-힣]/g, '')
    .replace(/\s+/g, ' ');
}

function truncateDescription(description: string, maxLength: number): string {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength - 3) + '...';
}
```

#### 워드프레스 포스트 변환
```typescript
// lib/seo/rankmath.ts
export function prepareWordPressPost(
  post: BlogPost,
  scheduledTime: Date
): WordPressPost {
  const meta = createRankMathMeta(post);

  return {
    title: post.title,
    content: optimizeContent(post.content, post.products),
    status: 'future',
    date: scheduledTime.toISOString(),
    meta,
  };
}

function optimizeContent(content: string, products: CoupangProduct[]): string {
  // 1. 이미지 alt 태그 최적화
  // 2. 내부 링크 구조 확인
  // 3. 헤딩 태그 구조 확인
  return content;
}
```

#### SEO 체크리스트
```typescript
export interface SeoCheckResult {
  passed: boolean;
  issues: string[];
}

export function checkSeoRequirements(post: BlogPost): SeoCheckResult {
  const issues: string[] = [];

  // Focus Keyword 검사
  if (!post.focusKeyword || post.focusKeyword.length < 2) {
    issues.push('Focus Keyword가 너무 짧습니다.');
  }

  // Meta Description 검사
  if (post.metaDescription.length > 160) {
    issues.push('Meta Description이 160자를 초과합니다.');
  }

  // 본문에 Focus Keyword 포함 확인
  if (!post.content.includes(post.focusKeyword)) {
    issues.push('본문에 Focus Keyword가 포함되어 있지 않습니다.');
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}
```

### 협업 인터페이스
- `api-integrator`의 워드프레스 API 클라이언트 사용
- `workflow-orchestrator`로부터 블로그 포스트 데이터 수신
- AI 생성 컨텐츠의 SEO 최적화

---

## 5. storage-manager

### 역할
로컬 스토리지 관리를 전문으로 담당하는 Agent입니다.

### 책임 범위
- API 키 저장/불러오기
- 사용자 설정 관리
- 브라우저 스토리지 CRUD
- 데이터 암호화 (선택)

### 담당 파일/폴더
```
/lib/storage/
├── localStorage.ts    # 로컬 스토리지 유틸리티
└── encryption.ts      # 암호화 유틸리티

/hooks/
└── useLocalStorage.ts # 로컬 스토리지 훅
```

### 가이드라인

#### 스토리지 키
```typescript
// lib/storage/localStorage.ts
export const STORAGE_KEYS = {
  API_KEYS: 'coupang-blog-api-keys',
  PUBLISH_SETTINGS: 'coupang-blog-publish-settings',
  LAST_USED_AI: 'coupang-blog-last-ai',
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
```

#### 스토리지 유틸리티
```typescript
// lib/storage/localStorage.ts
import type { ApiKeys, PublishSettings } from '@/types/settings';

export class LocalStorageManager {
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  static getApiKeys(): ApiKeys | null {
    if (!this.isClient()) return null;

    try {
      const data = localStorage.getItem(STORAGE_KEYS.API_KEYS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static setApiKeys(keys: ApiKeys): void {
    if (!this.isClient()) return;

    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
  }

  static getPublishSettings(): PublishSettings | null {
    if (!this.isClient()) return null;

    try {
      const data = localStorage.getItem(STORAGE_KEYS.PUBLISH_SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static setPublishSettings(settings: PublishSettings): void {
    if (!this.isClient()) return;

    localStorage.setItem(STORAGE_KEYS.PUBLISH_SETTINGS, JSON.stringify(settings));
  }

  static clearAll(): void {
    if (!this.isClient()) return;

    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}
```

#### 암호화 유틸리티 (선택)
```typescript
// lib/storage/encryption.ts
import CryptoJS from 'crypto-js';

// 브라우저 환경에서의 고유 키 생성
function getDeviceKey(): string {
  // 간단한 구현: localStorage에 저장된 랜덤 키 사용
  const storedKey = localStorage.getItem('__device_key__');
  if (storedKey) return storedKey;

  const newKey = CryptoJS.lib.WordArray.random(32).toString();
  localStorage.setItem('__device_key__', newKey);
  return newKey;
}

export function encrypt(data: string): string {
  const key = getDeviceKey();
  return CryptoJS.AES.encrypt(data, key).toString();
}

export function decrypt(encryptedData: string): string {
  const key = getDeviceKey();
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

#### useLocalStorage 훅
```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // SSR 대응: 초기값은 initialValue 사용
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // 클라이언트에서 로컬 스토리지 값으로 초기화
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value;

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }

      return newValue;
    });
  }, [key]);

  const removeValue = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
```

### 협업 인터페이스
- `ui-developer`의 설정 폼에서 호출
- `workflow-orchestrator`에 API 키 제공
- `api-integrator`에 저장된 인증 정보 제공

---

## Agent 간 협업 흐름

### 1. 초기 설정 흐름
```
[ui-developer] SettingsForm
        ↓ 사용자 입력
[storage-manager] saveApiKeys()
        ↓ 저장 완료
[ui-developer] Toast 알림
```

### 2. 워크플로우 실행 흐름
```
[ui-developer] KeywordForm 제출
        ↓
[storage-manager] getApiKeys()
        ↓
[workflow-orchestrator] execute()
        ↓
[api-integrator] searchProducts() → 쿠팡 API
        ↓
[api-integrator] generatePost() → Claude/Gemini API
        ↓
[seo-specialist] prepareWordPressPost()
        ↓
[api-integrator] createPost() → WordPress API
        ↓
[workflow-orchestrator] updateProgress()
        ↓
[ui-developer] ProgressBar 업데이트
```

### 3. 에러 처리 흐름
```
[api-integrator] API 호출 실패
        ↓
[workflow-orchestrator] 에러 캐치 & 상태 업데이트
        ↓
[ui-developer] 에러 모달/토스트 표시
```

---

## 코드 리뷰 체크리스트

### ui-developer
- [ ] Tailwind 클래스가 일관되게 정렬되어 있는가?
- [ ] 컴포넌트가 재사용 가능하게 설계되어 있는가?
- [ ] 접근성(a11y)이 고려되어 있는가?
- [ ] 반응형 디자인이 적용되어 있는가?

### api-integrator
- [ ] 모든 API 호출에 에러 처리가 있는가?
- [ ] 타입이 올바르게 정의되어 있는가?
- [ ] 민감한 정보가 클라이언트에 노출되지 않는가?
- [ ] 재시도 로직이 필요한 곳에 구현되어 있는가?

### workflow-orchestrator
- [ ] 상태 전이가 명확한가?
- [ ] 에러 발생 시 즉시 중단되는가?
- [ ] 진행 상황이 실시간으로 업데이트되는가?
- [ ] 스케줄링 로직이 정확한가?

### seo-specialist
- [ ] Focus Keyword가 올바르게 설정되는가?
- [ ] Meta Description이 160자 이내인가?
- [ ] Rank Math 메타 필드가 올바른가?

### storage-manager
- [ ] SSR 환경에서 에러가 발생하지 않는가?
- [ ] 데이터 타입이 일관되는가?
- [ ] 암호화가 필요한 데이터가 보호되고 있는가?

---

*최종 업데이트: 2026-01-19*
