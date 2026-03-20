"use client";

import { DISCLAIMER } from "@/lib/saju/data";

export default function Disclaimer() {
  return (
    <div className="bg-surface-container rounded-2xl p-4 flex items-start gap-3">
      <span className="material-symbols-outlined text-outline text-base flex-shrink-0 mt-0.5">
        info
      </span>
      <p className="text-xs text-outline leading-relaxed">{DISCLAIMER}</p>
    </div>
  );
}
