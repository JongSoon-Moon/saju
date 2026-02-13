"""
🔮 사주명리 분석 앱 v2.0
========================
전통 동양 명리학(사주팔자) 이론 기반 종합 분석 Streamlit 앱.
"""

import streamlit as st
import pandas as pd

from sajuengine.models import BirthInput
from sajuengine.engine import (
    validate_input,
    generate_full_analysis,
    generate_time_scenarios,
)
from sajuengine.interpretation import (
    generate_element_interpretation,
    generate_yinyang_interpretation,
    generate_strength_interpretation,
    generate_interaction_interpretation,
    generate_luck_interpretation,
    calculate_element_balance_score,
    calculate_interaction_score,
)
from sajuengine.data import (
    STEM_INFO, BRANCH_INFO, ELEMENT_COLORS, ELEMENT_KOREAN,
    ELEMENT_DETAILS, TEN_GOD_DESC, TWELVE_STAGE_DESC, DISCLAIMER,
)

# ========== 페이지 설정 ==========
st.set_page_config(
    page_title="사주명리 분석 v2.0",
    page_icon="🔮",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ========== CSS 스타일 ==========
st.markdown("""
<style>
    .main-title { text-align: center; color: #5D3A1A; font-size: 2.8em; font-weight: bold; margin-bottom: 5px; }
    .subtitle { text-align: center; color: #8B7355; font-size: 1.1em; margin-bottom: 20px; }
    .saju-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    .saju-table th, .saju-table td {
        text-align: center; padding: 10px 8px; border: 1px solid #D2B48C; font-size: 1.3em;
    }
    .saju-table th { background: #8B4513; color: white; font-size: 0.9em; }
    .saju-table .stem { background: #FFF8DC; color: #8B0000; font-weight: bold; font-size: 1.5em; }
    .saju-table .branch { background: #FFFACD; color: #191970; font-weight: bold; font-size: 1.5em; }
    .saju-table .hidden { background: #FFF5EE; color: #556B2F; font-size: 0.85em; }
    .saju-table .tengod { background: #F0F8FF; color: #4169E1; font-size: 0.8em; }
    .saju-table .stage { background: #FFF0F5; color: #8B008B; font-size: 0.8em; }
    .score-card { background: linear-gradient(135deg, #FFF8DC, #FFE4B5);
        border: 2px solid #D2B48C; border-radius: 12px; padding: 15px; text-align: center; margin: 5px; }
    .score-card h3 { color: #8B4513; margin: 5px 0; font-size: 1.1em; }
    .score-card p { color: #5D3A1A; margin: 3px 0; font-size: 1.4em; font-weight: bold; }
    .interaction-pos { color: #4169E1; font-weight: bold; }
    .interaction-neg { color: #DC143C; font-weight: bold; }
    .disclaimer-box { background: #FFF3CD; border: 1px solid #FFC107; border-radius: 8px;
        padding: 15px; margin-top: 20px; font-size: 0.85em; }
</style>
""", unsafe_allow_html=True)


# ========== 세션 상태 초기화 ==========
if 'report' not in st.session_state:
    st.session_state.report = None
if 'analyzed' not in st.session_state:
    st.session_state.analyzed = False


# ========== 사이드바: 입력 화면 ==========
def render_sidebar():
    with st.sidebar:
        st.markdown("## 🔮 사주 분석 입력")
        st.caption("생년월일시를 입력하고 분석 버튼을 누르세요.")

        st.markdown("### 📅 기본 정보")
        col1, col2 = st.columns(2)
        with col1:
            year = st.number_input("년", 1900, 2100, 1990, step=1, key="year")
        with col2:
            cal_type = st.radio("달력", ["양력", "음력"], horizontal=True, key="cal")

        col1, col2 = st.columns(2)
        with col1:
            month = st.number_input("월", 1, 12, 1, step=1, key="month")
        with col2:
            day = st.number_input("일", 1, 31, 1, step=1, key="day")

        is_leap = False
        if cal_type == "음력":
            is_leap = st.checkbox("윤달", key="leap")

        st.markdown("### ⏰ 출생 시간")
        time_known = st.radio("시간을 아십니까?", ["예", "모름"], horizontal=True, key="time_known")
        hour = None
        if time_known == "예":
            hour = st.slider("시각 (0~23시)", 0, 23, 12, key="hour")

        st.markdown("### 👤 추가 정보")
        gender_opt = st.radio("성별", ["남", "여", "선택 안함"], horizontal=True, key="gender")
        gender_map = {"남": "male", "여": "female", "선택 안함": None}
        gender = gender_map[gender_opt]

        name = st.text_input("이름 (선택)", key="name", placeholder="홍길동")

        st.divider()
        if st.button("🔍 사주 분석하기", type="primary", use_container_width=True):
            inp = BirthInput(
                year=year, month=month, day=day,
                hour=hour,
                calendar_type='solar' if cal_type == '양력' else 'lunar',
                is_leap_month=is_leap,
                gender=gender,
                name=name if name else None,
            )

            errors = validate_input(inp)
            if errors:
                for e in errors:
                    st.error(f"❌ {e}")
            else:
                with st.spinner("사주를 분석 중입니다..."):
                    report = generate_full_analysis(inp)
                    st.session_state.report = report
                    st.session_state.analyzed = True
                st.success("✅ 분석 완료!")

        st.divider()
        st.caption("⚠️ 본 분석은 전통 명리학 이론 기반 참고 자료이며 과학적 예측이 아닙니다.")


# ========== 사주 원국표 ==========
def render_saju_table(report):
    p = report.pillars
    pillars_data = [
        ('時柱', p.hour),
        ('日柱', p.day),
        ('月柱', p.month),
        ('年柱', p.year),
    ]

    html = '<table class="saju-table">'
    html += '<tr>'
    for label, _ in pillars_data:
        html += f'<th>{label}</th>'
    html += '</tr>'

    # 천간
    html += '<tr>'
    for _, pillar in pillars_data:
        if pillar:
            si = STEM_INFO[pillar.stem]
            html += f'<td class="stem" title="{si["korean"]}({si["element"]},{si["yinyang"]})">{pillar.stem}</td>'
        else:
            html += '<td class="stem" style="color:#999">?</td>'
    html += '</tr>'

    # 지지
    html += '<tr>'
    for _, pillar in pillars_data:
        if pillar:
            bi = BRANCH_INFO[pillar.branch]
            html += f'<td class="branch" title="{bi["korean"]}({bi["animal"]},{bi["element"]})">{pillar.branch}</td>'
        else:
            html += '<td class="branch" style="color:#999">?</td>'
    html += '</tr>'

    # 지장간
    html += '<tr>'
    for _, pillar in pillars_data:
        if pillar:
            hs_text = ' '.join(hs.stem for hs in pillar.hidden_stems)
            html += f'<td class="hidden">{hs_text}</td>'
        else:
            html += '<td class="hidden">-</td>'
    html += '</tr>'

    # 십신
    html += '<tr>'
    for _, pillar in pillars_data:
        if pillar:
            html += f'<td class="tengod">{pillar.ten_god}</td>'
        else:
            html += '<td class="tengod">-</td>'
    html += '</tr>'

    # 12운성
    html += '<tr>'
    for _, pillar in pillars_data:
        if pillar:
            html += f'<td class="stage">{pillar.twelve_stage}</td>'
        else:
            html += '<td class="stage">-</td>'
    html += '</tr>'

    html += '</table>'
    html += '<div style="font-size:0.75em; color:#888; margin-top:5px; text-align:center;">'
    html += '행 순서: 천간 | 지지 | 지장간 | 십신 | 12운성</div>'

    st.markdown(html, unsafe_allow_html=True)


# ========== 오행 차트 ==========
def render_element_chart(report):
    el = report.element_stats_with_hidden
    pcts = el.percentages
    values = el.as_dict

    chart_data = pd.DataFrame({
        '오행': list(values.keys()),
        '수치': [round(v, 1) for v in values.values()],
    }).set_index('오행')

    col1, col2 = st.columns([3, 2])

    with col1:
        st.bar_chart(chart_data, color='#D2B48C')

    with col2:
        for element in ['木', '火', '土', '金', '水']:
            pct = pcts.get(element, 0)
            v = values.get(element, 0)
            color = ELEMENT_COLORS.get(element, '#888')
            bar_width = max(5, int(pct * 2))
            st.markdown(
                f'<div style="margin:4px 0;">'
                f'<span style="display:inline-block;width:60px;font-weight:bold;">{ELEMENT_KOREAN[element]}</span>'
                f'<span style="display:inline-block;width:{bar_width}px;height:16px;'
                f'background:{color};border-radius:3px;vertical-align:middle;"></span>'
                f' <span style="font-size:0.9em;">{v:.1f} ({pct}%)</span></div>',
                unsafe_allow_html=True,
            )
        if el.missing:
            missing_names = ', '.join(ELEMENT_KOREAN[m] for m in el.missing)
            st.warning(f"⚠️ 부족: {missing_names}")


# ========== 핵심 카드 ==========
def render_summary_cards(report):
    p = report.pillars
    strength = report.strength
    el = report.element_stats_with_hidden

    ds = p.day_stem
    ds_info = STEM_INFO[ds]
    animal = BRANCH_INFO[p.year.branch]['animal']

    cols = st.columns(4)

    with cols[0]:
        st.markdown(
            f'<div class="score-card"><h3>🏋️ 신강/신약</h3>'
            f'<p>{strength.grade}</p>'
            f'<span style="font-size:0.8em;">{strength.score:.0f}점</span></div>',
            unsafe_allow_html=True)

    with cols[1]:
        st.markdown(
            f'<div class="score-card"><h3>☯️ 일간</h3>'
            f'<p>{ds} {ds_info["element"]}</p>'
            f'<span style="font-size:0.8em;">{ds_info["korean"]} ({ds_info["yinyang"]})</span></div>',
            unsafe_allow_html=True)

    with cols[2]:
        st.markdown(
            f'<div class="score-card"><h3>🐉 띠</h3>'
            f'<p>{animal}띠</p>'
            f'<span style="font-size:0.8em;">{p.year.branch}({BRANCH_INFO[p.year.branch]["korean"]})</span></div>',
            unsafe_allow_html=True)

    with cols[3]:
        st.markdown(
            f'<div class="score-card"><h3>🌊 오행</h3>'
            f'<p>{ELEMENT_KOREAN[el.dominant]} 강</p>'
            f'<span style="font-size:0.8em;">{ELEMENT_KOREAN[el.weakest]} 약</span></div>',
            unsafe_allow_html=True)


# ========== 탭 1: 분석 요약 ==========
def render_summary_tab(report):
    inp = report.input
    p = report.pillars

    name_text = f" — {inp.name}님" if inp.name else ""
    cal_text = "양력" if inp.calendar_type == 'solar' else "음력"
    hour_text = f" {inp.hour}시" if inp.hour is not None else ""
    gender_text = {"male": " 남성", "female": " 여성"}.get(inp.gender, "")

    st.markdown(
        f'### 📊 사주 분석 결과{name_text}\n'
        f'{inp.year}년 {inp.month}월 {inp.day}일 ({cal_text}){hour_text}{gender_text}'
    )

    if inp.hour is None:
        st.info("⏰ 출생 시간을 입력하지 않아 **시주(時柱) 없이 3주 기반**으로 분석합니다.")

    st.markdown("#### 📋 사주 원국표")
    render_saju_table(report)

    st.divider()
    render_summary_cards(report)
    st.divider()

    # 오행 분포
    st.markdown("#### 🌊 오행(五行) 분포")
    render_element_chart(report)

    el_interp = generate_element_interpretation(report.element_stats_with_hidden)
    st.markdown(el_interp['interpretation'])
    if el_interp['advice']:
        with st.expander("💡 오행 조언"):
            for a in el_interp['advice']:
                st.write(f"• {a}")

    st.divider()

    # 음양 균형
    st.markdown("#### ☯️ 음양 균형")
    yy = report.yinyang_stats
    yy_interp = generate_yinyang_interpretation(yy)

    col1, col2 = st.columns([1, 2])
    with col1:
        st.metric("陽 (양)", yy.yang)
        st.metric("陰 (음)", yy.yin)
    with col2:
        st.write(yy_interp['interpretation'])
        st.caption(f"💡 {yy_interp['advice']}")

    st.divider()

    # 성격 요약
    if report.personality:
        st.markdown("#### ✨ 성격 요약")
        st.info(report.personality.summary)

        for detail in report.personality.details:
            with st.expander(f"📌 {detail['subtitle']}"):
                st.write(detail['content'])
                if detail.get('evidence'):
                    st.caption("근거: " + " / ".join(detail['evidence'][:3]))


# ========== 탭 2: 상세 분석 ==========
def render_detail_tab(report):
    p = report.pillars

    sub_tabs = st.tabs(["🔟 십신 분석", "🔄 12운성", "⚡ 합·충 관계", "🏋️ 신강·신약"])

    with sub_tabs[0]:
        st.markdown("### 🔟 십신(十神) 분석")
        st.caption("일간을 기준으로 나머지 글자와의 관계를 분석합니다.")

        tg = report.ten_god_stats
        group_counts = tg.get_group_counts()

        for group, count in group_counts.items():
            bar = '█' * int(count) + '░' * (6 - int(count))
            highlight = ' ⭐ 최다' if group == tg.dominant_group else ''
            st.write(f"**{group}** {bar} {count}개{highlight}")

        st.write(f"\n💡 **{tg.dominant_group}**이(가) 가장 강하여, "
                f"{_get_group_short_desc(tg.dominant_group)}의 특성이 두드러집니다.")

        with st.expander("📍 십신 배치 상세"):
            for pos in tg.positions:
                pillar_kr = {'year': '년주', 'month': '월주', 'day': '일주', 'hour': '시주'}.get(pos.pillar, pos.pillar)
                pos_kr = {'stem': '천간', 'branch': '지지(본기)', 'hidden': '지장간'}.get(pos.position, pos.position)
                desc = TEN_GOD_DESC.get(pos.ten_god, '')
                st.write(f"• **{pillar_kr} {pos_kr}** {pos.char} → **{pos.ten_god}**: {desc}")

    with sub_tabs[1]:
        st.markdown("### 🔄 12운성(十二運星)")
        st.caption(f"일간 {p.day_stem}이(가) 각 지지에서의 생왕사절 단계입니다.")

        stage_data = []
        labels = {'year': '년지', 'month': '월지', 'day': '일지', 'hour': '시지'}
        for name, pillar in [('year', p.year), ('month', p.month), ('day', p.day), ('hour', p.hour)]:
            if pillar:
                stage_data.append({
                    '위치': labels[name], '지지': pillar.branch,
                    '12운성': pillar.twelve_stage,
                    '의미': TWELVE_STAGE_DESC.get(pillar.twelve_stage, ''),
                })

        if stage_data:
            st.dataframe(pd.DataFrame(stage_data), use_container_width=True, hide_index=True)

    with sub_tabs[2]:
        st.markdown("### ⚡ 합·충 관계")
        interactions = report.interactions

        if not interactions:
            st.info("원국에서 특별한 합·충 관계가 발견되지 않았습니다.")
        else:
            interp = generate_interaction_interpretation(interactions)
            score_info = calculate_interaction_score(interactions)

            st.metric("조화 점수", f"{score_info['harmony_score']}/100",
                     delta=f"합 {score_info['positive_count']}개 / 충 {score_info['negative_count']}개")

            for item in interp:
                cls = "interaction-pos" if item['icon'] == '✅' else "interaction-neg"
                st.markdown(
                    f'{item["icon"]} <span class="{cls}">[{item["type"]}]</span> '
                    f'**{item["name"]}** ({item["positions"]})',
                    unsafe_allow_html=True)
                st.caption(f"  → {item['description']}")

    with sub_tabs[3]:
        st.markdown("### 🏋️ 신강·신약 판단")
        strength = report.strength
        s_interp = generate_strength_interpretation(strength)

        col1, col2 = st.columns([1, 2])
        with col1:
            st.metric("힘 점수", f"{strength.score:.0f} / 100")
            st.metric("판정", strength.grade)
        with col2:
            st.write(s_interp['interpretation'])

        with st.expander("💡 판단 근거"):
            for ev in s_interp['evidence']:
                st.write(f"• {ev}")

        st.markdown("#### 💬 조언")
        for a in s_interp['advice']:
            st.success(f"💡 {a}")


# ========== 탭 3: 대운 타임라인 ==========
def render_timeline_tab(report):
    st.markdown("### 📅 대운(大運) 타임라인")

    luck = report.luck_cycles
    luck_interp = generate_luck_interpretation(luck, report.pillars.day_stem)

    if not luck_interp['available']:
        st.warning(luck_interp['message'])
        st.info("사이드바에서 **성별**을 선택하면 대운을 산출할 수 있습니다.")
        return

    st.write(f"**방향**: {luck_interp['direction']} | **대운 시작**: {luck_interp['start_age']}세")

    if luck_interp['current_text']:
        st.info(f"📍 {luck_interp['current_text']}")

    st.divider()

    timeline = luck_interp['timeline']
    num_cols = min(len(timeline), 5)
    rows = [timeline[i:i+num_cols] for i in range(0, len(timeline), num_cols)]

    for row in rows:
        cols = st.columns(len(row))
        for j, item in enumerate(row):
            with cols[j]:
                bg = '#FFD700' if item['is_current'] else '#FFF8DC'
                border = '3px solid #8B4513' if item['is_current'] else '1px solid #D2B48C'
                current_badge = '<span style="color:red;font-size:0.7em;">◀ 현재</span>' if item['is_current'] else ''

                st.markdown(
                    f'<div style="background:{bg};border:{border};border-radius:10px;'
                    f'padding:12px;text-align:center;min-height:180px;">'
                    f'<div style="font-size:1.8em;font-weight:bold;">{item["pillar"]}</div>'
                    f'<div style="font-size:0.85em;color:#555;">{item["element"]} · {item["ten_god"]}</div>'
                    f'<div style="font-size:0.85em;margin-top:5px;">{item["start_age"]}~{item["end_age"]}세</div>'
                    f'<div style="font-size:0.75em;color:#888;">{item["start_year"]}~{item["end_year"]}년</div>'
                    f'{current_badge}'
                    f'<div style="font-size:0.7em;color:#666;margin-top:8px;">{item["relation"]}</div>'
                    f'</div>',
                    unsafe_allow_html=True)

    with st.expander("📊 대운 상세 테이블"):
        df = pd.DataFrame([{
            '대운': item['pillar'], '오행': item['element'], '십신': item['ten_god'],
            '시작나이': item['start_age'], '종료나이': item['end_age'],
            '시작년도': item['start_year'], '종료년도': item['end_year'],
            '해석': item['relation'],
        } for item in timeline])
        st.dataframe(df, use_container_width=True, hide_index=True)


# ========== 탭 4: 사주 정보 ==========
def render_info_tab():
    sub_tabs = st.tabs(["ℹ️ 사주란?", "📚 천간·지지", "🌊 오행", "🔟 십신", "🔄 12운성"])

    with sub_tabs[0]:
        st.markdown("""
        ### 📖 사주(四柱)란?

        **사주(四柱)**는 동양 전통 운명학으로, 태어난 **년·월·일·시**의 네 기둥(柱)을
        천간(天干)과 지지(地支)로 표현하여 인간의 성향과 운의 흐름을 분석하는 학문입니다.

        | 기둥 | 의미 | 대표 영역 |
        |------|------|----------|
        | **年柱** | 태어난 해 | 조상, 사회적 환경 |
        | **月柱** | 태어난 달 | 부모, 성장 환경 |
        | **日柱** | 태어난 날 | 자기 자신, 배우자 |
        | **時柱** | 태어난 시간 | 자녀, 말년 |

        #### 🔑 핵심 개념
        - **일간(日干)**: 일주의 천간으로, 사주 분석의 **중심**입니다.
        - **오행(五行)**: 木·火·土·金·水 — 우주 만물의 기본 에너지
        - **십신(十神)**: 일간과 다른 글자의 관계 — 성격·운명의 핵심

        #### ⚠️ 올바른 이해
        사주는 **참고 자료**이지 절대적 운명이 아닙니다.
        **본인의 노력과 선택**이 가장 중요합니다.
        """)

    with sub_tabs[1]:
        st.markdown("### 천간(天干) 10자")
        stem_data = []
        for s in ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']:
            si = STEM_INFO[s]
            stem_data.append({'천간': s, '음독': si['korean'], '음양': si['yinyang'],
                            '오행': si['element'], '의미': si['desc']})
        st.dataframe(pd.DataFrame(stem_data), use_container_width=True, hide_index=True)

        st.markdown("### 지지(地支) 12자")
        branch_data = []
        for b in ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']:
            bi = BRANCH_INFO[b]
            branch_data.append({'지지': b, '음독': bi['korean'], '띠': bi['animal'],
                              '오행': bi['element'], '음양': bi['yinyang'], '시간': bi['time']})
        st.dataframe(pd.DataFrame(branch_data), use_container_width=True, hide_index=True)

    with sub_tabs[2]:
        st.markdown("### 🌊 오행(五行)")
        for el in ['木', '火', '土', '金', '水']:
            d = ELEMENT_DETAILS[el]
            color = ELEMENT_COLORS[el]
            st.markdown(
                f'<div style="border-left:5px solid {color};padding:10px;margin:8px 0;'
                f'background:#FAFAFA;border-radius:4px;">'
                f'<strong style="font-size:1.2em;">{ELEMENT_KOREAN[el]}</strong><br>'
                f'🎨 {d["color"]} | 🧭 {d["direction"]} | 🌸 {d["season"]} | '
                f'😋 {d["taste"]} | 🏥 {d["organ"]}<br>'
                f'💫 특성: {d["nature"]}</div>',
                unsafe_allow_html=True)

    with sub_tabs[3]:
        st.markdown("### 🔟 십신(十神)")
        for god, desc in TEN_GOD_DESC.items():
            st.write(f"**{god}** — {desc}")

    with sub_tabs[4]:
        st.markdown("### 🔄 12운성(十二運星)")
        for stage, desc in TWELVE_STAGE_DESC.items():
            st.write(f"**{stage}** — {desc}")


# ========== 유틸리티 ==========
def _get_group_short_desc(group):
    return {'비겁': '독립·경쟁', '식상': '창의·표현', '재성': '재물·실행',
            '관성': '사회성·책임', '인성': '학습·사고'}.get(group, '')


# ========== 메인 앱 ==========
def main():
    st.markdown('<p class="main-title">🔮 사주명리 분석</p>', unsafe_allow_html=True)
    st.markdown('<p class="subtitle">전통 명리학 기반 종합 사주 분석 서비스 v2.0</p>', unsafe_allow_html=True)

    render_sidebar()

    if st.session_state.analyzed and st.session_state.report:
        report = st.session_state.report

        tabs = st.tabs(["📊 분석 요약", "📋 상세 분석", "📅 대운 타임라인", "ℹ️ 사주 정보"])

        with tabs[0]:
            render_summary_tab(report)
        with tabs[1]:
            render_detail_tab(report)
        with tabs[2]:
            render_timeline_tab(report)
        with tabs[3]:
            render_info_tab()

        # 시간 모름 시나리오
        if report.input.hour is None:
            with st.expander("⏰ 출생 시간별 시나리오 비교"):
                scenarios = generate_time_scenarios(report.input, report.pillars)
                cols = st.columns(3)
                for i, sc in enumerate(scenarios):
                    with cols[i]:
                        st.markdown(f"**{sc['label']}**")
                        if sc['pillar']:
                            st.write(f"시주: {sc['pillar'].full}")
                            st.write(f"십신: {sc['ten_god']}")
                            st.write(f"12운성: {sc['twelve_stage']}")

        st.markdown(f'<div class="disclaimer-box">{DISCLAIMER}</div>', unsafe_allow_html=True)

    else:
        st.markdown("---")
        st.markdown("""
        #### 🎯 사용 방법
        1. **왼쪽 사이드바**에서 생년월일시를 입력하세요
        2. **🔍 사주 분석하기** 버튼을 클릭하세요
        3. 결과가 여러 탭으로 표시됩니다

        #### 📌 분석 항목
        - 📊 **사주 원국표** — 4주 8자, 지장간, 십신, 12운성
        - 🌊 **오행 분석** — 木火土金水 분포 및 균형
        - ☯️ **음양 분석** — 양과 음의 비율
        - 🔟 **십신 분석** — 일간 기준 관계 분석
        - 🏋️ **신강·신약** — 일간의 힘 판정
        - ⚡ **합·충 관계** — 천간·지지 상호작용
        - 📅 **대운 타임라인** — 10년 주기 운의 흐름
        - ✨ **성격 분석** — 종합 성격 프로필
        """)

        st.divider()
        render_info_tab()

    st.divider()
    st.caption("🔮 사주명리 분석 v2.0 | Python + Streamlit | 전통 명리학 이론 기반 참고 자료")


if __name__ == "__main__":
    main()
else:
    main()
