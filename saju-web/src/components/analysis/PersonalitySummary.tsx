"use client";

import type { TopicReport } from "@/lib/saju/types";

interface PersonalitySummaryProps {
  personality: TopicReport;
}

export default function PersonalitySummary({
  personality,
}: PersonalitySummaryProps) {
  return (
    <section className="bg-surface-container-lowest rounded-2xl p-5 space-y-4">
      <h3 className="font-headline font-bold text-base flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-base">
          psychology
        </span>
        성격 분석 (Personality)
      </h3>

      {/* Score & Grade */}
      <div className="bg-primary-container rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-headline text-xs uppercase tracking-widest text-primary opacity-70">
              {personality.topic}
            </span>
            <p className="font-headline text-xl font-bold text-on-primary-container mt-1">
              {personality.grade}
            </p>
          </div>
          <div className="text-right">
            <span className="font-headline text-2xl font-bold text-primary">
              {personality.score}
            </span>
            <span className="text-xs text-on-primary-container/70">/100</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm leading-relaxed text-on-surface-variant">
        {personality.summary}
      </p>

      {/* Details */}
      <div className="space-y-3">
        {personality.details.map((detail, i) => (
          <div
            key={i}
            className="bg-surface-container rounded-xl p-4 space-y-2"
          >
            <span className="font-headline text-xs font-bold text-on-surface flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-primary">
                arrow_right
              </span>
              {detail.subtitle}
            </span>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {detail.content}
            </p>
            {detail.evidence.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {detail.evidence.map((ev, j) => (
                  <span
                    key={j}
                    className="text-[10px] font-headline bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full"
                  >
                    {ev}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Advice */}
      {personality.advice.length > 0 && (
        <div className="bg-tertiary-container rounded-xl p-4 space-y-2">
          <span className="font-headline text-[10px] uppercase tracking-widest text-tertiary font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              tips_and_updates
            </span>
            조언
          </span>
          <ul className="space-y-1">
            {personality.advice.map((a, i) => (
              <li
                key={i}
                className="text-sm text-on-tertiary-container flex items-start gap-1"
              >
                <span className="text-tertiary mt-0.5">•</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {personality.warnings.length > 0 && (
        <div className="bg-error-container rounded-xl p-4 space-y-2">
          <span className="font-headline text-[10px] uppercase tracking-widest text-error font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">warning</span>
            주의사항
          </span>
          <ul className="space-y-1">
            {personality.warnings.map((w, i) => (
              <li
                key={i}
                className="text-sm text-on-error-container flex items-start gap-1"
              >
                <span className="text-error mt-0.5">•</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
