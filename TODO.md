# TODO - 쿠팡 파트너스 자동 블로그 작성 시스템

> 각 작업 완료 시 체크박스를 체크하고 커밋합니다.
> 커밋 메시지는 Conventional Commits 형식을 따릅니다.

---

## Phase 1: 프로젝트 초기 설정

### 1.1 환경 설정
- [x] Next.js 14 프로젝트 초기화 (App Router)
- [x] TypeScript 설정 확인 및 조정
- [x] Tailwind CSS 설정 (커스텀 색상, 폰트)
- [x] ESLint/Prettier 설정
- [x] .env.example 파일 생성
- [x] .gitignore 업데이트

### 1.2 프로젝트 구조 생성
- [x] 폴더 구조 생성 (`/lib`, `/components`, `/types`, `/hooks`, `/constants`)
- [x] 기본 레이아웃 컴포넌트 생성 (`layout.tsx`)
- [x] 전역 스타일 설정 (`globals.css`)

### 1.3 타입 정의
- [x] `types/settings.ts` - API 키 및 설정 타입
- [x] `types/product.ts` - 쿠팡 상품 타입
- [x] `types/post.ts` - 블로그 포스트 타입
- [x] `types/workflow.ts` - 워크플로우 상태 타입
- [x] `types/api.ts` - API 에러 및 응답 타입

---

## Phase 2: UI 컴포넌트 개발 (ui-developer)

### 2.1 기본 UI 컴포넌트
- [x] `components/ui/Button.tsx`
- [x] `components/ui/Input.tsx`
- [x] `components/ui/Textarea.tsx`
- [x] `components/ui/Select.tsx`
- [x] `components/ui/Card.tsx`
- [x] `components/ui/Modal.tsx`
- [x] `components/ui/Toast.tsx`

### 2.2 레이아웃 컴포넌트
- [x] `components/layout/Header.tsx`
- [x] `components/layout/Container.tsx`

### 2.3 폼 컴포넌트
- [x] `components/forms/KeywordForm.tsx` - 키워드 입력 폼
- [x] `components/forms/SettingsForm.tsx` - API 키 설정 폼
- [x] `components/forms/PublishSettings.tsx` - 발행 설정 폼

### 2.4 진행 상황 컴포넌트
- [x] `components/progress/ProgressBar.tsx`
- [x] `components/progress/StepIndicator.tsx`
- [x] `components/progress/StatusMessage.tsx`

### 2.5 페이지 구현
- [x] `app/page.tsx` - 메인 페이지 (컴포넌트 통합 완료)
- [x] `app/settings/page.tsx` - API 키 설정 페이지 (컴포넌트 통합 완료)

---

## Phase 3: 스토리지 관리 (storage-manager)

### 3.1 로컬 스토리지 유틸리티
- [x] `lib/storage/localStorage.ts` - 로컬 스토리지 CRUD
- [ ] `lib/storage/encryption.ts` - 암호화 유틸리티 (선택, 추후 구현)
- [x] `hooks/useLocalStorage.ts` - 로컬 스토리지 훅

### 3.2 설정 관리
- [x] API 키 저장/불러오기 구현
- [x] 발행 설정 저장/불러오기 구현

---

## Phase 4: API 클라이언트 개발 (api-integrator)

### 4.1 쿠팡 파트너스 API
- [x] `lib/api/coupang.ts` - API 클라이언트 구현
- [x] HMAC 서명 생성 로직
- [x] 상품 검색 함수 구현
- [x] 에러 핸들링

### 4.2 Claude API
- [x] `lib/api/claude.ts` - API 클라이언트 구현
- [x] 블로그 글 생성 함수 구현
- [x] 응답 파싱 로직
- [x] 에러 핸들링

### 4.3 Gemini API
- [x] `lib/api/gemini.ts` - API 클라이언트 구현
- [x] 블로그 글 생성 함수 구현
- [x] 응답 파싱 로직
- [x] 에러 핸들링

### 4.4 워드프레스 REST API
- [x] `lib/api/wordpress.ts` - API 클라이언트 구현
- [x] 포스트 생성 함수 구현
- [x] 인증 처리 (Basic Auth)
- [x] 에러 핸들링

### 4.5 API Routes
- [x] `app/api/coupang/route.ts` - 쿠팡 API 프록시
- [x] `app/api/ai/claude/route.ts` - Claude API 프록시
- [x] `app/api/ai/gemini/route.ts` - Gemini API 프록시
- [x] `app/api/wordpress/route.ts` - 워드프레스 API 프록시

---

## Phase 5: SEO 및 워드프레스 연동 (seo-specialist)

### 5.1 Rank Math SEO 설정
- [x] `lib/seo/rankmath.ts` - Rank Math 메타데이터 설정
- [x] Focus Keyword 자동 설정 로직
- [x] Meta Description 자동 설정 로직

### 5.2 워드프레스 포스트 최적화
- [x] HTML 컨텐츠 정리/최적화
- [x] 이미지 URL 처리 (쿠팡 이미지)
- [x] 예약 발행 데이터 포맷팅

---

## Phase 6: 워크플로우 구현 (workflow-orchestrator)

### 6.1 프롬프트 설계
- [x] `constants/prompts.ts` - AI 프롬프트 템플릿
- [x] 프롬프트 빌더 함수 (constants/prompts.ts에 통합)

### 6.2 스케줄러 구현
- [x] `lib/workflow/scheduler.ts` - 발행 예약 스케줄러
- [x] 시간대 계산 로직
- [x] 다음 가능 시간 계산
- [x] 간격 기반 시간 배정

### 6.3 오케스트레이터 구현
- [x] `lib/workflow/orchestrator.ts` - 메인 워크플로우
- [x] 단계별 상태 관리
- [x] 에러 발생 시 중단 로직
- [x] 진행 상황 업데이트 콜백

### 6.4 워크플로우 API
- [x] 클라이언트에서 직접 API Route 호출 (별도 워크플로우 API 불필요)

### 6.5 워크플로우 훅
- [x] `hooks/useWorkflow.ts` - 워크플로우 실행 훅
- [x] `hooks/useProgress.ts` - 진행 상황 관리 훅

---

## Phase 7: 통합 및 테스트

### 7.1 통합 작업
- [ ] 메인 페이지에 모든 컴포넌트 통합
- [ ] 설정 페이지 완성
- [ ] 전체 워크플로우 연결

### 7.2 에러 핸들링
- [ ] API 에러 처리 통합
- [ ] 사용자 친화적 에러 메시지
- [ ] 에러 모달/토스트 연동

### 7.3 테스트
- [ ] 쿠팡 API 연동 테스트
- [ ] Claude API 연동 테스트
- [ ] Gemini API 연동 테스트
- [ ] 워드프레스 업로드 테스트
- [ ] 전체 워크플로우 테스트
- [ ] 발행 예약 시간 계산 검증

---

## Phase 8: 최적화 및 배포

### 8.1 코드 최적화
- [ ] 불필요한 코드 제거
- [ ] 성능 최적화 (필요시)
- [ ] 타입 안정성 최종 점검

### 8.2 배포 준비
- [ ] 환경 변수 설정 문서화
- [ ] Vercel 배포 설정
- [ ] 프로덕션 빌드 테스트

### 8.3 문서화
- [ ] README.md 작성
- [ ] 사용 가이드 작성

---

## 작업 규칙

### 커밋 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
style: UI/스타일 변경
docs: 문서 수정
refactor: 리팩토링
chore: 빌드/설정 등
```

### 작업 순서
1. TODO.md에서 작업할 항목 확인
2. 작업 수행
3. 체크박스 체크 (`- [x]`)
4. 커밋 (TODO.md 업데이트 포함)

### Sub Agent 할당
| Phase | 담당 Agent |
|-------|-----------|
| Phase 1 | 공통 |
| Phase 2 | ui-developer |
| Phase 3 | storage-manager |
| Phase 4 | api-integrator |
| Phase 5 | seo-specialist |
| Phase 6 | workflow-orchestrator |
| Phase 7-8 | 공통 |

---

## 진행 상황 요약

| Phase | 상태 | 진행률 |
|-------|------|--------|
| Phase 1: 초기 설정 | 완료 | 100% |
| Phase 2: UI 컴포넌트 | 완료 | 100% |
| Phase 3: 스토리지 | 완료 | 100% |
| Phase 4: API 클라이언트 | 완료 | 100% |
| Phase 5: SEO/워드프레스 | 완료 | 100% |
| Phase 6: 워크플로우 | 완료 | 100% |
| Phase 7: 통합/테스트 | 대기 | 0% |
| Phase 8: 배포 | 대기 | 0% |

---

*최종 업데이트: 2026-01-19*
