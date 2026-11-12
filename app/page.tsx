"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import UploadModal from "@/components/UploadModal";
import SongCard from "@/components/SongCard";
import { Song } from "@/lib/db";
import { Search, Plus, Music2, Sparkles, Loader2, Play } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");

  const { playSong } = usePlayer();

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

  const handleSongUploaded = (newSong: Song) => {
    setSongs((prev) => [newSong, ...prev]);
  };

  const filteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white">
      {/* Sidebar */}
      <Sidebar
        onOpenUpload={() => setIsUploadOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#121212] m-2 ml-0 rounded-xl relative">
        {/* Top Navbar */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== "search" && e.target.value) {
                    setActiveTab("search");
                  }
                }}
                placeholder="Tìm kiếm bài hát, ca sĩ..."
                className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-sm text-white placeholder-gray-400 pl-9 pr-4 py-2 rounded-full border border-transparent focus:border-white/20 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-[#1db954] hover:bg-[#1ed760] text-black text-xs font-bold py-2.5 px-4 rounded-full transition flex items-center gap-2 shadow-md hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng nhạc</span>
            </button>
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
          {/* Welcome Banner */}
          <div className="rounded-2xl p-6 mb-8 bg-gradient-to-r from-emerald-900/60 via-green-950/40 to-[#121212] border border-white/10 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-xl">
              <div className="flex items-center gap-2 text-[#1db954] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Không quảng cáo 100%</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                Chào mừng đến với TrackFlow
              </h1>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                Nghe nhạc trực tuyến chất lượng cao không lo quảng cáo. Bạn và bạn bè có thể tự do tải lên và cùng thưởng thức bài hát yêu thích.
              </p>
              {songs.length > 0 && (
                <button
                  onClick={() => playSong(songs[0], songs)}
                  className="bg-white hover:bg-gray-200 text-black font-bold text-xs py-2.5 px-6 rounded-full flex items-center gap-2 transition hover:scale-105 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Phát ngẫu nhiên tất cả</span>
                </button>
              )}
            </div>
          </div>

          {/* Song Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Music2 className="w-5 h-5 text-[#1db954]" />
              {activeTab === "search" && searchQuery
                ? `Kết quả tìm kiếm cho "${searchQuery}" (${filteredSongs.length})`
                : `Danh sách bài hát (${songs.length})`}
            </h2>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#1db954]" />
              <p className="text-sm">Đang kết nối Neon Database...</p>
            </div>
          ) : filteredSongs.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 px-4 bg-[#181818]/60 border border-white/5 rounded-2xl flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#242424] flex items-center justify-center text-gray-500 mb-4">
                <Music2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {searchQuery ? "Không tìm thấy bài hát nào" : "Chưa có bài hát nào"}
              </h3>
              <p className="text-sm text-gray-400 max-w-sm mb-6">
                {searchQuery
                  ? "Hãy thử tìm bằng từ khóa khác hoặc tên ca sĩ."
                  : "Hãy là người đầu tiên tải lên bài hát yêu thích để bắt đầu nghe nhạc trên TrackFlow!"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-sm py-2.5 px-6 rounded-full transition shadow-lg hover:scale-105 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Đăng bài hát đầu tiên</span>
                </button>
              )}
            </div>
          ) : (
            /* Song Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredSongs.map((song) => (
                <SongCard key={song.id} song={song} songsList={filteredSongs} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Persistent Audio Player */}
      <Player />

      {/* Upload Song Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSongUploaded={handleSongUploaded}
      />
    </div>
  );
}
