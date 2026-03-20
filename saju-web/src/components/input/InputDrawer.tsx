"use client";

import { useState, useCallback } from "react";
import type { BirthInput } from "@/lib/saju/types";

interface InputDrawerProps {
  open: boolean;
  onClose: () => void;
  onAnalyze: (input: BirthInput) => void;
  loading?: boolean;
}

export default function InputDrawer({ open, onClose, onAnalyze, loading }: InputDrawerProps) {
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [timeKnown, setTimeKnown] = useState(true);
  const [hour, setHour] = useState(12);
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [name, setName] = useState("");

  const handleSubmit = useCallback(() => {
    const input: BirthInput = {
      year,
      month,
      day,
      hour: timeKnown ? hour : null,
      minute: null,
      calendarType,
      isLeapMonth: false,
      gender,
      name: name.trim() || null,
    };
    onAnalyze(input);
  }, [year, month, day, timeKnown, hour, calendarType, gender, name, onAnalyze]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-surface z-50 shadow-2xl flex flex-col p-6 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="font-headline uppercase tracking-widest text-xs opacity-60">
              Input Archive
            </span>
            <h2 className="font-headline font-bold text-lg text-primary mt-1">New Entry</h2>
          </div>
          <button
            onClick={onClose}
            className="material-symbols-outlined text-outline p-1 rounded-full hover:bg-surface-container"
          >
            close
          </button>
        </div>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Calendar Type */}
          <div className="space-y-2">
            <label className="font-headline text-[11px] uppercase tracking-wider font-bold text-outline">
              Calendar Type
            </label>
            <div className="flex gap-2">
              {(["solar", "lunar"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setCalendarType(t)}
                  className={`flex-1 py-2 rounded-lg font-headline text-xs font-bold uppercase tracking-wider transition-colors ${
                    calendarType === t
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {t === "solar" ? "양력" : "음력"}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="font-headline text-[11px] uppercase tracking-wider font-bold text-outline flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              Year / Month / Day
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1900}
                max={2100}
                className="bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2.5 font-body text-sm text-on-surface focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                placeholder="Year"
              />
              <input
                type="number"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                min={1}
                max={12}
                className="bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2.5 font-body text-sm text-on-surface focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                placeholder="Month"
              />
              <input
                type="number"
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                min={1}
                max={31}
                className="bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2.5 font-body text-sm text-on-surface focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                placeholder="Day"
              />
            </div>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <label className="font-headline text-[11px] uppercase tracking-wider font-bold text-outline flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">schedule</span>
              Birth Time
            </label>
            <div className="flex gap-2 mb-2">
              {([true, false] as const).map((known) => (
                <button
                  key={String(known)}
                  onClick={() => setTimeKnown(known)}
                  className={`flex-1 py-2 rounded-lg font-headline text-xs font-bold uppercase tracking-wider transition-colors ${
                    timeKnown === known
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {known ? "알고 있음" : "모름"}
                </button>
              ))}
            </div>
            {timeKnown && (
              <div className="space-y-1">
                <input
                  type="range"
                  value={hour}
                  onChange={(e) => setHour(Number(e.target.value))}
                  min={0}
                  max={23}
                  className="w-full accent-primary"
                />
                <div className="text-center font-headline font-bold text-primary text-lg">
                  {String(hour).padStart(2, "0")}:00
                </div>
              </div>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="font-headline text-[11px] uppercase tracking-wider font-bold text-outline flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">wc</span>
              Gender
            </label>
            <div className="flex gap-2">
              {([
                { value: "male" as const, label: "남성" },
                { value: "female" as const, label: "여성" },
                { value: null, label: "선택안함" },
              ]).map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setGender(opt.value)}
                  className={`flex-1 py-2 rounded-lg font-headline text-xs font-bold uppercase tracking-wider transition-colors ${
                    gender === opt.value
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="font-headline text-[11px] uppercase tracking-wider font-bold text-outline flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">person</span>
              Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2.5 font-body text-sm text-on-surface focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* Analyze button */}
        <div className="mt-6 pt-6 border-t border-outline-variant/10">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary text-on-primary p-4 rounded-xl font-headline font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                Analyzing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">search</span>
                Analyze
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
