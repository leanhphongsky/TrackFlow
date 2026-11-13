"use client";

import React, { useState } from "react";
import {
  Home,
  Search,
  Library,
  Plus,
  Disc3,
  Heart,
  ShieldCheck,
  Music,
  ListPlus,
  Upload,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePlaylist } from "@/context/PlaylistContext";

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
  const {
    playlists,
    createPlaylist,
    selectedPlaylistId,
    setSelectedPlaylistId,
  } = usePlaylist();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePlaylistClick = async () => {
    setIsMenuOpen(false);
    if (!user) {
      openAuthModal("login");
      return;
    }

    setIsCreating(true);
    try {
      const newPlaylist = await createPlaylist();
      if (newPlaylist) {
        setSelectedPlaylistId(newPlaylist.id);
        setActiveTab("playlist");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectPlaylist = (id: number) => {
    setSelectedPlaylistId(id);
    setActiveTab("playlist");
  };

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
      <div className="bg-[#121212] rounded-xl p-3 flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between text-gray-400 px-2 py-2 mb-1 relative">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-white cursor-pointer transition">
            <Library className="w-5 h-5" />
            <span>Thư viện</span>
          </div>

          {/* Plus Action Button (Spotify Style Dropdown) */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-full hover:bg-white/10 hover:text-white transition"
              title="Tạo danh sách phát hoặc đăng nhạc"
            >
              <Plus className="w-5 h-5" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-50 w-52 bg-[#282828] border border-white/10 rounded-xl shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={handleCreatePlaylistClick}
                    disabled={isCreating}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10 flex items-center gap-2.5 transition"
                  >
                    <ListPlus className="w-4 h-4 text-[#1db954]" />
                    <span>Tạo danh sách phát mới</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenUpload();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10 flex items-center gap-2.5 transition"
                  >
                    <Upload className="w-4 h-4 text-sky-400" />
                    <span>Đăng bài hát MP3</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Liked Songs Playlist (Spotify Signature Card) */}
        <div
          onClick={() => {
            if (!user) openAuthModal("login");
            else setActiveTab("favorites");
          }}
          className={`flex items-center gap-3 p-2 rounded-lg transition cursor-pointer mb-1 ${
            activeTab === "favorites" ? "bg-[#282828]" : "hover:bg-[#1f1f1f]"
          }`}
        >
          <div className="w-11 h-11 rounded-md bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0 shadow">
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-bold text-white truncate">
              Bài hát đã thích
            </p>
            <p className="text-xs text-gray-400 truncate">
              Danh sách phát • {user ? `${favoriteSongs.length} bài` : "Đăng nhập"}
            </p>
          </div>
        </div>

        {/* Scrollable Library Content: Playlists & Followed Artists */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 border-t border-white/5 pt-2">
          {/* User Playlists */}
          {playlists.length > 0 && (
            <div className="space-y-1 mb-2">
              {playlists.map((pl) => {
                const isSelected = activeTab === "playlist" && selectedPlaylistId === pl.id;
                const cover = pl.cover_image || pl.image_url;

                return (
                  <div
                    key={pl.id}
                    onClick={() => handleSelectPlaylist(pl.id)}
                    className={`group flex items-center gap-3 p-2 rounded-lg transition cursor-pointer ${
                      isSelected ? "bg-[#282828]" : "hover:bg-[#1f1f1f]"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-md bg-[#242424] overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/5 shadow group-hover:scale-105 transition">
                      {cover ? (
                        <img
                          src={cover}
                          alt={pl.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <p
                        className={`text-sm font-semibold truncate transition ${
                          isSelected ? "text-[#1db954]" : "text-white group-hover:text-[#1db954]"
                        }`}
                      >
                        {pl.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        Danh sách phát • {pl.song_count} bài
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Followed Artists */}
          {followedArtists.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-white/5">
              {followedArtists.map((artist) => (
                <div
                  key={artist.id}
                  onClick={() => onOpenArtist(artist.artist_name)}
                  className="group flex items-center gap-3 p-2 rounded-lg hover:bg-[#1f1f1f] transition cursor-pointer"
                >
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
              ))}
            </div>
          )}

          {playlists.length === 0 && followedArtists.length === 0 && (
            <div className="px-2 py-4 text-center">
              <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
                Bấm dấu &quot;+&quot; ở trên để tạo playlist đầu tiên của bạn!
              </p>
              <button
                onClick={handleCreatePlaylistClick}
                className="text-xs text-[#1db954] hover:underline font-semibold"
              >
                + Tạo danh sách phát
              </button>
            </div>
          )}
        </div>

        {/* Upload Card at bottom */}
        <div className="mt-2 pt-2 border-t border-white/5 space-y-2">
          <button
            onClick={onOpenUpload}
            className="w-full bg-[#1f1f1f] hover:bg-[#282828] text-white text-xs font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition border border-white/5"
          >
            <Plus className="w-4 h-4 text-[#1db954]" />
            <span>Đăng bài hát MP3</span>
          </button>

          {/* Legal / Terms of Service Footer Link */}
          <button
            onClick={() => setActiveTab("terms")}
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium rounded transition ${
              activeTab === "terms"
                ? "text-[#1db954] bg-[#1db954]/10 font-semibold"
                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Điều khoản & Pháp lý</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
