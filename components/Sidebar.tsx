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
  Sparkles,
  Waves,
  X,
  Download,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePlaylist } from "@/context/PlaylistContext";
import { usePlayer } from "@/context/PlayerContext";

interface SidebarProps {
  onOpenUpload: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenArtist: (name: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  onOpenUpload,
  activeTab,
  setActiveTab,
  onOpenArtist,
  isMobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { user, favoriteSongs, openAuthModal, followedArtists } = useAuth();
  const {
    playlists,
    createPlaylist,
    selectedPlaylistId,
    setSelectedPlaylistId,
    openImportModal,
  } = usePlaylist();
  const { currentSong } = usePlayer();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleNav = (action: () => void) => {
    action();
    onMobileClose?.();
  };

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
        onMobileClose?.();
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectPlaylist = (id: number) => {
    setSelectedPlaylistId(id);
    setActiveTab("playlist");
    onMobileClose?.();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 md:hidden animate-fadeIn"
        />
      )}

      {/* Main Sidebar: Desktop (static w-64) + Mobile (slide-out drawer z-50) */}
      <aside
        className={`${
          isMobileOpen
            ? "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-black shadow-2xl flex animate-fadeIn"
            : "hidden md:flex md:w-64"
        } flex-col h-full p-2 gap-2 text-gray-300 select-none border-r border-[#242424] flex-shrink-0 transition-all duration-300 ${
          currentSong ? "pb-36 md:pb-28" : "pb-20 md:pb-2"
        }`}
      >
        {/* Top Section */}
        <div className="bg-[#121212] rounded-xl p-4 flex flex-col gap-4">
          {/* Brand Logo & Version Badge */}
          <div className="flex items-center justify-between gap-2">
            <div
              onClick={() => handleNav(() => setActiveTab("home"))}
              className="flex items-center gap-2 cursor-pointer group min-w-0"
            >
              <Disc3 className="w-6 h-6 text-[#1db954] animate-spin-slow group-hover:scale-105 transition-transform flex-shrink-0" />
              <img
                src="/brand/trackflow-text.png"
                alt="TrackFlow"
                className="h-5 sm:h-5.5 w-auto max-w-[95px] object-contain select-none group-hover:scale-105 transition-transform drop-shadow"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Version Badge (Clickable to open Changelog) */}
              <button
                onClick={() => handleNav(() => setActiveTab("changelog"))}
                title="Xem nhật ký bản cập nhật Beta v2.4"
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide transition border shadow-sm flex-shrink-0 whitespace-nowrap ${
                  activeTab === "changelog"
                    ? "bg-[#1db954] text-black border-[#1db954] shadow-[0_0_10px_rgba(29,185,84,0.4)]"
                    : "bg-[#1db954]/15 text-[#1db954] border-[#1db954]/30 hover:bg-[#1db954] hover:text-black hover:scale-105 active:scale-95"
                }`}
              >
                <Sparkles className="w-2.5 h-2.5 flex-shrink-0" />
                <span>Beta v2.4</span>
              </button>

              {/* Close Drawer Button on Mobile */}
              {onMobileClose && (
                <button
                  onClick={onMobileClose}
                  className="md:hidden p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
                  title="Đóng menu"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => handleNav(() => setActiveTab("home"))}
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
              onClick={() => handleNav(() => setActiveTab("search"))}
              className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeTab === "search"
                  ? "text-white bg-[#282828]"
                  : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              <Search className="w-5 h-5" />
              <span>Tìm kiếm</span>
            </button>

            <button
              onClick={() => handleNav(() => setActiveTab("chill"))}
              className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeTab === "chill"
                  ? "text-white bg-gradient-to-r from-purple-900/40 to-[#282828] border-l-2 border-purple-400"
                  : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              <Waves className="w-5 h-5 text-purple-400" />
              <div className="flex items-center gap-2">
                <span>Chill</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Visualizer
                </span>
              </div>
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
                      openImportModal();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10 flex items-center gap-2.5 transition"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Nhập từ Spotify / YouTube</span>
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
            else handleNav(() => setActiveTab("favorites"));
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
                  onClick={() => handleNav(() => onOpenArtist(artist.artist_name))}
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
            <div className="px-2 py-4 text-center space-y-2">
              <p className="text-[11px] text-gray-500 leading-relaxed mb-1">
                Bấm dấu &quot;+&quot; ở trên để tạo playlist hoặc nhập kho nhạc của bạn!
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={handleCreatePlaylistClick}
                  className="text-xs text-[#1db954] hover:underline font-semibold"
                >
                  + Tạo danh sách phát
                </button>
                <button
                  onClick={() => openImportModal()}
                  className="text-xs text-gray-300 hover:text-white transition flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Nhập từ Spotify / YouTube</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upload Card at bottom */}
        <div className="mt-2 pt-2 border-t border-white/5 space-y-2">
          <button
            onClick={() => handleNav(onOpenUpload)}
            className="w-full bg-[#1f1f1f] hover:bg-[#282828] text-white text-xs font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition border border-white/5"
          >
            <Plus className="w-4 h-4 text-[#1db954]" />
            <span>Đăng bài hát MP3</span>
          </button>

          {/* Footer Navigation Links: Changelog & Terms */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => handleNav(() => setActiveTab("changelog"))}
              className={`flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-medium rounded transition truncate ${
                activeTab === "changelog"
                  ? "text-[#1db954] bg-[#1db954]/10 font-bold"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#1db954]" />
              <span className="truncate">Bản cập nhật</span>
            </button>

            <button
              onClick={() => handleNav(() => setActiveTab("terms"))}
              className={`flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-medium rounded transition truncate ${
                activeTab === "terms"
                  ? "text-[#1db954] bg-[#1db954]/10 font-bold"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span className="truncate">Pháp lý</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
