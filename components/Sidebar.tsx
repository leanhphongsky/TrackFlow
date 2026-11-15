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
  FolderPlus,
  UserCheck,
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

  const [isLibraryFlyoutOpen, setIsLibraryFlyoutOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleNav = (action: () => void) => {
    action();
    setIsLibraryFlyoutOpen(false);
    onMobileClose?.();
  };

  const handleCreatePlaylistClick = async () => {
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
        setIsLibraryFlyoutOpen(false);
        onMobileClose?.();
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectPlaylist = (id: number) => {
    setSelectedPlaylistId(id);
    setActiveTab("playlist");
    setIsLibraryFlyoutOpen(false);
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

      {/* DESKTOP: SLIM ICON RAIL (Liner Style ~72px) */}
      <aside
        className={`hidden md:flex flex-col items-center justify-between w-[72px] h-full bg-[#121212] border-r border-[#242424] py-4 select-none flex-shrink-0 z-40 transition-all ${
          currentSong ? "pb-28" : "pb-4"
        }`}
      >
        {/* Top: Logo & Main Navigation Icons */}
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Logo Disc Button */}
          <button
            onClick={() => handleNav(() => setActiveTab("home"))}
            className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.04] hover:bg-white/10 border border-white/5 transition"
            title="TrackFlow Trang chủ"
          >
            <Disc3 className="w-6 h-6 text-[#1db954] animate-spin-slow group-hover:scale-110 transition-transform" />
          </button>

          {/* Navigation Icons Stack */}
          <nav className="flex flex-col items-center gap-2 w-full px-2">
            {/* 1. Home */}
            <button
              onClick={() => handleNav(() => setActiveTab("home"))}
              className={`group relative flex items-center justify-center w-11 h-11 rounded-xl transition ${
                activeTab === "home"
                  ? "bg-[#282828] text-white shadow"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title="Trang chủ"
            >
              <Home className="w-5 h-5 text-current" />
              {activeTab === "home" && (
                <span className="absolute left-0 w-1 h-5 bg-[#1db954] rounded-r-full" />
              )}
            </button>

            {/* 2. Search */}
            <button
              onClick={() => handleNav(() => setActiveTab("search"))}
              className={`group relative flex items-center justify-center w-11 h-11 rounded-xl transition ${
                activeTab === "search"
                  ? "bg-[#282828] text-white shadow"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title="Tìm kiếm"
            >
              <Search className="w-5 h-5 text-current" />
              {activeTab === "search" && (
                <span className="absolute left-0 w-1 h-5 bg-[#1db954] rounded-r-full" />
              )}
            </button>

            {/* 3. Library (Flyout Drawer Trigger) */}
            <button
              onClick={() => setIsLibraryFlyoutOpen(!isLibraryFlyoutOpen)}
              className={`group relative flex items-center justify-center w-11 h-11 rounded-xl transition ${
                isLibraryFlyoutOpen || activeTab === "favorites" || activeTab === "playlist"
                  ? "bg-[#282828] text-[#1db954] shadow"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title="Thư viện & Danh sách phát"
            >
              <Library className="w-5 h-5 text-current" />
              {(isLibraryFlyoutOpen || activeTab === "favorites" || activeTab === "playlist") && (
                <span className="absolute left-0 w-1 h-5 bg-[#1db954] rounded-r-full" />
              )}
            </button>

            {/* 4. Chill Mode Visualizer */}
            <button
              onClick={() => handleNav(() => setActiveTab("chill"))}
              className={`group relative flex items-center justify-center w-11 h-11 rounded-xl transition ${
                activeTab === "chill"
                  ? "bg-purple-900/40 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                  : "text-purple-400/80 hover:text-purple-300 hover:bg-purple-500/10"
              }`}
              title="Chế độ Chill & Visualizer 360°"
            >
              <Waves className="w-5 h-5 text-current" />
              {activeTab === "chill" && (
                <span className="absolute left-0 w-1 h-5 bg-purple-400 rounded-r-full" />
              )}
            </button>

            {/* 5. 1-Click Import Playlist */}
            <button
              onClick={() => openImportModal()}
              className="group relative flex items-center justify-center w-11 h-11 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition"
              title="Nhập playlist từ Spotify hoặc YouTube"
            >
              <Download className="w-5 h-5 text-current" />
            </button>
          </nav>
        </div>

        {/* Bottom: Quick Upload & Settings / Changelog */}
        <div className="flex flex-col items-center gap-2 w-full px-2">
          {/* Quick Upload MP3 */}
          <button
            onClick={onOpenUpload}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 text-sky-400 transition"
            title="Đăng bài hát MP3"
          >
            <Upload className="w-4 h-4 text-current" />
          </button>

          {/* Version / Changelog Badge */}
          <button
            onClick={() => handleNav(() => setActiveTab("changelog"))}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition ${
              activeTab === "changelog"
                ? "bg-[#1db954] text-black font-extrabold shadow"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            title="Nhật ký cập nhật Beta v3.0"
          >
            <Sparkles className="w-4 h-4 text-current" />
          </button>
        </div>
      </aside>

      {/* DESKTOP SMART LIBRARY FLYOUT DRAWER (Slides out when Library icon is clicked) */}
      {isLibraryFlyoutOpen && (
        <>
          <div
            onClick={() => setIsLibraryFlyoutOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />
          <div className="fixed top-0 bottom-0 left-[72px] z-50 w-72 bg-[#181818]/95 border-r border-white/10 shadow-2xl backdrop-blur-xl flex flex-col p-4 animate-in slide-in-from-left duration-200">
            {/* Flyout Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Library className="w-4 h-4 text-[#1db954]" />
                <span>Thư viện của bạn</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCreatePlaylistClick}
                  disabled={isCreating}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                  title="Tạo playlist mới"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsLibraryFlyoutOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Liked Songs Quick Card */}
            <div
              onClick={() => {
                if (!user) openAuthModal("login");
                else handleNav(() => setActiveTab("favorites"));
              }}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition cursor-pointer mb-2 ${
                activeTab === "favorites" ? "bg-[#282828]" : "hover:bg-white/5"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0 shadow">
                <Heart className="w-5 h-5 fill-white text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">Bài hát đã thích</p>
                <p className="text-[11px] text-gray-400 truncate">
                  {user ? `${favoriteSongs.length} bài hát` : "Đăng nhập để xem"}
                </p>
              </div>
            </div>

            {/* Scrollable Playlists & Followed Artists */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 border-t border-white/5 pt-2">
              {playlists.length > 0 && (
                <div className="space-y-1 mb-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase px-2 py-1">
                    Danh sách phát ({playlists.length})
                  </p>
                  {playlists.map((pl) => {
                    const isSelected = activeTab === "playlist" && selectedPlaylistId === pl.id;
                    const cover = pl.cover_image || pl.image_url;
                    return (
                      <div
                        key={pl.id}
                        onClick={() => handleSelectPlaylist(pl.id)}
                        className={`group flex items-center gap-3 p-2 rounded-xl transition cursor-pointer ${
                          isSelected ? "bg-[#282828]" : "hover:bg-white/5"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#242424] overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/5 shadow">
                          {cover ? (
                            <img src={cover} alt={pl.name} className="w-full h-full object-cover" />
                          ) : (
                            <Music className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-semibold truncate ${
                              isSelected ? "text-[#1db954]" : "text-white group-hover:text-[#1db954]"
                            }`}
                          >
                            {pl.name}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">{pl.song_count} bài hát</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Followed Artists */}
              {followedArtists.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-white/5">
                  <p className="text-[10px] font-bold text-gray-500 uppercase px-2 py-1">
                    Nghệ sĩ đang theo dõi
                  </p>
                  {followedArtists.map((artist) => (
                    <div
                      key={artist.id}
                      onClick={() => handleNav(() => onOpenArtist(artist.artist_name))}
                      className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-black flex-shrink-0 border border-white/10 flex items-center justify-center">
                        {artist.avatar_url ? (
                          <img src={artist.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-[#1db954]">
                            {artist.artist_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white group-hover:text-[#1db954] truncate">
                          {artist.artist_name}
                        </p>
                        <p className="text-[10px] text-gray-400">Nghệ sĩ</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {playlists.length === 0 && followedArtists.length === 0 && (
                <div className="text-center py-8 px-2 space-y-3">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Bạn chưa có playlist nào. Hãy tạo mới hoặc nhập kho nhạc ngay!
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleCreatePlaylistClick}
                      className="w-full py-2 bg-[#1db954] text-black font-bold text-xs rounded-xl hover:bg-[#1ed760] transition"
                    >
                      + Tạo danh sách phát
                    </button>
                    <button
                      onClick={() => {
                        setIsLibraryFlyoutOpen(false);
                        openImportModal();
                      }}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-medium text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-white/5"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Nhập từ Spotify / YouTube</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* MOBILE SLIDE-OUT DRAWER */}
      {isMobileOpen && (
        <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#141414] shadow-2xl flex flex-col p-4 text-gray-300 md:hidden animate-in slide-in-from-left duration-200">
          {/* Mobile Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div
              onClick={() => handleNav(() => setActiveTab("home"))}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Disc3 className="w-6 h-6 text-[#1db954] animate-spin-slow" />
              <img
                src="/brand/trackflow-text.png"
                alt="TrackFlow"
                className="h-5 w-auto max-w-[95px] object-contain"
              />
            </div>
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1.5 mb-4">
            <button
              onClick={() => handleNav(() => setActiveTab("home"))}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "home" ? "bg-[#282828] text-white" : "hover:bg-white/5 text-gray-300"
              }`}
            >
              <Home className="w-5 h-5 text-[#1db954]" />
              <span>Trang chủ</span>
            </button>

            <button
              onClick={() => handleNav(() => setActiveTab("search"))}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "search" ? "bg-[#282828] text-white" : "hover:bg-white/5 text-gray-300"
              }`}
            >
              <Search className="w-5 h-5" />
              <span>Tìm kiếm</span>
            </button>

            <button
              onClick={() => handleNav(() => setActiveTab("chill"))}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "chill"
                  ? "bg-purple-900/40 text-purple-300 border border-purple-500/30"
                  : "hover:bg-white/5 text-purple-400"
              }`}
            >
              <Waves className="w-5 h-5 text-purple-400" />
              <span>Chill Visualizer 360°</span>
            </button>

            <button
              onClick={() => {
                onMobileClose?.();
                openImportModal();
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/5 text-emerald-400 transition"
            >
              <Download className="w-5 h-5 text-emerald-400" />
              <span>Nhập playlist từ Spotify / YouTube</span>
            </button>
          </nav>

          {/* Playlists in Drawer */}
          <div className="flex-1 overflow-y-auto border-t border-white/10 pt-3 space-y-1">
            <div
              onClick={() => {
                if (!user) openAuthModal("login");
                else handleNav(() => setActiveTab("favorites"));
              }}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition cursor-pointer mb-2"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 fill-white text-white" />
              </div>
              <span className="text-xs font-bold text-white">Bài hát đã thích</span>
            </div>

            {playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => handleSelectPlaylist(pl.id)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-[#242424] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {pl.cover_image || pl.image_url ? (
                    <img src={(pl.cover_image || pl.image_url)!} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{pl.name}</p>
                  <p className="text-[10px] text-gray-400">{pl.song_count} bài</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <button
              onClick={() => handleNav(() => setActiveTab("changelog"))}
              className="flex items-center gap-1 hover:text-white"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1db954]" />
              <span>Beta v3.0</span>
            </button>
            <button
              onClick={() => handleNav(() => setActiveTab("terms"))}
              className="hover:text-white"
            >
              Pháp lý
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
