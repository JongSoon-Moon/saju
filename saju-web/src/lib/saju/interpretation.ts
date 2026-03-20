/* ================================================================
   사주 분석 결과 해석 모듈
   Python interpretation.py → TypeScript
   ================================================================ */

import type {
  Pillars, StrengthResult, TenGodStats, TopicReport,
  ElementStats, YinYangStats, Interaction, LuckCycles,
  LuckTimelineItem, LuckInterpretation,
} from "./types";

import {
  STEM_INFO, ELEMENT_DETAILS, ELEMENT_KOREAN,
  PERSONALITY_TEMPLATES, TEN_GOD_GROUP_PERSONALITY,
  TWELVE_STAGE_DESC, ELEMENT_GENERATES, ELEMENT_CONTROLS,
  ELEMENT_GENERATED_BY, ELEMENT_CONTROLLED_BY,
} from "./data";

/* ═══════ D-01: 성격·기질 분석 ═══════ */

export function interpretPersonality(
  pillars: Pillars,
  strength: StrengthResult,
  tenGodStats: TenGodStats,
): TopicReport {
  const ds = pillars.day.stem;
  const dsInfo = STEM_INFO[ds];
  const template = PERSONALITY_TEMPLATES[ds] ?? { base: "", strong: "", weak: "" };

  const baseText = template.base;
  const conditionText = strength.isStrong ? template.strong : template.weak;

  const dominantGroup = tenGodStats.dominantGroup;
  const groupText = TEN_GOD_GROUP_PERSONALITY[dominantGroup] ?? "";

  const summary = `${ds}(${dsInfo.korean}) 일간, ${dsInfo.desc}의 기질을 가지고 있습니다.`;

  const details: TopicReport["details"] = [
    {
      subtitle: "기본 기질",
      content: baseText,
      evidence: [`일간 ${ds}(${dsInfo.element}, ${dsInfo.yinyang})`],
    },
    {
      subtitle: `${strength.isStrong ? "신강" : "신약"} 특성 (${strength.grade}, ${strength.score}점)`,
      content: conditionText,
      evidence: strength.factors.filter(f => f.points > 0).map(f => f.description),
    },
    {
      subtitle: `${dominantGroup} 중심 성격`,
      content: groupText,
      evidence: [`가장 많은 십신 그룹: ${dominantGroup}`],
    },
  ];

  const dayStage = pillars.day.twelveStage;
  const stageDesc = TWELVE_STAGE_DESC[dayStage] ?? "";
  if (dayStage) {
    details.push({
      subtitle: `일지 12운성: ${dayStage}`,
      content: stageDesc,
      evidence: [`일간 ${ds}이(가) 일지 ${pillars.day.branch}에서 ${dayStage}`],
    });
  }

  const advice = generatePersonalityAdvice(ds, strength, dominantGroup);

  return {
    topic: "성격",
    score: 75,
    grade: "A",
    summary,
    details,
    advice,
    warnings: [],
  };
}

function generatePersonalityAdvice(dayStem: string, strength: StrengthResult, dominantGroup: string): string[] {
  const advice: string[] = [];
  const el = STEM_INFO[dayStem].element;

  if (strength.isStrong) {
    advice.push("신강한 사주는 리더십과 추진력이 강하지만, 타인의 의견을 경청하는 연습이 필요합니다.");
    const generated = ELEMENT_GENERATES[el];
    advice.push(`에너지를 발산하는 ${ELEMENT_KOREAN[generated]}(식상) 활동 — 표현, 창작, 운동이 좋습니다.`);
  } else {
    advice.push("신약한 사주는 유연하고 적응력이 좋지만, 자신감을 키우는 것이 중요합니다.");
    const generator = ELEMENT_GENERATED_BY[el];
    advice.push(`에너지를 보충하는 ${ELEMENT_KOREAN[generator]}(인성) 활동 — 학습, 독서, 멘토 관계가 좋습니다.`);
  }

  const groupAdvice: Record<string, string> = {
    "비겁": "혼자만의 시간과 함께하는 시간의 균형을 유지하세요.",
    "식상": "창의적 에너지를 생산적으로 활용하세요.",
    "재성": "현실적 목표 설정이 중요합니다.",
    "관성": "적절한 규율과 자유 사이의 균형을 찾으세요.",
    "인성": "배움을 실천으로 연결하세요.",
  };
  if (groupAdvice[dominantGroup]) advice.push(groupAdvice[dominantGroup]);

  return advice;
}

/* ═══════ G-01: 점수화 엔진 ═══════ */

export function calculateElementBalanceScore(elStats: ElementStats): number {
  const total = elStats.total || 1;
  const pcts = {
    "木": (elStats.wood / total) * 100,
    "火": (elStats.fire / total) * 100,
    "土": (elStats.earth / total) * 100,
    "金": (elStats.metal / total) * 100,
    "水": (elStats.water / total) * 100,
  };
  const ideal = 20;
  const totalDeviation = Object.values(pcts).reduce((sum, v) => sum + Math.abs(v - ideal), 0);
  return Math.max(0, 100 - Math.round(totalDeviation * 1.25));
}

export function calculateYinyangBalanceScore(yyStats: YinYangStats): number {
  const total = yyStats.yang + yyStats.yin;
  if (total === 0) return 50;
  const diff = Math.abs(yyStats.yang - yyStats.yin);
  return Math.max(0, 100 - diff * 15);
}

export function calculateInteractionScore(interactions: Interaction[]): {
  harmonyScore: number; positiveCount: number; negativeCount: number;
} {
  const positive = interactions.filter(i => i.isPositive).length;
  const negative = interactions.filter(i => !i.isPositive).length;
  const harmony = Math.min(100, 50 + positive * 10 - negative * 15);
  return { harmonyScore: Math.max(0, harmony), positiveCount: positive, negativeCount: negative };
}

/* ═══════ G-02: 템플릿 엔진 ═══════ */

export function generateElementInterpretation(elStats: ElementStats): {
  interpretation: string; advice: string[]; balanceScore: number;
} {
  const total = elStats.total || 1;
  const pcts: Record<string, number> = {
    "木": Math.round((elStats.wood / total) * 1000) / 10,
    "火": Math.round((elStats.fire / total) * 1000) / 10,
    "土": Math.round((elStats.earth / total) * 1000) / 10,
    "金": Math.round((elStats.metal / total) * 1000) / 10,
    "水": Math.round((elStats.water / total) * 1000) / 10,
  };
  const vals: Record<string, number> = {
    "木": elStats.wood, "火": elStats.fire, "土": elStats.earth, "金": elStats.metal, "水": elStats.water,
  };

  const dominant = Object.entries(vals).reduce((a, b) => b[1] > a[1] ? b : a)[0];
  const weakest = Object.entries(vals).reduce((a, b) => b[1] < a[1] ? b : a)[0];
  const missing = Object.entries(vals).filter(([, v]) => v === 0).map(([k]) => k);

  const lines: string[] = [];
  if (dominant) {
    const domDetails = ELEMENT_DETAILS[dominant];
    lines.push(`${ELEMENT_KOREAN[dominant]}이(가) 가장 강합니다 (${pcts[dominant]}%)`);
    if (domDetails) lines.push(`→ ${domDetails.nature}의 에너지가 강하게 작용합니다.`);
  }
  if (weakest && pcts[weakest] < 15) {
    const weakDetails = ELEMENT_DETAILS[weakest];
    lines.push(`${ELEMENT_KOREAN[weakest]}이(가) 부족합니다 (${pcts[weakest]}%)`);
    if (weakDetails) lines.push(`→ ${weakDetails.organ}에 주의하고, ${weakDetails.nature}을(를) 키우면 좋습니다.`);
  }
  if (missing.length > 0) {
    const missingNames = missing.map(m => ELEMENT_KOREAN[m]).join(", ");
    lines.push(`⚠️ ${missingNames}이(가) 완전히 부재합니다.`);
  }

  const overEl = Object.entries(pcts).filter(([, p]) => p > 30).map(([e]) => e);
  const underEl = Object.entries(pcts).filter(([, p]) => p < 10).map(([e]) => e);
  const advice: string[] = [];
  for (const oe of overEl) {
    const controlled = ELEMENT_CONTROLS[oe];
    advice.push(`${ELEMENT_KOREAN[oe]} 과다 → ${ELEMENT_KOREAN[controlled]}이(가) 억눌릴 수 있습니다.`);
  }
  for (const ue of underEl) {
    const generator = ELEMENT_GENERATED_BY[ue];
    advice.push(`${ELEMENT_KOREAN[ue]} 부족 → ${ELEMENT_KOREAN[generator]}의 도움이 필요합니다.`);
  }

  return { interpretation: lines.join("\n"), advice, balanceScore: calculateElementBalanceScore(elStats) };
}

export function generateYinyangInterpretation(yyStats: YinYangStats): {
  interpretation: string; advice: string; balanceScore: number;
} {
  const dom = yyStats.yang > yyStats.yin ? "陽" : yyStats.yin > yyStats.yang ? "陰" : "균형";
  let text: string, advice: string;

  if (dom === "균형") {
    text = "음양이 균형을 이루고 있습니다. 외향성과 내향성이 조화로운 이상적인 상태입니다.";
    advice = "현재의 균형을 유지하세요.";
  } else if (dom === "陽") {
    const diff = yyStats.yang - yyStats.yin;
    text = diff >= 4
      ? "양(陽)의 기운이 매우 강합니다. 적극적·외향적·활동적 성향이 두드러집니다."
      : "양(陽)의 기운이 약간 우세합니다. 진취적이고 적극적인 면이 있습니다.";
    advice = "차분한 활동(명상, 독서)으로 음의 에너지를 보충하면 좋습니다.";
  } else {
    const diff = yyStats.yin - yyStats.yang;
    text = diff >= 4
      ? "음(陰)의 기운이 매우 강합니다. 내면적·섬세·신중한 성향이 두드러집니다."
      : "음(陰)의 기운이 약간 우세합니다. 사려 깊고 신중한 면이 있습니다.";
    advice = "활동적인 취미(운동, 여행)로 양의 에너지를 키우면 좋습니다.";
  }

  return { interpretation: text, advice, balanceScore: calculateYinyangBalanceScore(yyStats) };
}

export function generateStrengthInterpretation(strength: StrengthResult): {
  interpretation: string; advice: string[]; evidence: string[];
} {
  const interpretations: Record<string, string> = {
    "극신강": "일간의 에너지가 매우 강합니다. 독립심과 자존감이 높지만, 에너지를 발산하는 방향이 중요합니다.",
    "신강":   "일간이 힘을 잘 갖추고 있습니다. 주도적이며 자기 주장이 뚜렷합니다.",
    "중화":   "일간의 힘이 적절하게 균형 잡혀 있습니다. 유연하게 상황에 적응할 수 있습니다.",
    "신약":   "일간의 에너지가 다소 약합니다. 유연하고 적응력이 좋지만, 자신감 강화가 필요합니다.",
    "극신약": "일간의 에너지가 매우 약합니다. 타인과의 협력, 환경의 도움이 중요합니다.",
  };
  const advices: Record<string, string[]> = {
    "극신강": ["에너지 과잉을 해소하기 위해 식상 활동을 추천합니다.", "타인과의 협업에서 의견을 조율하는 연습이 중요합니다."],
    "신강":   ["자기 주장이 강하므로 경청의 미덕을 키우세요.", "재성/관성 방향의 활동이 좋습니다."],
    "중화":   ["다양한 분야에 고르게 관심을 가져도 좋습니다.", "유연하게 움직이는 것이 장점입니다."],
    "신약":   ["인성(학습·멘토) 관계가 큰 힘이 됩니다.", "비겁(동료·팀워크)를 통해 에너지를 보충하세요."],
    "극신약": ["자신의 강점을 인식하고 키우는 것이 최우선입니다.", "안정적인 환경과 지지 체계를 구축하세요."],
  };

  return {
    interpretation: interpretations[strength.grade] ?? "",
    advice: advices[strength.grade] ?? [],
    evidence: strength.factors.map(f => `${f.factor}: ${f.description} (${f.points >= 0 ? "+" : ""}${f.points}점)`),
  };
}

export function generateInteractionInterpretation(interactions: Interaction[]): {
  icon: string; type: string; name: string; description: string; positions: string;
}[] {
  return interactions.map(intr => ({
    icon: intr.isPositive ? "✅" : "⚠️",
    type: intr.type,
    name: intr.name,
    description: intr.description,
    positions: intr.positions.join(" ↔ "),
  }));
}

export function generateLuckInterpretation(
  luck: LuckCycles | null, dayStem: string
): LuckInterpretation {
  if (!luck) return { available: false, message: "성별 정보가 없어 대운을 산출할 수 없습니다." };

  const dsEl = STEM_INFO[dayStem].element;
  const timeline: LuckTimelineItem[] = luck.pillars.map(lp => {
    let relation = "";
    if (lp.element === dsEl)
      relation = "비겁운 — 경쟁·독립·자기주도의 시기";
    else if (ELEMENT_GENERATES[dsEl] === lp.element)
      relation = "식상운 — 창의·표현·자녀·활동의 시기";
    else if (ELEMENT_CONTROLS[dsEl] === lp.element)
      relation = "재성운 — 재물·실행·현실적 성취의 시기";
    else if (ELEMENT_CONTROLLED_BY[dsEl] === lp.element)
      relation = "관성운 — 직업·사회적 역할·명예의 시기";
    else if (ELEMENT_GENERATED_BY[dsEl] === lp.element)
      relation = "인성운 — 학습·사고·준비·내면 성장의 시기";

    const isCurrent = luck.currentPillar !== null &&
      lp.startAge === luck.currentPillar.startAge;

    return {
      pillar: `${lp.stem}${lp.branch}`,
      element: lp.element,
      tenGod: lp.tenGod,
      startAge: lp.startAge,
      endAge: lp.endAge,
      startYear: lp.startYear,
      endYear: lp.endYear,
      relation,
      isCurrent,
    };
  });

  let currentText = "";
  if (luck.currentPillar) {
    const cp = luck.currentPillar;
    currentText = `현재 ${cp.stem}${cp.branch} 대운 (${cp.startAge}~${cp.endAge}세, ${cp.startYear}~${cp.endYear}년)`;
  }

  return { available: true, direction: luck.direction, startAge: luck.startAge, timeline, currentText };
}

/* ═══════ helper: element percentages ═══════ */

export function getElementPercentages(elStats: ElementStats): Record<string, number> {
  const total = elStats.total || 1;
  return {
    "木": Math.round((elStats.wood / total) * 1000) / 10,
    "火": Math.round((elStats.fire / total) * 1000) / 10,
    "土": Math.round((elStats.earth / total) * 1000) / 10,
    "金": Math.round((elStats.metal / total) * 1000) / 10,
    "水": Math.round((elStats.water / total) * 1000) / 10,
  };
}

export function getDominantElement(elStats: ElementStats): string {
  const vals: Record<string, number> = {
    "木": elStats.wood, "火": elStats.fire, "土": elStats.earth, "金": elStats.metal, "水": elStats.water,
  };
  return Object.entries(vals).reduce((a, b) => b[1] > a[1] ? b : a)[0];
}

export function getWeakestElement(elStats: ElementStats): string {
  const vals: Record<string, number> = {
    "木": elStats.wood, "火": elStats.fire, "土": elStats.earth, "金": elStats.metal, "水": elStats.water,
  };
  return Object.entries(vals).reduce((a, b) => b[1] < a[1] ? b : a)[0];
}
