"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Sparkles,
  RefreshCw,
  Users,
  Play,
  ChevronRight,
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

  const displayedCategories =
    activeTab === "all"
      ? categories
      : categories.filter((c) => c.id === activeTab);

  return (
    <div className="mb-10 space-y-5">
      {/* Section Header with live badge and region tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
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
              Phân loại theo khu vực âm nhạc • Cập nhật số liệu & avatar trực tiếp {lastUpdated && `(${lastUpdated})`}
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
          <span>Tất cả khu vực</span>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-[#181818] border border-white/5 animate-pulse flex flex-col items-center gap-3"
            >
              <div className="w-20 h-20 rounded-full bg-white/5" />
              <div className="w-16 h-3.5 rounded bg-white/5" />
              <div className="w-20 h-2.5 rounded bg-white/5" />
            </div>
          ))}
        </div>
      ) : (
        /* Boards by Category */
        <div className="space-y-8">
          {displayedCategories.map((cat) => (
            <div key={cat.id} className="space-y-3">
              {/* Category Subheader */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{cat.badge}</span>
                    <span className="text-xs text-gray-400 font-normal">
                      • {cat.description}
                    </span>
                  </h4>
                </div>
                {activeTab === "all" && (
                  <button
                    onClick={() => setActiveTab(cat.id)}
                    className="text-xs text-gray-400 hover:text-[#1db954] transition flex items-center gap-0.5 font-medium"
                  >
                    <span>Xem bảng {cat.name}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Artist Cards Container */}
              {activeTab === "all" ? (
                /* Horizontal Scrollable Carousel when viewing all boards */
                <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-white/10">
                  {cat.artists.map((art) => (
                    <div
                      key={art.channelId || art.name}
                      onClick={() =>
                        onOpenArtist({ channelId: art.channelId, name: art.name })
                      }
                      className="group relative flex flex-col items-center p-3.5 rounded-2xl bg-[#181818] hover:bg-[#252525] border border-white/5 hover:border-white/10 transition cursor-pointer flex-shrink-0 w-36 sm:w-40 shadow-lg text-center"
                    >
                      {/* Avatar with hover play overlay */}
                      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-black shadow-md border-2 border-white/5 group-hover:border-[#1db954]/50 group-hover:scale-105 transition duration-300 mb-2.5">
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

                      {/* Artist Name */}
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

                      {/* Genre Tag */}
                      {art.tag && (
                        <span className="text-[9px] font-semibold text-gray-300 bg-white/5 px-2 py-0.5 rounded-full mt-2 border border-white/5">
                          {art.tag}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Rich Responsive Grid when a specific region board is selected */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 pt-1">
                  {cat.artists.map((art) => (
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
