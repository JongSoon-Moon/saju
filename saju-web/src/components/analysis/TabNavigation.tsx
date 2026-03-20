"use client";

interface TabNavigationProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
}

const TABS = [
  { icon: "analytics", label: "Summary" },
  { icon: "tune", label: "Detail" },
  { icon: "timeline", label: "Luck" },
];

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-1 bg-surface-container rounded-xl p-1">
      {TABS.map((tab, idx) => (
        <button
          key={tab.label}
          onClick={() => onTabChange(idx)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-headline text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            activeTab === idx
              ? "bg-primary text-on-primary shadow-sm"
              : "text-outline hover:bg-surface-container-high hover:text-on-surface"
          }`}
        >
          <span
            className="material-symbols-outlined text-base"
            style={activeTab === idx ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            {tab.icon}
          </span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
