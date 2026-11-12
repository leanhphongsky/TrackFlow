"use client";

import React from "react";
import { Home, Search, Library, PlusCircle, Disc3, Sparkles } from "lucide-react";

interface SidebarProps {
  onOpenUpload: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ onOpenUpload, activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 bg-black flex flex-col h-full p-4 gap-4 text-gray-300 select-none border-r border-[#242424]">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5 px-3 py-2 text-white font-bold text-xl tracking-tight">
        <Disc3 className="w-8 h-8 text-[#1db954] animate-spin-slow" />
        <span className="bg-gradient-to-r from-white via-gray-200 to-[#1db954] bg-clip-text text-transparent">
          TrackFlow
        </span>
      </div>

      {/* Main Nav */}
      <nav className="bg-[#121212] rounded-xl p-3 flex flex-col gap-2">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
            activeTab === "home"
              ? "text-white bg-[#282828]"
              : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
          }`}
        >
          <Home className="w-5 h-5 text-[#1db954]" />
          <span>Trang chủ</span>
        </button>

        <button
          onClick={() => setActiveTab("search")}
          className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
            activeTab === "search"
              ? "text-white bg-[#282828]"
              : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Tìm kiếm bài hát</span>
        </button>
      </nav>

      {/* Library & Upload Section */}
      <div className="bg-[#121212] rounded-xl p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-gray-400 mb-4 px-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Library className="w-5 h-5" />
              <span>Thư viện nhạc</span>
            </div>
          </div>

          {/* Upload Callout Card */}
          <div className="bg-[#1f1f1f] p-4 rounded-xl flex flex-col gap-3 border border-white/5">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-[#1db954]" />
              <span>Đóng góp bài hát</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Tải nhạc của bạn hoặc bài hát yêu thích lên để cùng chia sẻ với nhóm bạn.
            </p>
            <button
              onClick={onOpenUpload}
              className="mt-1 bg-white hover:bg-gray-200 text-black text-xs font-bold py-2 px-4 rounded-full transition flex items-center justify-center gap-2 shadow"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              <span>Đăng nhạc mới</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-gray-500 pt-4 border-t border-gray-800 space-y-1">
          <p className="text-gray-400 font-medium">TrackFlow Music App</p>
          <p>Không quảng cáo • Cloudinary 25GB • Neon PostgreSQL</p>
        </div>
      </div>
    </aside>
  );
}
