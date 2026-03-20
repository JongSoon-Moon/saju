"use client";

import type { ElementStats } from "@/lib/saju/types";

interface ElementChartProps {
  stats: ElementStats;
}

const ELEMENT_ROWS = [
  { key: "wood" as const, hanja: "木", korean: "목", bg: "bg-saju-wood" },
  { key: "fire" as const, hanja: "火", korean: "화", bg: "bg-saju-fire" },
  { key: "earth" as const, hanja: "土", korean: "토", bg: "bg-saju-earth" },
  { key: "metal" as const, hanja: "金", korean: "금", bg: "bg-saju-metal" },
  { key: "water" as const, hanja: "水", korean: "수", bg: "bg-saju-water" },
];

export default function ElementChart({ stats }: ElementChartProps) {
  const total = stats.total || 1;

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-5 space-y-4">
      <h3 className="font-headline font-bold text-base flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-base">
          donut_large
        </span>
        오행 분포 (Five Elements)
      </h3>

      <div className="space-y-3">
        {ELEMENT_ROWS.map((row) => {
          const count = stats[row.key];
          const pct = Math.round((count / total) * 100);
          return (
            <div key={row.key} className="flex items-center gap-3">
              {/* Label */}
              <div className="w-14 flex-shrink-0">
                <span className="font-headline text-xs font-bold">
                  {row.hanja} {row.korean}
                </span>
              </div>

              {/* Bar track */}
              <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                <div
                  className={`h-full ${row.bg} rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Percentage */}
              <span className="w-10 text-right font-headline text-xs font-bold text-outline">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
