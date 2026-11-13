"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import UploadModal from "@/components/UploadModal";
import SongCard from "@/components/SongCard";
import ArtistView from "@/components/ArtistView";
import NowPlayingPanel from "@/components/NowPlayingPanel";
import AuthModal from "@/components/AuthModal";
import LoginPage from "@/components/LoginPage";
import TermsView from "@/components/TermsView";
import TrendingArtistsSection from "@/components/TrendingArtistsSection";
import { Song } from "@/lib/db";
import {
  Search,
  Plus,
  Music2,
  Sparkles,
  Loader2,
  Play,
  Heart,
  UserCheck,
  LogOut,
  LogIn,
  Disc3,
} from "lucide-react";
import YoutubeIcon from "@/components/icons/YoutubeIcon";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home"); // "home" | "search" | "favorites"
  const [searchQuery, setSearchQuery] = useState("");

  // YouTube Search state
  const [ytResults, setYtResults] = useState<any[]>([]);
  const [ytChannels, setYtChannels] = useState<any[]>([]);
  const [isSearchingYt, setIsSearchingYt] = useState(false);

  // Selected Artist Profile state
  const [selectedArtist, setSelectedArtist] = useState<{
    channelId?: string;
    name?: string;
  } | null>(null);

  // Right Now Playing / Lyrics Panel
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const { currentSong, playSong } = usePlayer();
  const { user, loading: authLoading, openAuthModal, logout, favoriteSongs, isFavorite, toggleFavorite } = useAuth();

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/songs");
      if (res.ok) {
        const data = await res.json();
        setSongs(data.songs || []);
      }
    } catch (err) {
      console.error("Lỗi tải bài hát:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [user?.id]);

  const handlePlaySong = (song: any, queue?: any[], isPlaylistContext?: boolean) => {
    playSong(song, queue, isPlaylistContext);
    setIsRightPanelOpen(true);
  };

  // Search YouTube
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearchingYt(true);
      setSelectedArtist(null);
      setActiveTab("search");
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setYtResults(data.results || []);
        setYtChannels(data.channels || []);
      }
    } catch (err) {
      console.error("YouTube search error:", err);
    } finally {
      setIsSearchingYt(false);
    }
  };

  const openArtist = (artistInfo: { channelId?: string; name?: string }) => {
    setSelectedArtist(artistInfo);
  };

  const handleSongUploaded = (newSong: Song) => {
    setSongs((prev) => [newSong, ...prev]);
  };

  const localFilteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If loading auth state from cookies
  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white select-none">
        <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center shadow-2xl mb-4 animate-pulse">
          <Disc3 className="w-9 h-9 text-[#1db954] animate-spin-slow" />
        </div>
        <p className="text-sm font-bold text-gray-400 tracking-wide">Đang kết nối TrackFlow...</p>
      </div>
    );
  }

  // If user is not authenticated and hasn't chosen to browse as guest, show modern Login Page
  if (!user && !isGuest) {
    return <LoginPage onContinueAsGuest={() => setIsGuest(true)} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white font-sans">
      {/* Left Sidebar */}
      <Sidebar
        onOpenUpload={() => setIsUploadOpen(true)}
        activeTab={selectedArtist ? "artist" : activeTab}
        setActiveTab={(tab) => {
          setSelectedArtist(null);
          setActiveTab(tab);
        }}
        onOpenArtist={(name) => openArtist({ name })}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#121212] m-2 ml-0 mr-0 rounded-xl relative">
        {/* Top Navbar */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-[#121212]/90 backdrop-blur-md sticky top-0 z-40">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-4 flex-1 max-w-lg">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài hát, nghệ sĩ từ YouTube..."
                className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-sm text-white placeholder-gray-400 pl-10 pr-24 py-2 rounded-full border border-transparent focus:border-white/20 focus:outline-none transition"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#1db954] hover:bg-[#1ed760] text-black text-xs font-bold px-3 py-1 rounded-full transition flex items-center gap-1 shadow"
              >
                {isSearchingYt ? <Loader2 className="w-3 h-3 animate-spin" /> : "Tìm kiếm"}
              </button>
            </div>
          </form>

          {/* User Profile / Auth Area */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-white text-black text-xs font-bold px-3.5 py-2 rounded-full hover:scale-105 transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng nhạc</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-[#242424] px-3 py-1.5 rounded-full border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-[#1db954] text-black font-extrabold flex items-center justify-center text-xs">
                    {user.display_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-white max-w-[120px] truncate">
                    {user.display_name}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    setIsGuest(false);
                    await logout();
                  }}
                  className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal("login")}
                  className="bg-[#1db954] hover:bg-[#1ed760] text-black text-xs font-extrabold px-4 py-2 rounded-full transition hover:scale-105 shadow flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
          {/* VIEW 1: ARTIST PROFILE PAGE */}
          {selectedArtist ? (
            <ArtistView
              channelId={selectedArtist.channelId}
              artistName={selectedArtist.name}
              onBack={() => setSelectedArtist(null)}
              onSongSaved={(song) => setSongs((prev) => [song, ...prev])}
            />
          ) : activeTab === "terms" ? (
            /* VIEW: TERMS & LEGAL DISCLAIMER */
            <TermsView onBack={() => setActiveTab("home")} />
          ) : activeTab === "favorites" ? (
            /* VIEW 2: FAVORITES / LIKED SONGS PAGE */
            <div className="space-y-6">
              {/* Liked Songs Hero Banner */}
              <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-indigo-900/90 via-purple-900/70 to-[#121212] border border-white/10 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl flex-shrink-0">
                  <Heart className="w-20 h-20 fill-white text-white drop-shadow-md" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300">
                    Danh sách phát
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white mt-1 mb-3">
                    Bài hát đã thích
                  </h1>
                  <p className="text-xs text-gray-300 font-medium">
                    <span className="text-white font-bold">{user?.display_name || "Bạn"}</span> •{" "}
                    {favoriteSongs.length} bài hát
                  </p>
                </div>
              </div>

              {/* Action */}
              {favoriteSongs.length > 0 && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handlePlaySong(favoriteSongs[0], favoriteSongs, true)}
                    className="w-12 h-12 rounded-full bg-[#1db954] hover:bg-[#1ed760] hover:scale-105 flex items-center justify-center text-black shadow-xl transition"
                    title="Phát tất cả bài hát yêu thích"
                  >
                    <Play className="w-6 h-6 fill-black ml-0.5" />
                  </button>
                </div>
              )}

              {/* Liked Songs List */}
              {favoriteSongs.length === 0 ? (
                <div className="text-center py-20 bg-[#181818]/60 border border-white/5 rounded-2xl">
                  <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">
                    Chưa có bài hát yêu thích nào
                  </h3>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto">
                    Nhấn vào biểu tượng trái tim ở bất kỳ bài hát nào để lưu vào danh sách riêng của bạn!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {favoriteSongs.map((song, index) => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div
                        key={song.id || index}
                        onClick={() => handlePlaySong(song, favoriteSongs, true)}
                        className={`group flex items-center gap-4 p-2.5 rounded-lg hover:bg-[#282828] transition cursor-pointer ${
                          isCurrent ? "bg-[#242424]" : ""
                        }`}
                      >
                        <div className="w-6 text-center text-sm font-semibold text-gray-400">
                          {index + 1}
                        </div>
                        <div className="w-11 h-11 rounded-md overflow-hidden bg-black flex-shrink-0">
                          {song.image_url ? (
                            <img src={song.image_url} alt={song.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                              <Music2 className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${isCurrent ? "text-[#1db954]" : "text-white"}`}>
                            {song.title}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                        </div>

                        {/* Unlike Heart Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(song);
                          }}
                          title="Bỏ yêu thích"
                          className="p-2 text-[#1db954] hover:scale-110 transition"
                        >
                          <Heart className="w-5 h-5 fill-[#1db954]" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === "search" ? (
            /* VIEW 3: SEARCH RESULTS */
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <YoutubeIcon className="w-7 h-7 text-red-500" />
                  <span>Kết quả tìm kiếm cho: &quot;{searchQuery}&quot;</span>
                </h2>
                <button
                  onClick={() => setActiveTab("home")}
                  className="text-xs text-gray-400 hover:text-white underline"
                >
                  Quay lại Trang chủ
                </button>
              </div>

              {isSearchingYt ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1db954]" />
                  <p className="text-sm">Đang tìm kiếm bài hát và nghệ sĩ...</p>
                </div>
              ) : (
                <>
                  {/* Channels / Artists matches */}
                  {ytChannels.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-sky-400" />
                        <span>Nghệ sĩ phù hợp</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {ytChannels.map((ch) => (
                          <div
                            key={ch.channelId}
                            onClick={() => openArtist({ channelId: ch.channelId, name: ch.title })}
                            className="group flex items-center gap-4 p-4 rounded-2xl bg-[#181818] hover:bg-[#252525] border border-white/5 hover:border-white/10 transition cursor-pointer shadow-lg"
                          >
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-black flex-shrink-0 border-2 border-white/10 group-hover:scale-105 transition">
                              <img src={ch.avatar} alt={ch.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="overflow-hidden flex-1">
                              <p className="font-bold text-white text-base group-hover:text-[#1db954] transition truncate">
                                {ch.title}
                              </p>
                              <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full inline-block mt-1">
                                Trang nghệ sĩ
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Songs list */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <Music2 className="w-5 h-5 text-[#1db954]" />
                      <span>Bài hát ({ytResults.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {ytResults.map((item) => {
                        const favorited = isFavorite(item);
                        return (
                          <div
                            key={item.id}
                            className="group flex items-center gap-3 p-3 bg-[#181818] hover:bg-[#242424] rounded-xl transition border border-white/5 hover:border-white/10"
                          >
                            <div
                              onClick={() => handlePlaySong(item, [item], false)}
                              className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer bg-black shadow"
                            >
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <p
                                onClick={() => handlePlaySong(item, [item], false)}
                                className="text-sm font-semibold text-white line-clamp-1 group-hover:text-[#1db954] transition cursor-pointer"
                              >
                                {item.title}
                              </p>
                              <p
                                onClick={() => openArtist({ name: item.artist, channelId: item.channelId })}
                                className="text-xs text-gray-400 hover:text-white hover:underline cursor-pointer truncate mt-0.5"
                              >
                                {item.artist}
                              </p>
                            </div>

                            {/* Heart Favorite Button */}
                            <button
                              onClick={() => toggleFavorite(item)}
                              title={favorited ? "Bỏ yêu thích" : "Yêu thích"}
                              className={`p-2 rounded-full transition flex-shrink-0 ${
                                favorited
                                  ? "text-[#1db954]"
                                  : "text-gray-400 hover:text-white hover:bg-white/10"
                              }`}
                            >
                              <Heart
                                className={`w-5 h-5 transition ${
                                  favorited ? "fill-[#1db954] text-[#1db954]" : ""
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* VIEW 4: HOME / ALL SONGS */
            <div>
              {/* Welcome Banner */}
              <div className="rounded-2xl p-6 mb-8 bg-gradient-to-r from-emerald-900/60 via-green-950/40 to-[#121212] border border-white/10 relative overflow-hidden shadow-2xl">
                <div className="relative z-10 max-w-xl">
                  <div className="flex items-center gap-2 text-[#1db954] text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Không quảng cáo 100% • Tích hợp YouTube & Trang Nghệ Sĩ</span>
                  </div>
                  <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                    Chào mừng đến với TrackFlow
                  </h1>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    Khám phá trang cá nhân nghệ sĩ, nghe toàn bộ bài hát từ YouTube, lưu danh sách bài hát yêu thích riêng biệt cho từng người.
                  </p>
                  <div className="flex items-center gap-3">
                    {songs.length > 0 && (
                      <button
                        onClick={() => handlePlaySong(songs[0], songs, songs.length > 1)}
                        className="bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs py-2.5 px-6 rounded-full flex items-center gap-2 transition hover:scale-105 shadow-lg"
                      >
                        <Play className="w-4 h-4 fill-black" />
                        <span>Phát tất cả</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Trending Artists Section with Multi-Region Boards & Real-Time Data */}
              <TrendingArtistsSection onOpenArtist={openArtist} />

              {/* Quick Liked Songs on Home if any */}
              {favoriteSongs.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Heart className="w-5 h-5 fill-[#1db954] text-[#1db954]" />
                      <span>Bài hát bạn đã thích gần đây ({favoriteSongs.length})</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab("favorites")}
                      className="text-xs text-gray-400 hover:text-white transition font-semibold"
                    >
                      Xem tất cả →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {favoriteSongs.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handlePlaySong(item, favoriteSongs, true)}
                        className="group p-3 bg-[#181818] hover:bg-[#282828] rounded-xl transition cursor-pointer border border-white/5 hover:border-white/10"
                      >
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-black mb-2 shadow">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                              <Music2 className="w-6 h-6" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <Play className="w-7 h-7 fill-[#1db954] text-[#1db954]" />
                          </div>
                        </div>
                        <p className="text-xs font-bold text-white truncate group-hover:text-[#1db954] transition">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.artist}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Song Section Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Music2 className="w-5 h-5 text-[#1db954]" />
                  <span>Bài hát bạn đã tải lên ({songs.length})</span>
                </h2>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1db954]" />
                  <p className="text-sm">Đang tải thư viện...</p>
                </div>
              ) : songs.length === 0 ? (
                /* Empty State */
                <div className="text-center py-20 px-4 bg-[#181818]/60 border border-white/5 rounded-2xl flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#242424] flex items-center justify-center text-gray-500 mb-4">
                    <Music2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Bạn chưa tải lên bài hát nào</h3>
                  <p className="text-sm text-gray-400 max-w-md mb-6">
                    Bấm nút Đăng nhạc để tải file MP3 của riêng bạn lên thư viện cá nhân!
                  </p>
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-sm py-2.5 px-6 rounded-full transition shadow-lg hover:scale-105 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Đăng bài hát MP3</span>
                  </button>
                </div>
              ) : (
                /* Song Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {localFilteredSongs.map((song) => (
                    <SongCard key={song.id} song={song} songsList={localFilteredSongs} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Right Spotify Sidebar: Now Playing Artwork, Lyrics & About Artist */}
      <NowPlayingPanel
        isOpen={isRightPanelOpen && currentSong !== null}
        onClose={() => setIsRightPanelOpen(false)}
        onOpenArtist={(name) => openArtist({ name })}
      />

      {/* Persistent Audio Player */}
      <Player
        isRightPanelOpen={isRightPanelOpen}
        onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
      />

      {/* Upload Song Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSongUploaded={handleSongUploaded}
      />

      {/* Login & Register Modal */}
      <AuthModal />
    </div>
  );
}
