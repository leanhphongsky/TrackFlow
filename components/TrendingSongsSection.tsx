"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Play,
  Pause,
  Heart,
  Globe,
  RefreshCw,
  Eye,
  Music2,
  Calendar,
  Flame,
  ChevronDown,
  ChevronUp,
  Plus,
  MoreVertical,
} from "lucide-react";
import { Song } from "@/lib/db";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { usePlaylist } from "@/context/PlaylistContext";

interface TrendingSongItem extends Song {
  rank?: number;
  globalRank?: number;
  views_gain_24h?: number;
  viewsGain24hFormatted?: string;
  total_views?: number;
  totalViewsFormatted?: string;
  views?: string;
  viewCount?: number;
  region?: string;
  regionBadge?: string;
  channelId?: string;
}

interface SongCategory {
  id: string;
  name: string;
  badge: string;
  description: string;
  songs: TrendingSongItem[];
}

interface TrendingSongsSectionProps {
  onPlaySong: (song: Song, queue?: Song[], isPlaylistContext?: boolean) => void;
  onOpenArtist: (artist: { channelId?: string; name?: string }) => void;
}

export default function TrendingSongsSection({
  onPlaySong,
  onOpenArtist,
}: TrendingSongsSectionProps) {
  const [categories, setCategories] = useState<SongCategory[]>([]);
  const [allTracks, setAllTracks] = useState<TrendingSongItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [chartDate, setChartDate] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const { currentSong, isPlaying, togglePlay } = usePlayer();
  const { isFavorite, toggleFavorite } = useAuth();
  const { openAddToPlaylist } = usePlaylist();

  const fetchTrendingSongs = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setIsRefreshing(true);
      else setLoading(true);

      const url = forceRefresh
        ? "/api/songs/trending?refresh=true"
        : "/api/songs/trending";

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        setAllTracks(data.allTracks || []);
        if (data.chartDate) {
          setChartDate(data.chartDate);
        }
        if (data.updatedAt) {
          const time = new Date(data.updatedAt);
          setLastUpdated(
            time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
          );
        }
      }
    } catch (err) {
      console.error("Failed to load trending songs:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrendingSongs();
  }, []);

  const currentCategory = categories.find((c) => c.id === activeTab);
  const displayedTracks: TrendingSongItem[] =
    activeTab === "all" ? allTracks : currentCategory?.songs || [];
  const visibleTracks: TrendingSongItem[] = isExpanded
    ? displayedTracks
    : displayedTracks.slice(0, 10);

  const formatSongDuration = (seconds?: number): string => {
    if (!seconds || seconds <= 0) return "";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleTrackClick = (track: TrendingSongItem) => {
    const isCurrent = currentSong?.id === track.id || currentSong?.audio_url === track.audio_url;
    if (isCurrent) {
      togglePlay();
    } else {
      onPlaySong(track, displayedTracks, true);
    }
  };

  return (
    <div className="mb-10 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-[#1db954] flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-[#1db954]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <span>Listening right now</span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                24h Growth
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              {activeTab === "all"
                ? "Bảng xếp hạng bài hát đang được nghe nhiều nhất và tăng trưởng nhanh nhất"
                : currentCategory?.description || "Xếp hạng theo độ tăng trưởng lượt xem"}
              {chartDate && (
                <span className="text-gray-300 ml-1.5 font-medium inline-flex items-center gap-1">
                  • <Calendar className="w-3 h-3 inline text-gray-400" /> Ngày {chartDate}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Actions: Play All & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {displayedTracks.length > 0 && (
            <button
              onClick={() => onPlaySong(displayedTracks[0], displayedTracks, true)}
              className="bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs py-2 px-4 rounded-full flex items-center gap-1.5 transition hover:scale-105 shadow-lg"
              title="Phát toàn bộ danh sách thịnh hành"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Phát tất cả</span>
            </button>
          )}

          <button
            onClick={() => fetchTrendingSongs(true)}
            disabled={isRefreshing || loading}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-[#181818] hover:bg-[#252525] border border-white/5 px-3 py-2 rounded-full transition disabled:opacity-50"
            title="Làm mới bảng xếp hạng từ YouTube"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#1db954]" : ""}`}
            />
            <span className="hidden sm:inline">Làm mới 24h</span>
          </button>
        </div>
      </div>

      {/* Region Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition flex-shrink-0 ${
            activeTab === "all"
              ? "bg-white text-black shadow-md scale-105"
              : "bg-[#181818] text-gray-400 hover:text-white hover:bg-[#252525] border border-white/5"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Tất cả (Top 24h Toàn cầu)</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition flex-shrink-0 ${
              activeTab === cat.id
                ? "bg-white text-black shadow-md scale-105"
                : "bg-[#181818] text-gray-400 hover:text-white hover:bg-[#252525] border border-white/5"
            }`}
          >
            <span>{cat.badge}</span>
            <span className="text-[10px] opacity-70">({cat.songs.length})</span>
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-2 pt-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#181818] border border-white/5 animate-pulse flex items-center gap-4"
            >
              <div className="w-6 h-4 bg-white/5 rounded" />
              <div className="w-12 h-12 rounded-lg bg-white/5" />
              <div className="flex-1 space-y-2">
                <div className="w-48 h-3.5 bg-white/5 rounded" />
                <div className="w-28 h-2.5 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Trending Songs List - Dual-Column Grid (Liner Style) */
        <div className="bg-[#181818]/40 border border-white/5 rounded-2xl overflow-hidden p-2.5 sm:p-3.5 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
            {visibleTracks.map((song, index) => {
              const isCurrent =
                currentSong?.id === song.id || currentSong?.audio_url === song.audio_url;
              const favorited = isFavorite(song);
              const rank = song.globalRank || song.rank || index + 1;
              const durStr = formatSongDuration(song.duration);

              return (
                <div
                  key={song.id}
                  onClick={() => handleTrackClick(song)}
                  className={`group flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-[#222222] transition cursor-pointer border border-transparent hover:border-white/5 ${
                    isCurrent ? "bg-[#242424] border-white/10" : "bg-[#161616]/70"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Rank Number */}
                    <div className="w-6 text-center flex-shrink-0">
                      {isCurrent && isPlaying ? (
                        <div className="flex items-center justify-center gap-0.5 h-3.5">
                          <span className="w-1 bg-[#1db954] h-2.5 animate-bounce rounded-full" />
                          <span className="w-1 bg-[#1db954] h-3.5 animate-bounce delay-75 rounded-full" />
                          <span className="w-1 bg-[#1db954] h-2 animate-bounce delay-150 rounded-full" />
                        </div>
                      ) : (
                        <span
                          className={`text-xs font-black ${
                            rank === 1
                              ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] text-sm"
                              : rank === 2
                              ? "text-slate-300 font-bold"
                              : rank === 3
                              ? "text-amber-600 font-bold"
                              : "text-gray-500 font-semibold"
                          }`}
                        >
                          #{rank}
                        </span>
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-black flex-shrink-0 shadow border border-white/5 flex items-center justify-center">
                      {song.image_url ? (
                        <img
                          src={song.image_url}
                          alt={song.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                          loading="lazy"
                        />
                      ) : (
                        <Music2 className="w-5 h-5 text-gray-500" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        {isCurrent && isPlaying ? (
                          <Pause className="w-4 h-4 fill-white text-white" />
                        ) : (
                          <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                        )}
                      </div>
                    </div>

                    {/* Title & Artist */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs sm:text-sm font-bold truncate transition ${
                          isCurrent ? "text-[#1db954]" : "text-white group-hover:text-[#1db954]"
                        }`}
                      >
                        {song.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 truncate">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenArtist({ name: song.artist, channelId: song.channelId });
                          }}
                          className="text-xs text-gray-400 hover:text-white hover:underline truncate cursor-pointer font-medium"
                        >
                          {song.artist}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Duration & Actions (Liner 3-dots style) */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Duration */}
                    {durStr && (
                      <span className="text-[12px] font-mono text-gray-400 mr-1">
                        {durStr}
                      </span>
                    )}

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(song);
                      }}
                      className={`p-1.5 rounded-full hover:bg-white/10 transition ${
                        favorited ? "text-[#1db954]" : "text-gray-500 hover:text-white"
                      }`}
                      title={favorited ? "Bỏ yêu thích" : "Yêu thích"}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${favorited ? "fill-[#1db954]" : ""}`}
                      />
                    </button>

                    {/* Liner 3-dots Menu / Add to Playlist */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddToPlaylist(song);
                      }}
                      className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
                      title="Tùy chọn bài hát"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toggle Expand / Collapse (Show Top 10 or Full List) */}
          {displayedTracks.length > 10 && (
            <div className="flex justify-center pt-3 pb-1 border-t border-white/5 mt-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-gray-300 hover:text-white bg-[#202020] hover:bg-[#2a2a2a] border border-white/10 transition shadow-md hover:scale-105 active:scale-95"
              >
                {isExpanded ? (
                  <>
                    <span>Thu gọn bảng xếp hạng (Hiện Top 10)</span>
                    <ChevronUp className="w-4 h-4 text-[#1db954]" />
                  </>
                ) : (
                  <>
                    <span>Xem toàn bộ bảng xếp hạng ({displayedTracks.length} bài hát)</span>
                    <ChevronDown className="w-4 h-4 text-[#1db954]" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
