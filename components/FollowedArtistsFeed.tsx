"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { usePlaylist } from "@/context/PlaylistContext";
import { Song } from "@/lib/db";
import {
  Play,
  Heart,
  Plus,
  Users,
  Music2,
  Loader2,
  Sparkles,
  ExternalLink,
  UserPlus,
  Check,
} from "lucide-react";

interface FollowedArtistsFeedProps {
  onPlaySong: (song: Song, queue?: Song[], isPlaylistContext?: boolean) => void;
  onOpenArtist: (artist: { channelId?: string; name?: string }) => void;
}

// Recommended artists for quick-follow when user has no follows yet
const SUGGESTED_ARTISTS = [
  {
    name: "Sơn Tùng M-TP Official",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_k6J03uE3oRffy32zV-c_dYfI48iYc6bVqfK3fJ=s176-c-k-c0x00ffffff-no-rj",
    genre: "V-Pop",
  },
  {
    name: "Đen Vâu",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_nkQx1u56X5g65N4Q4L5E_d-f38bB6-c8Q=s176-c-k-c0x00ffffff-no-rj",
    genre: "Hip-hop / Rap",
  },
  {
    name: "Vũ. - Topic",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_muN77w7P3B0Mv-1m5M2e-5=s176-c-k-c0x00ffffff-no-rj",
    genre: "Indie Pop",
  },
  {
    name: "Taylor Swift",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_nk9iL5640=s176-c-k-c0x00ffffff-no-rj",
    genre: "Pop / Country",
  },
  {
    name: "Charlie Puth",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_nF7f38k=s176-c-k-c0x00ffffff-no-rj",
    genre: "Pop",
  },
];

export default function FollowedArtistsFeed({
  onPlaySong,
  onOpenArtist,
}: FollowedArtistsFeedProps) {
  const { user, followedArtists, isFollowingArtist, toggleFollowArtist } = useAuth();
  const { currentSong, isPlaying } = usePlayer();
  const { isFavorite, toggleFavorite } = useAuth();
  const { openAddToPlaylist } = usePlaylist();

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowedSongs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/artists/follow/songs");
      if (res.ok) {
        const data = await res.json();
        setSongs(data.songs || []);
      }
    } catch (err) {
      console.error("Error loading followed songs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (followedArtists.length > 0) {
      fetchFollowedSongs();
    } else {
      setSongs([]);
      setLoading(false);
    }
  }, [followedArtists.length]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Followed Artists Horizontal Avatar Bar */}
      {followedArtists.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1db954]" />
              <span>Nghệ sĩ bạn đang theo dõi ({followedArtists.length})</span>
            </h3>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#333333]">
            {followedArtists.map((artist) => (
              <div
                key={artist.id}
                onClick={() =>
                  onOpenArtist({
                    channelId: artist.channel_id || undefined,
                    name: artist.artist_name,
                  })
                }
                className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#181818] hover:bg-[#252525] border border-white/5 hover:border-white/10 transition cursor-pointer flex-shrink-0 w-28 text-center"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-black border-2 border-white/10 group-hover:border-[#1db954] group-hover:scale-105 transition shadow-md">
                  {artist.avatar_url ? (
                    <img
                      src={artist.avatar_url}
                      alt={artist.artist_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-[#1db954] font-bold text-lg">
                      {artist.artist_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-white truncate w-full group-hover:text-[#1db954] transition">
                  {artist.artist_name}
                </p>
                <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
                  Nghệ sĩ
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State when no followed artists */}
      {followedArtists.length === 0 && (
        <div className="rounded-2xl p-8 bg-[#181818]/60 border border-white/5 text-center max-w-2xl mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-full bg-[#242424] flex items-center justify-center text-[#1db954] mx-auto mb-4 shadow">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Bạn chưa theo dõi nghệ sĩ nào
          </h3>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Nhấn theo dõi các nghệ sĩ mà bạn yêu thích trên trang nghệ sĩ để cập nhật những ca khúc và sản phẩm mới nhất ngay tại đây!
          </p>

          {/* Quick Suggestions */}
          <div className="text-left mt-6 pt-6 border-t border-white/5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Gợi ý nghệ sĩ nổi bật dành cho bạn:</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SUGGESTED_ARTISTS.map((item) => {
                const following = isFollowingArtist(item.name);
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#202020] border border-white/5 hover:border-white/10 transition"
                  >
                    <div
                      onClick={() => onOpenArtist({ name: item.name })}
                      className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                    >
                      <div className="w-10 h-10 rounded-full bg-black overflow-hidden flex-shrink-0">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate hover:text-[#1db954] transition">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-gray-400">{item.genre}</p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        toggleFollowArtist({
                          name: item.name,
                          avatar: item.avatar,
                        })
                      }
                      className={`text-xs font-bold px-3 py-1.5 rounded-full transition flex items-center gap-1 ${
                        following
                          ? "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400 border border-white/10"
                          : "bg-white text-black hover:bg-[#1db954] hover:scale-105"
                      }`}
                    >
                      {following ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đang theo dõi</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Theo dõi</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Song List Feed */}
      {followedArtists.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Music2 className="w-5 h-5 text-[#1db954]" />
                <span>Ca khúc từ các nghệ sĩ đang theo dõi ({songs.length})</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Được tổng hợp từ các kênh chính thức của những nghệ sĩ bạn theo dõi
              </p>
            </div>

            {songs.length > 0 && (
              <button
                onClick={() => onPlaySong(songs[0], songs, true)}
                className="bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs py-2 px-5 rounded-full flex items-center gap-2 transition hover:scale-105 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Phát tất cả</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#1db954]" />
              <p className="text-sm">Đang tải ca khúc từ các nghệ sĩ bạn theo dõi...</p>
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-16 bg-[#181818]/60 border border-white/5 rounded-2xl text-gray-400">
              <p className="text-sm">Chưa tìm thấy ca khúc nào từ các nghệ sĩ bạn theo dõi.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {songs.map((song, index) => {
                const isCurrent =
                  currentSong?.id === song.id ||
                  (currentSong?.videoId && currentSong.videoId === song.videoId);

                return (
                  <div
                    key={song.id || index}
                    onClick={() => onPlaySong(song, songs, true)}
                    className={`group flex items-center gap-4 p-2.5 rounded-xl hover:bg-[#252525] transition cursor-pointer border border-transparent hover:border-white/5 ${
                      isCurrent ? "bg-[#202020] border-white/10" : ""
                    }`}
                  >
                    {/* Index or Equalizer */}
                    <div className="w-6 text-center text-sm font-semibold text-gray-400 flex-shrink-0">
                      {isCurrent && isPlaying ? (
                        <span className="text-[#1db954] text-xs font-bold animate-pulse">
                          ▶
                        </span>
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0 relative shadow">
                      {song.image_url ? (
                        <img
                          src={song.image_url}
                          alt={song.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <Music2 className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <Play className="w-5 h-5 fill-white text-white" />
                      </div>
                    </div>

                    {/* Title & Artist */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? "text-[#1db954]" : "text-white group-hover:text-white"
                        }`}
                      >
                        {song.title}
                      </p>
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenArtist({ name: song.artist });
                        }}
                        className="text-xs text-gray-400 truncate hover:text-white hover:underline mt-0.5 inline-block"
                      >
                        {song.artist}
                      </p>
                    </div>

                    {/* Views Count */}
                    {song.views && (
                      <span className="text-xs text-gray-400 font-medium hidden sm:inline-block">
                        {song.views}
                      </span>
                    )}

                    {/* Duration */}
                    {song.duration && (
                      <span className="text-xs text-gray-500 font-mono hidden md:inline-block">
                        {song.duration}
                      </span>
                    )}

                    {/* Actions: Add to Playlist */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddToPlaylist(song);
                      }}
                      title="Thêm vào danh sách phát"
                      className="p-2 rounded-full text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 hover:bg-white/10 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {/* Like Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(song);
                      }}
                      title={isFavorite(song) ? "Bỏ yêu thích" : "Yêu thích"}
                      className="p-2 text-gray-400 hover:text-white transition"
                    >
                      <Heart
                        className={`w-4 h-4 transition ${
                          isFavorite(song)
                            ? "fill-[#1db954] text-[#1db954]"
                            : "hover:scale-110"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
