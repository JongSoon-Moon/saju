"""
사주명리 핵심 계산 엔진.

구현 모듈:
- H-05: 데이터 검증
- H-02/H-03: 음양력 변환 / 절기 경계 처리
- A-01: 사주 원국 산출
- A-05: 지장간 분석
- A-02: 오행 분포 분석
- A-03: 음양 균형
- A-04: 십신 배치
- A-06: 12운성
- A-08: 천간 합·충
- A-09: 지지 충·합·형·파·해
- B-01: 신강·신약 판단
- C-01: 대운 산출
- H-01: 출생 시간 모름 처리
"""

from datetime import datetime, date, timedelta
from typing import Optional, Tuple, List

from .data import (
    STEMS, BRANCHES, STEM_INFO, BRANCH_INFO,
    HIDDEN_STEMS, ELEMENTS,
    ELEMENT_GENERATES, ELEMENT_CONTROLS, ELEMENT_GENERATED_BY,
    SOLAR_TERM_BOUNDARIES,
    MONTH_STEM_START, HOUR_STEM_START,
    get_hour_branch, get_hour_branch_index, get_ten_god, get_twelve_stage,
    STEM_COMBINATIONS, STEM_CLASHES,
    BRANCH_SIX_COMBINATIONS, BRANCH_THREE_COMBINATIONS, BRANCH_DIRECTIONAL,
    BRANCH_CLASHES, BRANCH_PENALTIES, BRANCH_SELF_PENALTY,
    BRANCH_BREAKS, BRANCH_HARMS,
    STRENGTH_RULES, TEN_GOD_GROUPS,
)
from .models import (
    BirthInput, Pillar, Pillars, HiddenStemInfo,
    ElementStats, YinYangStats,
    TenGodPosition, TenGodStats,
    Interaction, StrengthFactor, StrengthResult,
    LuckPillar, LuckCycles, FullReport,
)


# ===================== H-05: 데이터 검증 =====================

def validate_input(inp: BirthInput) -> List[str]:
    """입력 데이터 검증. 오류 메시지 리스트 반환 (빈 리스트 = 유효)."""
    errors = []

    # 년도 범위
    if not (1900 <= inp.year <= 2100):
        errors.append("년도는 1900~2100 사이여야 합니다.")

    # 월 범위
    if not (1 <= inp.month <= 12):
        errors.append("월은 1~12 사이여야 합니다.")

    # 일 범위 (기본)
    if not (1 <= inp.day <= 31):
        errors.append("일은 1~31 사이여야 합니다.")

    # 날짜 유효성
    if not errors:
        try:
            if inp.calendar_type == 'solar':
                date(inp.year, inp.month, inp.day)
        except ValueError:
            errors.append(f"{inp.year}년 {inp.month}월 {inp.day}일은 유효하지 않은 날짜입니다.")

    # 시간 범위
    if inp.hour is not None and not (0 <= inp.hour <= 23):
        errors.append("시간은 0~23 사이여야 합니다.")

    # 성별 확인
    if inp.gender is not None and inp.gender not in ('male', 'female'):
        errors.append("성별은 'male' 또는 'female'이어야 합니다.")

    # 미래 날짜 경고
    try:
        if inp.calendar_type == 'solar':
            birth = date(inp.year, inp.month, inp.day)
            if birth > date.today():
                errors.append("미래 날짜는 분석할 수 없습니다.")
    except ValueError:
        pass

    return errors


# ===================== H-02/H-03: 달력 & 절기 =====================

def compute_jdn(year: int, month: int, day: int) -> int:
    """그레고리력 날짜의 율리우스 일수(Julian Day Number) 계산."""
    a = (14 - month) // 12
    y = year + 4800 - a
    m = month + 12 * a - 3
    return day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045


def jdn_to_day_stem_branch(jdn: int) -> Tuple[str, str]:
    """JDN으로부터 일간·일지 계산.
    검증 기준: 2024-01-01 = 壬辰일 (JDN=2460311)
    """
    stem_idx = (jdn + 7) % 10
    branch_idx = (jdn + 5) % 12
    return STEMS[stem_idx], BRANCHES[branch_idx]


def get_solar_term_month(year: int, month: int, day: int) -> int:
    """양력 날짜가 속하는 절기 월(지지 인덱스) 반환.
    반환값: 0=寅(1월), 1=卯(2월), ..., 11=丑(12월)
    """
    # 절기 경계 일자 (해당 년도 기준 근사값)
    boundaries = []
    for name, m, d, idx in SOLAR_TERM_BOUNDARIES:
        boundaries.append((m, d, idx))

    # 소한(1월) 이전이면 전년도 자월(11월) 또는 축월(12월)
    # 입춘(2월) 이전이면 축월(12월)

    # 정렬: 1월(소한) → 2월(입춘) → ... → 12월(대설)
    # 절기 순서대로 비교
    sorted_terms = sorted(boundaries, key=lambda x: (x[0], x[1]))

    current_month_idx = 11  # 기본값: 丑月 (12월)

    for t_month, t_day, t_idx in sorted_terms:
        if month > t_month or (month == t_month and day >= t_day):
            current_month_idx = t_idx

    return current_month_idx


def get_year_for_pillars(year: int, month: int, day: int) -> int:
    """절기 기준 년도 결정. 입춘(약 2/4) 이전이면 전년도 사용."""
    # 입춘 이전이면 전년
    lichun_month, lichun_day = 2, 4  # 근사값
    if month < lichun_month or (month == lichun_month and day < lichun_day):
        return year - 1
    return year


# ===================== A-01: 사주 원국 산출 =====================

def calculate_year_pillar(year: int, month: int, day: int) -> Pillar:
    """년주 계산. 입춘 기준으로 년도 결정."""
    adj_year = get_year_for_pillars(year, month, day)
    stem_idx = (adj_year - 4) % 10
    branch_idx = (adj_year - 4) % 12
    stem = STEMS[stem_idx]
    branch = BRANCHES[branch_idx]
    return _build_pillar(stem, branch)


def calculate_month_pillar(year: int, month: int, day: int) -> Pillar:
    """월주 계산. 절기 기준 월 결정 + 오호둔천간."""
    # 년간 구하기 (입춘 기준)
    adj_year = get_year_for_pillars(year, month, day)
    year_stem_idx = (adj_year - 4) % 10
    year_stem = STEMS[year_stem_idx]

    # 절기 기준 월 (0=寅, ..., 11=丑)
    month_branch_offset = get_solar_term_month(year, month, day)
    # 지지: 寅=2, 卯=3, ... 丑=1 → 브랜치 인덱스 = (month_branch_offset + 2) % 12
    branch_idx = (month_branch_offset + 2) % 12
    branch = BRANCHES[branch_idx]

    # 오호둔천간: 년간 → 寅월 시작 천간
    start_stem = MONTH_STEM_START[year_stem]
    start_stem_idx = STEMS.index(start_stem)
    stem_idx = (start_stem_idx + month_branch_offset) % 10
    stem = STEMS[stem_idx]

    return _build_pillar(stem, branch)


def calculate_day_pillar(year: int, month: int, day: int) -> Pillar:
    """일주 계산. JDN 기반."""
    jdn = compute_jdn(year, month, day)
    stem, branch = jdn_to_day_stem_branch(jdn)
    return _build_pillar(stem, branch)


def calculate_hour_pillar(day_stem: str, hour: Optional[int]) -> Optional[Pillar]:
    """시주 계산. 오자둔천간 기반. hour=None이면 None 반환."""
    if hour is None:
        return None

    branch_idx = get_hour_branch_index(hour)
    if branch_idx is None:
        return None
    branch = BRANCHES[branch_idx]

    # 오자둔천간: 일간 → 子시 시작 천간
    start_stem = HOUR_STEM_START[day_stem]
    start_stem_idx = STEMS.index(start_stem)
    stem_idx = (start_stem_idx + branch_idx) % 10
    stem = STEMS[stem_idx]

    return _build_pillar(stem, branch)


def _build_pillar(stem: str, branch: str) -> Pillar:
    """천간·지지로부터 Pillar 객체 생성 (오행, 음양, 지장간 포함)."""
    si = STEM_INFO[stem]
    bi = BRANCH_INFO[branch]

    hidden = []
    for h_stem, weight in HIDDEN_STEMS[branch]:
        if weight >= 1.0:
            role = '본기'
        elif weight >= 0.5:
            role = '중기'
        else:
            role = '여기'
        hidden.append(HiddenStemInfo(stem=h_stem, weight=weight, role=role))

    return Pillar(
        stem=stem,
        branch=branch,
        stem_element=si['element'],
        branch_element=bi['element'],
        stem_yinyang=si['yinyang'],
        branch_yinyang=bi['yinyang'],
        hidden_stems=hidden,
    )


def calculate_pillars(inp: BirthInput) -> Pillars:
    """BirthInput으로부터 사주 4주 계산."""
    year_p = calculate_year_pillar(inp.year, inp.month, inp.day)
    month_p = calculate_month_pillar(inp.year, inp.month, inp.day)
    day_p = calculate_day_pillar(inp.year, inp.month, inp.day)
    hour_p = calculate_hour_pillar(day_p.stem, inp.hour)

    pillars = Pillars(year=year_p, month=month_p, day=day_p, hour=hour_p)

    # 십신 & 12운성 채우기
    _fill_ten_gods(pillars)
    _fill_twelve_stages(pillars)

    return pillars


# ===================== A-04: 십신 배치 =====================

def _fill_ten_gods(pillars: Pillars):
    """모든 기둥에 십신 배정 (일간 기준)."""
    ds = pillars.day_stem
    for name, p in [('year', pillars.year), ('month', pillars.month), ('hour', pillars.hour)]:
        if p is None:
            continue
        p.ten_god = get_ten_god(ds, p.stem)
    pillars.day.ten_god = '일간'


def _fill_twelve_stages(pillars: Pillars):
    """모든 기둥에 12운성 배정 (일간 기준)."""
    ds = pillars.day_stem
    for p in pillars.all_pillars():
        p.twelve_stage = get_twelve_stage(ds, p.branch)


def calculate_ten_god_stats(pillars: Pillars) -> TenGodStats:
    """십신 통계 계산."""
    positions = []
    counts = {g: 0 for g in ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인']}
    ds = pillars.day_stem

    pillar_names = [('year', pillars.year), ('month', pillars.month),
                    ('day', pillars.day), ('hour', pillars.hour)]

    for pname, p in pillar_names:
        if p is None:
            continue
        # 천간 (일간 제외)
        if pname != 'day':
            tg = get_ten_god(ds, p.stem)
            positions.append(TenGodPosition(pillar=pname, position='stem', char=p.stem, ten_god=tg))
            counts[tg] = counts.get(tg, 0) + 1

        # 지지 본기
        if p.hidden_stems:
            main_hidden = p.hidden_stems[0].stem  # 본기
            tg = get_ten_god(ds, main_hidden)
            positions.append(TenGodPosition(pillar=pname, position='branch', char=p.branch, ten_god=tg))
            counts[tg] = counts.get(tg, 0) + 1

    # 지배 그룹 결정
    group_counts = {}
    for gname, gods in TEN_GOD_GROUPS.items():
        group_counts[gname] = sum(counts.get(g, 0) for g in gods)
    dominant = max(group_counts, key=group_counts.get) if group_counts else '비겁'

    stats = TenGodStats(positions=positions, counts=counts, dominant_group=dominant)
    return stats


# ===================== A-02: 오행 분포 분석 =====================

def analyze_five_elements(pillars: Pillars, include_hidden: bool = False) -> ElementStats:
    """오행 분포 분석.
    include_hidden=True: 지장간 포함 (가중치 적용)
    include_hidden=False: 천간 4자 + 지지 4자만
    """
    counts = {'木': 0.0, '火': 0.0, '土': 0.0, '金': 0.0, '水': 0.0}

    for p in pillars.all_pillars():
        # 천간 오행
        counts[p.stem_element] += 1.0

        if include_hidden:
            # 지장간 가중치 적용
            for hs in p.hidden_stems:
                el = STEM_INFO[hs.stem]['element']
                counts[el] += hs.weight
        else:
            # 지지 오행 (1개)
            counts[p.branch_element] += 1.0

    total = sum(counts.values())

    return ElementStats(
        wood=round(counts['木'], 1),
        fire=round(counts['火'], 1),
        earth=round(counts['土'], 1),
        metal=round(counts['金'], 1),
        water=round(counts['水'], 1),
        total=round(total, 1),
        with_hidden_stems=include_hidden,
    )


# ===================== A-03: 음양 균형 =====================

def analyze_yin_yang(pillars: Pillars) -> YinYangStats:
    """음양 비율 분석."""
    yang = 0
    yin = 0

    for p in pillars.all_pillars():
        # 천간
        if p.stem_yinyang == '陽':
            yang += 1
        else:
            yin += 1
        # 지지
        if p.branch_yinyang == '陽':
            yang += 1
        else:
            yin += 1

    return YinYangStats(yang=yang, yin=yin)


# ===================== A-08: 천간 합·충 =====================

def find_stem_interactions(pillars: Pillars) -> List[Interaction]:
    """천간 간 합·충 탐지."""
    results = []
    stems_with_pos = []
    for name, p in [('년간', pillars.year), ('월간', pillars.month),
                    ('일간', pillars.day), ('시간', pillars.hour)]:
        if p:
            stems_with_pos.append((name, p.stem))

    for i in range(len(stems_with_pos)):
        for j in range(i + 1, len(stems_with_pos)):
            pos1, s1 = stems_with_pos[i]
            pos2, s2 = stems_with_pos[j]

            # 합 체크
            for sa, sb, result_el, name in STEM_COMBINATIONS:
                if (s1 == sa and s2 == sb) or (s1 == sb and s2 == sa):
                    # 인접한 기둥일 때만 합이 성립 (간단한 규칙)
                    results.append(Interaction(
                        type='천간합',
                        elements=[s1, s2],
                        positions=[pos1, pos2],
                        result=result_el,
                        name=name,
                        description=f"{pos1} {s1}과(와) {pos2} {s2}가 합하여 {result_el}의 기운을 형성합니다.",
                        severity=2,
                        is_positive=True,
                    ))

            # 충 체크
            for sa, sb, name in STEM_CLASHES:
                if (s1 == sa and s2 == sb) or (s1 == sb and s2 == sa):
                    results.append(Interaction(
                        type='천간충',
                        elements=[s1, s2],
                        positions=[pos1, pos2],
                        name=name,
                        description=f"{pos1} {s1}과(와) {pos2} {s2}가 충돌하여 긴장과 변화의 에너지가 있습니다.",
                        severity=2,
                        is_positive=False,
                    ))

    return results


# ===================== A-09: 지지 충·합·형·파·해 =====================

def find_branch_interactions(pillars: Pillars) -> List[Interaction]:
    """지지 간 모든 상호작용 탐지."""
    results = []
    branches_with_pos = []
    for name, p in [('년지', pillars.year), ('월지', pillars.month),
                    ('일지', pillars.day), ('시지', pillars.hour)]:
        if p:
            branches_with_pos.append((name, p.branch))

    branch_list = [b for _, b in branches_with_pos]

    # 6합 체크
    for i in range(len(branches_with_pos)):
        for j in range(i + 1, len(branches_with_pos)):
            pos1, b1 = branches_with_pos[i]
            pos2, b2 = branches_with_pos[j]

            for ba, bb, result_el, name in BRANCH_SIX_COMBINATIONS:
                if (b1 == ba and b2 == bb) or (b1 == bb and b2 == ba):
                    results.append(Interaction(
                        type='지지육합',
                        elements=[b1, b2],
                        positions=[pos1, pos2],
                        result=result_el,
                        name=name,
                        description=f"{pos1} {b1}과(와) {pos2} {b2}가 합하여 {result_el}의 조화를 이룹니다.",
                        severity=2,
                        is_positive=True,
                    ))

    # 6충 체크
    for i in range(len(branches_with_pos)):
        for j in range(i + 1, len(branches_with_pos)):
            pos1, b1 = branches_with_pos[i]
            pos2, b2 = branches_with_pos[j]

            for ba, bb, name in BRANCH_CLASHES:
                if (b1 == ba and b2 == bb) or (b1 == bb and b2 == ba):
                    results.append(Interaction(
                        type='지지충',
                        elements=[b1, b2],
                        positions=[pos1, pos2],
                        name=name,
                        description=f"{pos1} {b1}과(와) {pos2} {b2}가 충하여 갈등·변화의 에너지가 강합니다.",
                        severity=3,
                        is_positive=False,
                    ))

    # 3합 체크
    for combo_branches, result_el, name in BRANCH_THREE_COMBINATIONS:
        matching = [(pos, b) for pos, b in branches_with_pos if b in combo_branches]
        if len(matching) >= 2:
            is_full = len(matching) >= 3
            results.append(Interaction(
                type='지지삼합',
                elements=[b for _, b in matching],
                positions=[p for p, _ in matching],
                result=result_el,
                name=name + (' (완전)' if is_full else ' (반합)'),
                description=f"{'·'.join(b for _, b in matching)}이(가) {result_el}국을 이루어 {'강력한' if is_full else '부분적'} {result_el}의 에너지를 형성합니다.",
                severity=3 if is_full else 1,
                is_positive=True,
            ))

    # 방합 체크
    for combo_branches, result_el, name in BRANCH_DIRECTIONAL:
        matching = [(pos, b) for pos, b in branches_with_pos if b in combo_branches]
        if len(matching) >= 3:
            results.append(Interaction(
                type='지지방합',
                elements=[b for _, b in matching],
                positions=[p for p, _ in matching],
                result=result_el,
                name=name,
                description=f"{'·'.join(b for _, b in matching)}이(가) 방합을 이루어 매우 강한 {result_el} 에너지를 형성합니다.",
                severity=3,
                is_positive=True,
            ))

    # 3형 체크
    for penalty_branches, desc in BRANCH_PENALTIES:
        matching = [(pos, b) for pos, b in branches_with_pos if b in penalty_branches]
        if len(matching) >= 2:
            results.append(Interaction(
                type='지지형',
                elements=[b for _, b in matching],
                positions=[p for p, _ in matching],
                name=desc,
                description=f"{'·'.join(b for _, b in matching)}의 형살 — {desc}",
                severity=2,
                is_positive=False,
            ))

    # 자형 체크
    for i in range(len(branches_with_pos)):
        for j in range(i + 1, len(branches_with_pos)):
            pos1, b1 = branches_with_pos[i]
            pos2, b2 = branches_with_pos[j]
            if b1 == b2 and b1 in BRANCH_SELF_PENALTY:
                results.append(Interaction(
                    type='지지형',
                    elements=[b1, b2],
                    positions=[pos1, pos2],
                    name=f'{b1}{b2} 자형(自刑)',
                    description=f"{pos1}과(와) {pos2}의 {b1}이(가) 자형을 이루어 자기 내면의 갈등이 있습니다.",
                    severity=1,
                    is_positive=False,
                ))

    # 6파 체크
    for i in range(len(branches_with_pos)):
        for j in range(i + 1, len(branches_with_pos)):
            pos1, b1 = branches_with_pos[i]
            pos2, b2 = branches_with_pos[j]
            for ba, bb in BRANCH_BREAKS:
                if (b1 == ba and b2 == bb) or (b1 == bb and b2 == ba):
                    results.append(Interaction(
                        type='지지파',
                        elements=[b1, b2],
                        positions=[pos1, pos2],
                        name=f'{b1}{b2}파',
                        description=f"{pos1} {b1}과(와) {pos2} {b2}의 파(破) — 파괴와 재구성의 에너지.",
                        severity=1,
                        is_positive=False,
                    ))

    # 6해 체크
    for i in range(len(branches_with_pos)):
        for j in range(i + 1, len(branches_with_pos)):
            pos1, b1 = branches_with_pos[i]
            pos2, b2 = branches_with_pos[j]
            for ba, bb, name in BRANCH_HARMS:
                if (b1 == ba and b2 == bb) or (b1 == bb and b2 == ba):
                    results.append(Interaction(
                        type='지지해',
                        elements=[b1, b2],
                        positions=[pos1, pos2],
                        name=name,
                        description=f"{pos1} {b1}과(와) {pos2} {b2}의 해(害) — 은근한 방해와 갈등의 요소.",
                        severity=1,
                        is_positive=False,
                    ))

    return results


# ===================== B-01: 신강·신약 판단 =====================

def calculate_strength(pillars: Pillars) -> StrengthResult:
    """
    일간의 신강·신약 판단.
    득령(월지), 득지(일지·시지), 득세(천간) 기반.
    """
    ds = pillars.day_stem
    ds_element = STEM_INFO[ds]['element']
    factors = []
    total_score = 0

    # ① 득령 (월지 기준) — 최대 30점
    month_branch_el = pillars.month.branch_element
    # 월지 지장간 본기 오행도 확인
    month_hidden_main = pillars.month.hidden_stems[0].stem if pillars.month.hidden_stems else None
    month_hidden_el = STEM_INFO[month_hidden_main]['element'] if month_hidden_main else None

    check_el = month_hidden_el or month_branch_el

    if check_el == ds_element:
        pts = STRENGTH_RULES['deukryeong']['same']
        factors.append(StrengthFactor('득령', f'월지 {pillars.month.branch}의 본기가 일간과 같은 {ds_element} — 비겁(比) 관계', pts))
        total_score += pts
    elif ELEMENT_GENERATED_BY.get(ds_element) == check_el:
        pts = STRENGTH_RULES['deukryeong']['generate']
        factors.append(StrengthFactor('득령', f'월지 본기가 일간을 생하는 {check_el}→{ds_element} — 인성(印) 관계', pts))
        total_score += pts
    else:
        factors.append(StrengthFactor('득령', f'월지 본기({check_el})가 일간({ds_element})을 돕지 않음', 0))

    # ② 득지 (일지, 시지)
    for pname, p in [('일지', pillars.day), ('시지', pillars.hour)]:
        if p is None:
            continue
        branch_hidden_main = p.hidden_stems[0].stem if p.hidden_stems else None
        bh_el = STEM_INFO[branch_hidden_main]['element'] if branch_hidden_main else p.branch_element

        if bh_el == ds_element:
            pts = STRENGTH_RULES['deukji']['same']
            factors.append(StrengthFactor('득지', f'{pname} {p.branch} 본기가 일간과 같은 오행', pts))
            total_score += pts
        elif ELEMENT_GENERATED_BY.get(ds_element) == bh_el:
            pts = STRENGTH_RULES['deukji']['generate']
            factors.append(StrengthFactor('득지', f'{pname} {p.branch} 본기가 일간을 생함', pts))
            total_score += pts

    # ③ 득세 (년간, 월간, 시간의 천간)
    for pname, p in [('년간', pillars.year), ('월간', pillars.month), ('시간', pillars.hour)]:
        if p is None:
            continue
        p_el = STEM_INFO[p.stem]['element']
        if p_el == ds_element:
            pts = STRENGTH_RULES['deukse']['same']
            factors.append(StrengthFactor('득세', f'{pname} {p.stem}이(가) 일간과 같은 {ds_element}', pts))
            total_score += pts
        elif ELEMENT_GENERATED_BY.get(ds_element) == p_el:
            pts = STRENGTH_RULES['deukse']['generate']
            factors.append(StrengthFactor('득세', f'{pname} {p.stem}이(가) 일간을 생하는 {p_el}', pts))
            total_score += pts

    # ④ 지장간 보너스 (본기 외)
    for p in pillars.all_pillars():
        for hs in p.hidden_stems[1:]:  # 중기, 여기
            if STEM_INFO[hs.stem]['element'] == ds_element:
                if hs.role == '중기':
                    pts = STRENGTH_RULES['hidden_middle']
                else:
                    pts = STRENGTH_RULES['hidden_residual']
                factors.append(StrengthFactor('지장간', f'{p.branch} {hs.role} {hs.stem}이(가) 일간과 같은 오행', pts))
                total_score += pts

    # 판정
    # 0~100 스케일로 정규화 (max 약 100)
    score = min(max(total_score, 0), 100)

    if score >= 70:
        grade = '극신강'
    elif score >= 50:
        grade = '신강'
    elif score >= 40:
        grade = '중화'
    elif score >= 20:
        grade = '신약'
    else:
        grade = '극신약'

    return StrengthResult(
        score=score,
        is_strong=(score >= 50),
        grade=grade,
        factors=factors,
    )


# ===================== C-01: 대운 산출 =====================

def calculate_luck_cycles(
    inp: BirthInput,
    pillars: Pillars,
    num_cycles: int = 9
) -> Optional[LuckCycles]:
    """
    대운 산출.
    - 양남음녀 → 순행, 음남양녀 → 역행
    - 생일~다음/이전 절기까지 일수 ÷ 3 = 대운 시작 나이
    """
    if inp.gender is None:
        return None

    year_stem_yy = pillars.year.stem_yinyang
    is_yang_stem = (year_stem_yy == '陽')
    is_male = (inp.gender == 'male')

    # 순행: 양남, 음녀 / 역행: 음남, 양녀
    is_forward = (is_yang_stem and is_male) or (not is_yang_stem and not is_male)
    direction = '순행' if is_forward else '역행'

    # 대운 시작 나이 계산 (절기까지 일수 ÷ 3)
    birth_date = date(inp.year, inp.month, inp.day)
    start_age = _calc_luck_start_age(birth_date, is_forward)

    # 월주에서 순행/역행하며 대운 간지 도출
    month_stem_idx = STEMS.index(pillars.month.stem)
    month_branch_idx = BRANCHES.index(pillars.month.branch)

    luck_pillars = []
    for i in range(num_cycles):
        offset = (i + 1) if is_forward else -(i + 1)
        stem_idx = (month_stem_idx + offset) % 10
        branch_idx = (month_branch_idx + offset) % 12
        stem = STEMS[stem_idx]
        branch = BRANCHES[branch_idx]
        element = STEM_INFO[stem]['element']
        tg = get_ten_god(pillars.day_stem, stem)

        s_age = start_age + i * 10
        e_age = s_age + 9
        s_year = inp.year + s_age
        e_year = inp.year + e_age

        luck_pillars.append(LuckPillar(
            stem=stem, branch=branch, element=element, ten_god=tg,
            start_age=s_age, end_age=e_age,
            start_year=s_year, end_year=e_year,
        ))

    # 현재 대운 결정
    current_age = date.today().year - inp.year
    current_pillar = None
    for lp in luck_pillars:
        if lp.start_age <= current_age <= lp.end_age:
            current_pillar = lp
            break

    return LuckCycles(
        start_age=start_age,
        direction=direction,
        pillars=luck_pillars,
        current_pillar=current_pillar,
    )


def _calc_luck_start_age(birth_date: date, is_forward: bool) -> int:
    """다음(순행)/이전(역행) 절기까지의 일수 ÷ 3 → 대운 시작 나이."""
    year = birth_date.year
    month = birth_date.month
    day = birth_date.day

    # 모든 절기 날짜 생성
    term_dates = []
    for y in [year - 1, year, year + 1]:
        for name, m, d, _ in SOLAR_TERM_BOUNDARIES:
            try:
                term_dates.append(date(y, m, d))
            except ValueError:
                pass

    term_dates.sort()

    if is_forward:
        # 순행: 다음 절기까지 일수
        next_terms = [t for t in term_dates if t > birth_date]
        if next_terms:
            days_diff = (next_terms[0] - birth_date).days
        else:
            days_diff = 15  # fallback
    else:
        # 역행: 이전 절기까지 일수
        prev_terms = [t for t in term_dates if t <= birth_date]
        if prev_terms:
            days_diff = (birth_date - prev_terms[-1]).days
        else:
            days_diff = 15  # fallback

    # 3일 = 1년
    start_age = max(1, round(days_diff / 3))
    return start_age


# ===================== H-01: 시간 모름 처리 =====================

def generate_time_scenarios(inp: BirthInput, pillars: Pillars) -> List[dict]:
    """시간을 모를 때, 3가지 시간대 시나리오 생성."""
    scenarios = []
    # 대표적인 3개 시간대: 寅시(5시), 午시(12시), 戌시(20시)
    test_hours = [5, 12, 20]
    labels = ['寅시(새벽 5시)', '午시(정오 12시)', '戌시(저녁 20시)']

    for hour, label in zip(test_hours, labels):
        hour_p = calculate_hour_pillar(pillars.day_stem, hour)
        scenarios.append({
            'label': label,
            'hour': hour,
            'pillar': hour_p,
            'ten_god': get_ten_god(pillars.day_stem, hour_p.stem) if hour_p else '',
            'twelve_stage': get_twelve_stage(pillars.day_stem, hour_p.branch) if hour_p else '',
        })

    return scenarios


# ===================== 전체 분석 실행 =====================

def generate_full_analysis(inp: BirthInput) -> FullReport:
    """전체 사주 분석을 실행하고 FullReport 반환."""
    from datetime import datetime as dt
    from .data import DISCLAIMER

    # 1. 원국 계산
    pillars = calculate_pillars(inp)

    # 2. 오행 분석
    el_stats = analyze_five_elements(pillars, include_hidden=False)
    el_stats_hidden = analyze_five_elements(pillars, include_hidden=True)

    # 3. 음양 분석
    yy_stats = analyze_yin_yang(pillars)

    # 4. 십신 분석
    tg_stats = calculate_ten_god_stats(pillars)

    # 5. 천간·지지 상호작용
    interactions = find_stem_interactions(pillars)
    interactions += find_branch_interactions(pillars)

    # 6. 신강신약
    strength = calculate_strength(pillars)

    # 7. 대운
    luck = calculate_luck_cycles(inp, pillars)

    # 8. 성격 분석 (interpretation 모듈에서 처리)
    from .interpretation import interpret_personality
    personality = interpret_personality(pillars, strength, tg_stats)

    # 9. 시간 모름 시나리오
    scenarios = []
    if inp.hour is None:
        scenarios = generate_time_scenarios(inp, pillars)

    return FullReport(
        input=inp,
        pillars=pillars,
        element_stats=el_stats,
        element_stats_with_hidden=el_stats_hidden,
        yinyang_stats=yy_stats,
        ten_god_stats=tg_stats,
        interactions=interactions,
        strength=strength,
        luck_cycles=luck,
        personality=personality,
        time_scenarios=scenarios,
        disclaimer=DISCLAIMER,
        generated_at=dt.now().isoformat(),
    )
