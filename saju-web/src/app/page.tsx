"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import AboutSection from "@/components/home/AboutSection";
import InputDrawer from "@/components/input/InputDrawer";
import type { BirthInput } from "@/lib/saju/types";

export default function HomePage() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleAnalyze = (input: BirthInput) => {
    const params = new URLSearchParams({
      year: String(input.year),
      month: String(input.month),
      day: String(input.day),
      hour: input.hour !== null ? String(input.hour) : "",
      gender: input.gender ?? "",
      calendarType: input.calendarType,
      name: input.name ?? "",
    });
    router.push(`/analysis?${params.toString()}`);
  };

  return (
    <>
      <HeroSection onAnalyzeClick={() => setDrawerOpen(true)} />
      <HowItWorks />
      <AboutSection />

      <InputDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAnalyze={handleAnalyze}
      />
    </>
  );
}
