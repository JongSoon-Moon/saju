"use client";

import type { Pillars } from "@/lib/saju/types";
import { STEM_INFO, BRANCH_INFO } from "@/lib/saju/data";

/** Map element to Stitch color class */
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

function elementBorderClass(element: string): string {
  switch (element) {
    case "木": return "border-saju-wood";
    case "火": return "border-saju-fire";
    case "土": return "border-saju-earth";
    case "金": return "border-saju-metal";
    case "水": return "border-saju-water";
    default:  return "border-outline";
  }
}

interface SajuTableProps {
  pillars: Pillars;
}

const LABELS = ["時柱", "日柱", "月柱", "年柱"] as const;

export default function SajuTable({ pillars }: SajuTableProps) {
  const cols = [pillars.hour, pillars.day, pillars.month, pillars.year];

  return (
    <section className="space-y-4">
      <h3 className="font-headline font-bold text-lg flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-base">grid_view</span>
        四柱 原局 (Four Pillars)
      </h3>

      <div className="grid grid-cols-4 gap-3">
        {cols.map((pillar, idx) => {
          const label = LABELS[idx];
          if (!pillar) {
            return (
              <div key={label} className="flex flex-col items-center gap-2">
                <span className="font-headline text-[10px] uppercase tracking-widest text-outline font-bold">
                  {label}
                </span>
                <div className="w-full aspect-[3/4] bg-surface-container rounded-xl flex items-center justify-center">
                  <span className="text-outline text-2xl">?</span>
                </div>
              </div>
            );
          }

          const stemInfo = STEM_INFO[pillar.stem];
          const branchInfo = BRANCH_INFO[pillar.branch];
          const stemColor = elementColorClass(stemInfo.element);
          const branchColor = elementColorClass(branchInfo.element);
          const borderColor = elementBorderClass(stemInfo.element);

          return (
            <div key={label} className="flex flex-col items-center gap-2">
              {/* Column Header */}
              <span className="font-headline text-[10px] uppercase tracking-widest text-outline font-bold">
                {label}
              </span>

              {/* Card */}
              <div className={`w-full bg-surface-container-lowest rounded-xl border-t-4 ${borderColor} shadow-sm overflow-hidden`}>
                {/* Stem */}
                <div className={`${stemColor} py-3 text-center`}>
                  <div className="text-2xl font-bold">{pillar.stem}</div>
                  <div className="text-[10px] font-headline uppercase tracking-wider opacity-80">
                    {stemInfo.korean} · {stemInfo.element}
                  </div>
                </div>

                {/* Branch */}
                <div className={`${branchColor} py-3 text-center`}>
                  <div className="text-2xl font-bold">{pillar.branch}</div>
                  <div className="text-[10px] font-headline uppercase tracking-wider opacity-80">
                    {branchInfo.korean} · {branchInfo.animal}
                  </div>
                </div>

                {/* Hidden Stems */}
                <div className="bg-surface-container-low py-2 px-1 text-center">
                  <div className="text-[9px] font-headline uppercase tracking-wider text-outline mb-1">
                    藏干
                  </div>
                  <div className="text-xs font-bold text-on-surface-variant">
                    {pillar.hiddenStems.map(hs => hs.stem).join(" ")}
                  </div>
                </div>

                {/* Ten God */}
                <div className="py-2 px-1 text-center border-t border-outline-variant/10">
                  <div className="text-[9px] font-headline uppercase tracking-wider text-outline mb-1">
                    十神
                  </div>
                  <div className="text-xs font-bold text-primary">
                    {pillar.tenGod}
                  </div>
                </div>

                {/* Twelve Stage */}
                <div className="py-2 px-1 text-center border-t border-outline-variant/10">
                  <div className="text-[9px] font-headline uppercase tracking-wider text-outline mb-1">
                    12運
                  </div>
                  <div className="text-xs font-bold text-tertiary">
                    {pillar.twelveStage}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
