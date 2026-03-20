const STEPS = [
  {
    icon: "calendar_today",
    title: "1. Enter Birth Info",
    desc: "생년월일과 출생 시간을 입력합니다.",
  },
  {
    icon: "auto_awesome",
    title: "2. AI Analysis",
    desc: "명리학 알고리즘이 사주 원국을 산출하고 분석합니다.",
  },
  {
    icon: "insights",
    title: "3. View Results",
    desc: "오행, 십신, 대운 등 종합 분석 결과를 확인합니다.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 px-6 bg-surface-container-low">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-headline font-extrabold text-2xl text-center text-on-surface mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div
              key={step.title}
              className="bg-surface-container-lowest p-8 rounded-2xl text-center space-y-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-primary text-2xl">
                  {step.icon}
                </span>
              </div>
              <h3 className="font-headline font-bold text-sm uppercase tracking-wider text-on-surface">
                {step.title}
              </h3>
              <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
