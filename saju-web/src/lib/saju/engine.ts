/* ================================================================
   사주명리 핵심 계산 엔진
   Python engine.py → TypeScript
   ================================================================ */

import type {
  BirthInput, Pillar, Pillars, HiddenStemInfo,
  ElementStats, YinYangStats,
  TenGodPosition, TenGodStats,
  Interaction, StrengthFactor, StrengthResult,
  LuckPillar, LuckCycles, FullReport, TimeScenario,
} from "./types";

import { interpretPersonality } from "./interpretation";

import {
  STEMS, BRANCHES, STEM_INFO, BRANCH_INFO,
  HIDDEN_STEMS, ELEMENT_GENERATES, ELEMENT_GENERATED_BY,
  SOLAR_TERM_BOUNDARIES,
  MONTH_STEM_START, HOUR_STEM_START,
  getHourBranchIndex, getTenGod, getTwelveStage,
  STEM_COMBINATIONS, STEM_CLASHES,
  BRANCH_SIX_COMBINATIONS, BRANCH_THREE_COMBINATIONS, BRANCH_DIRECTIONAL,
  BRANCH_CLASHES, BRANCH_PENALTIES, BRANCH_SELF_PENALTY,
  BRANCH_BREAKS, BRANCH_HARMS,
  STRENGTH_RULES, TEN_GOD_GROUPS, DISCLAIMER,
} from "./data";

/** Safe indexOf wrappers for readonly tuple arrays */
function stemIdx(s: string): number {
  return (STEMS as readonly string[]).indexOf(s);
}
function branchIdx(b: string): number {
  return (BRANCHES as readonly string[]).indexOf(b);
}

/* ═══════ H-05: 데이터 검증 ═══════ */

export function validateInput(inp: BirthInput): string[] {
  const errors: string[] = [];

  if (inp.year < 1900 || inp.year > 2100)
    errors.push("년도는 1900~2100 사이여야 합니다.");
  if (inp.month < 1 || inp.month > 12)
    errors.push("월은 1~12 사이여야 합니다.");
  if (inp.day < 1 || inp.day > 31)
    errors.push("일은 1~31 사이여야 합니다.");

  if (errors.length === 0 && inp.calendarType === "solar") {
    const d = new Date(inp.year, inp.month - 1, inp.day);
    if (d.getFullYear() !== inp.year || d.getMonth() !== inp.month - 1 || d.getDate() !== inp.day) {
      errors.push(`${inp.year}년 ${inp.month}월 ${inp.day}일은 유효하지 않은 날짜입니다.`);
    }
  }

  if (inp.hour !== null && (inp.hour < 0 || inp.hour > 23))
    errors.push("시간은 0~23 사이여야 합니다.");

  if (inp.gender !== null && inp.gender !== "male" && inp.gender !== "female")
    errors.push("성별은 'male' 또는 'female'이어야 합니다.");

  if (inp.calendarType === "solar" && errors.length === 0) {
    const birth = new Date(inp.year, inp.month - 1, inp.day);
    if (birth > new Date()) errors.push("미래 날짜는 분석할 수 없습니다.");
  }

  return errors;
}

/* ═══════ JDN / 달력 ═══════ */

function computeJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function jdnToDayStemBranch(jdn: number): [string, string] {
  const stemIdx = ((jdn + 7) % 10 + 10) % 10;
  const branchIdx = ((jdn + 5) % 12 + 12) % 12;
  return [STEMS[stemIdx], BRANCHES[branchIdx]];
}

function getSolarTermMonth(year: number, month: number, day: number): number {
  const boundaries: [number, number, number][] = SOLAR_TERM_BOUNDARIES.map(
    ([, m, d, idx]) => [m, d, idx]
  );
  const sorted = [...boundaries].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let currentMonthIdx = 11;
  for (const [tMonth, tDay, tIdx] of sorted) {
    if (month > tMonth || (month === tMonth && day >= tDay)) {
      currentMonthIdx = tIdx;
    }
  }
  return currentMonthIdx;
}

function getYearForPillars(year: number, month: number, day: number): number {
  if (month < 2 || (month === 2 && day < 4)) return year - 1;
  return year;
}

/* ═══════ A-01: 사주 원국 산출 ═══════ */

function buildPillar(stem: string, branch: string): Pillar {
  const si = STEM_INFO[stem];
  const bi = BRANCH_INFO[branch];
  const hiddenStems: HiddenStemInfo[] = (HIDDEN_STEMS[branch] || []).map(
    ([hStem, weight]) => ({
      stem: hStem,
      weight,
      role: weight >= 1.0 ? "본기" : weight >= 0.5 ? "중기" : "여기",
    })
  );
  return {
    stem, branch,
    stemElement: si.element,
    branchElement: bi.element,
    stemYinyang: si.yinyang,
    branchYinyang: bi.yinyang,
    hiddenStems,
    tenGod: "",
    twelveStage: "",
  };
}

function calculateYearPillar(year: number, month: number, day: number): Pillar {
  const adjYear = getYearForPillars(year, month, day);
  const stemIdx = ((adjYear - 4) % 10 + 10) % 10;
  const branchIdx = ((adjYear - 4) % 12 + 12) % 12;
  return buildPillar(STEMS[stemIdx], BRANCHES[branchIdx]);
}

function calculateMonthPillar(year: number, month: number, day: number): Pillar {
  const adjYear = getYearForPillars(year, month, day);
  const yearStemIdx = ((adjYear - 4) % 10 + 10) % 10;
  const yearStem = STEMS[yearStemIdx];
  const monthBranchOffset = getSolarTermMonth(year, month, day);
  const branchIdx = (monthBranchOffset + 2) % 12;
  const branch = BRANCHES[branchIdx];
  const startStem = MONTH_STEM_START[yearStem];
  const startStemI = stemIdx(startStem);
  const sIdx = (startStemI + monthBranchOffset) % 10;
  return buildPillar(STEMS[sIdx], branch);
}

function calculateDayPillar(year: number, month: number, day: number): Pillar {
  const jdn = computeJdn(year, month, day);
  const [stem, branch] = jdnToDayStemBranch(jdn);
  return buildPillar(stem, branch);
}

function calculateHourPillar(dayStem: string, hour: number | null): Pillar | null {
  if (hour === null) return null;
  const branchIndex = getHourBranchIndex(hour);
  if (branchIndex === null) return null;
  const branch = BRANCHES[branchIndex];
  const startStem = HOUR_STEM_START[dayStem];
  const startStemI = stemIdx(startStem);
  const sIdx2 = (startStemI + branchIndex) % 10;
  return buildPillar(STEMS[sIdx2], branch);
}

/* helper: all pillars as array */
function allPillars(p: Pillars): Pillar[] {
  const result = [p.year, p.month, p.day];
  if (p.hour) result.push(p.hour);
  return result;
}

/* fill ten gods */
function fillTenGods(pillars: Pillars) {
  const ds = pillars.day.stem;
  for (const [, p] of [["year", pillars.year], ["month", pillars.month], ["hour", pillars.hour]] as const) {
    if (!p) continue;
    (p as Pillar).tenGod = getTenGod(ds, (p as Pillar).stem);
  }
  pillars.day.tenGod = "일간";
}

/* fill twelve stages */
function fillTwelveStages(pillars: Pillars) {
  const ds = pillars.day.stem;
  for (const p of allPillars(pillars)) {
    p.twelveStage = getTwelveStage(ds, p.branch);
  }
}

export function calculatePillars(inp: BirthInput): Pillars {
  const yearP = calculateYearPillar(inp.year, inp.month, inp.day);
  const monthP = calculateMonthPillar(inp.year, inp.month, inp.day);
  const dayP = calculateDayPillar(inp.year, inp.month, inp.day);
  const hourP = calculateHourPillar(dayP.stem, inp.hour);

  const pillars: Pillars = { year: yearP, month: monthP, day: dayP, hour: hourP };
  fillTenGods(pillars);
  fillTwelveStages(pillars);
  return pillars;
}

/* ═══════ A-04: 십신 통계 ═══════ */

export function calculateTenGodStats(pillars: Pillars): TenGodStats {
  const positions: TenGodPosition[] = [];
  const counts: Record<string, number> = {};
  for (const g of ["비견","겁재","식신","상관","편재","정재","편관","정관","편인","정인"]) {
    counts[g] = 0;
  }
  const ds = pillars.day.stem;

  const pillarNames = [
    ["year", pillars.year],
    ["month", pillars.month],
    ["day", pillars.day],
    ["hour", pillars.hour],
  ] as const;

  for (const [pname, p] of pillarNames) {
    if (!p) continue;
    if (pname !== "day") {
      const tg = getTenGod(ds, p.stem);
      positions.push({ pillar: pname, position: "stem", char: p.stem, tenGod: tg });
      counts[tg] = (counts[tg] || 0) + 1;
    }
    if (p.hiddenStems.length > 0) {
      const mainHidden = p.hiddenStems[0].stem;
      const tg = getTenGod(ds, mainHidden);
      positions.push({ pillar: pname, position: "branch", char: p.branch, tenGod: tg });
      counts[tg] = (counts[tg] || 0) + 1;
    }
  }

  const groupCounts: Record<string, number> = {};
  for (const [gname, gods] of Object.entries(TEN_GOD_GROUPS)) {
    groupCounts[gname] = gods.reduce((sum, g) => sum + (counts[g] || 0), 0);
  }
  const dominant = Object.entries(groupCounts).reduce(
    (a, b) => (b[1] > a[1] ? b : a), ["비겁", 0]
  )[0];

  return { positions, counts, dominantGroup: dominant };
}

/* ═══════ A-02: 오행 분포 ═══════ */

export function analyzeFiveElements(pillars: Pillars, includeHidden: boolean): ElementStats {
  const counts: Record<string, number> = { "木": 0, "火": 0, "土": 0, "金": 0, "水": 0 };

  for (const p of allPillars(pillars)) {
    counts[p.stemElement] += 1.0;
    if (includeHidden) {
      for (const hs of p.hiddenStems) {
        const el = STEM_INFO[hs.stem].element;
        counts[el] += hs.weight;
      }
    } else {
      counts[p.branchElement] += 1.0;
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return {
    wood: Math.round(counts["木"] * 10) / 10,
    fire: Math.round(counts["火"] * 10) / 10,
    earth: Math.round(counts["土"] * 10) / 10,
    metal: Math.round(counts["金"] * 10) / 10,
    water: Math.round(counts["水"] * 10) / 10,
    total: Math.round(total * 10) / 10,
    withHiddenStems: includeHidden,
  };
}

/* ═══════ A-03: 음양 균형 ═══════ */

export function analyzeYinYang(pillars: Pillars): YinYangStats {
  let yang = 0, yin = 0;
  for (const p of allPillars(pillars)) {
    if (p.stemYinyang === "陽") yang++; else yin++;
    if (p.branchYinyang === "陽") yang++; else yin++;
  }
  return { yang, yin };
}

/* ═══════ A-08: 천간 합·충 ═══════ */

export function findStemInteractions(pillars: Pillars): Interaction[] {
  const results: Interaction[] = [];
  const stemsWithPos: [string, string][] = [];
  for (const [name, p] of [["년간", pillars.year], ["월간", pillars.month],
    ["일간", pillars.day], ["시간", pillars.hour]] as [string, Pillar | null][]) {
    if (p) stemsWithPos.push([name, p.stem]);
  }

  for (let i = 0; i < stemsWithPos.length; i++) {
    for (let j = i + 1; j < stemsWithPos.length; j++) {
      const [pos1, s1] = stemsWithPos[i];
      const [pos2, s2] = stemsWithPos[j];

      for (const [sa, sb, resultEl, name] of STEM_COMBINATIONS) {
        if ((s1 === sa && s2 === sb) || (s1 === sb && s2 === sa)) {
          results.push({
            type: "천간합", elements: [s1, s2], positions: [pos1, pos2],
            result: resultEl, name,
            description: `${pos1} ${s1}과(와) ${pos2} ${s2}가 합하여 ${resultEl}의 기운을 형성합니다.`,
            severity: 2, isPositive: true,
          });
        }
      }
      for (const [sa, sb, name] of STEM_CLASHES) {
        if ((s1 === sa && s2 === sb) || (s1 === sb && s2 === sa)) {
          results.push({
            type: "천간충", elements: [s1, s2], positions: [pos1, pos2],
            result: "", name,
            description: `${pos1} ${s1}과(와) ${pos2} ${s2}가 충돌하여 긴장과 변화의 에너지가 있습니다.`,
            severity: 2, isPositive: false,
          });
        }
      }
    }
  }
  return results;
}

/* ═══════ A-09: 지지 상호작용 ═══════ */

export function findBranchInteractions(pillars: Pillars): Interaction[] {
  const results: Interaction[] = [];
  const branchesWithPos: [string, string][] = [];
  for (const [name, p] of [["년지", pillars.year], ["월지", pillars.month],
    ["일지", pillars.day], ["시지", pillars.hour]] as [string, Pillar | null][]) {
    if (p) branchesWithPos.push([name, p.branch]);
  }

  // 6합
  for (let i = 0; i < branchesWithPos.length; i++) {
    for (let j = i + 1; j < branchesWithPos.length; j++) {
      const [pos1, b1] = branchesWithPos[i];
      const [pos2, b2] = branchesWithPos[j];
      for (const [ba, bb, resultEl, name] of BRANCH_SIX_COMBINATIONS) {
        if ((b1 === ba && b2 === bb) || (b1 === bb && b2 === ba)) {
          results.push({
            type: "지지육합", elements: [b1, b2], positions: [pos1, pos2],
            result: resultEl, name,
            description: `${pos1} ${b1}과(와) ${pos2} ${b2}가 합하여 ${resultEl}의 조화를 이룹니다.`,
            severity: 2, isPositive: true,
          });
        }
      }
    }
  }

  // 6충
  for (let i = 0; i < branchesWithPos.length; i++) {
    for (let j = i + 1; j < branchesWithPos.length; j++) {
      const [pos1, b1] = branchesWithPos[i];
      const [pos2, b2] = branchesWithPos[j];
      for (const [ba, bb, name] of BRANCH_CLASHES) {
        if ((b1 === ba && b2 === bb) || (b1 === bb && b2 === ba)) {
          results.push({
            type: "지지충", elements: [b1, b2], positions: [pos1, pos2],
            result: "", name,
            description: `${pos1} ${b1}과(와) ${pos2} ${b2}가 충하여 갈등·변화의 에너지가 강합니다.`,
            severity: 3, isPositive: false,
          });
        }
      }
    }
  }

  // 3합
  for (const [comboBranches, resultEl, name] of BRANCH_THREE_COMBINATIONS) {
    const matching = branchesWithPos.filter(([, b]) => comboBranches.includes(b));
    if (matching.length >= 2) {
      const isFull = matching.length >= 3;
      results.push({
        type: "지지삼합",
        elements: matching.map(([, b]) => b),
        positions: matching.map(([p]) => p),
        result: resultEl,
        name: name + (isFull ? " (완전)" : " (반합)"),
        description: `${matching.map(([, b]) => b).join("·")}이(가) ${resultEl}국을 이루어 ${isFull ? "강력한" : "부분적"} ${resultEl}의 에너지를 형성합니다.`,
        severity: isFull ? 3 : 1, isPositive: true,
      });
    }
  }

  // 방합
  for (const [comboBranches, resultEl, name] of BRANCH_DIRECTIONAL) {
    const matching = branchesWithPos.filter(([, b]) => comboBranches.includes(b));
    if (matching.length >= 3) {
      results.push({
        type: "지지방합",
        elements: matching.map(([, b]) => b),
        positions: matching.map(([p]) => p),
        result: resultEl, name,
        description: `${matching.map(([, b]) => b).join("·")}이(가) 방합을 이루어 매우 강한 ${resultEl} 에너지를 형성합니다.`,
        severity: 3, isPositive: true,
      });
    }
  }

  // 3형
  for (const [penaltyBranches, desc] of BRANCH_PENALTIES) {
    const matching = branchesWithPos.filter(([, b]) => penaltyBranches.includes(b));
    if (matching.length >= 2) {
      results.push({
        type: "지지형",
        elements: matching.map(([, b]) => b),
        positions: matching.map(([p]) => p),
        result: "", name: desc,
        description: `${matching.map(([, b]) => b).join("·")}의 형살 — ${desc}`,
        severity: 2, isPositive: false,
      });
    }
  }

  // 자형
  for (let i = 0; i < branchesWithPos.length; i++) {
    for (let j = i + 1; j < branchesWithPos.length; j++) {
      const [pos1, b1] = branchesWithPos[i];
      const [pos2, b2] = branchesWithPos[j];
      if (b1 === b2 && (BRANCH_SELF_PENALTY as readonly string[]).includes(b1)) {
        results.push({
          type: "지지형", elements: [b1, b2], positions: [pos1, pos2],
          result: "", name: `${b1}${b2} 자형(自刑)`,
          description: `${pos1}과(와) ${pos2}의 ${b1}이(가) 자형을 이루어 자기 내면의 갈등이 있습니다.`,
          severity: 1, isPositive: false,
        });
      }
    }
  }

  // 6파
  for (let i = 0; i < branchesWithPos.length; i++) {
    for (let j = i + 1; j < branchesWithPos.length; j++) {
      const [pos1, b1] = branchesWithPos[i];
      const [pos2, b2] = branchesWithPos[j];
      for (const [ba, bb] of BRANCH_BREAKS) {
        if ((b1 === ba && b2 === bb) || (b1 === bb && b2 === ba)) {
          results.push({
            type: "지지파", elements: [b1, b2], positions: [pos1, pos2],
            result: "", name: `${b1}${b2}파`,
            description: `${pos1} ${b1}과(와) ${pos2} ${b2}의 파(破) — 파괴와 재구성의 에너지.`,
            severity: 1, isPositive: false,
          });
        }
      }
    }
  }

  // 6해
  for (let i = 0; i < branchesWithPos.length; i++) {
    for (let j = i + 1; j < branchesWithPos.length; j++) {
      const [pos1, b1] = branchesWithPos[i];
      const [pos2, b2] = branchesWithPos[j];
      for (const [ba, bb, name] of BRANCH_HARMS) {
        if ((b1 === ba && b2 === bb) || (b1 === bb && b2 === ba)) {
          results.push({
            type: "지지해", elements: [b1, b2], positions: [pos1, pos2],
            result: "", name,
            description: `${pos1} ${b1}과(와) ${pos2} ${b2}의 해(害) — 은근한 방해와 갈등의 요소.`,
            severity: 1, isPositive: false,
          });
        }
      }
    }
  }

  return results;
}

/* ═══════ B-01: 신강·신약 ═══════ */

export function calculateStrength(pillars: Pillars): StrengthResult {
  const ds = pillars.day.stem;
  const dsElement = STEM_INFO[ds].element;
  const factors: StrengthFactor[] = [];
  let totalScore = 0;

  // ① 득령
  const monthHiddenMain = pillars.month.hiddenStems[0]?.stem ?? null;
  const monthHiddenEl = monthHiddenMain ? STEM_INFO[monthHiddenMain].element : null;
  const checkEl = monthHiddenEl ?? pillars.month.branchElement;

  if (checkEl === dsElement) {
    const pts = STRENGTH_RULES.deukryeong.same;
    factors.push({ factor: "득령", description: `월지 ${pillars.month.branch}의 본기가 일간과 같은 ${dsElement}`, points: pts });
    totalScore += pts;
  } else if (ELEMENT_GENERATED_BY[dsElement] === checkEl) {
    const pts = STRENGTH_RULES.deukryeong.generate;
    factors.push({ factor: "득령", description: `월지 본기가 일간을 생하는 ${checkEl}→${dsElement}`, points: pts });
    totalScore += pts;
  } else {
    factors.push({ factor: "득령", description: `월지 본기(${checkEl})가 일간(${dsElement})을 돕지 않음`, points: 0 });
  }

  // ② 득지
  for (const [pname, p] of [["일지", pillars.day], ["시지", pillars.hour]] as [string, Pillar | null][]) {
    if (!p) continue;
    const bhMain = p.hiddenStems[0]?.stem ?? null;
    const bhEl = bhMain ? STEM_INFO[bhMain].element : p.branchElement;
    if (bhEl === dsElement) {
      const pts = STRENGTH_RULES.deukji.same;
      factors.push({ factor: "득지", description: `${pname} ${p.branch} 본기가 일간과 같은 오행`, points: pts });
      totalScore += pts;
    } else if (ELEMENT_GENERATED_BY[dsElement] === bhEl) {
      const pts = STRENGTH_RULES.deukji.generate;
      factors.push({ factor: "득지", description: `${pname} ${p.branch} 본기가 일간을 생함`, points: pts });
      totalScore += pts;
    }
  }

  // ③ 득세
  for (const [pname, p] of [["년간", pillars.year], ["월간", pillars.month], ["시간", pillars.hour]] as [string, Pillar | null][]) {
    if (!p) continue;
    const pEl = STEM_INFO[p.stem].element;
    if (pEl === dsElement) {
      const pts = STRENGTH_RULES.deukse.same;
      factors.push({ factor: "득세", description: `${pname} ${p.stem}이(가) 일간과 같은 ${dsElement}`, points: pts });
      totalScore += pts;
    } else if (ELEMENT_GENERATED_BY[dsElement] === pEl) {
      const pts = STRENGTH_RULES.deukse.generate;
      factors.push({ factor: "득세", description: `${pname} ${p.stem}이(가) 일간을 생하는 ${pEl}`, points: pts });
      totalScore += pts;
    }
  }

  // ④ 지장간 보너스
  for (const p of allPillars(pillars)) {
    for (const hs of p.hiddenStems.slice(1)) {
      if (STEM_INFO[hs.stem].element === dsElement) {
        const pts = hs.role === "중기" ? STRENGTH_RULES.hiddenMiddle : STRENGTH_RULES.hiddenResidual;
        factors.push({ factor: "지장간", description: `${p.branch} ${hs.role} ${hs.stem}이(가) 일간과 같은 오행`, points: pts });
        totalScore += pts;
      }
    }
  }

  const score = Math.min(Math.max(totalScore, 0), 100);
  let grade: string;
  if (score >= 70) grade = "극신강";
  else if (score >= 50) grade = "신강";
  else if (score >= 40) grade = "중화";
  else if (score >= 20) grade = "신약";
  else grade = "극신약";

  return { score, isStrong: score >= 50, grade, factors };
}

/* ═══════ C-01: 대운 산출 ═══════ */

export function calculateLuckCycles(
  inp: BirthInput, pillars: Pillars, numCycles = 9
): LuckCycles | null {
  if (!inp.gender) return null;

  const isYangStem = pillars.year.stemYinyang === "陽";
  const isMale = inp.gender === "male";
  const isForward = (isYangStem && isMale) || (!isYangStem && !isMale);
  const direction = isForward ? "순행" : "역행";

  const birthDate = new Date(inp.year, inp.month - 1, inp.day);
  const startAge = calcLuckStartAge(birthDate, isForward);

  const monthStemI = stemIdx(pillars.month.stem);
  const monthBranchI = branchIdx(pillars.month.branch);

  const luckPillars: LuckPillar[] = [];
  for (let i = 0; i < numCycles; i++) {
    const offset = isForward ? (i + 1) : -(i + 1);
    const sI = ((monthStemI + offset) % 10 + 10) % 10;
    const bI = ((monthBranchI + offset) % 12 + 12) % 12;
    const stem = STEMS[sI];
    const branch = BRANCHES[bI];
    const element = STEM_INFO[stem].element;
    const tg = getTenGod(pillars.day.stem, stem);
    const sAge = startAge + i * 10;
    const eAge = sAge + 9;
    luckPillars.push({
      stem, branch, element, tenGod: tg,
      startAge: sAge, endAge: eAge,
      startYear: inp.year + sAge, endYear: inp.year + eAge,
    });
  }

  const currentAge = new Date().getFullYear() - inp.year;
  let currentPillar: LuckPillar | null = null;
  for (const lp of luckPillars) {
    if (lp.startAge <= currentAge && currentAge <= lp.endAge) {
      currentPillar = lp;
      break;
    }
  }

  return { startAge, direction, pillars: luckPillars, currentPillar };
}

function calcLuckStartAge(birthDate: Date, isForward: boolean): number {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  const termDates: Date[] = [];
  for (const y of [year - 1, year, year + 1]) {
    for (const [, m, d] of SOLAR_TERM_BOUNDARIES) {
      try { termDates.push(new Date(y, m - 1, d)); } catch { /* skip */ }
    }
  }
  termDates.sort((a, b) => a.getTime() - b.getTime());

  let daysDiff: number;
  if (isForward) {
    const next = termDates.find(t => t > birthDate);
    daysDiff = next ? Math.floor((next.getTime() - birthDate.getTime()) / 86400000) : 15;
  } else {
    const prevs = termDates.filter(t => t <= birthDate);
    const prev = prevs.length > 0 ? prevs[prevs.length - 1] : null;
    daysDiff = prev ? Math.floor((birthDate.getTime() - prev.getTime()) / 86400000) : 15;
  }

  return Math.max(1, Math.round(daysDiff / 3));
}

/* ═══════ H-01: 시간 모름 시나리오 ═══════ */

export function generateTimeScenarios(inp: BirthInput, pillars: Pillars): TimeScenario[] {
  const testHours = [5, 12, 20];
  const labels = ["寅시(새벽 5시)", "午시(정오 12시)", "戌시(저녁 20시)"];

  return testHours.map((hour, i) => {
    const hourP = calculateHourPillar(pillars.day.stem, hour);
    return {
      label: labels[i],
      hour,
      pillar: hourP,
      tenGod: hourP ? getTenGod(pillars.day.stem, hourP.stem) : "",
      twelveStage: hourP ? getTwelveStage(pillars.day.stem, hourP.branch) : "",
    };
  });
}

/* ═══════ 전체 분석 실행 ═══════ */

export function generateFullAnalysis(inp: BirthInput): FullReport {
  const pillars = calculatePillars(inp);
  const elementStats = analyzeFiveElements(pillars, false);
  const elementStatsWithHidden = analyzeFiveElements(pillars, true);
  const yinyangStats = analyzeYinYang(pillars);
  const tenGodStats = calculateTenGodStats(pillars);
  const stemInteractions = findStemInteractions(pillars);
  const branchInteractions = findBranchInteractions(pillars);
  const interactions = [...stemInteractions, ...branchInteractions];
  const strength = calculateStrength(pillars);
  const luckCycles = calculateLuckCycles(inp, pillars);

  // interpretation
  const personality = interpretPersonality(pillars, strength, tenGodStats);

  const scenarios = inp.hour === null ? generateTimeScenarios(inp, pillars) : [];

  return {
    input: inp,
    pillars,
    elementStats,
    elementStatsWithHidden,
    yinyangStats,
    tenGodStats,
    interactions,
    strength,
    luckCycles,
    personality,
    timeScenarios: scenarios,
    disclaimer: DISCLAIMER,
    generatedAt: new Date().toISOString(),
    version: "2.0.0",
  };
}
