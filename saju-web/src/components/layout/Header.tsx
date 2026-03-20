"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-lg border-b border-outline-variant/10">
      <div className="flex items-center justify-between px-6 md:px-10 h-16 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
          <span className="font-headline font-extrabold text-primary tracking-tight text-lg">
            SAJU ARCHIVIST
          </span>
        </Link>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="font-headline text-xs font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            href="/analysis"
            className="font-headline text-xs font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors"
          >
            Analyze
          </Link>
        </nav>
      </div>
    </header>
  );
}
