"""Quick test for sajuengine"""
from sajuengine.engine import generate_full_analysis
from sajuengine.models import BirthInput

# Test 1: Known date - 1990-05-15 14:00 male
inp = BirthInput(year=1990, month=5, day=15, hour=14, gender='male')
report = generate_full_analysis(inp)
p = report.pillars

print("=== Test 1: 1990-05-15 14:00 남성 ===")
print(f"년주: {p.year.full}")
print(f"월주: {p.month.full}")
print(f"일주: {p.day.full}")
print(f"시주: {p.hour.full if p.hour else 'N/A'}")
print(f"일간: {p.day_stem}")
print(f"오행: {report.element_stats.as_dict}")
print(f"음양: yin={report.yinyang_stats.yin}, yang={report.yinyang_stats.yang}")
print(f"강약: {report.strength.grade} ({report.strength.score}점)")
print(f"성격: {report.personality.summary}")
print(f"상호작용: {len(report.interactions)}개")
if report.luck_cycles:
    print(f"대운방향: {report.luck_cycles.direction}")
    print(f"대운시작: {report.luck_cycles.start_age}세")
    for lp in report.luck_cycles.pillars[:3]:
        print(f"  {lp.start_age}세: {lp.stem}{lp.branch}")

# Test 2: Known reference date - 2024-01-01 should be 壬辰
print("\n=== Test 2: 2024-01-01 일주 검증 ===")
inp2 = BirthInput(year=2024, month=1, day=1, hour=None, gender='female')
report2 = generate_full_analysis(inp2)
print(f"일주: {report2.pillars.day.full} (기대값: 壬辰)")
assert report2.pillars.day.stem == '壬', f"일간 오류: {report2.pillars.day.stem} != 壬"
assert report2.pillars.day.branch == '辰', f"일지 오류: {report2.pillars.day.branch} != 辰"
print("일주 검증 통과!")

# Test 3: Time unknown (scenarios)
print("\n=== Test 3: 시간 미입력 시나리오 ===")
inp3 = BirthInput(year=1985, month=8, day=20, hour=None, gender='male')
report3 = generate_full_analysis(inp3)
print(f"시나리오 수: {len(report3.time_scenarios)}개")
for sc in report3.time_scenarios:
    print(f"  {sc['label']}: 시주={sc['pillar'].full if sc['pillar'] else 'N/A'}")

print("\n모든 테스트 통과!")
