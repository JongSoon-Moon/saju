"use client";

import type { Pillars } from "@/lib/saju/types";
import { TWELVE_STAGE_DESC } from "@/lib/saju/data";

interface TwelveStagesTableProps {
  pillars: Pillars;
}

const COL_LABELS = ["時柱", "日柱", "月柱", "年柱"] as const;

export default function TwelveStagesTable({ pillars }: TwelveStagesTableProps) {
  const cols = [pillars.hour, pillars.day, pillars.month, pillars.year];

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-5 space-y-4">
      <h3 className="font-headline font-bold text-base flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-base">
          cycle
        </span>
        12운성 (Twelve Life Stages)
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-outline-variant/20">
              <th className="py-2 px-2 text-left font-headline text-[10px] uppercase tracking-widest text-outline">
                구분
              </th>
              {COL_LABELS.map((label) => (
                <th
                  key={label}
                  className="py-2 px-2 text-center font-headline text-[10px] uppercase tracking-widest text-outline"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Branch */}
            <tr className="border-b border-outline-variant/10">
              <td className="py-2 px-2 font-headline text-[10px] uppercase tracking-widest text-outline">
                地支
              </td>
              {cols.map((p, i) => (
                <td
                  key={i}
                  className="py-2 px-2 text-center font-bold text-on-surface"
                >
                  {p?.branch ?? "—"}
                </td>
              ))}
            </tr>

            {/* Stage */}
            <tr className="border-b border-outline-variant/10">
              <td className="py-2 px-2 font-headline text-[10px] uppercase tracking-widest text-outline">
                12운성
              </td>
              {cols.map((p, i) => (
                <td
                  key={i}
                  className="py-2 px-2 text-center font-bold text-primary"
                >
                  {p?.twelveStage ?? "—"}
                </td>
              ))}
            </tr>

            {/* Meaning */}
            <tr>
              <td className="py-2 px-2 font-headline text-[10px] uppercase tracking-widest text-outline">
                의미
              </td>
              {cols.map((p, i) => {
                const desc =
                  p?.twelveStage && TWELVE_STAGE_DESC[p.twelveStage]
                    ? TWELVE_STAGE_DESC[p.twelveStage]
                    : "—";
                return (
                  <td
                    key={i}
                    className="py-2 px-2 text-center text-[10px] text-on-surface-variant leading-snug"
                  >
                    {desc}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
