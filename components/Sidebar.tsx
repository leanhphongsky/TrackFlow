"use client";

import React from "react";
import {
  Home,
  Search,
  Library,
  Plus,
  Disc3,
  Heart,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  onOpenUpload: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenArtist: (name: string) => void;
}

export default function Sidebar({
  onOpenUpload,
  activeTab,
  setActiveTab,
  onOpenArtist,
}: SidebarProps) {
  const { user, favoriteSongs, openAuthModal, followedArtists } = useAuth();

  return (
    <aside className="w-64 bg-black flex flex-col h-full p-2 gap-2 text-gray-300 select-none border-r border-[#242424] flex-shrink-0">
      {/* Top Section */}
      <div className="bg-[#121212] rounded-xl p-4 flex flex-col gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab("home")}
          className="flex items-center gap-2.5 text-white font-bold text-lg tracking-tight cursor-pointer"
        >
          <Disc3 className="w-7 h-7 text-[#1db954] animate-spin-slow" />
          <span className="bg-gradient-to-r from-white via-gray-200 to-[#1db954] bg-clip-text text-transparent">
            TrackFlow
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
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
            <span>Tìm kiếm</span>
          </button>
        </nav>
      </div>

      {/* Library Section */}
      <div className="bg-[#121212] rounded-xl p-3 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between text-gray-400 px-2 py-2 mb-1">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-white cursor-pointer transition">
            <Library className="w-5 h-5" />
            <span>Thư viện</span>
          </div>
          <button
            onClick={onOpenUpload}
            className="p-1.5 rounded-full hover:bg-white/10 hover:text-white transition"
            title="Đăng tải bài hát MP3"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Liked Songs Playlist (Spotify Signature Card) */}
        <div
          onClick={() => {
            if (!user) openAuthModal("login");
            else setActiveTab("favorites");
          }}
          className={`flex items-center gap-3 p-2 rounded-lg transition cursor-pointer mb-2 ${
            activeTab === "favorites" ? "bg-[#282828]" : "hover:bg-[#1f1f1f]"
          }`}
        >
          <div className="w-12 h-12 rounded-md bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0 shadow">
            <Heart className="w-6 h-6 fill-white text-white" />
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-bold text-white truncate">
              Bài hát đã thích
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user ? `${favoriteSongs.length} bài hát` : "Đăng nhập để xem"}
            </p>
          </div>
        </div>

        {/* Followed Artists & Library items */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 border-t border-white/5 pt-2">
          {followedArtists.length > 0 ? (
            followedArtists.map((artist) => (
              <div
                key={artist.id}
                onClick={() => onOpenArtist(artist.artist_name)}
                className="group flex items-center gap-3 p-2 rounded-lg hover:bg-[#1f1f1f] transition cursor-pointer"
              >
                {/* Circular Avatar (Spotify signature for artists) */}
                <div className="w-11 h-11 rounded-full overflow-hidden bg-black flex-shrink-0 shadow border border-white/10 group-hover:scale-105 transition">
                  {artist.avatar_url ? (
                    <img
                      src={artist.avatar_url}
                      alt={artist.artist_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-[#1db954] font-bold text-sm">
                      {artist.artist_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="overflow-hidden min-w-0">
                  <p className="text-sm font-semibold text-white group-hover:text-[#1db954] truncate transition">
                    {artist.artist_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">Nghệ sĩ</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-gray-500 px-2 py-4 text-center leading-relaxed">
              Theo dõi nghệ sĩ yêu thích để ghim vào thư viện của bạn.
            </p>
          )}
        </div>

        {/* Upload Card at bottom */}
        <div className="mt-2 pt-2 border-t border-white/5">
          <button
            onClick={onOpenUpload}
            className="w-full bg-[#1f1f1f] hover:bg-[#282828] text-white text-xs font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition border border-white/5"
          >
            <Plus className="w-4 h-4 text-[#1db954]" />
            <span>Đăng bài hát MP3</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
