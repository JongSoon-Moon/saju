"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useSajuAnalysis } from "@/hooks/useSajuAnalysis";
import type { BirthInput } from "@/lib/saju/types";

import TabNavigation from "@/components/analysis/TabNavigation";
import SajuTable from "@/components/analysis/SajuTable";
import SummaryBento from "@/components/analysis/SummaryBento";
import ElementChart from "@/components/analysis/ElementChart";
import PersonalitySummary from "@/components/analysis/PersonalitySummary";
import StrengthPanel from "@/components/analysis/StrengthPanel";
import TenGodsChart from "@/components/analysis/TenGodsChart";
import TwelveStagesTable from "@/components/analysis/TwelveStagesTable";
import InteractionList from "@/components/analysis/InteractionList";
import LuckGrid from "@/components/analysis/LuckGrid";
import LuckInterpretation from "@/components/analysis/LuckInterpretation";
import Disclaimer from "@/components/analysis/Disclaimer";

function AnalysisContent() {
  const searchParams = useSearchParams();
  const { report, isLoading, error, analyze } =
    useSajuAnalysis();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const day = searchParams.get("day");
    const hourStr = searchParams.get("hour");
    const gender = searchParams.get("gender") ?? "";
    const calendarType = searchParams.get("calendarType") ?? "solar";
    const name = searchParams.get("name") ?? "";

    if (year && month && day) {
      const genderMap: Record<string, BirthInput["gender"]> = {
        "남성": "male", "male": "male",
        "여성": "female", "female": "female",
      };
      const calMap: Record<string, BirthInput["calendarType"]> = {
        "양력": "solar", "solar": "solar",
        "음력": "lunar", "lunar": "lunar",
      };

      const input: BirthInput = {
        year: Number(year),
        month: Number(month),
        day: Number(day),
        hour: hourStr ? Number(hourStr) : null,
        minute: null,
        calendarType: calMap[calendarType] ?? "solar",
        isLeapMonth: false,
        gender: genderMap[gender] ?? null,
        name: name || null,
      };
      analyze(input);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const currentYear = new Date().getFullYear();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="font-headline text-sm text-outline">분석 중...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-error text-4xl">error</span>
        <p className="text-sm text-error mt-2">{error}</p>
      </div>
    );
  }

  // No data
  if (!report) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-outline text-4xl">
          hourglass_empty
        </span>
        <p className="text-sm text-outline mt-2">
          생년월일시 정보를 입력하면 분석 결과가 여기에 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Name Header */}
      {report.input.name && (
        <div className="text-center">
          <h2 className="font-headline text-xl font-bold text-on-surface">
            {report.input.name}님의 사주 분석
          </h2>
          <p className="text-xs text-outline mt-1">
            {report.input.year}년 {report.input.month}월 {report.input.day}일
            {report.input.hour !== undefined && ` ${report.input.hour}시`}
            {" · "}
            {report.input.calendarType} · {report.input.gender}
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab: Summary */}
      {activeTab === 0 && (
        <div className="space-y-6">
          <SajuTable pillars={report.pillars} />
          <SummaryBento report={report} />
          <ElementChart stats={report.elementStats} />
          {report.personality && <PersonalitySummary personality={report.personality} />}
          <Disclaimer />
        </div>
      )}

      {/* Tab: Detail */}
      {activeTab === 1 && (
        <div className="space-y-6">
          <StrengthPanel strength={report.strength} />
          <TenGodsChart tenGodStats={report.tenGodStats} />
          <TwelveStagesTable pillars={report.pillars} />
          <InteractionList interactions={report.interactions} />
          <Disclaimer />
        </div>
      )}

      {/* Tab: Luck */}
      {activeTab === 2 && report.luckCycles && (
        <div className="space-y-6">
          <LuckGrid luckCycles={report.luckCycles} currentYear={currentYear} />
          <LuckInterpretation
            luckCycles={report.luckCycles}
            currentYear={currentYear}
          />
          <Disclaimer />
        </div>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <AnalysisContent />
    </Suspense>
  );
}
