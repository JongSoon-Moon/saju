"use client";

import type { Interaction } from "@/lib/saju/types";

interface InteractionListProps {
  interactions: Interaction[];
}

const TYPE_ICON: Record<string, string> = {
  "합": "handshake",
  "충": "flash_on",
  "형": "warning",
  "파": "broken_image",
  "해": "heart_broken",
  "자형": "warning",
};

const TYPE_COLOR: Record<string, string> = {
  "합": "text-primary bg-primary-container",
  "충": "text-error bg-error-container",
  "형": "text-tertiary bg-tertiary-container",
  "파": "text-on-surface-variant bg-surface-container",
  "해": "text-error bg-error-container",
  "자형": "text-tertiary bg-tertiary-container",
};

export default function InteractionList({ interactions }: InteractionListProps) {
  if (!interactions || interactions.length === 0) {
    return (
      <section className="bg-surface-container-lowest rounded-2xl p-5 space-y-4">
        <h3 className="font-headline font-bold text-base flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base">
            compare_arrows
          </span>
          합충형파해 (Interactions)
        </h3>
        <p className="text-sm text-outline text-center py-4">
          특별한 간지 상호작용이 없습니다.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-5 space-y-4">
      <h3 className="font-headline font-bold text-base flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-base">
          compare_arrows
        </span>
        합충형파해 (Interactions)
      </h3>

      <div className="space-y-2">
        {interactions.map((inter, i) => {
          const baseType = inter.type.replace(/[^가-힣]/g, "").slice(0, 1) === "" ? inter.type : inter.type;
          // Find closest matching type key
          let matchKey = "합";
          for (const key of Object.keys(TYPE_ICON)) {
            if (inter.type.includes(key)) {
              matchKey = key;
              break;
            }
          }
          const icon = TYPE_ICON[matchKey] ?? "circle";
          const colorClass = TYPE_COLOR[matchKey] ?? "text-outline bg-surface-container";

          return (
            <div
              key={i}
              className="flex items-start gap-3 bg-surface-container rounded-xl p-3"
            >
              <span
                className={`material-symbols-outlined text-base p-1.5 rounded-lg ${colorClass} flex-shrink-0`}
              >
                {icon}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-headline text-xs font-bold text-on-surface">
                    {inter.name} ({inter.elements.join(", ")})
                  </span>
                  <span
                    className={`font-headline text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClass}`}
                  >
                    {inter.type}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  {inter.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
