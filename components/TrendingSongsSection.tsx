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
} from "lucide-react";
import { Song } from "@/lib/db";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";

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
    : displayedTracks.slice(0, 5);

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
            <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Bảng xếp hạng bài hát thịnh hành</span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Flame className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                24h Velocity Growth
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              {activeTab === "all"
                ? "Xếp hạng dựa trên số view tăng trưởng trong 24 giờ qua trên toàn cầu"
                : currentCategory?.description || "Xếp hạng theo độ tăng trưởng lượt xem trong 24 giờ qua"}
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
        /* Trending Songs List */
        <div className="bg-[#181818]/60 border border-white/5 rounded-2xl overflow-hidden p-2 sm:p-3 shadow-xl">
          <div className="flex flex-col gap-1">
            {visibleTracks.map((song, index) => {
              const isCurrent =
                currentSong?.id === song.id || currentSong?.audio_url === song.audio_url;
              const favorited = isFavorite(song);
              const rank = song.globalRank || song.rank || index + 1;

              return (
                <div
                  key={song.id}
                  onClick={() => handleTrackClick(song)}
                  className={`group flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-[#252525] transition cursor-pointer border border-transparent hover:border-white/5 ${
                    isCurrent ? "bg-[#252525] border-white/10" : ""
                  }`}
                >
                  {/* Rank Number */}
                  <div className="w-8 text-center flex-shrink-0">
                    {isCurrent && isPlaying ? (
                      <div className="flex items-center justify-center gap-0.5 h-4">
                        <span className="w-1 bg-[#1db954] h-3 animate-bounce rounded-full" />
                        <span className="w-1 bg-[#1db954] h-4 animate-bounce delay-75 rounded-full" />
                        <span className="w-1 bg-[#1db954] h-2 animate-bounce delay-150 rounded-full" />
                      </div>
                    ) : (
                      <span
                        className={`text-sm font-black ${
                          rank === 1
                            ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] text-base"
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
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0 shadow border border-white/5 flex items-center justify-center">
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
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-bold truncate transition ${
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

                      {song.regionBadge && (
                        <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.2 rounded-full border border-white/5 flex-shrink-0 hidden sm:inline-block">
                          {song.regionBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 24-Hour View Gain Growth Badge (The Core Trending Definition) */}
                  {(song.viewsGain24hFormatted || song.views_gain_24h) && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold flex-shrink-0 shadow-sm">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>+{song.viewsGain24hFormatted || song.views_gain_24h} / 24h</span>
                    </div>
                  )}

                  {/* Total Views Count (Secondary) */}
                  {(song.totalViewsFormatted || song.views) && (
                    <div className="hidden lg:flex items-center gap-1 text-[11px] text-gray-500 flex-shrink-0">
                      <Eye className="w-3 h-3 text-gray-600" />
                      <span>{song.totalViewsFormatted || song.views} tổng</span>
                    </div>
                  )}

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(song);
                    }}
                    className={`p-2 rounded-full hover:bg-white/10 transition flex-shrink-0 ${
                      favorited ? "text-[#1db954]" : "text-gray-500 hover:text-white"
                    }`}
                    title={favorited ? "Bỏ yêu thích" : "Yêu thích"}
                  >
                    <Heart
                      className={`w-4 h-4 ${favorited ? "fill-[#1db954]" : ""}`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Toggle Expand / Collapse (Show Top 5 or Full List) */}
          {displayedTracks.length > 5 && (
            <div className="flex justify-center pt-3 pb-1 border-t border-white/5 mt-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-gray-300 hover:text-white bg-[#202020] hover:bg-[#2a2a2a] border border-white/10 transition shadow-md hover:scale-105 active:scale-95"
              >
                {isExpanded ? (
                  <>
                    <span>Thu gọn bảng xếp hạng (Hiện Top 5)</span>
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
