"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Flame,
  RefreshCw,
  Users,
  Play,
  Globe,
} from "lucide-react";

interface Artist {
  id: string;
  channelId: string;
  name: string;
  officialTitle?: string;
  customUrl?: string;
  tag?: string;
  region?: string;
  avatar: string;
  subscribers?: string;
  subscriberCount?: number;
  views?: string;
  videoCount?: number | string;
}

interface ArtistCategory {
  id: string;
  name: string;
  badge: string;
  description: string;
  artists: Artist[];
}

interface TrendingArtistsSectionProps {
  onOpenArtist: (artist: { channelId?: string; name?: string }) => void;
}

export default function TrendingArtistsSection({ onOpenArtist }: TrendingArtistsSectionProps) {
  const [categories, setCategories] = useState<ArtistCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchTrendingArtists = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setIsRefreshing(true);
      else setLoading(true);

      const url = forceRefresh
        ? "/api/artists/trending?refresh=true"
        : "/api/artists/trending";

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        if (data.updatedAt) {
          const time = new Date(data.updatedAt);
          setLastUpdated(
            time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
          );
        }
      }
    } catch (err) {
      console.error("Failed to load trending artists:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrendingArtists();
  }, []);

  // When activeTab === "all", interleave/mix top artists from all regions together
  // into one single, cohesive, compact global list to shorten and clean up the UI!
  const globalMixedArtists = useMemo(() => {
    if (categories.length === 0) return [];
    const list: (Artist & { regionBadge: string })[] = [];
    const maxLen = Math.max(...categories.map((c) => c.artists.length));
    const seen = new Set<string>();

    for (let i = 0; i < maxLen; i++) {
      for (const cat of categories) {
        const art = cat.artists[i];
        if (art && !seen.has(art.channelId)) {
          seen.add(art.channelId);
          list.push({
            ...art,
            regionBadge: cat.badge,
          });
        }
      }
    }
    return list;
  }, [categories]);

  const currentCategory = categories.find((c) => c.id === activeTab);

  return (
    <div className="mb-10 space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 flex-shrink-0">
            <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Nghệ sĩ thịnh hành</span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live YouTube
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              {activeTab === "all"
                ? "Tuyển tập nghệ sĩ nổi bật toàn cầu (V-Pop, K-Pop, US-UK, Châu Á) • Tự động cập nhật số liệu thật"
                : currentCategory?.description || "Cập nhật số liệu & avatar từ YouTube"}
              {lastUpdated && ` (${lastUpdated})`}
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => fetchTrendingArtists(true)}
            disabled={isRefreshing || loading}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-[#181818] hover:bg-[#252525] border border-white/5 px-3 py-1.5 rounded-full transition disabled:opacity-50"
            title="Làm mới dữ liệu từ YouTube Data API"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#1db954]" : ""}`}
            />
            <span className="hidden sm:inline">Làm mới</span>
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
          <span>Tất cả (Trộn toàn cầu)</span>
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
            <span className="text-[10px] opacity-70">({cat.artists.length})</span>
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#181818] border border-white/5 animate-pulse flex flex-col items-center gap-2.5 w-36 flex-shrink-0"
            >
              <div className="w-20 h-20 rounded-full bg-white/5" />
              <div className="w-20 h-3.5 rounded bg-white/5" />
              <div className="w-16 h-2.5 rounded bg-white/5" />
            </div>
          ))}
        </div>
      ) : activeTab === "all" ? (
        /* CASE 1: COMPACT GLOBAL MIXED CAROUSEL FOR "TẤT CẢ" */
        <div className="space-y-2">
          <div className="flex items-center gap-3.5 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-white/10">
            {globalMixedArtists.map((art) => (
              <div
                key={art.channelId || art.name}
                onClick={() =>
                  onOpenArtist({ channelId: art.channelId, name: art.name })
                }
                className="group relative flex flex-col items-center p-3 rounded-2xl bg-[#181818] hover:bg-[#252525] border border-white/5 hover:border-white/10 transition cursor-pointer flex-shrink-0 w-36 sm:w-40 shadow-lg text-center"
              >
                {/* Avatar with play overlay */}
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-black shadow-md border-2 border-white/5 group-hover:border-[#1db954]/50 group-hover:scale-105 transition duration-300 mb-2">
                  <img
                    src={art.avatar}
                    alt={art.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <div className="w-9 h-9 rounded-full bg-[#1db954] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                      <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <p className="text-xs sm:text-sm font-bold text-white group-hover:text-[#1db954] truncate w-full transition">
                  {art.name}
                </p>

                {/* Subscribers */}
                {art.subscribers && (
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                    <Users className="w-3 h-3 text-gray-500" />
                    <span>{art.subscribers} theo dõi</span>
                  </p>
                )}

                {/* Region Flag Badge */}
                <span className="text-[9px] font-semibold text-gray-300 bg-white/5 px-2 py-0.5 rounded-full mt-1.5 border border-white/5 truncate max-w-full">
                  {art.regionBadge}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* CASE 2: REGIONAL BOARD GRID FOR SPECIFIC CATEGORY TAB */
        currentCategory && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 pt-1">
              {currentCategory.artists.map((art) => (
                <div
                  key={art.channelId || art.name}
                  onClick={() =>
                    onOpenArtist({ channelId: art.channelId, name: art.name })
                  }
                  className="group relative flex flex-col items-center p-4 rounded-2xl bg-[#181818] hover:bg-[#252525] border border-white/5 hover:border-white/10 transition cursor-pointer shadow-lg text-center"
                >
                  <div className="relative w-28 h-28 rounded-full overflow-hidden bg-black shadow-md border-2 border-white/5 group-hover:border-[#1db954]/50 group-hover:scale-105 transition duration-300 mb-3">
                    <img
                      src={art.avatar}
                      alt={art.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <div className="w-10 h-10 rounded-full bg-[#1db954] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                        <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-white group-hover:text-[#1db954] truncate w-full transition">
                    {art.name}
                  </p>

                  {art.subscribers && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 truncate">
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      <span>{art.subscribers} theo dõi</span>
                    </p>
                  )}

                  {art.tag && (
                    <span className="text-[10px] font-semibold text-gray-300 bg-white/5 px-2.5 py-0.5 rounded-full mt-2.5 border border-white/5">
                      {art.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
