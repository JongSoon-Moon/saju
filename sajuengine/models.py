"""
사주명리 분석을 위한 데이터 모델(dataclass) 정의.
ARCHITECTURE.md의 TypeScript 인터페이스를 Python dataclass로 구현.
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class BirthInput:
    """사용자 입력 데이터"""
    year: int
    month: int
    day: int
    hour: Optional[int] = None         # 0~23, None = 시간 모름
    minute: Optional[int] = None       # 0~59
    calendar_type: str = 'solar'       # 'solar' 또는 'lunar'
    is_leap_month: bool = False        # 윤달 여부 (음력일 때만)
    gender: Optional[str] = None       # 'male' / 'female' / None
    name: Optional[str] = None         # 이름 (선택)


@dataclass
class HiddenStemInfo:
    """지장간 정보"""
    stem: str           # 천간
    weight: float       # 가중치 (본기 1.0, 중기 0.7, 여기 0.3)
    role: str           # '본기' / '중기' / '여기'


@dataclass
class Pillar:
    """하나의 기둥 (년주/월주/일주/시주)"""
    stem: str                                    # 천간
    branch: str                                  # 지지
    stem_element: str = ''                       # 천간 오행
    branch_element: str = ''                     # 지지 오행
    stem_yinyang: str = ''                       # 천간 음양
    branch_yinyang: str = ''                     # 지지 음양
    hidden_stems: list = field(default_factory=list)  # HiddenStemInfo 리스트
    ten_god: str = ''                            # 십신 (일간 기준)
    twelve_stage: str = ''                       # 12운성 (일간 기준)

    @property
    def full(self):
        return f"{self.stem}{self.branch}"


@dataclass
class Pillars:
    """사주 원국 (4주 8자)"""
    year: Pillar
    month: Pillar
    day: Pillar
    hour: Optional[Pillar] = None                # 시간 모를 때 None

    @property
    def day_stem(self):
        """일간 (분석의 중심)"""
        return self.day.stem

    def all_pillars(self):
        """모든 기둥 리스트"""
        result = [self.year, self.month, self.day]
        if self.hour:
            result.append(self.hour)
        return result

    def all_stems(self):
        """모든 천간 리스트"""
        return [p.stem for p in self.all_pillars()]

    def all_branches(self):
        """모든 지지 리스트"""
        return [p.branch for p in self.all_pillars()]


@dataclass
class ElementStats:
    """오행 분포 통계"""
    wood: float = 0
    fire: float = 0
    earth: float = 0
    metal: float = 0
    water: float = 0
    total: float = 0
    with_hidden_stems: bool = False

    @property
    def as_dict(self):
        return {'木': self.wood, '火': self.fire, '土': self.earth,
                '金': self.metal, '水': self.water}

    @property
    def percentages(self):
        if self.total == 0:
            return {'木': 0, '火': 0, '土': 0, '金': 0, '水': 0}
        return {k: round(v / self.total * 100, 1) for k, v in self.as_dict.items()}

    @property
    def dominant(self):
        d = self.as_dict
        return max(d, key=d.get)

    @property
    def weakest(self):
        d = self.as_dict
        return min(d, key=d.get)

    @property
    def missing(self):
        """부족(0)인 오행 목록"""
        return [k for k, v in self.as_dict.items() if v == 0]


@dataclass
class YinYangStats:
    """음양 통계"""
    yang: int = 0
    yin: int = 0

    @property
    def ratio(self):
        return f"{self.yang}:{self.yin}"

    @property
    def dominant(self):
        if self.yang > self.yin:
            return '陽'
        elif self.yin > self.yang:
            return '陰'
        return '균형'


@dataclass
class TenGodPosition:
    """십신 위치 정보"""
    pillar: str          # 'year', 'month', 'day', 'hour'
    position: str        # 'stem', 'branch', 'hidden'
    char: str            # 해당 천간/지지
    ten_god: str         # 십신명


@dataclass
class TenGodStats:
    """십신 통계"""
    positions: list = field(default_factory=list)  # TenGodPosition 리스트
    counts: dict = field(default_factory=dict)     # 십신별 개수
    dominant_group: str = ''                        # 가장 많은 그룹

    def get_group_counts(self):
        """5대 그룹별 합계"""
        from .data import TEN_GOD_GROUPS
        result = {}
        for group_name, gods in TEN_GOD_GROUPS.items():
            result[group_name] = sum(self.counts.get(g, 0) for g in gods)
        return result


@dataclass
class Interaction:
    """천간/지지 상호작용"""
    type: str             # '천간합', '천간충', '지지육합', '지지삼합', '지지충', '지지형', '지지파', '지지해'
    elements: list = field(default_factory=list)  # 관련 간지 리스트
    positions: list = field(default_factory=list)  # 위치명 (예: ['년지', '일지'])
    result: str = ''      # 합화 결과 오행
    name: str = ''        # 이름 (예: '甲己合土')
    description: str = '' # 해석
    severity: int = 2     # 1=약, 2=중, 3=강
    is_positive: bool = True


@dataclass
class StrengthFactor:
    """신강신약 점수 요인"""
    factor: str           # 요인명 (예: '득령')
    description: str      # 설명
    points: float         # 점수


@dataclass
class StrengthResult:
    """신강·신약 판단 결과"""
    score: float = 50
    is_strong: bool = True
    grade: str = '중화'    # '극신강', '신강', '중화', '신약', '극신약'
    factors: list = field(default_factory=list)  # StrengthFactor 리스트


@dataclass
class LuckPillar:
    """대운 하나의 기둥"""
    stem: str
    branch: str
    element: str
    ten_god: str
    start_age: int
    end_age: int
    start_year: int
    end_year: int

    @property
    def full(self):
        return f"{self.stem}{self.branch}"


@dataclass
class LuckCycles:
    """대운 전체"""
    start_age: int                                     # 대운 시작 나이
    direction: str = '순행'                             # '순행' / '역행'
    pillars: list = field(default_factory=list)         # LuckPillar 리스트
    current_pillar: Optional[LuckPillar] = None        # 현재 대운


@dataclass
class TopicReport:
    """주제별 분석 리포트"""
    topic: str
    score: int = 50
    grade: str = 'B'
    summary: str = ''
    details: list = field(default_factory=list)  # [{'subtitle': '', 'content': '', 'evidence': []}]
    advice: list = field(default_factory=list)
    warnings: list = field(default_factory=list)


@dataclass
class FullReport:
    """전체 분석 리포트"""
    input: BirthInput = None
    pillars: Pillars = None
    element_stats: ElementStats = None
    element_stats_with_hidden: ElementStats = None
    yinyang_stats: YinYangStats = None
    ten_god_stats: TenGodStats = None
    interactions: list = field(default_factory=list)   # Interaction 리스트
    strength: StrengthResult = None
    luck_cycles: LuckCycles = None
    personality: TopicReport = None
    time_scenarios: list = field(default_factory=list)   # 시간 모름 시나리오
    disclaimer: str = ''
    generated_at: str = ''
    version: str = '2.0.0'
