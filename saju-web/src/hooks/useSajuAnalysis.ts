"use client";

import { useState, useCallback } from "react";
import type { BirthInput, FullReport } from "@/lib/saju/types";
import { generateFullAnalysis } from "@/lib/saju/engine";

interface UseSajuAnalysisReturn {
  report: FullReport | null;
  isLoading: boolean;
  error: string | null;
  analyze: (input: BirthInput) => void;
  reset: () => void;
}

export function useSajuAnalysis(): UseSajuAnalysisReturn {
  const [report, setReport] = useState<FullReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback((input: BirthInput) => {
    setIsLoading(true);
    setError(null);

    // Use setTimeout to keep UI responsive during heavy computation
    setTimeout(() => {
      try {
        const fullReport = generateFullAnalysis(input);
        setReport(fullReport);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "분석 중 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    }, 50);
  }, []);

  const reset = useCallback(() => {
    setReport(null);
    setError(null);
  }, []);

  return {
    report,
    isLoading,
    error,
    analyze,
    reset,
  };
}
