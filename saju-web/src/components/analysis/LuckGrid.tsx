"use client";

import type { LuckCycles, LuckPillar } from "@/lib/saju/types";
import { STEM_INFO, BRANCH_INFO } from "@/lib/saju/data";

interface LuckGridProps {
  luckCycles: LuckCycles;
  currentYear: number;
}

function elementColorClass(element: string): string {
  switch (element) {
    case "木": return "bg-saju-wood text-white";
    case "火": return "bg-saju-fire text-white";
    case "土": return "bg-saju-earth text-white";
    case "金": return "bg-saju-metal text-on-surface";
    case "水": return "bg-saju-water text-white";
    default:  return "bg-outline text-white";
  }
}

interface LuckCardProps {
  pillar: LuckPillar;
  isCurrent: boolean;
}

function LuckCard({ pillar, isCurrent }: LuckCardProps) {
  const stemInfo = STEM_INFO[pillar.stem];
  const branchInfo = BRANCH_INFO[pillar.branch];
  const stemColor = elementColorClass(stemInfo?.element ?? "");
  const branchColor = elementColorClass(branchInfo?.element ?? "");

  return (
    <div
      className={`rounded-2xl overflow-hidden border ${
        isCurrent
          ? "border-primary shadow-md ring-2 ring-primary/20"
          : "border-outline-variant/20"
      }`}
    >
      {/* Period label */}
      <div
        className={`text-center py-1.5 font-headline text-[10px] uppercase tracking-widest font-bold ${
          isCurrent
            ? "bg-primary text-on-primary"
            : "bg-surface-container text-outline"
        }`}
      >
        {pillar.startAge}세 ~ {pillar.endAge}세
        {isCurrent && (
          <span className="ml-1 text-[8px] bg-on-primary/20 px-1.5 py-0.5 rounded-full">
            현재
          </span>
        )}
      </div>

      {/* Stem & Branch */}
      <div className="grid grid-cols-2">
        <div className={`${stemColor} py-3 text-center`}>
          <div className="text-xl font-bold">{pillar.stem}</div>
          <div className="text-[9px] opacity-70">
            {stemInfo?.korean ?? ""}
          </div>
        </div>
        <div className={`${branchColor} py-3 text-center`}>
          <div className="text-xl font-bold">{pillar.branch}</div>
          <div className="text-[9px] opacity-70">
            {branchInfo?.korean ?? ""}
          </div>
        </div>
      </div>

      {/* Extra info */}
      <div className="bg-surface-container-lowest p-2 text-center">
        <span className="text-[10px] text-outline">
          {pillar.startYear}–{pillar.endYear}
        </span>
      </div>
    </div>
  );
}

export default function LuckGrid({ luckCycles, currentYear }: LuckGridProps) {
  const pillars = luckCycles.pillars;

  // Split into past, current, future
  const past: LuckPillar[] = [];
  const future: LuckPillar[] = [];
  let current: LuckPillar | null = null;

  for (const p of pillars) {
    if (currentYear >= p.startYear && currentYear <= p.endYear) {
      current = p;
    } else if (p.endYear < currentYear) {
      past.push(p);
    } else {
      future.push(p);
    }
  }

  return (
    <section className="space-y-6">
      <h3 className="font-headline font-bold text-base flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-base">
          timeline
        </span>
        대운 흐름 (Major Luck Cycles)
      </h3>

      {/* Current */}
      {current && (
        <div>
          <span className="font-headline text-[10px] uppercase tracking-widest text-primary font-bold mb-2 block">
            현재 대운 (Current Cycle)
          </span>
          <LuckCard pillar={current} isCurrent={true} />
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <span className="font-headline text-[10px] uppercase tracking-widest text-outline font-bold mb-2 block">
            지나간 대운 (Past)
          </span>
          <div className="grid grid-cols-2 gap-3">
            {past.map((p, i) => (
              <LuckCard key={i} pillar={p} isCurrent={false} />
            ))}
          </div>
        </div>
      )}

      {/* Future */}
      {future.length > 0 && (
        <div>
          <span className="font-headline text-[10px] uppercase tracking-widest text-outline font-bold mb-2 block">
            다가올 대운 (Future)
          </span>
          <div className="grid grid-cols-2 gap-3">
            {future.map((p, i) => (
              <LuckCard key={i} pillar={p} isCurrent={false} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
