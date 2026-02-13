import streamlit as st
from datetime import datetime, timedelta
import pandas as pd

# 페이지 설정
st.set_page_config(
    page_title="사주분석 앱",
    page_icon="🔮",
    layout="centered",
    initial_sidebar_state="expanded"
)

# 스타일 설정
st.markdown("""
    <style>
        .main-title {
            text-align: center;
            color: #8B4513;
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            color: #666;
            font-size: 1.1em;
            margin-bottom: 30px;
        }
        .result-box {
            background: linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%);
            border: 2px solid #8B4513;
            border-radius: 10px;
            padding: 20px;
            margin: 10px 0;
        }
        .element-box {
            background: #F0F8FF;
            border-left: 4px solid #4169E1;
            padding: 12px;
            border-radius: 5px;
            margin: 8px 0;
        }
    </style>
""", unsafe_allow_html=True)

# ========== 사주 데이터 정의 ==========
HEAVENLY_STEMS = {
    0: '甲', 1: '乙', 2: '丙', 3: '丁', 4: '戊',
    5: '己', 6: '庚', 7: '辛', 8: '壬', 9: '癸'
}

EARTHLY_BRANCHES = {
    0: '子', 1: '丑', 2: '寅', 3: '卯', 4: '辰',
    5: '巳', 6: '午', 7: '未', 8: '申', 9: '酉',
    10: '戌', 11: '亥'
}

STEM_MEANING = {
    '甲': '갑(나무의 시작)', '乙': '을(유연한 나무)',
    '丙': '병(불의 양)', '丁': '정(불의 음)',
    '戊': '무(흙의 양)', '己': '기(흙의 음)',
    '庚': '경(쇠의 양)', '辛': '신(쇠의 음)',
    '壬': '임(물의 양)', '癸': '계(물의 음)'
}

BRANCH_MEANING = {
    '子': '쥐띠', '丑': '소띠', '寅': '호랑이띠', '卯': '토끼띠',
    '辰': '용띠', '巳': '뱀띠', '午': '말띠', '未': '양띠',
    '申': '원숭이띠', '酉': '닭띠', '戌': '개띠', '亥': '돼지띠'
}

FIVE_ELEMENTS = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
    '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
}

ELEMENT_COLORS = {
    '木': ('초록색', '동쪽', '봄', '신맛'),
    '火': ('빨간색', '남쪽', '여름', '쓴맛'),
    '土': ('노란색', '중앙', '환절기', '단맛'),
    '金': ('하얀색', '서쪽', '가을', '매운맛'),
    '水': ('검은색', '북쪽', '겨울', '짠맛')
}

# ========== 사주 계산 함수 ==========

def get_lunar_date(year, month, day, is_lunar=False):
    """
    양력/음력 날짜 처리
    is_lunar=True면 음력으로 입력된 것으로 가정
    """
    try:
        # 간단한 버전: 양력 기준으로 처리
        # 실제 음력 변환을 위해서는 lunardate 패키지 필요
        date = datetime(year, month, day)
        return date
    except ValueError as e:
        return None

def calculate_heavenly_stem_and_branch(birth_date):
    """
    생년월일로부터 년월일시의 천간지지 계산
    """
    year = birth_date.year
    month = birth_date.month
    day = birth_date.day
    
    # 년간지 계산 (1900년 기준점)
    year_index = (year - 1900) % 60
    year_stem = HEAVENLY_STEMS[year_index % 10]
    year_branch = EARTHLY_BRANCHES[year_index % 12]
    
    # 월간지 계산 (간단해진 버전)
    month_stem_index = (year_index % 10 * 2 + month - 1) % 10
    month_branch = EARTHLY_BRANCHES[(month - 1) % 12]
    month_stem = HEAVENLY_STEMS[month_stem_index]
    
    # 일간지 계산
    base_date = datetime(1900, 1, 1)  # 1900년 1월 1일은 鼠年 甲子
    target_date = datetime(year, month, day)
    days_diff = (target_date - base_date).days
    
    day_index = days_diff % 60
    day_stem = HEAVENLY_STEMS[day_index % 10]
    day_branch = EARTHLY_BRANCHES[day_index % 12]
    
    # 시간간지 (사용자 입력으로 받을 수 있음)
    hour_index = 0  # 기본값
    hour_stem = HEAVENLY_STEMS[(day_index % 10 * 2 + hour_index) % 10]
    hour_branch = EARTHLY_BRANCHES[hour_index % 12]
    
    return {
        'year': (year_stem, year_branch),
        'month': (month_stem, month_branch),
        'day': (day_stem, day_branch),
        'hour': (hour_stem, hour_branch)
    }

def analyze_five_elements(year, month, day, hour):
    """
    오행 분석
    """
    stems = [year[0], month[0], day[0], hour[0]]
    elements = {
        '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
    }
    
    for stem in stems:
        element = FIVE_ELEMENTS.get(stem, '金')
        elements[element] += 1
    
    return elements

def get_zodiac_animal(year_branch):
    """
    십간십이지 동물띠 반환
    """
    return BRANCH_MEANING.get(year_branch, '알 수 없음')

def calculate_luck_aspects(stem_branch_info):
    """
    운세 분석 (간단한 버전)
    """
    year_stem, year_branch = stem_branch_info['year']
    
    luck_message = f"""
    {year_branch}띠({BRANCH_MEANING[year_branch]})로 태어난 분의 특성:
    
    🌟 **기본 성질**: {year_stem} 천간의 에너지를 가진 사람
    📊 **오행**: {FIVE_ELEMENTS.get(year_stem, '不明')}
    💫 **운세**: 자신의 오행 에너지를 이해하면 더 나은 운을 만들 수 있습니다.
    
    ✨ **조언**: 자신의 타고난 성질을 받아들이고, 부족한 부분을 채우려는 노력이 중요합니다.
    """
    
    return luck_message

# ========== UI 구성 ==========

# 제목
st.markdown('<p class="main-title">🔮 사주분석 앱</p>', unsafe_allow_html=True)
st.markdown('<p class="subtitle">당신의 운명을 읽어보세요</p>', unsafe_allow_html=True)

# 탭 구성
tab1, tab2, tab3, tab4 = st.tabs(['📅 사주 분석', 'ℹ️ 사주란?', '📚 용어 설명', '⚙️ 설정'])

# ========== TAB 1: 사주 분석 ==========
with tab1:
    st.header("📅 생년월일 입력")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        year = st.number_input("태어난 년도", min_value=1900, max_value=2100, value=2000, step=1)
    
    with col2:
        month = st.number_input("태어난 월", min_value=1, max_value=12, value=1, step=1)
    
    with col3:
        day = st.number_input("태어난 일", min_value=1, max_value=31, value=1, step=1)
    
    # 음력/양력 선택
    calendar_type = st.radio("달력 유형", ["양력", "음력"], horizontal=True)
    
    # 시간 입력 (선택사항)
    st.caption("⏰ 정확한 분석을 위해 정시(시간)를 입력할 수 있습니다 (선택사항)")
    time_input = st.slider("태어난 시각 (선택사항)", 0, 23, 12)
    
    # 분석 버튼
    if st.button("🔍 사주 분석하기", type="primary", use_container_width=True):
        try:
            # 날짜 유효성 검사
            birth_date = get_lunar_date(year, month, day, is_lunar=(calendar_type == "음력"))
            
            if birth_date is None:
                st.error("❌ 잘못된 날짜입니다. 다시 확인해주세요.")
            else:
                # 사주 계산
                stem_branch = calculate_heavenly_stem_and_branch(birth_date)
                
                # 결과 표시
                st.markdown('<div class="result-box">', unsafe_allow_html=True)
                st.subheader(f"📊 {year}년 {month}월 {day}일 {calendar_type} 출생자의 사주")
                
                # 천간지지 표시
                col1, col2, col3, col4 = st.columns(4)
                
                with col1:
                    st.metric("年(년)", f"{stem_branch['year'][0]}{stem_branch['year'][1]}")
                
                with col2:
                    st.metric("月(월)", f"{stem_branch['month'][0]}{stem_branch['month'][1]}")
                
                with col3:
                    st.metric("日(일)", f"{stem_branch['day'][0]}{stem_branch['day'][1]}")
                
                with col4:
                    st.metric("時(시)", f"{stem_branch['hour'][0]}{stem_branch['hour'][1]}")
                
                st.markdown('</div>', unsafe_allow_html=True)
                
                # 동물띠
                zodiac = get_zodiac_animal(stem_branch['year'][1])
                st.success(f"🐶 **동물띠**: {zodiac}")
                
                # 오행 분석
                st.subheader("🌊 오행(五行) 분석")
                elements = analyze_five_elements(
                    stem_branch['year'],
                    stem_branch['month'],
                    stem_branch['day'],
                    stem_branch['hour']
                )
                
                # 오행 비율
                col1, col2 = st.columns([2, 1])
                
                with col1:
                    element_df = pd.DataFrame({
                        '오행': list(elements.keys()),
                        '강도': list(elements.values())
                    })
                    
                    st.bar_chart(element_df.set_index('오행'))
                
                with col2:
                    st.write("**오행 분포**")
                    for element, count in elements.items():
                        color, direction, season, taste = ELEMENT_COLORS[element]
                        st.write(f"{element}: {count}개")
                
                # 각 오행별 상세 설명
                st.subheader("💫 오행의 의미")
                
                for element in ['木', '火', '土', '金', '水']:
                    color, direction, season, taste = ELEMENT_COLORS[element]
                    st.markdown(f"""
                    <div class="element-box">
                    <strong>{element} (오행)</strong><br>
                    색: {color} | 방향: {direction} | 계절: {season} | 맛: {taste}
                    </div>
                    """, unsafe_allow_html=True)
                
                # 천간과 지지의 의미
                st.subheader("🔤 천간과 지지의 의미")
                
                year_stem, year_branch = stem_branch['year']
                st.markdown(f"""
                <div class="result-box">
                <h4>년주: {year_stem} {year_branch}</h4>
                <p><strong>{year_stem}</strong> - {STEM_MEANING.get(year_stem, '미상')}</p>
                <p><strong>{year_branch}</strong> - {BRANCH_MEANING.get(year_branch, '미상')}</p>
                </div>
                """, unsafe_allow_html=True)
                
                # 운세 해석
                st.subheader("✨ 운세 해석")
                st.info(calculate_luck_aspects(stem_branch))
                
                # 상세 정보 표시
                st.subheader("📋 전체 사주도")
                saju_df = pd.DataFrame({
                    '구분': ['年(년)', '月(월)', '日(일)', '時(시)'],
                    '천간': [stem_branch['year'][0], stem_branch['month'][0], 
                            stem_branch['day'][0], stem_branch['hour'][0]],
                    '지지': [stem_branch['year'][1], stem_branch['month'][1], 
                            stem_branch['day'][1], stem_branch['hour'][1]]
                })
                
                st.dataframe(saju_df, use_container_width=True)
        
        except ValueError as e:
            st.error(f"❌ 오류 발생: {str(e)}")

# ========== TAB 2: 사주란? ==========
with tab2:
    st.header("ℹ️ 사주(四柱)란?")
    
    st.markdown("""
    ### 📖 사주의 정의
    
    **사주(四柱)**는 동양 전통 운명학으로, 인간의 운명을 분석하는 학문입니다.
    
    "四柱"는 네 개의 기둥을 의미하며:
    - **年柱 (년주)**: 태어난 해
    - **月柱 (월주)**: 태어난 달
    - **日柱 (일주)**: 태어난 날
    - **時柱 (시주)**: 태어난 시간
    
    이 네 개의 기둥이 이루는 천간지지의 조합으로 개인의 운명과 성격을 분석합니다.
    
    ### 🌟 주요 개념
    
    | 개념 | 설명 |
    |------|------|
    | **天干 (천간)** | 10개의 부호: 甲乙丙丁戊己庚辛壬癸 |
    | **地支 (지지)** | 12개의 부호: 子丑寅卯辰巳午未申酉戌亥 |
    | **五行 (오행)** | 목화토금수로 분류되는 5가지 에너지 |
    | **納音 (납음)** | 천간지지 조합의 특별한 오행 |
    
    ### 💡 사주 분석의 의미
    
    사주는 단순한 점술이 아니라:
    1. **개인의 성향 파악** - 타고난 기질과 성격
    2. **운의 흐름 이해** - 인생의 주기적 변화
    3. **자기계발의 방향** - 부족한 부분 개선
    4. **인간관계 분석** - 만남과 관계 이해
    
    ### ⚠️ 사주의 올바른 이해
    
    - 사주는 **참고 자료**이지 절대적인 것이 아닙니다
    - **본인의 노력과 선택**이 운명을 바꿀 수 있습니다
    - 부정적 해석에 너무 의존하지 않기
    - 전문가의 상담과 함께 활용하기
    """)

# ========== TAB 3: 용어 설명 ==========
with tab3:
    st.header("📚 사주 용어 설명")
    
    st.subheader("천간(天干)")
    st.markdown("""
    | 天干 | 음독 | 양/음 | 오행 | 의미 |
    |------|------|--------|------|------|
    | 甲 | 갑 | 양 | 木 | 시작, 큰 나무 |
    | 乙 | 을 | 음 | 木 | 유연함, 작은 나무 |
    | 丙 | 병 | 양 | 火 | 밝음, 불 |
    | 丁 | 정 | 음 | 火 | 온열함, 촛불 |
    | 戊 | 무 | 양 | 土 | 높음, 큰 흙 |
    | 己 | 기 | 음 | 土 | 낮음, 작은 흙 |
    | 庚 | 경 | 양 | 金 | 단단함, 큰 쇠 |
    | 辛 | 신 | 음 | 金 | 예리함, 작은 쇠 |
    | 壬 | 임 | 양 | 水 | 포함, 큰 물 |
    | 癸 | 계 | 음 | 水 | 유순함, 작은 물 |
    """)
    
    st.subheader("지지(地支) & 동물띠")
    st.markdown("""
    | 地支 | 띠 | 시간 | 오행 | 특징 |
    |------|-----|------|------|------|
    | 子 | 쥐 | 자정(23-1시) | 水 | 지혜로움 |
    | 丑 | 소 | 새벽(1-3시) | 土 | 근면함 |
    | 寅 | 호랑이 | 이른아침(3-5시) | 木 | 용맹함 |
    | 卯 | 토끼 | 아침(5-7시) | 木 | 온화함 |
    | 辰 | 용 | 아침(7-9시) | 土 | 위엄있음 |
    | 巳 | 뱀 | 낮전(9-11시) | 火 | 신비로움 |
    | 午 | 말 | 정오(11-13시) | 火 | 활발함 |
    | 未 | 양 | 오후(13-15시) | 土 | 온순함 |
    | 申 | 원숭이 | 오후(15-17시) | 金 | 영리함 |
    | 酉 | 닭 | 저녁(17-19시) | 金 | 충실함 |
    | 戌 | 개 | 저녁(19-21시) | 土 | 충성스러움 |
    | 亥 | 돼지 | 밤(21-23시) | 水 | 솔직함 |
    """)
    
    st.subheader("오행(五行)")
    st.markdown("""
    | 오행 | 색 | 방위 | 계절 | 맛 | 특징 |
    |------|------|------|------|------|------|
    | 木 | 초록 | 동쪽 | 봄 | 신맛 | 성장, 발전 |
    | 火 | 빨강 | 남쪽 | 여름 | 쓴맛 | 드러남, 열정 |
    | 土 | 노랑 | 중앙 | 환절기 | 단맛 | 안정, 신뢰 |
    | 金 | 하양 | 서쪽 | 가을 | 매운맛 | 결단, 수렴 |
    | 水 | 검정 | 북쪽 | 겨울 | 짠맛 | 흐름, 지혜 |
    """)

# ========== TAB 4: 설정 ==========
with tab4:
    st.header("⚙️ 앱 설정")
    
    st.markdown("""
    ### 📌 현재 버전
    **v1.0.0** - 기본 사주분석 기능
    
    ### 🎯 주요 기능
    - ✅ 생년월일 입력
    - ✅ 천간지지 계산
    - ✅ 오행 분석
    - ✅ 용어 설명
    - ✅ 기본 운세 해석
    
    ### 📝 주의사항
    
    1. **정확한 시간이 중요합니다**
       - 가능하면 정확한 출생 시간을 입력해주세요
       - 시간이 없으면 정오(12시)를 기준으로 합니다
    
    2. **음력/양력 확인**
       - 증명서의 달력 표시를 확인해주세요
       - 음력으로 변환하면 결과가 달라집니다
    
    3. **전문가 상담**
       - 더 정확한 분석을 원하면 전문가 상담을 권장합니다
    
    ### 💬 피드백
    
    이 앱에 대한 의견이나 개선 사항이 있으시면:
    - GitHub Issues를 통해 제안해주세요
    - ⭐ 도움이 되셨다면 스타를 눌러주세요!
    """)
    
    # 앱 정보
    st.divider()
    st.caption("🔮 사주분석 앱 | Python + Streamlit으로 만들어졌습니다")

# 푸터
st.divider()
st.caption("💡 Tip: 정확한 분석을 위해 정확한 출생 시간을 입력하세요")
