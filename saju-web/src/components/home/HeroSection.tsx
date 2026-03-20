"use client";

interface HeroSectionProps {
  onAnalyzeClick: () => void;
}

export default function HeroSection({ onAnalyzeClick }: HeroSectionProps) {
  return (
    <section className="relative py-20 md:py-32 px-6 flex flex-col items-center text-center space-y-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f5f3ee] via-surface to-transparent -z-10" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />

      <span className="font-headline text-[10px] uppercase tracking-[0.3em] text-outline">
        Traditional Four Pillars Analysis
      </span>

      <h1 className="font-headline font-extrabold text-4xl md:text-6xl text-on-surface leading-tight max-w-2xl">
        Discover Your <span className="text-primary">Cosmic Blueprint</span>
      </h1>

      <p className="font-body text-on-surface-variant max-w-md leading-relaxed text-sm md:text-base">
        사주명리학에 기반한 정밀 분석으로 당신의 잠재력, 성격, 그리고 운의 흐름을 해석합니다.
      </p>

      <button
        onClick={onAnalyzeClick}
        className="mt-4 bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-bold text-sm tracking-widest uppercase flex items-center gap-3 shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all duration-200"
      >
        <span className="material-symbols-outlined text-lg">search</span>
        Analyze Now
      </button>
    </section>
  );
}
