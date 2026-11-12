"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  CheckCircle2,
  Heart,
  Music2,
  Users,
  Eye,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { Song } from "@/lib/db";

interface Artist {
  id: string;
  name: string;
  customUrl?: string;
  description?: string;
  avatar?: string;
  banner?: string | null;
  subscribers?: string;
  views?: string;
  videoCount?: number | string;
}

interface ArtistViewProps {
  channelId?: string;
  artistName?: string;
  onBack: () => void;
  onSongSaved?: (song: Song) => void;
}

export default function ArtistView({
  channelId,
  artistName,
  onBack,
}: ArtistViewProps) {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { isFavorite, toggleFavorite, isFollowingArtist, toggleFollowArtist } = useAuth();
  
  const isFollowing = artist ? isFollowingArtist(artist.name, artist.id) : false;

  useEffect(() => {
    async function loadArtist() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (channelId) params.set("channelId", channelId);
        else if (artistName) params.set("q", artistName);

        const res = await fetch(`/api/youtube/artist?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setArtist(data.artist);
          setSongs(data.popularSongs || []);
        }
      } catch (err) {
        console.error("Failed to load artist profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadArtist();
  }, [channelId, artistName]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#1db954]" />
        <p className="text-sm">Đang tải trang cá nhân nghệ sĩ...</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">Không tìm thấy thông tin nghệ sĩ.</p>
        <button
          onClick={onBack}
          className="text-xs bg-white text-black px-4 py-2 rounded-full font-bold"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const isCurrentArtistPlaying =
    currentSong && songs.some((s) => s.id === currentSong.id);

  return (
    <div className="text-white pb-32">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>
      </div>

      {/* Artist Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#333] to-[#121212] mb-8 border border-white/10 shadow-2xl">
        {artist.banner && (
          <img
            src={artist.banner}
            alt={artist.name}
            className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent" />

        <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center md:items-end gap-6">
          {/* Avatar */}
          <div className="w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden shadow-2xl border-4 border-white/10 flex-shrink-0 bg-black">
            {artist.avatar ? (
              <img
                src={artist.avatar}
                alt={artist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <Music2 className="w-16 h-16 text-gray-500" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-sky-400 font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4 fill-sky-400 text-black" />
              <span>Nghệ sĩ đã xác minh trên YouTube</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight">
              {artist.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#1db954]" />
                {artist.subscribers} người đăng ký
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-sky-400" />
                {artist.views} lượt xem
              </span>
              {artist.customUrl && (
                <>
                  <span>•</span>
                  <span className="text-gray-400">{artist.customUrl}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center gap-4 mb-8">
        {songs.length > 0 && (
          <button
            onClick={() => {
              if (isCurrentArtistPlaying && isPlaying) {
                togglePlay();
              } else {
                playSong(songs[0], songs);
              }
            }}
            className="w-14 h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] hover:scale-105 flex items-center justify-center text-black shadow-xl transition"
            title="Phát tất cả"
          >
            {isCurrentArtistPlaying && isPlaying ? (
              <Pause className="w-7 h-7 fill-black" />
            ) : (
              <Play className="w-7 h-7 fill-black ml-1" />
            )}
          </button>
        )}

        <button
          onClick={() => {
            if (artist) {
              toggleFollowArtist({
                name: artist.name,
                channelId: artist.id,
                avatar: artist.avatar,
              });
            }
          }}
          className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition ${
            isFollowing
              ? "border-[#1db954] text-[#1db954] bg-[#1db954]/10 shadow-[0_0_12px_rgba(29,185,84,0.2)]"
              : "border-gray-500 text-white hover:border-white hover:scale-105"
          }`}
        >
          {isFollowing ? "Đang theo dõi" : "Theo dõi"}
        </button>
      </div>

      {/* Popular Songs Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#1db954]" />
          <span>Bài hát phổ biến nhất ({songs.length})</span>
        </h2>

        <div className="flex flex-col gap-1">
          {songs.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;
            const favorited = isFavorite(song);

            return (
              <div
                key={song.id}
                onClick={() => playSong(song, songs)}
                className={`group flex items-center gap-4 p-2.5 rounded-lg hover:bg-[#282828] transition cursor-pointer ${
                  isCurrent ? "bg-[#242424]" : ""
                }`}
              >
                {/* Rank number or Play button */}
                <div className="w-6 text-center text-sm font-semibold text-gray-400 group-hover:text-white">
                  {isCurrent && isPlaying ? (
                    <Pause className="w-4 h-4 fill-white text-white mx-auto" />
                  ) : (
                    <span className="group-hover:hidden">{index + 1}</span>
                  )}
                  <Play className="w-4 h-4 fill-white text-white mx-auto hidden group-hover:block" />
                </div>

                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-md overflow-hidden bg-black flex-shrink-0 relative">
                  <img
                    src={song.image_url}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title & Artist */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${
                      isCurrent ? "text-[#1db954]" : "text-white"
                    }`}
                  >
                    {song.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                </div>

                {/* Favorite Heart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(song);
                  }}
                  title={favorited ? "Bỏ yêu thích" : "Yêu thích"}
                  className={`p-2 rounded-full transition ${
                    favorited
                      ? "text-[#1db954]"
                      : "text-gray-400 hover:text-white opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${favorited ? "fill-[#1db954] text-[#1db954]" : ""}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* About Section */}
      {artist.description && (
        <div className="bg-[#181818] p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-bold mb-3">Giới thiệu về nghệ sĩ</h3>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line max-w-3xl">
            {artist.description}
          </p>
        </div>
      )}
    </div>
  );
}
