"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import UploadModal from "@/components/UploadModal";
import SongCard from "@/components/SongCard";
import ArtistView from "@/components/ArtistView";
import NowPlayingPanel from "@/components/NowPlayingPanel";
import { Song } from "@/lib/db";
import {
  Search,
  Plus,
  Music2,
  Sparkles,
  Loader2,
  Play,
  BookmarkPlus,
  Check,
  UserCheck,
} from "lucide-react";
import YoutubeIcon from "@/components/icons/YoutubeIcon";
import { usePlayer } from "@/context/PlayerContext";

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");

  // YouTube Search state
  const [ytResults, setYtResults] = useState<any[]>([]);
  const [ytChannels, setYtChannels] = useState<any[]>([]);
  const [isSearchingYt, setIsSearchingYt] = useState(false);
  const [savedYtIds, setSavedYtIds] = useState<Set<string>>(new Set());

  // Selected Artist Profile state
  const [selectedArtist, setSelectedArtist] = useState<{
    channelId?: string;
    name?: string;
  } | null>(null);

  // Right Now Playing / Lyrics Panel
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const { currentSong, playSong } = usePlayer();

  const handlePlaySong = (song: any, queue?: any[]) => {
    playSong(song, queue);
    setIsRightPanelOpen(true);
  };

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
  }, []);

  // Search YouTube
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearchingYt(true);
      setSelectedArtist(null); // Reset artist view
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

  // Open Artist Profile
  const openArtist = (artistInfo: { channelId?: string; name?: string }) => {
    setSelectedArtist(artistInfo);
  };

  // Save YouTube song to Neon Database
  const handleSaveToLibrary = async (item: any) => {
    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          artist: item.artist,
          audio_url: item.audio_url,
          image_url: item.image_url,
          duration: item.duration || 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSongs((prev) => [data.song, ...prev]);
        setSavedYtIds((prev) => new Set(prev).add(item.videoId));
      }
    } catch (err) {
      console.error("Error saving song:", err);
    }
  };

  const handleSongUploaded = (newSong: Song) => {
    setSongs((prev) => [newSong, ...prev]);
  };

  const localFilteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white">
      {/* Sidebar */}
      <Sidebar
        onOpenUpload={() => setIsUploadOpen(true)}
        activeTab={selectedArtist ? "artist" : activeTab}
        setActiveTab={(tab) => {
          setSelectedArtist(null);
          setActiveTab(tab);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#121212] m-2 ml-0 rounded-xl relative">
        {/* Top Navbar */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-40">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-4 flex-1 max-w-lg">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài hát, nghệ sĩ từ YouTube..."
                className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-sm text-white placeholder-gray-400 pl-9 pr-24 py-2 rounded-full border border-transparent focus:border-white/20 focus:outline-none transition"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#1db954] hover:bg-[#1ed760] text-black text-xs font-bold px-3 py-1 rounded-full transition flex items-center gap-1 shadow"
              >
                {isSearchingYt ? <Loader2 className="w-3 h-3 animate-spin" /> : "Tìm kiếm"}
              </button>
            </div>
          </form>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-white hover:bg-gray-200 text-black text-xs font-bold py-2.5 px-4 rounded-full transition flex items-center gap-2 shadow-md hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng nhạc</span>
            </button>
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
          ) : activeTab === "search" ? (
            /* VIEW 2: SEARCH RESULTS */
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
                  <p className="text-sm">Đang tìm kiếm bài hát và nghệ sĩ từ YouTube...</p>
                </div>
              ) : (
                <>
                  {/* ARTIST CHANNELS SECTION (If any found) */}
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

                  {/* YOUTUBE SONGS LIST */}
                  {ytResults.length === 0 && ytChannels.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <p>Nhập tên bài hát hoặc ca sĩ vào thanh tìm kiếm rồi nhấn Enter.</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <Music2 className="w-5 h-5 text-[#1db954]" />
                        <span>Bài hát ({ytResults.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ytResults.map((item) => {
                          const isSaved = savedYtIds.has(item.videoId);
                          return (
                            <div
                              key={item.id}
                              className="group flex items-center gap-3 p-3 bg-[#181818] hover:bg-[#242424] rounded-xl transition border border-white/5 hover:border-white/10"
                            >
                              {/* Thumbnail */}
                              <div
                                onClick={() => handlePlaySong(item, ytResults)}
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

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p
                                  onClick={() => handlePlaySong(item, ytResults)}
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

                              {/* Save to Library Button */}
                              <button
                                onClick={() => handleSaveToLibrary(item)}
                                disabled={isSaved}
                                title={isSaved ? "Đã lưu vào thư viện" : "Lưu vào Thư viện của bạn"}
                                className={`p-2 rounded-full transition flex-shrink-0 ${
                                  isSaved
                                    ? "text-[#1db954] bg-[#1db954]/10 cursor-default"
                                    : "text-gray-400 hover:text-white hover:bg-white/10"
                                }`}
                              >
                                {isSaved ? <Check className="w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* VIEW 3: HOME / SAVED LIBRARY */
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
                    Khám phá trang cá nhân nghệ sĩ, nghe toàn bộ bài hát từ YouTube hoặc đăng tải bài hát MP3 của riêng bạn.
                  </p>
                  <div className="flex items-center gap-3">
                    {songs.length > 0 && (
                      <button
                        onClick={() => handlePlaySong(songs[0], songs)}
                        className="bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs py-2.5 px-6 rounded-full flex items-center gap-2 transition hover:scale-105 shadow-lg"
                      >
                        <Play className="w-4 h-4 fill-black" />
                        <span>Phát tất cả</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Artists Shortcuts */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-3">Nghệ sĩ thịnh hành</h3>
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                  {[
                    { name: "Sơn Tùng M-TP", avatar: "https://yt3.ggpht.com/ru3SakOhxGBHZnrVeKPwmMndF81j1-gIrsPtmGSHV1YbX3Y6JoFVMR93UdlfpKp9_xIeh62t=s240-c-k-c0xffffffff-no-rj-mo" },
                    { name: "Đen Vâu", avatar: "https://yt3.googleusercontent.com/ytc/AIdro_k6BqTqF0K_9q2mO5oV8XG8Z3L3R1n0L-xW5hTf=s240-c-k-c0xffffffff-no-rj-mo" },
                    { name: "Vũ.", avatar: "https://yt3.googleusercontent.com/ytc/AIdro_m9TqF0K_9q2mO5oV8XG8Z3L3R1n0L-xW5hTf=s240-c-k-c0xffffffff-no-rj-mo" },
                    { name: "Taylor Swift", avatar: "https://yt3.googleusercontent.com/ytc/AIdro_mQ1sN6C_9q2mO5oV8XG8Z3L3R1n0L-xW5hTf=s240-c-k-c0xffffffff-no-rj-mo" },
                    { name: "Charlie Puth", avatar: "https://yt3.googleusercontent.com/ytc/AIdro_l2K8M1R_9q2mO5oV8XG8Z3L3R1n0L-xW5hTf=s240-c-k-c0xffffffff-no-rj-mo" },
                  ].map((art) => (
                    <button
                      key={art.name}
                      onClick={() => openArtist({ name: art.name })}
                      className="group flex items-center gap-3 bg-[#181818] hover:bg-[#282828] border border-white/5 hover:border-white/10 px-4 py-2.5 rounded-full transition flex-shrink-0"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-black flex-shrink-0">
                        <img src={art.avatar} alt={art.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm font-semibold text-white group-hover:text-[#1db954] transition">
                        {art.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Song Section Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Music2 className="w-5 h-5 text-[#1db954]" />
                  <span>Thư viện bài hát ({songs.length})</span>
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
                  <h3 className="text-lg font-bold text-white mb-1">Thư viện chưa có bài hát nào</h3>
                  <p className="text-sm text-gray-400 max-w-md mb-6">
                    Gõ tên bài hát hoặc ca sĩ vào thanh tìm kiếm ở trên để khám phá hoặc bấm Đăng nhạc để tải bài hát của bạn lên!
                  </p>
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-sm py-2.5 px-6 rounded-full transition shadow-lg hover:scale-105 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Đăng bài hát đầu tiên</span>
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
    </div>
  );
}
