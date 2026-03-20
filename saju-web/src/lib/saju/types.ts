/* ================================================================
   사주명리 TypeScript 타입 정의
   Python models.py → TypeScript interfaces
   ================================================================ */

/** 사용자 입력 데이터 */
export interface BirthInput {
  year: number;
  month: number;
  day: number;
  hour: number | null;         // 0–23, null = 시간 모름
  minute: number | null;
  calendarType: "solar" | "lunar";
  isLeapMonth: boolean;
  gender: "male" | "female" | null;
  name: string | null;
}

/** 지장간 정보 */
export interface HiddenStemInfo {
  stem: string;
  weight: number;       // 본기 1.0, 중기 0.7, 여기 0.3
  role: "본기" | "중기" | "여기";
}

/** 하나의 기둥 */
export interface Pillar {
  stem: string;
  branch: string;
  stemElement: string;
  branchElement: string;
  stemYinyang: string;
  branchYinyang: string;
  hiddenStems: HiddenStemInfo[];
  tenGod: string;
  twelveStage: string;
}

/** 사주 원국 (4주 8자) */
export interface Pillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null;
}

/** 오행 분포 통계 */
export interface ElementStats {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  total: number;
  withHiddenStems: boolean;
}

/** 음양 통계 */
export interface YinYangStats {
  yang: number;
  yin: number;
}

/** 십신 위치 정보 */
export interface TenGodPosition {
  pillar: string;       // "year" | "month" | "day" | "hour"
  position: string;     // "stem" | "branch" | "hidden"
  char: string;
  tenGod: string;
}

/** 십신 통계 */
export interface TenGodStats {
  positions: TenGodPosition[];
  counts: Record<string, number>;
  dominantGroup: string;
}

/** 상호작용 */
export interface Interaction {
  type: string;
  elements: string[];
  positions: string[];
  result: string;
  name: string;
  description: string;
  severity: number;      // 1=약, 2=중, 3=강
  isPositive: boolean;
}

/** 신강신약 점수 요인 */
export interface StrengthFactor {
  factor: string;
  description: string;
  points: number;
}

/** 신강·신약 판단 결과 */
export interface StrengthResult {
  score: number;
  isStrong: boolean;
  grade: string;         // 극신강 | 신강 | 중화 | 신약 | 극신약
  factors: StrengthFactor[];
}

/** 대운 기둥 */
export interface LuckPillar {
  stem: string;
  branch: string;
  element: string;
  tenGod: string;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
}

/** 대운 전체 */
export interface LuckCycles {
  startAge: number;
  direction: string;     // "순행" | "역행"
  pillars: LuckPillar[];
  currentPillar: LuckPillar | null;
}

/** 주제별 분석 리포트 */
export interface TopicReport {
  topic: string;
  score: number;
  grade: string;
  summary: string;
  details: {
    subtitle: string;
    content: string;
    evidence: string[];
  }[];
  advice: string[];
  warnings: string[];
}

/** 전체 분석 리포트 */
export interface FullReport {
  input: BirthInput;
  pillars: Pillars;
  elementStats: ElementStats;
  elementStatsWithHidden: ElementStats;
  yinyangStats: YinYangStats;
  tenGodStats: TenGodStats;
  interactions: Interaction[];
  strength: StrengthResult;
  luckCycles: LuckCycles | null;
  personality: TopicReport | null;
  timeScenarios: TimeScenario[];
  disclaimer: string;
  generatedAt: string;
  version: string;
}

/** 시간 모름 시나리오 */
export interface TimeScenario {
  label: string;
  hour: number;
  pillar: Pillar | null;
  tenGod: string;
  twelveStage: string;
}

/* ── Helper types ── */

export type Element = "木" | "火" | "土" | "金" | "水";
export type Yinyang = "陽" | "陰";

export interface StemInfo {
  element: Element;
  yinyang: Yinyang;
  korean: string;
  desc: string;
}

export interface BranchInfo {
  element: Element;
  yinyang: Yinyang;
  korean: string;
  animal: string;
  time: string;
  month: number;
}

/* ── Luck interpretation ── */

export interface LuckTimelineItem {
  pillar: string;
  element: string;
  tenGod: string;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  relation: string;
  isCurrent: boolean;
}

export interface LuckInterpretation {
  available: boolean;
  message?: string;
  direction?: string;
  startAge?: number;
  timeline?: LuckTimelineItem[];
  currentText?: string;
}
