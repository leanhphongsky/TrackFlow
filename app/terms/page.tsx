import React from "react";
import TermsView from "@/components/TermsView";
import Link from "next/link";
import { Disc3 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Điều khoản Dịch vụ & Pháp lý | TrackFlow",
  description:
    "Thông tin minh bạch về cơ chế kỹ thuật YouTube IFrame Player API, bảo vệ bản quyền âm nhạc và các căn cứ pháp lý của dự án TrackFlow.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-[#242424] bg-[#121212] px-6 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5 text-white font-bold text-lg tracking-tight">
          <Disc3 className="w-7 h-7 text-[#1db954] animate-spin-slow" />
          <span className="bg-gradient-to-r from-white via-gray-200 to-[#1db954] bg-clip-text text-transparent">
            TrackFlow
          </span>
        </Link>

        <Link
          href="/"
          className="bg-[#1db954] hover:bg-[#1ed760] text-black text-xs font-bold py-2 px-5 rounded-full transition shadow-md hover:scale-105"
        >
          Vào ứng dụng nghe nhạc
        </Link>
      </header>

      {/* Main Legal Content */}
      <main className="flex-1 overflow-hidden">
        <TermsView showBackButton={false} />
      </main>
    </div>
  );
}
