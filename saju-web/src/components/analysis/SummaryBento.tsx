"use client";

import type { FullReport } from "@/lib/saju/types";
import { STEM_INFO, BRANCH_INFO, ELEMENT_KOREAN } from "@/lib/saju/data";

interface SummaryBentoProps {
  report: FullReport;
}

export default function SummaryBento({ report }: SummaryBentoProps) {
  const dayMasterStem = report.pillars.day.stem;
  const dayMasterInfo = STEM_INFO[dayMasterStem];
  const yearBranchInfo = BRANCH_INFO[report.pillars.year.branch];
  const strengthGrade = report.strength.grade;
  const dominantElement = (() => {
    const entries: [string, number][] = [
      ["木", report.elementStats.wood],
      ["火", report.elementStats.fire],
      ["土", report.elementStats.earth],
      ["金", report.elementStats.metal],
      ["水", report.elementStats.water],
    ];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] ?? "木";
  })();

  const cards = [
    {
      icon: "trending_up",
      label: "신강/신약",
      value: strengthGrade,
      desc:
        report.strength.score > 50
          ? "일간의 힘이 강합니다"
          : "일간의 힘이 약합니다",
      color: "bg-primary-container text-on-primary-container",
    },
    {
      icon: "person",
      label: "일주 (Day Master)",
      value: `${dayMasterStem} ${dayMasterInfo.korean}`,
      desc: `${dayMasterInfo.element} ${dayMasterInfo.yinyang} · ${dayMasterInfo.desc}`,
      color: "bg-secondary-container text-on-secondary-container",
    },
    {
      icon: "pets",
      label: "띠 (Zodiac)",
      value: yearBranchInfo.animal,
      desc: `${report.pillars.year.branch} ${yearBranchInfo.korean}`,
      color: "bg-tertiary-container text-on-tertiary-container",
    },
    {
      icon: "bubble_chart",
      label: "주요 오행",
      value: `${dominantElement} ${ELEMENT_KOREAN[dominantElement] ?? dominantElement}`,
      desc: "가장 강한 오행 에너지",
      color: "bg-surface-container-high text-on-surface",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.color} rounded-2xl p-4 flex flex-col gap-2`}
        >
          <span className="material-symbols-outlined text-base opacity-70">
            {card.icon}
          </span>
          <span className="font-headline text-[10px] uppercase tracking-widest opacity-60">
            {card.label}
          </span>
          <span className="font-headline text-lg font-bold leading-tight">
            {card.value}
          </span>
          <span className="text-xs opacity-70">{card.desc}</span>
        </div>
      ))}
    </section>
  );
}
