"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/analysis", icon: "search", label: "Analyze" },
  { href: "#", icon: "person", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg flex justify-around items-center h-16 border-t border-outline-variant/10 z-50">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 ${
              isActive
                ? "text-primary bg-[#f5f3ee] rounded-xl px-4 py-1"
                : "text-outline"
            }`}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className={`text-[10px] font-label ${isActive ? "font-bold" : "font-semibold"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
