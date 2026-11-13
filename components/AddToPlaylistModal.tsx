"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Check,
  Music,
  Search,
  Loader2,
  FolderPlus,
  Sparkles,
} from "lucide-react";
import { usePlaylist, PlaylistSummary } from "@/context/PlaylistContext";

export default function AddToPlaylistModal() {
  const {
    isAddToPlaylistOpen,
    songForPlaylist,
    closeAddToPlaylist,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
  } = usePlaylist();

  const [playlistStatuses, setPlaylistStatuses] = useState<PlaylistSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const songAudioUrl = songForPlaylist?.audio_url || songForPlaylist?.url || (songForPlaylist?.videoId ? `https://www.youtube.com/watch?v=${songForPlaylist.videoId}` : "");

  // Load playlists with `hasSong` flag when modal opens
  useEffect(() => {
    if (!isAddToPlaylistOpen || !songAudioUrl) return;

    let isMounted = true;
    async function loadStatuses() {
      setLoading(true);
      try {
        const res = await fetch(`/api/playlists?audio_url=${encodeURIComponent(songAudioUrl)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setPlaylistStatuses(data.playlists || []);
          }
        }
      } catch (err) {
        console.error("Load playlist statuses error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStatuses();
    return () => {
      isMounted = false;
    };
  }, [isAddToPlaylistOpen, songAudioUrl]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  if (!isAddToPlaylistOpen || !songForPlaylist) return null;

  const handleToggleSongInPlaylist = async (playlist: PlaylistSummary) => {
    if (actionLoadingId !== null) return;
    setActionLoadingId(playlist.id);

    try {
      if (playlist.hasSong) {
        // Remove
        const success = await removeSongFromPlaylist(playlist.id, songAudioUrl);
        if (success) {
          setPlaylistStatuses((prev) =>
            prev.map((p) =>
              p.id === playlist.id
                ? { ...p, hasSong: false, song_count: Math.max(0, p.song_count - 1) }
                : p
            )
          );
          showToast(`Đã xoá khỏi "${playlist.name}"`);
        }
      } else {
        // Add
        const res = await addSongToPlaylist(playlist.id, songForPlaylist);
        if (res.success) {
          setPlaylistStatuses((prev) =>
            prev.map((p) =>
              p.id === playlist.id
                ? { ...p, hasSong: true, song_count: p.song_count + 1 }
                : p
            )
          );
          showToast(`Đã thêm vào "${playlist.name}"`);
        }
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateNewPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      setActionLoadingId(-1);
      const created = await createPlaylist(newPlaylistName.trim());
      if (created) {
        // Automatically add current song to the new playlist
        await addSongToPlaylist(created.id, songForPlaylist);
        setPlaylistStatuses((prev) => [
          { ...created, hasSong: true, song_count: 1 },
          ...prev,
        ]);
        showToast(`Đã tạo và thêm vào "${created.name}"`);
        setNewPlaylistName("");
        setIsCreatingNew(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredPlaylists = playlistStatuses.filter((p) =>
    p.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div
      onClick={closeAddToPlaylist}
      className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#242424] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-[#1db954]" />
            <h2 className="text-base font-bold text-white">Thêm vào danh sách phát</h2>
          </div>
          <button
            onClick={closeAddToPlaylist}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Song Preview Banner */}
        <div className="px-4 py-3 bg-[#181818] border-b border-white/5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-black overflow-hidden flex-shrink-0 border border-white/10 shadow">
            {songForPlaylist.image_url || songForPlaylist.thumbnail ? (
              <img
                src={songForPlaylist.image_url || songForPlaylist.thumbnail}
                alt={songForPlaylist.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <Music className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{songForPlaylist.title}</p>
            <p className="text-xs text-gray-400 truncate">
              {songForPlaylist.artist || songForPlaylist.author?.name || "Nghệ sĩ"}
            </p>
          </div>
        </div>

        {/* Toast Notification banner inside modal */}
        {toastMessage && (
          <div className="bg-[#1db954]/20 border-b border-[#1db954]/30 px-4 py-2 text-xs font-semibold text-[#1db954] flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Action: Create New Playlist Inline */}
        <div className="p-4 border-b border-white/10">
          {!isCreatingNew ? (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition border border-white/10"
            >
              <Plus className="w-4 h-4 text-[#1db954]" />
              <span>Tạo danh sách phát mới</span>
            </button>
          ) : (
            <form onSubmit={handleCreateNewPlaylist} className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Tên danh sách phát mới..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="flex-1 bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#1db954]"
              />
              <button
                type="submit"
                disabled={!newPlaylistName.trim() || actionLoadingId === -1}
                className="bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-50 text-black font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1"
              >
                {actionLoadingId === -1 ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Tạo</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  setNewPlaylistName("");
                }}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs transition"
              >
                Huỷ
              </button>
            </form>
          )}

          {/* Search Playlist Filter if user has multiple */}
          {playlistStatuses.length > 4 && (
            <div className="relative mt-3">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm danh sách phát..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>
          )}
        </div>

        {/* Playlist List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[160px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1db954]" />
              <span className="text-xs">Đang tải danh sách phát...</span>
            </div>
          ) : filteredPlaylists.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-xs text-gray-400 mb-2">
                {filterQuery
                  ? "Không tìm thấy danh sách phát phù hợp"
                  : "Bạn chưa có danh sách phát nào"}
              </p>
              <p className="text-[11px] text-gray-500">
                Hãy bấm nút &quot;Tạo danh sách phát mới&quot; ở trên để bắt đầu!
              </p>
            </div>
          ) : (
            filteredPlaylists.map((pl) => {
              const isActionLoading = actionLoadingId === pl.id;

              return (
                <div
                  key={pl.id}
                  onClick={() => handleToggleSongInPlaylist(pl)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition select-none ${
                    pl.hasSong
                      ? "bg-[#1db954]/10 hover:bg-[#1db954]/15 border border-[#1db954]/30"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#181818] overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10 shadow">
                      {pl.cover_image ? (
                        <img
                          src={pl.cover_image}
                          alt={pl.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-bold truncate transition ${
                          pl.hasSong ? "text-[#1db954]" : "text-white group-hover:text-white"
                        }`}
                      >
                        {pl.name}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {pl.song_count} bài hát
                      </p>
                    </div>
                  </div>

                  {/* Spotify-style Checkbox Toggle */}
                  <div className="flex items-center pl-2">
                    {isActionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#1db954]" />
                    ) : pl.hasSong ? (
                      <div className="w-5 h-5 rounded-full bg-[#1db954] flex items-center justify-center text-black shadow">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-gray-500 group-hover:border-white transition flex items-center justify-center">
                        <Plus className="w-3 h-3 text-gray-400 group-hover:text-white transition" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 flex justify-end">
          <button
            onClick={closeAddToPlaylist}
            className="px-5 py-2 rounded-full bg-white text-black font-bold text-xs hover:scale-105 transition shadow"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
}
