"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Clock,
  Heart,
  Trash2,
  Edit3,
  Music,
  ArrowLeft,
  Loader2,
  Eye,
  Plus,
  Check,
  X,
  Sparkles,
  Download,
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { usePlaylist, PlaylistSongItem } from "@/context/PlaylistContext";
import { Song } from "@/lib/db";

interface PlaylistViewProps {
  playlistId: number;
  onBack: () => void;
  onOpenArtist?: (name: string) => void;
}

export default function PlaylistView({
  playlistId,
  onBack,
  onOpenArtist,
}: PlaylistViewProps) {
  const [playlist, setPlaylist] = useState<any | null>(null);
  const [songs, setSongs] = useState<PlaylistSongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { currentSong, isPlaying, playSong, togglePlay, setIsRightPanelOpen } = usePlayer();
  const { user, isFavorite, toggleFavorite } = useAuth();
  const { updatePlaylist, deletePlaylist, removeSongFromPlaylist, openAddToPlaylist, openImportModal } = usePlaylist();

  const fetchPlaylistData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/playlists/${playlistId}`);
      if (res.ok) {
        const data = await res.json();
        setPlaylist(data.playlist);
        setSongs(data.songs || []);
        setEditName(data.playlist.name || "");
        setEditDesc(data.playlist.description || "");
      } else {
        setPlaylist(null);
      }
    } catch (err) {
      console.error("Lỗi tải playlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylistData();
  }, [playlistId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1db954]" />
        <p className="text-sm">Đang tải danh sách phát...</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-24">
        <p className="text-base text-gray-300 mb-4">Không tìm thấy danh sách phát hoặc đã bị xoá.</p>
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-2 px-5 rounded-full transition"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const isCurrentPlaylistPlaying =
    isPlaying &&
    currentSong &&
    songs.some((s) => s.audio_url === currentSong.audio_url);

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    if (isCurrentPlaylistPlaying) {
      togglePlay();
    } else {
      const formattedSongs: Song[] = songs.map((s) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        audio_url: s.audio_url,
        image_url: s.image_url,
        duration: s.duration,
        views: s.views ?? undefined,
        source: "youtube",
      }));
      playSong(formattedSongs[0], formattedSongs, true);
      setIsRightPanelOpen(true);
    }
  };

  const handlePlaySongItem = (song: PlaylistSongItem) => {
    if (currentSong?.audio_url === song.audio_url) {
      togglePlay();
    } else {
      const formattedSongs: Song[] = songs.map((s) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        audio_url: s.audio_url,
        image_url: s.image_url,
        duration: s.duration,
        views: s.views ?? undefined,
        source: "youtube",
      }));
      const target = formattedSongs.find((s) => s.id === song.id) || formattedSongs[0];
      playSong(target, formattedSongs, true);
      setIsRightPanelOpen(true);
    }
  };

  const handleRemoveSong = async (e: React.MouseEvent, song: PlaylistSongItem) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Xoá bài hát "${song.title}" khỏi danh sách phát này?`);
    if (!confirmed) return;

    const success = await removeSongFromPlaylist(playlist.id, song.audio_url, song.id);
    if (success) {
      setSongs((prev) => prev.filter((s) => s.id !== song.id));
      setPlaylist((prev: any) =>
        prev ? { ...prev, song_count: Math.max(0, prev.song_count - 1) } : prev
      );
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    setIsSaving(true);
    try {
      const success = await updatePlaylist(playlist.id, {
        name: editName.trim(),
        description: editDesc.trim(),
      });
      if (success) {
        setPlaylist((prev: any) => ({
          ...prev,
          name: editName.trim(),
          description: editDesc.trim(),
        }));
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlaylist = async () => {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xoá danh sách phát "${playlist.name}"?`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const success = await deletePlaylist(playlist.id);
      if (success) {
        onBack();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate total duration in minutes
  const totalSeconds = songs.reduce((acc, s) => acc + (s.duration || 0), 0);
  const totalMinutes = Math.floor(totalSeconds / 60);

  const coverUrl = playlist.cover_image || playlist.image_url;

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      {/* Top back button */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition group py-1 px-2 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại</span>
        </button>
      </div>

      {/* Spotify Signature Playlist Header Banner */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#333333] via-[#1a1a1a] to-[#121212] border border-white/10 shadow-2xl relative overflow-hidden mb-8">
        {/* Cover Art */}
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-[#121212] flex-shrink-0 shadow-2xl border border-white/10 flex items-center justify-center relative group">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={playlist.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Music className="w-16 h-16 text-gray-400 mb-2 stroke-[1.5]" />
              <span className="text-xs text-gray-400 font-medium">Danh sách phát</span>
            </div>
          )}
        </div>

        {/* Playlist Info */}
        <div className="flex-1 min-w-0 text-center md:text-left flex flex-col justify-end">
          <span className="text-xs font-bold uppercase tracking-widest text-white/80 mb-1">
            Danh sách phát công khai
          </span>

          {!isEditing ? (
            <div>
              <h1
                onClick={() => user?.id === playlist.user_id && setIsEditing(true)}
                className={`text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3 line-clamp-2 ${
                  user?.id === playlist.user_id ? "cursor-pointer hover:underline decoration-white/30" : ""
                }`}
                title={user?.id === playlist.user_id ? "Bấm để đổi tên" : undefined}
              >
                {playlist.name}
              </h1>
              {playlist.description && (
                <p className="text-sm text-gray-300 mb-3 line-clamp-2 max-w-2xl">
                  {playlist.description}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-4 space-y-2 max-w-xl">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Tên danh sách phát..."
                className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-lg font-bold text-white focus:outline-none focus:border-[#1db954]"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Thêm mô tả tuỳ chọn..."
                rows={2}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1db954]"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving || !editName.trim()}
                  className="bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs px-4 py-1.5 rounded-full transition flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Lưu</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(playlist.name);
                    setEditDesc(playlist.description || "");
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-4 py-1.5 rounded-full transition flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Huỷ</span>
                </button>
              </div>
            </div>
          )}

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-gray-300 font-medium">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#1db954] text-black text-[10px] font-black flex items-center justify-center">
                {playlist.owner_name?.charAt(0).toUpperCase() || "U"}
              </span>
              <span>{playlist.owner_name || "Người dùng"}</span>
            </span>
            <span>•</span>
            <span>{songs.length} bài hát</span>
            {totalMinutes > 0 && (
              <>
                <span>•</span>
                <span>khoảng {totalMinutes} phút</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar (Play All, Edit, Delete) */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handlePlayAll}
          disabled={songs.length === 0}
          className="w-14 h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center text-black shadow-xl hover:scale-105 transition cursor-pointer"
          title={isCurrentPlaylistPlaying ? "Tạm dừng" : "Phát tất cả"}
        >
          {isCurrentPlaylistPlaying ? (
            <Pause className="w-6 h-6 fill-black text-black" />
          ) : (
            <Play className="w-6 h-6 fill-black text-black translate-x-0.5" />
          )}
        </button>

        {user?.id === playlist.user_id && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
            title="Chỉnh sửa thông tin"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        )}

        {user?.id === playlist.user_id && (
          <button
            onClick={() => openImportModal()}
            className="p-2.5 rounded-full text-gray-400 hover:text-emerald-400 hover:bg-white/10 transition"
            title="Nhập thêm bài hát từ Spotify hoặc YouTube"
          >
            <Download className="w-5 h-5" />
          </button>
        )}

        {user?.id === playlist.user_id && (
          <button
            onClick={handleDeletePlaylist}
            disabled={isDeleting}
            className="p-2.5 rounded-full text-gray-400 hover:text-rose-500 hover:bg-white/10 transition"
            title="Xoá danh sách phát"
          >
            {isDeleting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Song List Table */}
      {songs.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#181818]/50 border border-white/5 rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mx-auto mb-3">
            <Music className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Danh sách phát này đang trống
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5 leading-relaxed">
            Bạn có thể tìm kiếm bài hát mới, hoặc chuyển toàn bộ playlist yêu thích từ Spotify hay YouTube vào đây chỉ với 1 click!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onBack}
              className="bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs py-2 px-5 rounded-full transition shadow"
            >
              Khám phá bài hát
            </button>
            <button
              onClick={() => openImportModal()}
              className="bg-white/10 hover:bg-white/15 text-white font-bold text-xs py-2 px-5 rounded-full transition flex items-center gap-2 border border-white/10 shadow"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nhập từ Spotify / YouTube</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#121212]/80 border border-white/5 rounded-2xl overflow-hidden shadow-lg">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-gray-400 border-b border-white/5 uppercase tracking-wider select-none">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-6 sm:col-span-5 md:col-span-6">Tiêu đề</div>
            <div className="hidden sm:block sm:col-span-3 md:col-span-3">Nghệ sĩ</div>
            <div className="col-span-5 sm:col-span-3 md:col-span-2 text-right flex items-center justify-end gap-1">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/[0.03]">
            {songs.map((song, idx) => {
              const isCurrent = currentSong?.audio_url === song.audio_url;
              const isSongActiveAndPlaying = isCurrent && isPlaying;
              const isSongFav = isFavorite({ audio_url: song.audio_url });

              const minutes = Math.floor((song.duration || 0) / 60);
              const seconds = (song.duration || 0) % 60;
              const durationStr = song.duration
                ? `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
                : "--:--";

              return (
                <div
                  key={song.id}
                  onClick={() => handlePlaySongItem(song)}
                  className={`group grid grid-cols-12 gap-4 px-4 py-2.5 items-center cursor-pointer transition select-none ${
                    isCurrent
                      ? "bg-[#1db954]/10 text-[#1db954]"
                      : "hover:bg-white/5 text-gray-300 hover:text-white"
                  }`}
                >
                  {/* # or Play Icon */}
                  <div className="col-span-1 flex items-center justify-center text-xs">
                    {isSongActiveAndPlaying ? (
                      <div className="w-4 h-4 flex items-center justify-center">
                        <span className="w-1.5 h-3.5 bg-[#1db954] animate-pulse rounded-sm" />
                      </div>
                    ) : (
                      <>
                        <span className="group-hover:hidden text-gray-500 font-medium">
                          {idx + 1}
                        </span>
                        <Play className="w-3.5 h-3.5 fill-current hidden group-hover:block" />
                      </>
                    )}
                  </div>

                  {/* Title & Thumbnail */}
                  <div className="col-span-6 sm:col-span-5 md:col-span-6 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10 shadow">
                      {song.image_url ? (
                        <img
                          src={song.image_url}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <Music className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? "text-[#1db954]" : "text-white group-hover:text-white"
                        }`}
                      >
                        {song.title}
                      </p>
                      <p
                        onClick={(e) => {
                          if (onOpenArtist && song.artist) {
                            e.stopPropagation();
                            onOpenArtist(song.artist);
                          }
                        }}
                        className="text-xs text-gray-400 hover:underline truncate sm:hidden"
                      >
                        {song.artist}
                      </p>
                    </div>
                  </div>

                  {/* Artist (Desktop) */}
                  <div className="hidden sm:block sm:col-span-3 md:col-span-3 min-w-0">
                    <p
                      onClick={(e) => {
                        if (onOpenArtist && song.artist) {
                          e.stopPropagation();
                          onOpenArtist(song.artist);
                        }
                      }}
                      className="text-xs text-gray-400 hover:text-white hover:underline truncate"
                    >
                      {song.artist}
                    </p>
                  </div>

                  {/* Duration + Actions (Like, Add to other playlist, Remove) */}
                  <div className="col-span-5 sm:col-span-3 md:col-span-2 flex items-center justify-end gap-2">
                    {/* View count if available */}
                    {song.views && (
                      <span className="hidden md:flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                        <Eye className="w-3 h-3 text-emerald-400/80" />
                        <span>{song.views}</span>
                      </span>
                    )}

                    {/* Like button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(song);
                      }}
                      className={`p-1.5 rounded-full transition ${
                        isSongFav
                          ? "text-[#1db954]"
                          : "text-gray-500 hover:text-white opacity-0 group-hover:opacity-100"
                      }`}
                      title={isSongFav ? "Bỏ thích" : "Yêu thích"}
                    >
                      <Heart className={`w-4 h-4 ${isSongFav ? "fill-current" : ""}`} />
                    </button>

                    {/* Add to another playlist */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddToPlaylist(song);
                      }}
                      className="p-1.5 rounded-full text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition"
                      title="Thêm vào danh sách phát khác"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {/* Remove from this playlist */}
                    {user?.id === playlist.user_id && (
                      <button
                        onClick={(e) => handleRemoveSong(e, song)}
                        className="p-1.5 rounded-full text-gray-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition"
                        title="Xoá khỏi danh sách phát này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Duration text */}
                    <span className="text-xs text-gray-400 font-mono w-10 text-right">
                      {durationStr}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
