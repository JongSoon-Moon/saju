"use client";

import type { TenGodStats } from "@/lib/saju/types";
import { TEN_GOD_GROUPS, TEN_GOD_GROUP_DESC } from "@/lib/saju/data";

interface TenGodsChartProps {
  tenGodStats: TenGodStats;
}

const GROUP_COLORS: Record<string, string> = {
  "비겁": "bg-saju-wood",
  "식상": "bg-saju-fire",
  "재성": "bg-saju-earth",
  "관성": "bg-saju-metal",
  "인성": "bg-saju-water",
};

const GROUP_ICONS: Record<string, string> = {
  "비겁": "group",
  "식상": "restaurant",
  "재성": "payments",
  "관성": "gavel",
  "인성": "school",
};

export default function TenGodsChart({ tenGodStats }: TenGodsChartProps) {
  const groupNames = Object.keys(TEN_GOD_GROUPS);

  // Compute group counts from individual ten god counts
  const groupCounts: Record<string, number> = {};
  for (const group of groupNames) {
    const gods = TEN_GOD_GROUPS[group] ?? [];
    groupCounts[group] = gods.reduce(
      (sum, god) => sum + (tenGodStats.counts[god] ?? 0),
      0
    );
  }
  const total = Object.values(groupCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-5 space-y-4">
      <h3 className="font-headline font-bold text-base flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-base">
          hub
        </span>
        십신 분포 (Ten Gods)
      </h3>

      <div className="space-y-3">
        {groupNames.map((group) => {
          const count = groupCounts[group] ?? 0;
          const pct = Math.round((count / total) * 100);
          const desc = TEN_GOD_GROUP_DESC[group] ?? "";
          const icon = GROUP_ICONS[group] ?? "circle";
          const color = GROUP_COLORS[group] ?? "bg-outline";

          return (
            <div key={group} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-headline text-xs font-bold text-on-surface">
                  <span className="material-symbols-outlined text-sm text-outline">
                    {icon}
                  </span>
                  {group}
                  <span className="text-[10px] font-normal text-outline">
                    {desc}
                  </span>
                </span>
                <span className="font-headline text-xs font-bold text-outline">
                  {count}개 ({pct}%)
                </span>
              </div>
              <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Positions */}
      <div className="mt-4">
        <span className="font-headline text-[10px] uppercase tracking-widest text-outline font-bold">
          위치별 십신
        </span>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {tenGodStats.positions.map((pos, i) => (
            <div
              key={i}
              className="bg-surface-container rounded-xl p-2 text-center"
            >
              <div className="text-[9px] font-headline uppercase tracking-wider text-outline">
                {pos.pillar}柱
              </div>
              <div className="text-xs font-bold text-primary mt-0.5">
                {pos.tenGod}
              </div>
              <div className="text-[9px] text-outline mt-0.5">
                {pos.char}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
