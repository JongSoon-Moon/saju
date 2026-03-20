export default function AboutSection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto bg-surface-container-lowest p-8 md:p-12 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">menu_book</span>
          <h2 className="font-headline font-extrabold text-xl text-on-surface">About Saju</h2>
        </div>
        <p className="font-body text-on-surface-variant leading-relaxed text-sm">
          사주(四柱)는 동양 전통 운명학으로, 태어난 년·월·일·시의 네 기둥(柱)을 천간(天干)과
          지지(地支)로 표현하여 인간의 성향과 운의 흐름을 분석하는 학문입니다. 오행(五行) —
          木·火·土·金·水의 조화와 균형을 통해 잠재력과 기질을 해석합니다.
        </p>
        <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/10">
          <span className="material-symbols-outlined text-outline text-sm">info</span>
          <p className="font-body text-xs text-outline leading-relaxed">
            본 분석은 전통 명리학 기반 참고 자료이며, 과학적 예측이 아닙니다.
          </p>
        </div>
      </div>
    </section>
  );
}
