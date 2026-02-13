"""
사주 분석 결과 해석 모듈.

구현 모듈:
- D-01: 성격·기질 분석
- G-01: 점수화 엔진
- G-02: 템플릿 엔진
"""

from .data import (
    STEM_INFO, BRANCH_INFO, ELEMENT_DETAILS, ELEMENT_KOREAN,
    PERSONALITY_TEMPLATES, TEN_GOD_GROUP_PERSONALITY, TEN_GOD_DESC,
    TWELVE_STAGE_DESC, ELEMENT_GENERATES, ELEMENT_CONTROLS,
    ELEMENT_GENERATED_BY, ELEMENT_CONTROLLED_BY,
)
from .models import (
    Pillars, StrengthResult, TenGodStats, TopicReport,
    ElementStats, YinYangStats, Interaction, LuckCycles,
)


# ===================== D-01: 성격·기질 분석 =====================

def interpret_personality(
    pillars: Pillars,
    strength: StrengthResult,
    ten_god_stats: TenGodStats,
) -> TopicReport:
    """일간 + 신강/신약 + 십신 조합으로 성격 프로필 생성."""

    ds = pillars.day_stem
    ds_info = STEM_INFO[ds]
    template = PERSONALITY_TEMPLATES.get(ds, {})

    # 기본 성격
    base_text = template.get('base', '')

    # 신강/신약에 따른 변형
    if strength.is_strong:
        condition_text = template.get('strong', '')
    else:
        condition_text = template.get('weak', '')

    # 지배 십신 그룹 성격 보정
    dominant_group = ten_god_stats.dominant_group
    group_text = TEN_GOD_GROUP_PERSONALITY.get(dominant_group, '')

    # 종합 성격 문장 생성
    summary = f"{ds}({ds_info['korean']}) 일간, {ds_info['desc']}의 기질을 가지고 있습니다."

    details = [
        {
            'subtitle': '기본 기질',
            'content': base_text,
            'evidence': [f"일간 {ds}({ds_info['element']}, {ds_info['yinyang']})"]
        },
        {
            'subtitle': f"{'신강' if strength.is_strong else '신약'} 특성 ({strength.grade}, {strength.score}점)",
            'content': condition_text,
            'evidence': [f.description for f in strength.factors if f.points > 0]
        },
        {
            'subtitle': f'{dominant_group} 중심 성격',
            'content': group_text,
            'evidence': [f"가장 많은 십신 그룹: {dominant_group}"]
        },
    ]

    # 12운성 기반 추가
    day_stage = pillars.day.twelve_stage
    stage_desc = TWELVE_STAGE_DESC.get(day_stage, '')
    if day_stage:
        details.append({
            'subtitle': f'일지 12운성: {day_stage}',
            'content': stage_desc,
            'evidence': [f"일간 {ds}이(가) 일지 {pillars.day.branch}에서 {day_stage}"]
        })

    # 점수 산출 (성격 분석 자체는 점수보다 해석 중심)
    score = 75  # 성격은 좋고 나쁨이 아니라 특성

    advice = _generate_personality_advice(ds, strength, dominant_group)

    return TopicReport(
        topic='성격',
        score=score,
        grade='A',
        summary=summary,
        details=details,
        advice=advice,
    )


def _generate_personality_advice(day_stem: str, strength: StrengthResult, dominant_group: str) -> list:
    """성격 기반 조언 생성."""
    advice = []
    el = STEM_INFO[day_stem]['element']

    if strength.is_strong:
        advice.append("신강한 사주는 리더십과 추진력이 강하지만, 타인의 의견을 경청하는 연습이 필요합니다.")
        generated = ELEMENT_GENERATES[el]
        advice.append(f"에너지를 발산하는 {ELEMENT_KOREAN[generated]}(식상) 활동 — 표현, 창작, 운동이 좋습니다.")
    else:
        advice.append("신약한 사주는 유연하고 적응력이 좋지만, 자신감을 키우는 것이 중요합니다.")
        generator = ELEMENT_GENERATED_BY[el]
        advice.append(f"에너지를 보충하는 {ELEMENT_KOREAN[generator]}(인성) 활동 — 학습, 독서, 멘토 관계가 좋습니다.")

    group_advice = {
        '비겁': '혼자만의 시간과 함께하는 시간의 균형을 유지하세요. 경쟁보다 협력에서 더 큰 성취를 얻을 수 있습니다.',
        '식상': '창의적 에너지를 생산적으로 활용하세요. 글쓰기, 예술, 요리 등 표현 활동이 삶의 만족도를 높입니다.',
        '재성': '현실적 목표 설정이 중요합니다. 재물에 대한 균형 잡힌 시각을 유지하세요.',
        '관성': '적절한 규율과 자유 사이의 균형을 찾으세요. 과도한 책임감은 스트레스의 원인이 됩니다.',
        '인성': '배움을 실천으로 연결하세요. 지식의 축적도 중요하지만, 행동이 변화를 만듭니다.',
    }
    if dominant_group in group_advice:
        advice.append(group_advice[dominant_group])

    return advice


# ===================== G-01: 점수화 엔진 =====================

def calculate_element_balance_score(el_stats: ElementStats) -> int:
    """오행 균형도 점수 (0~100). 고르게 분포할수록 높은 점수."""
    pcts = el_stats.percentages
    if not pcts:
        return 50

    ideal = 20.0  # 이상적 비율: 각 20%
    total_deviation = sum(abs(v - ideal) for v in pcts.values())
    # 최대 편차 = 4 * 20 = 80 (하나만 100%일 때)
    score = max(0, 100 - int(total_deviation * 1.25))
    return score


def calculate_yinyang_balance_score(yy_stats: YinYangStats) -> int:
    """음양 균형도 점수 (0~100)."""
    total = yy_stats.yang + yy_stats.yin
    if total == 0:
        return 50
    diff = abs(yy_stats.yang - yy_stats.yin)
    score = max(0, 100 - diff * 15)
    return score


def calculate_interaction_score(interactions: list) -> dict:
    """상호작용 기반 점수 (합=긍정, 충=부정)."""
    positive = sum(1 for i in interactions if i.is_positive)
    negative = sum(1 for i in interactions if not i.is_positive)

    harmony = min(100, 50 + positive * 10 - negative * 15)
    return {
        'harmony_score': max(0, harmony),
        'positive_count': positive,
        'negative_count': negative,
    }


# ===================== G-02: 템플릿 엔진 =====================

def generate_element_interpretation(el_stats: ElementStats) -> dict:
    """오행 분포 해석 텍스트 생성."""
    pcts = el_stats.percentages
    dominant = el_stats.dominant
    weakest = el_stats.weakest
    missing = el_stats.missing

    lines = []
    if dominant:
        dom_details = ELEMENT_DETAILS.get(dominant, {})
        lines.append(f"**{ELEMENT_KOREAN[dominant]}이(가) 가장 강합니다** ({pcts.get(dominant, 0)}%)")
        lines.append(f"  → {dom_details.get('nature', '')}의 에너지가 강하게 작용합니다.")

    if weakest and pcts.get(weakest, 0) < 15:
        weak_details = ELEMENT_DETAILS.get(weakest, {})
        lines.append(f"**{ELEMENT_KOREAN[weakest]}이(가) 부족합니다** ({pcts.get(weakest, 0)}%)")
        lines.append(f"  → {weak_details.get('organ', '관련 장기')}에 주의하고, {weak_details.get('nature', '')}을(를) 키우면 좋습니다.")

    if missing:
        missing_names = ', '.join(ELEMENT_KOREAN[m] for m in missing)
        lines.append(f"⚠️ **{missing_names}이(가) 완전히 부재**합니다. 이 오행을 보충하는 것이 좋습니다.")

    interpretation = '\n'.join(lines)

    # 오행 상생/상극 관계 요약
    over_el = [e for e, p in pcts.items() if p > 30]
    under_el = [e for e, p in pcts.items() if p < 10]

    advice = []
    for oe in over_el:
        controlled = ELEMENT_CONTROLS[oe]
        advice.append(f"{ELEMENT_KOREAN[oe]} 과다 → {ELEMENT_KOREAN[controlled]}이(가) 억눌릴 수 있습니다.")
    for ue in under_el:
        generator = ELEMENT_GENERATED_BY[ue]
        advice.append(f"{ELEMENT_KOREAN[ue]} 부족 → {ELEMENT_KOREAN[generator]}의 도움이나 {ELEMENT_KOREAN[ue]} 관련 활동이 도움됩니다.")

    return {
        'interpretation': interpretation,
        'advice': advice,
        'balance_score': calculate_element_balance_score(el_stats),
    }


def generate_yinyang_interpretation(yy_stats: YinYangStats) -> dict:
    """음양 균형 해석."""
    dom = yy_stats.dominant

    if dom == '균형':
        text = "음양이 균형을 이루고 있습니다. 외향성과 내향성이 조화로운 이상적인 상태입니다."
        advice = "현재의 균형을 유지하세요."
    elif dom == '陽':
        diff = yy_stats.yang - yy_stats.yin
        if diff >= 4:
            text = "양(陽)의 기운이 매우 강합니다. 적극적·외향적·활동적 성향이 두드러집니다."
        else:
            text = "양(陽)의 기운이 약간 우세합니다. 진취적이고 적극적인 면이 있습니다."
        advice = "차분한 활동(명상, 독서)으로 음의 에너지를 보충하면 좋습니다."
    else:
        diff = yy_stats.yin - yy_stats.yang
        if diff >= 4:
            text = "음(陰)의 기운이 매우 강합니다. 내면적·섬세·신중한 성향이 두드러집니다."
        else:
            text = "음(陰)의 기운이 약간 우세합니다. 사려 깊고 신중한 면이 있습니다."
        advice = "활동적인 취미(운동, 여행)로 양의 에너지를 키우면 좋습니다."

    return {
        'interpretation': text,
        'advice': advice,
        'balance_score': calculate_yinyang_balance_score(yy_stats),
    }


def generate_strength_interpretation(strength: StrengthResult) -> dict:
    """신강·신약 해석."""
    grade = strength.grade
    score = strength.score

    interpretations = {
        '극신강': '일간의 에너지가 매우 강합니다. 독립심과 자존감이 높지만, 에너지를 발산하는 방향이 중요합니다.',
        '신강': '일간이 힘을 잘 갖추고 있습니다. 주도적이며 자기 주장이 뚜렷합니다.',
        '중화': '일간의 힘이 적절하게 균형 잡혀 있습니다. 유연하게 상황에 적응할 수 있습니다.',
        '신약': '일간의 에너지가 다소 약합니다. 유연하고 적응력이 좋지만, 자신감 강화가 필요합니다.',
        '극신약': '일간의 에너지가 매우 약합니다. 타인과의 협력, 환경의 도움이 중요합니다.',
    }

    advices = {
        '극신강': ['에너지 과잉을 해소하기 위해 식상(표현·창작) 활동을 추천합니다.',
                  '타인과의 협업에서 의견을 조율하는 연습이 중요합니다.'],
        '신강': ['자기 주장이 강하므로 경청의 미덕을 키우세요.',
                '재성/관성 방향의 활동(사회 참여, 재테크)이 좋습니다.'],
        '중화': ['다양한 분야에 고르게 관심을 가져도 좋습니다.',
                '큰 틀에서 유연하게 움직이는 것이 장점입니다.'],
        '신약': ['인성(학습·멘토) 관계가 큰 힘이 됩니다.',
                '비겁(동료·팀워크)를 통해 부족한 에너지를 보충하세요.'],
        '극신약': ['자신의 강점을 인식하고 키우는 것이 최우선입니다.',
                  '안정적인 환경과 지지 체계를 구축하세요.'],
    }

    return {
        'interpretation': interpretations.get(grade, ''),
        'advice': advices.get(grade, []),
        'evidence': [f"{f.factor}: {f.description} ({f.points:+.0f}점)" for f in strength.factors],
    }


def generate_interaction_interpretation(interactions: list) -> list:
    """상호작용 해석 요약."""
    summaries = []
    for intr in interactions:
        icon = '✅' if intr.is_positive else '⚠️'
        summaries.append({
            'icon': icon,
            'type': intr.type,
            'name': intr.name,
            'description': intr.description,
            'positions': ' ↔ '.join(intr.positions),
        })
    return summaries


def generate_luck_interpretation(luck: LuckCycles, day_stem: str) -> dict:
    """대운 해석."""
    if luck is None:
        return {'available': False, 'message': '성별 정보가 없어 대운을 산출할 수 없습니다.'}

    timeline = []
    for lp in luck.pillars:
        ds_el = STEM_INFO[day_stem]['element']
        lp_el = lp.element
        # 관계 해석
        if lp_el == ds_el:
            relation = '비겁운 — 경쟁·독립·자기주도의 시기'
        elif ELEMENT_GENERATES[ds_el] == lp_el:
            relation = '식상운 — 창의·표현·자녀·활동의 시기'
        elif ELEMENT_CONTROLS[ds_el] == lp_el:
            relation = '재성운 — 재물·실행·현실적 성취의 시기'
        elif ELEMENT_CONTROLLED_BY[ds_el] == lp_el:
            relation = '관성운 — 직업·사회적 역할·명예의 시기'
        elif ELEMENT_GENERATED_BY[ds_el] == lp_el:
            relation = '인성운 — 학습·사고·준비·내면 성장의 시기'
        else:
            relation = ''

        is_current = (luck.current_pillar and
                     lp.start_age == luck.current_pillar.start_age)

        timeline.append({
            'pillar': lp.full,
            'element': lp.element,
            'ten_god': lp.ten_god,
            'start_age': lp.start_age,
            'end_age': lp.end_age,
            'start_year': lp.start_year,
            'end_year': lp.end_year,
            'relation': relation,
            'is_current': is_current,
        })

    current_text = ''
    if luck.current_pillar:
        cp = luck.current_pillar
        current_text = f"현재 {cp.full} 대운 ({cp.start_age}~{cp.end_age}세, {cp.start_year}~{cp.end_year}년)"

    return {
        'available': True,
        'direction': luck.direction,
        'start_age': luck.start_age,
        'timeline': timeline,
        'current_text': current_text,
    }
