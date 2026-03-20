"use client";

import type { LuckCycles, LuckPillar } from "@/lib/saju/types";
import { STEM_INFO, BRANCH_INFO } from "@/lib/saju/data";

interface LuckInterpretationProps {
  luckCycles: LuckCycles;
  currentYear: number;
  interpretation?: string;
}

export default function LuckInterpretation({
  luckCycles,
  currentYear,
  interpretation,
}: LuckInterpretationProps) {
  const current = luckCycles.pillars.find(
    (p) => currentYear >= p.startYear && currentYear <= p.endYear
  );

  if (!current) return null;

  const stemInfo = STEM_INFO[current.stem];
  const branchInfo = BRANCH_INFO[current.branch];

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-5 space-y-4">
      <h3 className="font-headline font-bold text-base flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-base">
          auto_awesome
        </span>
        현재 대운 해석
      </h3>

      <div className="bg-primary-container rounded-xl p-4 flex items-center gap-4">
        <div className="flex gap-2">
          <span className="text-2xl font-bold text-on-primary-container">
            {current.stem}
          </span>
          <span className="text-2xl font-bold text-on-primary-container">
            {current.branch}
          </span>
        </div>
        <div>
          <div className="font-headline text-xs font-bold text-primary">
            {stemInfo?.korean ?? ""} {branchInfo?.korean ?? ""}
          </div>
          <div className="text-[10px] text-on-primary-container/70">
            {current.startAge}세 ~ {current.endAge}세 ({current.startYear}–{current.endYear})
          </div>
        </div>
      </div>

      {interpretation && (
        <div className="text-sm leading-relaxed text-on-surface-variant whitespace-pre-line">
          {interpretation}
        </div>
      )}
    </section>
  );
}
