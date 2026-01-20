# 쿠팡 블로그 생성기 개선 작업 체크리스트

## 요구사항 요약

| # | 요구사항 | 상세 | 상태 |
|---|---------|------|------|
| 1 | 상품 개수 변경 | 5개 → 10개 | ✅ 완료 |
| 2 | 프롬프트 통합 | customprompt.md 내용 반영 (2500~3000자, 구조화된 본문) | ✅ 완료 |
| 3 | 상품 선별 로직 | 평점 4.0↑, 리뷰 많은 순, 가격대 다양화 | ✅ 완료 |
| 4 | 이미지 업로드 | 전체 상품 이미지 워드프레스 업로드 + Featured Image | ✅ 완료 |

---

## 구현 상세

### Phase 1: 타입 정의 수정 ✅

**파일: `src/types/post.ts`**
- [x] `WordPressPost`에 `featured_media?: number` 필드 추가
- [x] `WordPressMediaResponse` 인터페이스 추가
- [x] `UploadedImage` 인터페이스 추가

### Phase 2: 상품 선별 로직 ✅

**파일: `src/lib/product/selector.ts`** (신규 생성)
- [x] `selectProducts()` 함수 구현
  - 평점 4.0 이상 필터링 (부족시 3.5로 완화)
  - 리뷰 개수 많은 순 정렬
  - 가격대 다양성 보장 (저가 30%, 중가 40%, 고가 30%)
  - 최종 10개 반환
- [x] `calculatePriceRanges()` 함수 구현
- [x] `getPriceRangeRecommendations()` 함수 구현

**파일: `src/lib/product/index.ts`** (신규 생성)
- [x] 모듈 export 설정

### Phase 3: 프롬프트 통합 ✅

**파일: `src/constants/prompts.ts`**
- [x] `BLOG_POST_SYSTEM_PROMPT`: 10년차 리뷰 블로거 페르소나, 반말 사용
- [x] `BLOG_POST_USER_PROMPT`:
  - 2500~3000자 분량
  - 구조: 도입부(300자) → 구매가이드(200자+테이블) → 상품리뷰(400자x10) → 결론(200자)
  - 가격대별 비교 테이블 포함
  - JSON 출력 형식 유지
- [x] `buildBlogPostPrompt()`: 가격대 정보(priceRanges) 파라미터 추가

### Phase 4: 워드프레스 이미지 업로드 ✅

**파일: `src/lib/api/wordpress.ts`**
- [x] `uploadImageToWordPress()` 함수 추가
- [x] `uploadProductImages()` 함수 추가
- [x] `replaceImageUrls()` 함수 추가
- [x] `createWordPressPost()` featured_media 지원
- [x] `prepareWordPressPost()` featuredMediaId 파라미터 추가

**파일: `src/app/api/wordpress/media/route.ts`** (신규 생성)
- [x] 이미지 업로드 API 엔드포인트

### Phase 5: 워크플로우 수정 ✅

**파일: `src/lib/workflow/orchestrator.ts`**
- [x] 쿠팡 API 호출 시 `limit: 20`으로 요청 (productCount * 2)
- [x] `selectProducts()` 함수로 10개 선별
- [x] `calculatePriceRanges()` 호출하여 가격대 정보 전달
- [x] 워드프레스 발행 전 이미지 업로드 단계 추가
- [x] `featured_media` 포함하여 포스트 생성
- [x] totalSteps: 4 → 5 변경

**워크플로우 단계 변경:**
```
기존: 상품검색 → AI생성 → 일정계산 → WP발행
변경: 상품검색 → 상품선별 → AI생성 → 이미지업로드 → WP발행
```

### Phase 6: UI 수정 ✅

**파일: `src/app/page.tsx`**
- [x] `productCount: 5` → `productCount: 10`

**파일: `src/components/progress/StepIndicator.tsx`**
- [x] 5단계 워크플로우 반영
  - 상품 검색 → 상품 선별 → 글 작성 → 이미지 업로드 → 발행

### Phase 7: AI API 업데이트 ✅

**파일: `src/lib/api/claude.ts`**
- [x] `generateBlogPostWithClaude()` priceRanges 파라미터 추가

**파일: `src/lib/api/gemini.ts`**
- [x] `generateBlogPostWithGemini()` priceRanges 파라미터 추가

**파일: `src/app/api/ai/claude/route.ts`**
- [x] priceRanges 파라미터 처리

**파일: `src/app/api/ai/gemini/route.ts`**
- [x] priceRanges 파라미터 처리

---

## 수정된 파일 목록

| 파일 | 작업 |
|------|------|
| `src/types/post.ts` | 타입 추가 |
| `src/types/index.ts` | 새 타입 export 추가 |
| `src/lib/product/selector.ts` | **신규 생성** |
| `src/lib/product/index.ts` | **신규 생성** |
| `src/constants/prompts.ts` | 프롬프트 전면 수정 |
| `src/lib/api/wordpress.ts` | 이미지 업로드 함수 추가 |
| `src/lib/api/claude.ts` | priceRanges 지원 |
| `src/lib/api/gemini.ts` | priceRanges 지원 |
| `src/app/api/wordpress/route.ts` | import 수정 |
| `src/app/api/wordpress/media/route.ts` | **신규 생성** |
| `src/app/api/ai/claude/route.ts` | priceRanges 처리 |
| `src/app/api/ai/gemini/route.ts` | priceRanges 처리 |
| `src/lib/workflow/orchestrator.ts` | 워크플로우 수정 |
| `src/app/page.tsx` | productCount 변경 |
| `src/components/progress/StepIndicator.tsx` | 5단계 반영 |
| `TODO_MODIFY.md` | **신규 생성** |

---

## 검증 방법

### 1. 상품 선별 테스트
- [ ] 키워드 검색 후 콘솔에서 선별 결과 확인
- [ ] 평점, 리뷰 수, 가격대 분포 확인

### 2. 프롬프트 테스트
- [ ] AI 생성 결과가 2500~3000자인지 확인
- [ ] 도입부/구매가이드/상품리뷰/결론 구조 확인

### 3. 이미지 업로드 테스트
- [ ] 워드프레스 미디어 라이브러리에 이미지 업로드 확인
- [ ] Featured Image 설정 확인

### 4. 전체 워크플로우 테스트
- [ ] 키워드 1개로 전체 플로우 실행
- [ ] 워드프레스 예약 발행 확인

---

## 주의사항

- 이미지 10개 업로드 시 시간이 추가로 소요될 수 있음
- 쿠팡 이미지 URL 접근 권한 문제 발생 가능 (CORS, 핫링크 방지)
- 워드프레스 미디어 업로드 권한 필요 (Application Password 권한 확인)
- 이미지 업로드 실패 시 원본 URL로 자동 fallback

---

## 변경 이력

- 2026-01-20: 초기 구현 완료
