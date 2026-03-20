"use client";

import type { StrengthResult } from "@/lib/saju/types";

interface StrengthPanelProps {
  strength: StrengthResult;
}

export default function StrengthPanel({ strength }: StrengthPanelProps) {
  const score = strength.score;
  const grade = strength.grade;
  const isStrong = score > 50;

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-5 space-y-4">
      <h3 className="font-headline font-bold text-base flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-base">
          speed
        </span>
        신강/신약 (Strength Analysis)
      </h3>

      {/* Score Dial */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            {/* Track */}
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="currentColor"
              className="text-surface-container"
              strokeWidth="10"
            />
            {/* Progress */}
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="currentColor"
              className={isStrong ? "text-primary" : "text-tertiary"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 327} 327`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-headline text-3xl font-bold text-on-surface">
              {Math.round(score)}
            </span>
            <span className="font-headline text-[10px] uppercase tracking-widest text-outline">
              / 100
            </span>
          </div>
        </div>

        <span
          className={`font-headline text-sm font-bold px-3 py-1 rounded-full ${
            isStrong
              ? "bg-primary-container text-on-primary-container"
              : "bg-tertiary-container text-on-tertiary-container"
          }`}
        >
          {grade}
        </span>
      </div>

      {/* Factors */}
      <div className="space-y-2">
        <span className="font-headline text-[10px] uppercase tracking-widest text-outline font-bold">
          판단 근거
        </span>
        {strength.factors.map((factor, i) => (
          <div
            key={i}
            className="flex items-start gap-2 bg-surface-container rounded-xl p-3"
          >
            <span
              className={`material-symbols-outlined text-sm mt-0.5 ${
                factor.points >= 0 ? "text-primary" : "text-error"
              }`}
            >
              {factor.points >= 0 ? "add_circle" : "remove_circle"}
            </span>
            <div>
              <span className="font-headline text-xs font-bold text-on-surface">
                {factor.description}
              </span>
              <span className="ml-2 font-headline text-[10px] text-outline">
                ({factor.points >= 0 ? "+" : ""}{factor.points}점)
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
