# [문서 1] 기술/기능 설계 문서 — 사주명리 분석 앱 Next.js 14 이관

---

## 1. AS-IS 분석

### 1-1. 핵심 기능 (5개)

| # | 기능 | 설명 | 관련 모듈 |
|---|------|------|----------|
| 1 | **사주 원국 산출** | 생년월일시 입력 → 4주 8자(천간·지지) 계산, 지장간·십신·12운성 배치 | `engine.py` → `calculate_pillars()` |
| 2 | **오행/음양 분석** | 8자의 오행(木火土金水) 분포 및 음양 비율 산출, 지장간 가중치 포함 계산 | `engine.py` → `analyze_five_elements()`, `analyze_yin_yang()` |
| 3 | **신강·신약 판단** | 일간 기준 득령·득지·득세·지장간 가중치로 0~100 점수화 | `engine.py` → `calculate_strength()` |
| 4 | **대운 타임라인** | 양남음녀/음남양녀 기준 순행/역행 대운 간지 9개(90년치) 산출, 현재 대운 식별 | `engine.py` → `calculate_luck_cycles()` |
| 5 | **성격·기질 분석** | 일간+신강신약+십신지배그룹+12운성 조합으로 성격 프로필 및 조언 생성 | `interpretation.py` → `interpret_personality()` |

### 1-2. 사용자 흐름

```
[사이드바] 생년월일 입력
    → 달력 유형 선택 (양력/음력)
    → 출생 시간 입력 (선택)
    → 성별 선택 (선택)
    → 이름 입력 (선택)
    → "사주 분석하기" 버튼 클릭
        → 유효성 검증 → 실패 시 에러 토스트
        → 성공 시 로딩 스피너 → 분석 실행
            → report 세션에 저장
            → 메인 영역에 4개 탭 결과 표시
                ├ 탭1: 분석 요약 (원국표, 카드 4개, 오행 차트, 음양, 성격)
                ├ 탭2: 상세 분석 (십신, 12운성, 합·충, 신강신약)
                ├ 탭3: 대운 타임라인 (카드 렬 + 테이블)
                └ 탭4: 사주 정보 (교육 콘텐츠 5개 서브탭)
            → 시간 미입력 시: 시나리오 비교 expander 표시
            → 하단: 면책 문구
```

### 1-3. 상태 관리 (st.session_state 구조)

| 키 | 타입 | 용도 |
|----|------|------|
| `report` | `FullReport \| None` | 전체 분석 결과 객체 (pillars, element_stats, strength, luck_cycles, personality 등 포함) |
| `analyzed` | `bool` | 분석 완료 여부 → True일 때 결과 탭 렌더링 |
| `year`, `month`, `day` | `int` | 사이드바 입력값 |
| `cal` | `str` | 달력 유형 ("양력" / "음력") |
| `leap` | `bool` | 윤달 여부 |
| `time_known` | `str` | 시간 알고 있는지 ("예" / "모름") |
| `hour` | `int` | 출생 시각 |
| `gender` | `str` | 성별 |
| `name` | `str` | 이름 |

### 1-4. 데이터 흐름

```
[BirthInput 구성] → validate_input(inp)
                        ├ 에러 → 화면에 에러 메시지
                        └ 통과 → generate_full_analysis(inp)
                                    ├ calculate_pillars(inp)         → Pillars
                                    ├ analyze_five_elements(pillars)  → ElementStats × 2
                                    ├ analyze_yin_yang(pillars)       → YinYangStats
                                    ├ calculate_ten_god_stats(pillars)→ TenGodStats
                                    ├ find_stem_interactions(pillars) → Interaction[]
                                    ├ find_branch_interactions(pillars)→ Interaction[]
                                    ├ calculate_strength(pillars)     → StrengthResult
                                    ├ calculate_luck_cycles(inp, pillars)→ LuckCycles|null
                                    ├ interpret_personality(...)      → TopicReport
                                    └ generate_time_scenarios(...)    → ScenarioDict[]
                                 → FullReport 반환 → session_state에 저장
```

### 1-5. 외부 라이브러리 및 대체 전략

| Python 라이브러리 | 용도 | Next.js 대체 |
|-------------------|------|-------------|
| `streamlit` | UI 프레임워크, 세션 상태, 위젯 | Next.js 14 App Router + React 컴포넌트 |
| `pandas` | DataFrame 생성 → `st.dataframe()` 표시 | `@tanstack/react-table` 또는 일반 HTML `<table>` |
| `numpy` | requirements에 명시되어 있으나 실제 코드에서 미사용 | 불필요 |
| `python-dateutil` | 날짜 유틸 (requirements에 명시) | `date-fns` 또는 `dayjs` |
| `pytz` | 타임존 (requirements에 명시) | 브라우저 네이티브 `Intl` API |
| `st.bar_chart` | 오행 분포 막대 그래프 | `recharts` 또는 `chart.js` (`react-chartjs-2`) |

---

## 2. TO-BE 아키텍처

### 2-1. Frontend 구조 (Next.js 14 App Router)

```
app/
├ layout.tsx                     # 전역 레이아웃 (Header + Sidebar + Content)
├ page.tsx                       # 랜딩 페이지 (사용 방법 안내 + 사주 정보)
├ analysis/
│ └ page.tsx                     # 분석 결과 페이지 (탭 4개)
├ info/
│ ├ page.tsx                     # 사주 정보 메인
│ ├ stems-branches/page.tsx      # 천간·지지 설명
│ ├ elements/page.tsx            # 오행 설명
│ ├ ten-gods/page.tsx            # 십신 설명
│ └ twelve-stages/page.tsx       # 12운성 설명
├ globals.css
└ providers.tsx                  # Zustand/React-Query Provider
```

### 2-2. Backend 구조 (FastAPI)

```
backend/
├ main.py                        # FastAPI 앱
├ routers/
│ ├ analysis.py                  # /api/analysis 엔드포인트
│ └ reference.py                 # /api/reference (정적 데이터 조회)
├ sajuengine/                    # 기존 Python 엔진 그대로 이식
│ ├ engine.py
│ ├ interpretation.py
│ ├ models.py
│ └ data.py
├ schemas/
│ ├ request.py                   # Pydantic 요청 스키마
│ └ response.py                  # Pydantic 응답 스키마
└ tests/
```

### 2-3. 역할 분리

| 영역 | Frontend (Next.js) | Backend (FastAPI) |
|------|-------------------|-------------------|
| **입력 처리** | 폼 UI, 클라이언트 측 기본 유효성 검사 (날짜 범위, 필수값) | 서버 측 유효성 검사 (날짜 실존 여부, 미래 날짜 차단) |
| **사주 계산** | - | 모든 천간지지 계산, 오행 분석, 강약 판단, 대운 산출, 성격 해석 |
| **차트/시각화** | 오행 막대 그래프, 대운 카드 렌더링 | - |
| **정적 데이터** | 캐싱하여 사용 (천간/지지/오행 테이블) | 최초 1회 조회 API 제공 |
| **상태 관리** | 입력 상태(Zustand), 서버 응답 캐시(React-Query) | Stateless |

### 2-4. 통신 방식

| 방식 | 용도 |
|------|------|
| **REST (JSON)** | 사주 분석 요청/응답, 참조 데이터 조회 |
| **WebSocket** | 현재 불필요. 향후 실시간 운세 알림 기능 추가 시 검토 |

---

## 3. API 명세

### API-1: 사주 분석

| 항목 | 내용 |
|------|------|
| **Endpoint** | `POST /api/analysis` |
| **Method** | POST |

**Request Body:**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `year` | int | O | 1900~2100 |
| `month` | int | O | 1~12 |
| `day` | int | O | 1~31 |
| `hour` | int \| null | X | 0~23, null이면 시주 없이 분석 |
| `calendarType` | "solar" \| "lunar" | O | 기본값 "solar" |
| `isLeapMonth` | boolean | X | 음력일 때만, 기본값 false |
| `gender` | "male" \| "female" \| null | X | null이면 대운 미산출 |
| `name` | string \| null | X | 표시용 |

**Response (200):**

| 필드 | 타입 | 설명 |
|------|------|------|
| `pillars` | Pillars | 4주 원국 (year, month, day, hour) |
| `elementStats` | ElementStats | 오행 분포 (기본) |
| `elementStatsWithHidden` | ElementStats | 오행 분포 (지장간 가중치 포함) |
| `yinyangStats` | YinYangStats | 음양 비율 |
| `tenGodStats` | TenGodStats | 십신 통계 및 위치 |
| `interactions` | Interaction[] | 천간/지지 합·충·형·파·해 목록 |
| `strength` | StrengthResult | 신강·신약 결과 |
| `luckCycles` | LuckCycles \| null | 대운 타임라인 |
| `personality` | TopicReport | 성격·기질 분석 |
| `timeScenarios` | TimeScenario[] | 시간 모를 때 시나리오 (hour=null일 때만) |
| `disclaimer` | string | 면책 문구 |
| `generatedAt` | string (ISO) | 분석 시각 |

**에러 케이스:**

| 상태코드 | 조건 | 응답 |
|---------|------|------|
| 400 | 유효하지 않은 날짜 (예: 2025-02-30) | `{ "errors": ["2025년 2월 30일은 유효하지 않은 날짜입니다."] }` |
| 400 | 미래 날짜 | `{ "errors": ["미래 날짜는 분석할 수 없습니다."] }` |
| 400 | 범위 초과 (year < 1900) | `{ "errors": ["년도는 1900~2100 사이여야 합니다."] }` |
| 422 | 필수 필드 누락 | Pydantic 자동 에러 |
| 500 | 서버 내부 오류 | `{ "errors": ["분석 중 오류가 발생했습니다."] }` |

---

### API-2: 참조 데이터 조회

| 항목 | 내용 |
|------|------|
| **Endpoint** | `GET /api/reference` |
| **Method** | GET |

**Response (200):**

| 필드 | 타입 | 설명 |
|------|------|------|
| `stems` | StemInfo[] | 천간 10자 정보 |
| `branches` | BranchInfo[] | 지지 12자 정보 |
| `elements` | ElementDetail[] | 오행 5종 상세 |
| `tenGodDescriptions` | Record<string, string> | 십신 10종 설명 |
| `twelveStageDescriptions` | Record<string, string> | 12운성 설명 |
| `disclaimer` | string | 면책 문구 |

**에러 케이스:** 없음 (정적 데이터, 항상 200)

---

### API-3: 입력 유효성 사전 검증 (선택)

| 항목 | 내용 |
|------|------|
| **Endpoint** | `POST /api/validate` |
| **Method** | POST |

**Request:** API-1과 동일  
**Response (200):** `{ "valid": true, "errors": [] }`  
**Response (200, 실패):** `{ "valid": false, "errors": ["..."] }`

---

## 4. 상태 관리 전략

### 4-1. 전역 상태 (Zustand)

| Store | 필드 | 용도 |
|-------|------|------|
| `useInputStore` | `year`, `month`, `day`, `hour`, `calendarType`, `isLeapMonth`, `gender`, `name`, `timeKnown` | 사이드바 입력 폼 값 유지 |
| `useUIStore` | `isSidebarOpen`, `activeTab` | 사이드바 토글, 현재 활성 탭 인덱스 |

### 4-2. 서버 상태 (TanStack React-Query)

| Query Key | 용도 | staleTime |
|-----------|------|-----------|
| `['analysis', inputHash]` | 분석 결과 캐싱. 동일 입력 재요청 방지 | 5분 |
| `['reference']` | 참조 데이터 (천간/지지/오행 테이블) | Infinity (앱 라이프사이클 동안 불변) |

### 4-3. 로컬 상태 (React useState)

| 위치 | 상태 | 용도 |
|------|------|------|
| `AnalysisPage` | `activeSubTab` | 상세 분석 내 서브탭 (십신/12운성/합충/강약) |
| `SajuForm` | `isSubmitting` | 분석 버튼 비활성화 |
| `TimeScenarioPanel` | `isExpanded` | 시나리오 비교 패널 열림 여부 |

---

## 5. 기능 매핑 (Streamlit → Next.js)

| Streamlit 기능 | Next.js 구현 |
|----------------|-------------|
| `st.set_page_config(layout="wide")` | `layout.tsx`에서 CSS Grid/Flex 레이아웃 적용 |
| `st.sidebar` | 커스텀 `<Sidebar>` 컴포넌트 (왼쪽 고정, 모바일에서 Drawer) |
| `st.number_input("년", ...)` | `<input type="number">` + `react-hook-form` 유효성 |
| `st.radio("달력", ...)` | `<RadioGroup>` 커스텀 컴포넌트 또는 Radix UI |
| `st.slider("시각", 0, 23)` | `<input type="range">` 또는 Radix Slider |
| `st.checkbox("윤달")` | `<input type="checkbox">` |
| `st.text_input("이름")` | `<input type="text">` |
| `st.button("분석하기", type="primary")` | `<button>` + `useMutation()` (React-Query) |
| `st.spinner("분석 중...")` | 버튼 내 `<Spinner>` + `isLoading` 상태 |
| `st.success("완료!")`, `st.error("에러")` | `react-hot-toast` 또는 `sonner` 토스트 |
| `st.tabs(["탭1", "탭2", ...])` | Radix UI `<Tabs>` 또는 커스텀 탭 컴포넌트 |
| `st.columns(4)` | CSS Grid `grid-template-columns: repeat(4, 1fr)` |
| `st.metric("신강/신약", value)` | 커스텀 `<MetricCard>` 컴포넌트 |
| `st.bar_chart(data)` | `recharts` → `<BarChart>` 컴포넌트 |
| `st.dataframe(df)` | `@tanstack/react-table` 또는 `<table>` |
| `st.expander("제목")` | `<details>` / `<summary>` 또는 Radix Accordion |
| `st.markdown(html, unsafe_allow_html=True)` | JSX 직접 렌더링 (사주 원국 테이블 등은 React 컴포넌트로 구현) |
| `st.session_state` | Zustand store + React-Query 캐시 |
| `st.caption("...")` | `<p className="text-sm text-muted">` |
| `st.divider()` | `<hr>` 또는 `<Separator>` |
| `st.info("...")`, `st.warning("...")` | 커스텀 `<Alert variant="info \| warning">` 컴포넌트 |

---

## 6. 데이터 타입 정의 (TypeScript)

### 요청/입력

```typescript
interface BirthInput {
  year: number;               // 1900~2100
  month: number;              // 1~12
  day: number;                // 1~31
  hour: number | null;        // 0~23
  calendarType: 'solar' | 'lunar';
  isLeapMonth: boolean;
  gender: 'male' | 'female' | null;
  name: string | null;
}
```

### 핵심 모델

```typescript
type Element = '木' | '火' | '土' | '金' | '水';

interface StemInfo {
  char: string;               // "甲"
  element: Element;           // "木"
  yinyang: '陽' | '陰';
  korean: string;             // "갑"
  desc: string;               // "큰 나무, 시작의 에너지"
}

interface BranchInfo {
  char: string;               // "子"
  element: Element;
  yinyang: '陽' | '陰';
  korean: string;             // "자"
  animal: string;             // "쥐"
  time: string;               // "23:00-01:00"
  month: number;
}

interface HiddenStemInfo {
  stem: string;               // 천간
  weight: number;             // 1.0 | 0.7 | 0.3
  role: '본기' | '중기' | '여기';
}

interface Pillar {
  stem: string;
  branch: string;
  stemElement: Element;
  branchElement: Element;
  stemYinyang: '陽' | '陰';
  branchYinyang: '陽' | '陰';
  hiddenStems: HiddenStemInfo[];
  tenGod: string;             // "비견", "편인" 등
  twelveStage: string;        // "장생", "제왕" 등
  full: string;               // "甲子" (computed)
}

interface Pillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null;
}

interface ElementStats {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  total: number;
  withHiddenStems: boolean;
  percentages: Record<Element, number>;   // computed
  dominant: Element;                       // computed
  weakest: Element;                        // computed
  missing: Element[];                      // computed
}

interface YinYangStats {
  yang: number;
  yin: number;
  ratio: string;              // "5:3"
  dominant: '陽' | '陰' | '균형';
}

interface TenGodPosition {
  pillar: 'year' | 'month' | 'day' | 'hour';
  position: 'stem' | 'branch' | 'hidden';
  char: string;
  tenGod: string;
}

interface TenGodStats {
  positions: TenGodPosition[];
  counts: Record<string, number>;         // 십신별 갯수
  dominantGroup: string;                  // "비겁" | "식상" | "재성" | "관성" | "인성"
  groupCounts: Record<string, number>;    // 5대 그룹별 합계
}

type InteractionType =
  | '천간합' | '천간충'
  | '지지육합' | '지지삼합' | '지지방합'
  | '지지충' | '지지형' | '지지파' | '지지해';

interface Interaction {
  type: InteractionType;
  elements: string[];
  positions: string[];
  result: string;
  name: string;
  description: string;
  severity: 1 | 2 | 3;
  isPositive: boolean;
}

interface StrengthFactor {
  factor: string;
  description: string;
  points: number;
}

interface StrengthResult {
  score: number;              // 0~100
  isStrong: boolean;
  grade: '극신강' | '신강' | '중화' | '신약' | '극신약';
  factors: StrengthFactor[];
}

interface LuckPillar {
  stem: string;
  branch: string;
  element: Element;
  tenGod: string;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  full: string;               // computed
}

interface LuckCycles {
  startAge: number;
  direction: '순행' | '역행';
  pillars: LuckPillar[];
  currentPillar: LuckPillar | null;
}

interface TopicReportDetail {
  subtitle: string;
  content: string;
  evidence: string[];
}

interface TopicReport {
  topic: string;
  score: number;
  grade: string;
  summary: string;
  details: TopicReportDetail[];
  advice: string[];
  warnings: string[];
}

interface TimeScenario {
  label: string;
  hour: number;
  pillar: Pillar | null;
  tenGod: string;
  twelveStage: string;
}

interface FullReport {
  input: BirthInput;
  pillars: Pillars;
  elementStats: ElementStats;
  elementStatsWithHidden: ElementStats;
  yinyangStats: YinYangStats;
  tenGodStats: TenGodStats;
  interactions: Interaction[];
  strength: StrengthResult;
  luckCycles: LuckCycles | null;
  personality: TopicReport;
  timeScenarios: TimeScenario[];
  disclaimer: string;
  generatedAt: string;
  version: string;
}
```

---

## 7. 마이그레이션 단계

### Phase 1: 인프라 구축 (1주)

1. Next.js 14 프로젝트 초기화 (App Router, TypeScript)
2. Tailwind CSS 설정 + 색상 토큰 정의 (갈색 계열 `#8B4513`, 베이지 `#FFF8DC`)
3. FastAPI 프로젝트 초기화 + `/api/analysis`, `/api/reference` 스켈레톤
4. 기존 `sajuengine/` 폴더를 FastAPI 프로젝트 내부로 복사
5. Pydantic 스키마 정의 (BirthInput, FullReport 등)
6. CORS 설정, 에러 핸들러 등록

### Phase 2: Backend API 완성 (3일)

1. `POST /api/analysis` 엔드포인트 구현 — `generate_full_analysis()` 호출 → JSON 직렬화
2. `GET /api/reference` 엔드포인트 구현 — 정적 데이터 반환
3. 기존 `test_engine.py` 기반 API 테스트 작성 (pytest + httpx)
4. camelCase JSON 직렬화 설정 (Python snake_case → JSON camelCase)

### Phase 3: Frontend 공통 레이아웃 (3일)

1. `layout.tsx` — Header + Sidebar + Content 영역 구현
2. Zustand store 2개 설정 (`useInputStore`, `useUIStore`)
3. React-Query Provider + API 클라이언트(`axios` 인스턴스) 설정
4. 공통 컴포넌트 제작: `Alert`, `MetricCard`, `Tabs`, `Spinner`, `Separator`
5. 사이드바 입력 폼 완성 (`react-hook-form` + `zod` 유효성)

### Phase 4: 분석 결과 화면 (1주)

1. 탭1 — 분석 요약: `SajuTable` (원국표 HTML 테이블), `SummaryCards` (4개), `ElementChart` (recharts), `YinYangSection`, `PersonalitySummary`
2. 탭2 — 상세 분석: `TenGodAnalysis`, `TwelveStageTable`, `InteractionList`, `StrengthPanel`
3. 탭3 — 대운 타임라인: `LuckTimelineGrid` (카드 그리드), `LuckDetailTable`
4. 탭4 — 사주 정보: 5개 서브페이지의 정적 콘텐츠 렌더링
5. 시간 미입력 시나리오 패널

### Phase 5: 통합 테스트 및 배포 (3일)

1. E2E 테스트 (Playwright) — 입력 → 분석 → 결과 확인 흐름
2. 반응형 검증 (모바일/태블릿/데스크탑)
3. 성능 최적화: API 응답 캐싱, 컴포넌트 lazy loading
4. Vercel(FE) + Railway/Render(BE) 또는 Docker Compose 배포
