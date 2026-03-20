/* ================================================================
   사주명리 참조 데이터 테이블
   Python data.py → TypeScript
   ================================================================ */

import type { StemInfo, BranchInfo, Element } from "./types";

// ═══ 천간 (天干, Heavenly Stems) ═══

export const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"] as const;

export const STEM_INFO: Record<string, StemInfo> = {
  "甲": { element: "木", yinyang: "陽", korean: "갑", desc: "큰 나무, 시작의 에너지" },
  "乙": { element: "木", yinyang: "陰", korean: "을", desc: "풀·덩굴, 유연한 생명력" },
  "丙": { element: "火", yinyang: "陽", korean: "병", desc: "태양, 밝고 강한 불" },
  "丁": { element: "火", yinyang: "陰", korean: "정", desc: "촛불·등불, 따뜻한 빛" },
  "戊": { element: "土", yinyang: "陽", korean: "무", desc: "큰 산·대지, 장대한 흙" },
  "己": { element: "土", yinyang: "陰", korean: "기", desc: "논밭·정원, 기름진 흙" },
  "庚": { element: "金", yinyang: "陽", korean: "경", desc: "바위·도끼, 단단한 쇠" },
  "辛": { element: "金", yinyang: "陰", korean: "신", desc: "보석·칼날, 예리한 쇠" },
  "壬": { element: "水", yinyang: "陽", korean: "임", desc: "큰 바다·강, 넓은 물" },
  "癸": { element: "水", yinyang: "陰", korean: "계", desc: "비·이슬, 부드러운 물" },
};

// ═══ 지지 (地支, Earthly Branches) ═══

export const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"] as const;

export const BRANCH_INFO: Record<string, BranchInfo> = {
  "子": { element: "水", yinyang: "陽", korean: "자", animal: "쥐", time: "23:00-01:00", month: 11 },
  "丑": { element: "土", yinyang: "陰", korean: "축", animal: "소", time: "01:00-03:00", month: 12 },
  "寅": { element: "木", yinyang: "陽", korean: "인", animal: "호랑이", time: "03:00-05:00", month: 1 },
  "卯": { element: "木", yinyang: "陰", korean: "묘", animal: "토끼", time: "05:00-07:00", month: 2 },
  "辰": { element: "土", yinyang: "陽", korean: "진", animal: "용", time: "07:00-09:00", month: 3 },
  "巳": { element: "火", yinyang: "陰", korean: "사", animal: "뱀", time: "09:00-11:00", month: 4 },
  "午": { element: "火", yinyang: "陽", korean: "오", animal: "말", time: "11:00-13:00", month: 5 },
  "未": { element: "土", yinyang: "陰", korean: "미", animal: "양", time: "13:00-15:00", month: 6 },
  "申": { element: "金", yinyang: "陽", korean: "신", animal: "원숭이", time: "15:00-17:00", month: 7 },
  "酉": { element: "金", yinyang: "陰", korean: "유", animal: "닭", time: "17:00-19:00", month: 8 },
  "戌": { element: "土", yinyang: "陽", korean: "술", animal: "개", time: "19:00-21:00", month: 9 },
  "亥": { element: "水", yinyang: "陰", korean: "해", animal: "돼지", time: "21:00-23:00", month: 10 },
};

// ═══ 지장간 (藏干, Hidden Stems) ═══
//  (본기 1.0, 중기 0.7, 여기 0.3)

export const HIDDEN_STEMS: Record<string, [string, number][]> = {
  "子": [["癸", 1.0]],
  "丑": [["己", 1.0], ["癸", 0.7], ["辛", 0.3]],
  "寅": [["甲", 1.0], ["丙", 0.7], ["戊", 0.3]],
  "卯": [["乙", 1.0]],
  "辰": [["戊", 1.0], ["乙", 0.7], ["癸", 0.3]],
  "巳": [["丙", 1.0], ["庚", 0.7], ["戊", 0.3]],
  "午": [["丁", 1.0], ["己", 0.3]],
  "未": [["己", 1.0], ["丁", 0.7], ["乙", 0.3]],
  "申": [["庚", 1.0], ["壬", 0.7], ["戊", 0.3]],
  "酉": [["辛", 1.0]],
  "戌": [["戊", 1.0], ["辛", 0.7], ["丁", 0.3]],
  "亥": [["壬", 1.0], ["甲", 0.3]],
};

// ═══ 오행 (五行) ═══

export const ELEMENTS: Element[] = ["木", "火", "土", "金", "水"];

export const ELEMENT_KOREAN: Record<string, string> = {
  "木": "목(木)", "火": "화(火)", "土": "토(土)", "金": "금(金)", "水": "수(水)",
};

export const ELEMENT_ENGLISH: Record<string, string> = {
  "木": "Wood", "火": "Fire", "土": "Earth", "金": "Metal", "水": "Water",
};

export const ELEMENT_COLORS: Record<string, string> = {
  "木": "#2E8B57", "火": "#DC143C", "土": "#DAA520", "金": "#C0C0C0", "水": "#1E90FF",
};

export const ELEMENT_DETAILS: Record<string, {
  color: string; direction: string; season: string;
  taste: string; organ: string; number: string; nature: string;
}> = {
  "木": { color: "초록색", direction: "동쪽", season: "봄", taste: "신맛", organ: "간·담", number: "3, 8", nature: "성장·발전·인자" },
  "火": { color: "빨간색", direction: "남쪽", season: "여름", taste: "쓴맛", organ: "심장·소장", number: "2, 7", nature: "열정·예의·밝음" },
  "土": { color: "노란색", direction: "중앙", season: "환절기", taste: "단맛", organ: "비장·위장", number: "5, 10", nature: "안정·신뢰·포용" },
  "金": { color: "하얀색", direction: "서쪽", season: "가을", taste: "매운맛", organ: "폐·대장", number: "4, 9", nature: "결단·의리·수렴" },
  "水": { color: "검은색", direction: "북쪽", season: "겨울", taste: "짠맛", organ: "신장·방광", number: "1, 6", nature: "지혜·유연·흐름" },
};

// 상생
export const ELEMENT_GENERATES: Record<string, string> = {
  "木": "火", "火": "土", "土": "金", "金": "水", "水": "木",
};
// 상극
export const ELEMENT_CONTROLS: Record<string, string> = {
  "木": "土", "火": "金", "土": "水", "金": "木", "水": "火",
};
// 역방향
export const ELEMENT_GENERATED_BY: Record<string, string> = Object.fromEntries(
  Object.entries(ELEMENT_GENERATES).map(([k, v]) => [v, k])
);
export const ELEMENT_CONTROLLED_BY: Record<string, string> = Object.fromEntries(
  Object.entries(ELEMENT_CONTROLS).map(([k, v]) => [v, k])
);

// ═══ 십신 (十神) ═══

export const TEN_GODS = [
  "비견","겁재","식신","상관","편재","정재","편관","정관","편인","정인",
] as const;

export const TEN_GOD_GROUPS: Record<string, string[]> = {
  "비겁": ["비견", "겁재"],
  "식상": ["식신", "상관"],
  "재성": ["편재", "정재"],
  "관성": ["편관", "정관"],
  "인성": ["편인", "정인"],
};

export const TEN_GOD_GROUP_DESC: Record<string, string> = {
  "비겁": "자아·독립·경쟁",
  "식상": "표현·창의·재능",
  "재성": "재물·실리·관계",
  "관성": "명예·권력·질서",
  "인성": "학문·지혜·보호",
};

export const TEN_GOD_DESC: Record<string, string> = {
  "비견": "나와 같은 오행·같은 음양. 동료·형제·독립심·자존감",
  "겁재": "나와 같은 오행·다른 음양. 경쟁·도전·모험·대인관계",
  "식신": "내가 생하는 오행·같은 음양. 창의력·표현·식복·여유",
  "상관": "내가 생하는 오행·다른 음양. 재능·반항·도전·예술",
  "편재": "내가 극하는 오행·같은 음양. 돈벌기·투자·아버지·큰재물",
  "정재": "내가 극하는 오행·다른 음양. 안정수입·근면·아내(남자)·저축",
  "편관": "나를 극하는 오행·같은 음양. 권력·압박·질서·군인·경찰",
  "정관": "나를 극하는 오행·다른 음양. 명예·직장·남편(여자)·체계",
  "편인": "나를 생하는 오행·같은 음양. 학문·사고·편모·비주류지식",
  "정인": "나를 생하는 오행·다른 음양. 학습·어머니·교육·정통지식",
};

/** 일간 기준 십신 계산 */
export function getTenGod(dayStem: string, targetStem: string): string {
  const dayEl = STEM_INFO[dayStem].element;
  const dayYy = STEM_INFO[dayStem].yinyang;
  const tgtEl = STEM_INFO[targetStem].element;
  const tgtYy = STEM_INFO[targetStem].yinyang;
  const sameYy = dayYy === tgtYy;

  if (dayEl === tgtEl) return sameYy ? "비견" : "겁재";
  if (ELEMENT_GENERATES[dayEl] === tgtEl) return sameYy ? "식신" : "상관";
  if (ELEMENT_CONTROLS[dayEl] === tgtEl) return sameYy ? "편재" : "정재";
  if (ELEMENT_CONTROLLED_BY[dayEl] === tgtEl) return sameYy ? "편관" : "정관";
  if (ELEMENT_GENERATED_BY[dayEl] === tgtEl) return sameYy ? "편인" : "정인";
  return "비견";
}

// ═══ 12운성 ═══

export const TWELVE_STAGES = [
  "장생","목욕","관대","건록","제왕","쇠","병","사","묘","절","태","양",
] as const;

export const TWELVE_STAGE_DESC: Record<string, string> = {
  "장생": "생명이 시작되는 단계. 새로운 출발, 성장 가능성",
  "목욕": "세상에 씻겨 나오는 단계. 불안정하지만 순수함",
  "관대": "성인이 되어 관을 쓰는 단계. 사회적 인정, 활동 시작",
  "건록": "직업을 얻어 녹을 받는 단계. 안정, 성실, 자립",
  "제왕": "가장 왕성한 단계. 정점, 최대 에너지, 리더십",
  "쇠":   "에너지가 서서히 줄어드는 단계. 성숙, 경험, 안정",
  "병":   "쇠약해지기 시작하는 단계. 내면의 지혜, 성찰",
  "사":   "에너지가 극도로 약해진 단계. 전환점, 변화의 씨앗",
  "묘":   "묻히는 단계. 잠재력 저장, 내면 수련",
  "절":   "끊어지는 단계. 절체절명, 하지만 새로운 기회",
  "태":   "새 생명이 잉태되는 단계. 희망, 가능성의 시작",
  "양":   "생명이 자라는 단계. 준비, 숨은 성장",
};

const YANG_STEM_STAGE_START: Record<string, string> = {
  "甲": "亥", "丙": "寅", "戊": "寅", "庚": "巳", "壬": "申",
};
const YIN_STEM_STAGE_START: Record<string, string> = {
  "乙": "午", "丁": "酉", "己": "酉", "辛": "子", "癸": "卯",
};

export function getTwelveStage(dayStem: string, branch: string): string {
  const yy = STEM_INFO[dayStem].yinyang;
  const startBranch = yy === "陽"
    ? YANG_STEM_STAGE_START[dayStem]
    : YIN_STEM_STAGE_START[dayStem];
  const startIdx = BRANCHES.indexOf(startBranch as typeof BRANCHES[number]);
  const targetIdx = BRANCHES.indexOf(branch as typeof BRANCHES[number]);
  const offset = yy === "陽"
    ? ((targetIdx - startIdx) % 12 + 12) % 12
    : ((startIdx - targetIdx) % 12 + 12) % 12;
  return TWELVE_STAGES[offset];
}

// ═══ 천간 합·충 ═══

export const STEM_COMBINATIONS: [string, string, string, string][] = [
  ["甲","己","土","甲己合土"],
  ["乙","庚","金","乙庚合金"],
  ["丙","辛","水","丙辛合水"],
  ["丁","壬","木","丁壬合木"],
  ["戊","癸","火","戊癸合火"],
];

export const STEM_CLASHES: [string, string, string][] = [
  ["甲","庚","甲庚충"],
  ["乙","辛","乙辛충"],
  ["丙","壬","丙壬충"],
  ["丁","癸","丁癸충"],
];

// ═══ 지지 상호작용 ═══

export const BRANCH_SIX_COMBINATIONS: [string, string, string, string][] = [
  ["子","丑","土","子丑合土"],
  ["寅","亥","木","寅亥合木"],
  ["卯","戌","火","卯戌合火"],
  ["辰","酉","金","辰酉合金"],
  ["巳","申","水","巳申合水"],
  ["午","未","土","午未合土"],
];

export const BRANCH_THREE_COMBINATIONS: [string[], string, string][] = [
  [["申","子","辰"],"水","申子辰 수국(水局)"],
  [["亥","卯","未"],"木","亥卯未 목국(木局)"],
  [["寅","午","戌"],"火","寅午戌 화국(火局)"],
  [["巳","酉","丑"],"金","巳酉丑 금국(金局)"],
];

export const BRANCH_DIRECTIONAL: [string[], string, string][] = [
  [["寅","卯","辰"],"木","인묘진 동방목국"],
  [["巳","午","未"],"火","사오미 남방화국"],
  [["申","酉","戌"],"金","신유술 서방금국"],
  [["亥","子","丑"],"水","해자축 북방수국"],
];

export const BRANCH_CLASHES: [string, string, string][] = [
  ["子","午","子午충"],
  ["丑","未","丑未충"],
  ["寅","申","寅申충"],
  ["卯","酉","卯酉충"],
  ["辰","戌","辰戌충"],
  ["巳","亥","巳亥충"],
];

export const BRANCH_PENALTIES: [string[], string][] = [
  [["寅","巳","申"], "무은지형(無恩之刑) — 은혜를 모르는 형벌"],
  [["丑","戌","未"], "지세지형(恃勢之刑) — 세력을 믿는 형벌"],
  [["子","卯"],      "무례지형(無禮之刑) — 예의 없는 형벌"],
];

export const BRANCH_SELF_PENALTY = ["辰","午","酉","亥"] as const;

export const BRANCH_BREAKS: [string, string][] = [
  ["子","酉"],["丑","辰"],["寅","亥"],
  ["卯","午"],["巳","申"],["未","戌"],
];

export const BRANCH_HARMS: [string, string, string][] = [
  ["子","未","子未해"],
  ["丑","午","丑午해"],
  ["寅","巳","寅巳해"],
  ["卯","辰","卯辰해"],
  ["申","亥","申亥해"],
  ["酉","戌","酉戌해"],
];

// ═══ 오호둔천간 ═══

export const MONTH_STEM_START: Record<string, string> = {
  "甲":"丙","己":"丙","乙":"戊","庚":"戊",
  "丙":"庚","辛":"庚","丁":"壬","壬":"壬",
  "戊":"甲","癸":"甲",
};

// ═══ 오자둔천간 ═══

export const HOUR_STEM_START: Record<string, string> = {
  "甲":"甲","己":"甲","乙":"丙","庚":"丙",
  "丙":"戊","辛":"戊","丁":"庚","壬":"庚",
  "戊":"壬","癸":"壬",
};

// ═══ 시간 → 지지 ═══

export function getHourBranch(hour: number | null): string | null {
  if (hour === null) return null;
  if (hour >= 23 || hour < 1) return "子";
  if (hour < 3) return "丑";
  if (hour < 5) return "寅";
  if (hour < 7) return "卯";
  if (hour < 9) return "辰";
  if (hour < 11) return "巳";
  if (hour < 13) return "午";
  if (hour < 15) return "未";
  if (hour < 17) return "申";
  if (hour < 19) return "酉";
  if (hour < 21) return "戌";
  return "亥";
}

export function getHourBranchIndex(hour: number | null): number | null {
  if (hour === null) return null;
  if (hour >= 23 || hour < 1) return 0;
  return Math.floor((hour + 1) / 2) % 12;
}

// ═══ 절기 ═══

export const SOLAR_TERM_BOUNDARIES: [string, number, number, number][] = [
  ["입춘", 2, 4, 0],
  ["경칩", 3, 6, 1],
  ["청명", 4, 5, 2],
  ["입하", 5, 6, 3],
  ["망종", 6, 6, 4],
  ["소서", 7, 7, 5],
  ["입추", 8, 8, 6],
  ["백로", 9, 8, 7],
  ["한로", 10, 8, 8],
  ["입동", 11, 7, 9],
  ["대설", 12, 7, 10],
  ["소한", 1, 6, 11],
];

// ═══ 신강·신약 점수 규칙 ═══

export const STRENGTH_RULES = {
  deukryeong: { same: 30, generate: 25, neutral: 0 },
  deukji: { same: 15, generate: 12, neutral: 0 },
  deukse: { same: 10, generate: 8, neutral: 0 },
  hiddenMain: 5,
  hiddenMiddle: 3,
  hiddenResidual: 1,
};

// ═══ 성격 해석 템플릿 ═══

export const PERSONALITY_TEMPLATES: Record<string, { base: string; strong: string; weak: string }> = {
  "甲": {
    base: "큰 나무처럼 곧고 정직하며, 리더십이 강합니다. 시작하는 힘이 뛰어나고 의지가 굳습니다.",
    strong: "자존심이 강하고 독립적입니다. 주관이 뚜렷하여 때로 고집스러워 보일 수 있습니다.",
    weak: "외유내강의 성향으로, 겉으로는 유연하지만 속으로는 꿋꿋합니다. 주변의 도움이 힘이 됩니다.",
  },
  "乙": {
    base: "덩굴처럼 유연하고 적응력이 뛰어납니다. 부드러운 카리스마와 섬세한 감성을 가졌습니다.",
    strong: "사교적이고 설득력이 뛰어납니다. 유연하게 환경에 적응하면서도 자기 길을 찾아갑니다.",
    weak: "의존적일 수 있지만, 뿌리가 깊어 끈기 있게 목표를 향해 나아갑니다.",
  },
  "丙": {
    base: "태양처럼 밝고 열정적입니다. 긍정적 에너지로 주변을 환하게 밝히는 사람입니다.",
    strong: "자신감 넘치고 표현력이 뛰어납니다. 주목받는 것을 즐기며 열정적으로 삶을 살아갑니다.",
    weak: "내면에 따뜻함을 품고 있지만, 충분히 빛을 발하지 못할 때가 있습니다. 자신감 회복이 중요합니다.",
  },
  "丁": {
    base: "촛불처럼 따뜻하고 섬세합니다. 깊은 사고력과 통찰력을 가진 지성적인 사람입니다.",
    strong: "분석력이 뛰어나고 전략적입니다. 조용하지만 강한 영향력을 발휘합니다.",
    weak: "감성적이고 직관적입니다. 내면의 불꽃을 키우기 위해 안정적인 환경이 필요합니다.",
  },
  "戊": {
    base: "큰 산처럼 듬직하고 신뢰감을 줍니다. 포용력과 안정감이 뛰어난 사람입니다.",
    strong: "중후하고 때로 완고합니다. 한번 마음먹으면 흔들리지 않는 강한 의지력을 가졌습니다.",
    weak: "유순하고 배려심이 깊습니다. 자신의 위치에서 묵묵히 역할을 다하는 성실함이 있습니다.",
  },
  "己": {
    base: "논밭처럼 기름진 마음을 가졌습니다. 섬세하고 실용적이며 타인을 잘 돌봅니다.",
    strong: "현실감각이 뛰어나고 꼼꼼합니다. 실리를 추구하면서도 주변을 잘 챙깁니다.",
    weak: "겸손하고 순수합니다. 타인의 인정을 받을 때 더 큰 힘을 발휘합니다.",
  },
  "庚": {
    base: "바위·도끼처럼 강하고 결단력이 있습니다. 의리와 정의감이 강한 사람입니다.",
    strong: "대범하고 추진력이 뛰어납니다. 목표를 향해 직진하며, 리더십이 강합니다.",
    weak: "속은 단단하지만 겉은 유연합니다. 시련을 통해 더욱 강해지는 잠재력이 있습니다.",
  },
  "辛": {
    base: "보석처럼 빛나는 감성과 예리한 판단력을 가졌습니다. 완벽주의 성향이 있습니다.",
    strong: "심미안이 뛰어나고 날카로운 분석력을 가졌습니다. 자존심이 강하고 품위를 중시합니다.",
    weak: "예민하고 섬세합니다. 내면의 아름다움을 발견하고 갈고닦을 때 빛을 발합니다.",
  },
  "壬": {
    base: "바다·강처럼 넓고 자유로운 사고를 가졌습니다. 지혜롭고 포용력이 큽니다.",
    strong: "진취적이고 도전을 즐깁니다. 넓은 시야로 큰 그림을 그리는 능력이 있습니다.",
    weak: "감성적이고 직관적입니다. 흐름에 따르는 유연함이 있지만, 방향을 잡는 것이 중요합니다.",
  },
  "癸": {
    base: "비·이슬처럼 부드럽고 깊은 사고력을 가졌습니다. 학문과 지식에 대한 열정이 있습니다.",
    strong: "총명하고 연구심이 강합니다. 조용히 실력을 쌓아 결정적 순간에 빛을 발합니다.",
    weak: "내성적이고 조용하지만, 깊은 지혜를 품고 있습니다. 자신감을 키우는 것이 핵심입니다.",
  },
};

export const TEN_GOD_GROUP_PERSONALITY: Record<string, string> = {
  "비겁": "독립심과 자존감이 강하며, 자기 주장이 뚜렷합니다. 경쟁 상황에서 힘을 발휘합니다.",
  "식상": "창의력과 표현력이 뛰어납니다. 예술적 감각이 있으며, 자유로운 사고를 합니다.",
  "재성": "현실 감각이 뛰어나고 재물 관리 능력이 있습니다. 실용적이고 활동적입니다.",
  "관성": "책임감이 강하고 사회적 규범을 중시합니다. 조직 내에서 인정받으며 성장합니다.",
  "인성": "학습 능력이 뛰어나고 사고가 깊습니다. 지식에 대한 열정이 있으며 신중합니다.",
};

// ═══ 면책 문구 ═══

export const DISCLAIMER = `⚠️ 이용 안내 및 면책 사항

본 분석은 전통 동양 명리학(사주팔자) 이론을 기반으로 한 참고 자료이며, 과학적으로 검증된 예측이 아닙니다.

1. 과학적 한계: 사주명리학은 전통 철학 체계로, 현대 과학의 검증 기준을 충족하지 않습니다.
2. 의사결정 책임: 분석 결과를 근거로 한 모든 의사결정의 책임은 사용자 본인에게 있습니다.
3. 건강: 건강 관련 내용은 의학적 진단·처방·치료를 대체할 수 없습니다.
4. 재물·투자: 재물 분석은 투자 조언이 아닙니다.
5. 심리적 의존 주의: 당신의 선택과 노력이 운명을 만들어갑니다.
6. 데이터: 입력된 생년월일 정보는 분석 목적으로만 사용되며 서버에 영구 저장되지 않습니다.

© 2026 사주분석 앱 v2.0 | 모든 해석은 전통 명리학 이론 기반이며, 개인의 자유의지와 노력이 가장 중요합니다.`;
