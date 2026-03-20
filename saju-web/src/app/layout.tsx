import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "SAJU ARCHIVIST — 사주명리 분석",
  description:
    "사주명리학(四柱命理學) 기반의 정밀 분석 서비스. 생년월일시로 당신의 운명을 해석합니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body className="bg-surface text-on-surface font-body antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
