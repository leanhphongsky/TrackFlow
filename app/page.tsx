"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import UploadModal from "@/components/UploadModal";
import SongCard from "@/components/SongCard";
import ArtistView from "@/components/ArtistView";
import NowPlayingPanel from "@/components/NowPlayingPanel";
import AuthModal from "@/components/AuthModal";
import LoginPage from "@/components/LoginPage";
import TermsView from "@/components/TermsView";
import ChangelogView from "@/components/ChangelogView";
import TrendingArtistsSection from "@/components/TrendingArtistsSection";
import TrendingSongsSection from "@/components/TrendingSongsSection";
import PlaylistView from "@/components/PlaylistView";
import AddToPlaylistModal from "@/components/AddToPlaylistModal";
import ImportPlaylistModal from "@/components/ImportPlaylistModal";
import FollowedArtistsFeed from "@/components/FollowedArtistsFeed";
import PodcastsSection from "@/components/PodcastsSection";
import FullscreenLyricsView from "@/components/FullscreenLyricsView";
import ChillView from "@/components/ChillView";
import MixDetailView from "@/components/MixDetailView";
import { DailyMixItem } from "@/app/api/songs/mixes/route";
import { Song } from "@/lib/db";
import {
  Search,
  Plus,
  Music2,
  Sparkles,
  Loader2,
  Play,
  Pause,
  Heart,
  UserCheck,
  LogOut,
  LogIn,
  Disc3,
  Users,
  Waves,
  Menu,
  Home as HomeIcon,
  Download,
  Flame,
  Shuffle,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import YoutubeIcon from "@/components/icons/YoutubeIcon";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { usePlaylist } from "@/context/PlaylistContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Home() {
  const { t, language } = useLanguage();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home"); // "home" | "search" | "favorites"
  const [searchQuery, setSearchQuery] = useState("");

  // Category navigation state: "all" | "music" | "podcasts"
  const [homeCategory, setHomeCategory] = useState<"all" | "music" | "podcasts">("all");
  const [musicSubFilter, setMusicSubFilter] = useState<"all" | "following">("all");
  const [podcastSubFilter, setPodcastSubFilter] = useState<"all" | "following">("all");

  // YouTube Search state (with Liner-inspired SWR cache & in-flight abort)
  const [ytResults, setYtResults] = useState<any[]>([]);
  const [ytChannels, setYtChannels] = useState<any[]>([]);
  const [isSearchingYt, setIsSearchingYt] = useState(false);
  const searchCacheRef = useRef<Map<string, { results: any[]; channels: any[] }>>(new Map());
  const searchAbortRef = useRef<AbortController | null>(null);

  // Selected Artist Profile state
  const [selectedArtist, setSelectedArtist] = useState<{
    channelId?: string;
    name?: string;
  } | null>(null);

  // Daily Mixes (Your Mixes) state
  const [dailyMixes, setDailyMixes] = useState<DailyMixItem[]>([
    {
      id: "mix-1",
      mixNumber: 1,
      name: "Daily Mix 1",
      theme: "V-Pop & Indie Việt",
      badge: "Việt Nam 🇻🇳",
      description: "Tuyển chọn các giai điệu V-Pop, Indie và Ballad Việt Nam từ Sơn Tùng M-TP, Vũ., Hoàng Dũng, Ngọt, Grey D và nhiều nghệ sĩ khác.",
      coverUrl: "/mixes/mix-1.jpg",
      accentGradient: "from-amber-950/90 via-[#1c120c] to-black",
      accentColor: "#f59e0b",
      artistsSummary: "Sơn Tùng M-TP, Vũ., Hoàng Dũng, Ngọt...",
      songs: [],
    },
    {
      id: "mix-2",
      mixNumber: 2,
      name: "Daily Mix 2",
      theme: "Chill, Lo-Fi & Acoustic",
      badge: "Thư giãn ☕",
      description: "Giai điệu lofi êm dịu, acoustic mộc mạc và chillout nhẹ nhàng giúp bạn tập trung và thư giãn.",
      coverUrl: "/mixes/mix-2.jpg",
      accentGradient: "from-indigo-950/90 via-[#0d1322] to-black",
      accentColor: "#6366f1",
      artistsSummary: "Lofi Girl, Joji, Keshi, Wave to Earth...",
      songs: [],
    },
    {
      id: "mix-3",
      mixNumber: 3,
      name: "Daily Mix 3",
      theme: "US-UK Pop & Hip-Hop",
      badge: "Âu Mỹ 🌎",
      description: "Bùng nổ cùng những bản hit US-UK, Rap/Hip-hop và Pop đỉnh cao 24h qua.",
      coverUrl: "/mixes/mix-3.jpg",
      accentGradient: "from-rose-950/90 via-[#200911] to-black",
      accentColor: "#f43f5e",
      artistsSummary: "The Weeknd, Drake, Travis Scott, Billie Eilish...",
      songs: [],
    },
    {
      id: "mix-4",
      mixNumber: 4,
      name: "Daily Mix 4",
      theme: "K-Pop & Asian Energy",
      badge: "Châu Á 🌸",
      description: "Giai điệu K-Pop & J-Pop bùng nổ năng lượng, vũ đạo và âm nhạc Châu Á.",
      coverUrl: "/mixes/mix-4.jpg",
      accentGradient: "from-red-950/90 via-[#1f0b0b] to-black",
      accentColor: "#ef4444",
      artistsSummary: "NewJeans, IVE, Jung Kook, YOASOBI, Aespa...",
      songs: [],
    },
  ]);
  const [selectedDailyMix, setSelectedDailyMix] = useState<DailyMixItem | null>(null);

  const localizedDailyMixes: DailyMixItem[] = dailyMixes.map((mix) => {
    if (mix.mixNumber === 1) {
      return {
        ...mix,
        theme: t.mixes.mix1Theme,
        badge: t.mixes.mix1Badge,
        description: t.mixes.mix1Desc,
      };
    }
    if (mix.mixNumber === 2) {
      return {
        ...mix,
        theme: t.mixes.mix2Theme,
        badge: t.mixes.mix2Badge,
        description: t.mixes.mix2Desc,
      };
    }
    if (mix.mixNumber === 3) {
      return {
        ...mix,
        theme: t.mixes.mix3Theme,
        badge: t.mixes.mix3Badge,
        description: t.mixes.mix3Desc,
      };
    }
    if (mix.mixNumber === 4) {
      return {
        ...mix,
        theme: t.mixes.mix4Theme,
        badge: t.mixes.mix4Badge,
        description: t.mixes.mix4Desc,
      };
    }
    return mix;
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const {
    currentSong,
    playSong,
    isRightPanelOpen,
    setIsRightPanelOpen,
    toggleRightPanel,
    isLyricsFullscreen,
    setIsLyricsFullscreen,
  } = usePlayer();
  const { user, loading: authLoading, openAuthModal, logout, favoriteSongs, isFavorite, toggleFavorite } = useAuth();
  const { openAddToPlaylist, selectedPlaylistId, setSelectedPlaylistId, openImportModal } = usePlaylist();

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

  const fetchDailyMixes = async () => {
    try {
      const res = await fetch("/api/songs/mixes");
      if (res.ok) {
        const data = await res.json();
        if (data.mixes && data.mixes.length > 0) {
          setDailyMixes(data.mixes);
        }
      }
    } catch (err) {
      console.warn("Lỗi khi tải daily mixes:", err);
    }
  };

  useEffect(() => {
    fetchSongs();
    fetchDailyMixes();
  }, [user?.id]);

  const handlePlaySong = (song: any, queue?: any[], isPlaylistContext?: boolean) => {
    playSong(song, queue, isPlaylistContext);
    setIsRightPanelOpen(true);
  };

  // Live Instant Search (Liner technique: 250ms debounce + SWR Memory Cache + In-Flight Abort)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      if (trimmed.length === 0 && activeTab === "search") {
        setYtResults([]);
        setYtChannels([]);
      }
      return;
    }

    const cacheKey = trimmed.toLowerCase();
    const cached = searchCacheRef.current.get(cacheKey);
    if (cached) {
      setYtResults(cached.results);
      setYtChannels(cached.channels);
      setIsSearchingYt(false);
      return;
    }

    // Cancel prior search request to prevent UI flicker
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }
    const controller = new AbortController();
    searchAbortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        setIsSearchingYt(true);
        const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          const results = data.results || [];
          const channels = data.channels || [];
          searchCacheRef.current.set(cacheKey, { results, channels });
          setYtResults(results);
          setYtChannels(channels);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.warn("Live search error:", err);
        }
      } finally {
        setIsSearchingYt(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Manual submit or quick re-trigger
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setSelectedArtist(null);
    setActiveTab("search");

    const cacheKey = trimmed.toLowerCase();
    const cached = searchCacheRef.current.get(cacheKey);
    if (cached) {
      setYtResults(cached.results);
      setYtChannels(cached.channels);
      return;
    }

    try {
      setIsSearchingYt(true);
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        const results = data.results || [];
        const channels = data.channels || [];
        searchCacheRef.current.set(cacheKey, { results, channels });
        setYtResults(results);
        setYtChannels(channels);
      }
    } catch (err) {
      console.error("YouTube search error:", err);
    } finally {
      setIsSearchingYt(false);
    }
  };

  const openArtist = (artistInfo: { channelId?: string; name?: string }) => {
    setSelectedArtist(artistInfo);
  };

  const handleSongUploaded = (newSong: Song) => {
    setSongs((prev) => [newSong, ...prev]);
  };

  const localFilteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If loading auth state from cookies
  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white select-none">
        <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center shadow-2xl mb-4 animate-pulse">
          <Disc3 className="w-9 h-9 text-[#1db954] animate-spin-slow" />
        </div>
        <p className="text-sm font-bold text-gray-400 tracking-wide">{t.nav.connecting}</p>
      </div>
    );
  }

  // If user is not authenticated and hasn't chosen to browse as guest, show modern Login Page
  if (!user && !isGuest) {
    return <LoginPage onContinueAsGuest={() => setIsGuest(true)} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070709] text-white font-sans ambient-canvas">
      {/* Left Sidebar (Desktop Static + Mobile Slide-out Drawer) */}
      <Sidebar
        onOpenUpload={() => setIsUploadOpen(true)}
        activeTab={selectedArtist ? "artist" : activeTab}
        setActiveTab={(tab) => {
          setSelectedArtist(null);
          setActiveTab(tab);
        }}
        onOpenArtist={(name) => openArtist({ name })}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0a0d]/90 m-0 md:m-2 md:ml-0 md:mr-0 rounded-none md:rounded-2xl border-0 md:border md:border-white/[0.06] relative backdrop-blur-xl">
        {/* Top Navbar */}
        <header className="h-16 px-3 sm:px-6 flex items-center justify-between border-b border-white/[0.06] bg-[#0a0a0d]/70 backdrop-blur-2xl sticky top-0 z-30">
          {/* Mobile Drawer Trigger & Brand Disc on Mobile */}
          <div className="flex items-center gap-2 md:hidden mr-2">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition flex-shrink-0"
              title={t.nav.openNavMenu}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div
              onClick={() => {
                setSelectedArtist(null);
                setActiveTab("home");
              }}
              className="flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <Disc3 className="w-5 h-5 text-[#1db954] animate-spin-slow" />
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 sm:gap-4 flex-1 max-w-lg">
            <div className="relative w-full group">
              <Search className="w-4 h-4 absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1db954] transition" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setActiveTab("search");
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length >= 2 && activeTab !== "search") {
                    setSelectedArtist(null);
                    setActiveTab("search");
                  }
                }}
                placeholder={t.nav.searchPlaceholder}
                className="w-full bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] text-xs sm:text-sm text-white placeholder-gray-400 pl-8 sm:pl-10 pr-20 sm:pr-24 py-1.5 sm:py-2 rounded-full border border-white/10 focus:border-emerald-500/40 focus:outline-none transition shadow-inner backdrop-blur-xl"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      if (activeTab === "search") {
                        setYtResults([]);
                        setYtChannels([]);
                      }
                    }}
                    className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
                    title="Xóa tìm kiếm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-[#1db954] hover:bg-[#1ed760] text-black text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full transition flex items-center gap-1 shadow"
                >
                  {isSearchingYt ? <Loader2 className="w-3 h-3 animate-spin" /> : t.nav.searchButton}
                </button>
              </div>
            </div>
          </form>

          {/* User Profile / Auth Area & Language Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 ml-2">
            {/* Top Navbar Bilingual Switcher (VI | EN Pill) */}
            <LanguageSwitcher variant="pill" />

            <button
              onClick={openImportModal}
              className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1.5 rounded-full hover:scale-105 transition shadow"
              title={t.nav.importPlaylist}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.nav.importPlaylist}</span>
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-white text-black text-xs font-bold px-3.5 py-1.5 rounded-full hover:scale-105 transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>{t.nav.upload}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-[#242424] px-3 py-1.5 rounded-full border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-[#1db954] text-black font-extrabold flex items-center justify-center text-xs">
                    {user.display_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-white max-w-[120px] truncate">
                    {user.display_name}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    setIsGuest(false);
                    await logout();
                  }}
                  className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
                  title={t.nav.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal("login")}
                  className="bg-[#1db954] hover:bg-[#1ed760] text-black text-xs font-extrabold px-4 py-2 rounded-full transition hover:scale-105 shadow flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t.nav.login}</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Fixed Spotify-Style Category Filter Navigation Bar on Home & Charts */}
        {(activeTab === "home" || activeTab === "charts") && !selectedArtist && (
          <div className="h-14 px-6 bg-[#121212] border-b border-white/5 flex items-center gap-2 flex-shrink-0 z-20 overflow-x-auto scrollbar-none">
            {/* 1. All */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("home");
                setHomeCategory("all");
                setMusicSubFilter("all");
                setPodcastSubFilter("all");
              }}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition flex-shrink-0 ${
                activeTab === "home" && homeCategory === "all"
                  ? "bg-white text-black font-bold shadow-sm"
                  : "bg-[#242424] text-white hover:bg-[#303030]"
              }`}
            >
              {t.nav.all}
            </button>

            {/* 2. Music */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("home");
                setHomeCategory("music");
                if (homeCategory !== "music") {
                  setMusicSubFilter("all");
                }
              }}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition flex-shrink-0 ${
                activeTab === "home" && homeCategory === "music" && musicSubFilter === "all"
                  ? "bg-white text-black font-bold shadow-sm"
                  : activeTab === "home" && homeCategory === "music"
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-[#242424] text-white hover:bg-[#303030]"
              }`}
            >
              {t.nav.music}
            </button>

            {/* 2b. Music Following Sub-Pill */}
            {activeTab === "home" && homeCategory === "music" && (
              <button
                type="button"
                onClick={() => {
                  setMusicSubFilter((prev) => (prev === "following" ? "all" : "following"));
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 flex-shrink-0 animate-fadeIn ${
                  musicSubFilter === "following"
                    ? "bg-[#1db954] text-black font-bold shadow-md"
                    : "bg-[#282828] text-gray-200 hover:bg-[#353535] hover:text-white border border-white/10"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t.nav.following}</span>
              </button>
            )}

            {/* 3. Bảng xếp hạng / Charts Tab Pill */}
            <button
              type="button"
              onClick={() => setActiveTab("charts")}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === "charts"
                  ? "bg-white text-black font-bold shadow-sm"
                  : "bg-[#242424] text-white hover:bg-[#303030]"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.nav.charts}</span>
            </button>

            {/* 4. Podcasts */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("home");
                setHomeCategory("podcasts");
                if (homeCategory !== "podcasts") {
                  setPodcastSubFilter("all");
                }
              }}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition flex-shrink-0 ${
                activeTab === "home" && homeCategory === "podcasts" && podcastSubFilter === "all"
                  ? "bg-white text-black font-bold shadow-sm"
                  : activeTab === "home" && homeCategory === "podcasts"
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-[#242424] text-white hover:bg-[#303030]"
              }`}
            >
              {t.nav.podcasts}
            </button>

            {/* 3b. Podcasts Following Sub-Pill */}
            {homeCategory === "podcasts" && (
              <button
                type="button"
                onClick={() => {
                  setPodcastSubFilter((prev) => (prev === "following" ? "all" : "following"));
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 flex-shrink-0 animate-fadeIn ${
                  podcastSubFilter === "following"
                    ? "bg-purple-500 text-white font-bold shadow-md"
                    : "bg-[#282828] text-gray-200 hover:bg-[#353535] hover:text-white border border-white/10"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t.nav.following}</span>
              </button>
            )}

            {/* 3c. Chill Pill */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("chill");
              }}
              className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-[#242424] hover:bg-gradient-to-r hover:from-purple-900/60 hover:to-indigo-900/60 text-white transition flex-shrink-0 flex items-center gap-1.5 border border-purple-500/20 shadow-sm group"
            >
              <Waves className="w-3.5 h-3.5 text-purple-400 group-hover:animate-pulse" />
              <span>{t.nav.chill}</span>
            </button>

            {/* 4. Audiobooks (Disabled with Amber Badge) */}
            <div className="relative group/audiobook flex items-center flex-shrink-0">
              <button
                type="button"
                disabled
                className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-[#242424]/50 text-gray-400 border border-white/5 cursor-not-allowed opacity-60 flex items-center gap-2 select-none"
              >
                <span>{t.nav.audiobooks}</span>
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md tracking-wider">
                  {t.nav.inDevelopment}
                </span>
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover/audiobook:block bg-[#1f1f1f] text-gray-200 text-[11px] px-2.5 py-1 rounded-md shadow-lg border border-white/10 whitespace-nowrap z-30 pointer-events-none">
                {t.nav.audiobooksDevTooltip}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 pb-44 md:pb-32">
          {/* VIEW 1: ARTIST PROFILE PAGE */}
          {selectedArtist ? (
            <ArtistView
              channelId={selectedArtist.channelId}
              artistName={selectedArtist.name}
              onBack={() => setSelectedArtist(null)}
              onSongSaved={(song) => setSongs((prev) => [song, ...prev])}
            />
          ) : activeTab === "mix" && selectedDailyMix ? (
            /* VIEW: DAILY MIX THEMATIC PLAYLIST VIEW */
            <MixDetailView
              mix={selectedDailyMix}
              onBack={() => {
                setSelectedDailyMix(null);
                setActiveTab("home");
              }}
              onPlaySong={handlePlaySong}
              onOpenArtist={openArtist}
            />
          ) : activeTab === "charts" ? (
            /* VIEW: DEDICATED CHARTS & RANKINGS VIEW */
            <div className="space-y-8 animate-fadeIn pb-12">
              {/* Header Hero Banner */}
              <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-[#121212] border border-emerald-500/20 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1.5 rounded-lg bg-emerald-500/20 text-[#1db954]">
                      <TrendingUp className="w-4 h-4 text-[#1db954]" />
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      {t.nav.musicCharts}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    {t.nav.trendingAndBreakout}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-xl">
                    {t.nav.chartsHeroDesc}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("home")}
                  className="text-xs text-gray-400 hover:text-white underline self-start md:self-auto"
                >
                  ← {t.mixes.backToHome}
                </button>
              </div>

              {/* Dynamic Trending Artists Section with Multi-Region Boards */}
              <TrendingArtistsSection onOpenArtist={openArtist} />

              {/* Dynamic Trending Songs Section with Multi-Region Charts */}
              <TrendingSongsSection onPlaySong={handlePlaySong} onOpenArtist={openArtist} />
            </div>
          ) : activeTab === "terms" ? (
            /* VIEW: TERMS & LEGAL DISCLAIMER */
            <TermsView onBack={() => setActiveTab("home")} />
          ) : activeTab === "changelog" ? (
            /* VIEW: CHANGELOG & RELEASE NOTES */
            <ChangelogView onBack={() => setActiveTab("home")} />
          ) : activeTab === "playlist" && selectedPlaylistId ? (
            /* VIEW: SPOTIFY PLAYLIST VIEW */
            <PlaylistView
              playlistId={selectedPlaylistId}
              onBack={() => setActiveTab("home")}
              onOpenArtist={(name) => openArtist({ name })}
            />
          ) : activeTab === "chill" ? (
            /* VIEW: CHILL & 360 AUDIO VISUALIZER */
            <ChillView
              onBack={() => setActiveTab("home")}
              onOpenArtist={(name) => openArtist({ name })}
            />
          ) : activeTab === "favorites" ? (
            /* VIEW 2: FAVORITES / LIKED SONGS PAGE */
            <div className="space-y-6">
              {/* Liked Songs Hero Banner */}
              <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-indigo-900/90 via-purple-900/70 to-[#121212] border border-white/10 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl flex-shrink-0">
                  <Heart className="w-20 h-20 fill-white text-white drop-shadow-md" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300">
                    {t.favorites.playlistType}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white mt-1 mb-3">
                    {t.favorites.title}
                  </h1>
                  <p className="text-xs text-gray-300 font-medium">
                    <span className="text-white font-bold">{user?.display_name || t.favorites.you}</span> •{" "}
                    {favoriteSongs.length} {t.common.songsCount}
                  </p>
                </div>
              </div>

              {/* Action */}
              {favoriteSongs.length > 0 && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handlePlaySong(favoriteSongs[0], favoriteSongs, true)}
                    className="w-12 h-12 rounded-full bg-[#1db954] hover:bg-[#1ed760] hover:scale-105 flex items-center justify-center text-black shadow-xl transition"
                    title={t.favorites.playAllTooltip}
                  >
                    <Play className="w-6 h-6 fill-black ml-0.5" />
                  </button>
                </div>
              )}

              {/* Liked Songs List */}
              {favoriteSongs.length === 0 ? (
                <div className="text-center py-20 bg-[#181818]/60 border border-white/5 rounded-2xl">
                  <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">
                    {t.favorites.emptyTitle}
                  </h3>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto">
                    {t.favorites.emptyDesc}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {favoriteSongs.map((song, index) => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div
                        key={song.id || index}
                        onClick={() => handlePlaySong(song, favoriteSongs, true)}
                        className={`group flex items-center gap-4 p-2.5 rounded-lg hover:bg-[#282828] transition cursor-pointer ${
                          isCurrent ? "bg-[#242424]" : ""
                        }`}
                      >
                        <div className="w-6 text-center text-sm font-semibold text-gray-400">
                          {index + 1}
                        </div>
                        <div className="w-11 h-11 rounded-md overflow-hidden bg-black flex-shrink-0">
                          {song.image_url ? (
                            <img src={song.image_url} alt={song.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                              <Music2 className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${isCurrent ? "text-[#1db954]" : "text-white"}`}>
                            {song.title}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                        </div>

                        {/* Add to Playlist Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openAddToPlaylist(song);
                          }}
                          title={t.player.addToPlaylist}
                          className="p-2 rounded-full text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 hover:bg-white/10 transition"
                        >
                          <Plus className="w-5 h-5" />
                        </button>

                        {/* Unlike Heart Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(song);
                          }}
                          title={t.player.unfavorite}
                          className="p-2 text-[#1db954] hover:scale-110 transition"
                        >
                          <Heart className="w-5 h-5 fill-[#1db954]" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === "search" ? (
            /* VIEW 3: SEARCH RESULTS */
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <YoutubeIcon className="w-7 h-7 text-red-500" />
                  <span>{t.nav.searchResultsFor}: &quot;{searchQuery}&quot;</span>
                </h2>
                <button
                  onClick={() => setActiveTab("home")}
                  className="text-xs text-gray-400 hover:text-white underline"
                >
                  {t.mixes.backToHome}
                </button>
              </div>

              {isSearchingYt ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1db954]" />
                  <p className="text-sm">
                    {language === "vi" ? "Đang tìm kiếm bài hát và nghệ sĩ..." : "Searching for songs and artists..."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Channels / Artists matches */}
                  {ytChannels.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-sky-400" />
                        <span>{t.nav.matchingArtists}</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {ytChannels.map((ch) => (
                          <div
                            key={ch.channelId}
                            onClick={() => openArtist({ channelId: ch.channelId, name: ch.title })}
                            className="group flex items-center gap-4 p-4 rounded-2xl bg-[#181818] hover:bg-[#252525] border border-white/5 hover:border-white/10 transition cursor-pointer shadow-lg"
                          >
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-black flex-shrink-0 border-2 border-white/10 group-hover:scale-105 transition flex items-center justify-center">
                              {ch.avatar ? (
                                <img src={ch.avatar} alt={ch.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-[#1db954] font-bold text-lg">
                                  {ch.title.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="overflow-hidden flex-1">
                              <p className="font-bold text-white text-base group-hover:text-[#1db954] transition truncate flex items-center gap-1.5">
                                <span>{ch.title}</span>
                                {ch.verified && (
                                  <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0" title={t.artist.verifiedOnYoutube}>
                                    ✓
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full inline-block">
                                  {t.nav.artist}
                                </span>
                                {ch.subscribers && (
                                  <span className="text-xs text-gray-400 truncate">
                                    {ch.subscribers}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Songs list */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <Music2 className="w-5 h-5 text-[#1db954]" />
                      <span>{t.nav.songs} ({ytResults.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {ytResults.map((item) => {
                        const favorited = isFavorite(item);
                        return (
                          <div
                            key={item.id}
                            className="group flex items-center gap-3 p-3 bg-[#181818] hover:bg-[#242424] rounded-xl transition border border-white/5 hover:border-white/10"
                          >
                            <div
                              onClick={() => handlePlaySong(item, [item], false)}
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

                            <div className="flex-1 min-w-0">
                              <p
                                onClick={() => handlePlaySong(item, [item], false)}
                                className="text-sm font-semibold text-white line-clamp-1 group-hover:text-[#1db954] transition cursor-pointer"
                              >
                                {item.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p
                                  onClick={() => openArtist({ name: item.artist, channelId: item.channelId })}
                                  className="text-xs text-gray-400 hover:text-white hover:underline cursor-pointer truncate"
                                >
                                  {item.artist}
                                </p>
                                {item.viewsFormatted && (
                                  <span className="text-[10px] text-gray-500 font-medium flex-shrink-0">
                                    • {item.viewsFormatted}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Add to Playlist Button */}
                            <button
                              onClick={() => openAddToPlaylist(item)}
                              title={t.player.addToPlaylist}
                              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition flex-shrink-0"
                            >
                              <Plus className="w-5 h-5" />
                            </button>

                            {/* Heart Favorite Button */}
                            <button
                              onClick={() => toggleFavorite(item)}
                              title={favorited ? t.player.unfavorite : t.player.favorite}
                              className={`p-2 rounded-full transition flex-shrink-0 ${
                                favorited
                                  ? "text-[#1db954]"
                                  : "text-gray-400 hover:text-white hover:bg-white/10"
                              }`}
                            >
                              <Heart
                                className={`w-5 h-5 transition ${
                                  favorited ? "fill-[#1db954] text-[#1db954]" : ""
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* VIEW 4: HOME / ALL SONGS & CATEGORIES */
            <div>
              {/* CONDITIONAL CONTENT BASED ON CATEGORY & SUB-FILTER */}
              {homeCategory === "podcasts" ? (
                /* PODCASTS VIEW */
                <PodcastsSection
                  subFilter={podcastSubFilter}
                  onPlaySong={handlePlaySong}
                  onOpenArtist={openArtist}
                />
              ) : homeCategory === "music" && musicSubFilter === "following" ? (
                /* FOLLOWED ARTISTS MUSIC FEED */
                <FollowedArtistsFeed
                  onPlaySong={handlePlaySong}
                  onOpenArtist={openArtist}
                />
              ) : (
                /* STANDARD MUSIC / ALL CONTENT */
                <div>
                  {/* Your Mixes / Tuyển chọn cho bạn (Liner Style Thematic Shuffled Playlists) */}
                  {homeCategory === "all" && (
                    <div className="mb-9">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 shadow-sm flex-shrink-0" />
                          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            {t.mixes.title}
                          </h2>
                          <span className="hidden sm:inline-block text-[11px] font-bold text-gray-400 bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full">
                            {t.mixes.subtitle}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 hidden md:inline">
                          {t.mixes.hint}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {localizedDailyMixes.map((mix) => (
                          <div
                            key={mix.id}
                            onClick={() => {
                              setSelectedDailyMix(mix);
                              setActiveTab("mix");
                            }}
                            className="group cursor-pointer flex flex-col gap-2"
                          >
                            {/* Square Artwork Card with Giant MIX Typography */}
                            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10 group-hover:border-white/25 transition-all duration-300 group-hover:scale-[1.02] flex flex-col justify-between p-4">
                              {/* Background Album Cover Image */}
                              <img
                                src={mix.coverUrl}
                                alt={mix.name}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />

                              {/* Gradient Shading Overlay for maximum text legibility */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/25 pointer-events-none" />

                              {/* Top Left Mini Logo & Regional Badge */}
                              <div className="flex items-center justify-between z-10">
                                <span className="w-6 h-6 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-xs font-black text-white border border-white/10 shadow">
                                  ♫
                                </span>
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white border border-white/10">
                                  {mix.badge}
                                </span>
                              </div>

                              {/* Hover Floating Green Play/Shuffle Button */}
                              <div className="absolute right-4 bottom-4 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (mix.songs && mix.songs.length > 0) {
                                      handlePlaySong(mix.songs[0], mix.songs, true);
                                    }
                                  }}
                                  className="w-11 h-11 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition"
                                  title={`${t.mixes.shufflePlay} ${mix.name}`}
                                >
                                  <Play className="w-5 h-5 fill-black ml-0.5" />
                                </button>
                              </div>

                              {/* Bottom Giant MIX Typography */}
                              <div className="z-10">
                                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none drop-shadow-lg group-hover:text-emerald-400 transition">
                                  MIX {mix.mixNumber}
                                </h3>
                              </div>
                            </div>

                            {/* Subtitles outside the card (Liner style) */}
                            <div>
                              <h4 className="text-sm font-bold text-white group-hover:text-[#1db954] transition truncate">
                                {mix.name}
                              </h4>
                              <p className="text-xs text-gray-400 truncate mt-0.5" title={mix.artistsSummary}>
                                {mix.artistsSummary}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Liked Songs on Home if any */}
                  {favoriteSongs.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Heart className="w-5 h-5 fill-[#1db954] text-[#1db954]" />
                          <span>{t.nav.recentLikedSongs} ({favoriteSongs.length})</span>
                        </h3>
                        <button
                          onClick={() => setActiveTab("favorites")}
                          className="text-xs text-gray-400 hover:text-white transition font-semibold"
                        >
                          {t.nav.viewAll} →
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {favoriteSongs.slice(0, 6).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handlePlaySong(item, favoriteSongs, true)}
                            className="group p-3 bg-[#181818] hover:bg-[#282828] rounded-xl transition cursor-pointer border border-white/5 hover:border-white/10"
                          >
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-black mb-2 shadow">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                                  <Music2 className="w-6 h-6" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                <Play className="w-7 h-7 fill-[#1db954] text-[#1db954]" />
                              </div>
                            </div>
                            <p className="text-xs font-bold text-white truncate group-hover:text-[#1db954] transition">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.artist}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Song Section Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Music2 className="w-5 h-5 text-[#1db954]" />
                      <span>{t.home.uploadedSongs} ({songs.length})</span>
                    </h2>
                  </div>

                  {/* Loading State */}
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-[#1db954]" />
                      <p className="text-sm">{t.common.loading}</p>
                    </div>
                  ) : songs.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-20 px-4 bg-[#181818]/60 border border-white/5 rounded-2xl flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#242424] flex items-center justify-center text-gray-500 mb-4">
                        <Music2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{t.home.noUploadedSongs}</h3>
                      <p className="text-sm text-gray-400 max-w-md mb-6">
                        {t.home.noUploadedDesc}
                      </p>
                      <button
                        onClick={() => setIsUploadOpen(true)}
                        className="bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-sm py-2.5 px-6 rounded-full transition shadow-lg hover:scale-105 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t.nav.uploadMp3}</span>
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

              {/* App Footer: Legal Disclaimer & Version */}
              <footer className="mt-16 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 pb-8">
                <div className="flex items-center gap-2">
                  <Disc3 className="w-4 h-4 text-[#1db954]" />
                  <span>{t.footer.platformDesc}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveTab("changelog")}
                    className="hover:text-white transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.footer.changelogLink}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("terms")}
                    className="hover:text-white transition flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.footer.legalLink}</span>
                  </button>
                </div>
              </footer>
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

      {/* Persistent Audio Player (Hidden in Chill mode to prevent bottom overlap) */}
      {activeTab !== "chill" && (
        <Player
          isRightPanelOpen={isRightPanelOpen}
          onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
          onOpenChill={() => setActiveTab("chill")}
        />
      )}

      {/* Upload Song Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSongUploaded={handleSongUploaded}
      />

      {/* Login & Register Modal */}
      <AuthModal />

      {/* Spotify-style Add to Playlist Modal */}
      <AddToPlaylistModal />

      {/* 1-Click Import Playlist Modal (Spotify, YouTube, Text) */}
      <ImportPlaylistModal
        onSuccess={(plId) => {
          setSelectedPlaylistId(plId);
          setActiveTab("playlist");
        }}
      />

      {/* Fullscreen Apple Music / Spotify Style Karaoke Lyrics Experience */}
      {isLyricsFullscreen && currentSong && (
        <FullscreenLyricsView
          onClose={() => setIsLyricsFullscreen(false)}
          onOpenArtist={(name) => openArtist({ name })}
        />
      )}

      {/* Mobile Bottom Navigation Bar (Hidden on desktop & Chill mode) */}
      {activeTab !== "chill" && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#121212]/95 border-t border-white/10 backdrop-blur-xl z-40 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] select-none">
          {/* 1. Trang chủ */}
          <button
            onClick={() => {
              setSelectedArtist(null);
              setActiveTab("home");
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              activeTab === "home" && !selectedArtist
                ? "text-[#1db954]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">{t.nav.home}</span>
          </button>

          {/* 2. Tìm kiếm */}
          <button
            onClick={() => {
              setSelectedArtist(null);
              setActiveTab("search");
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              activeTab === "search"
                ? "text-[#1db954]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-bold">{t.nav.search}</span>
          </button>

          {/* 3. Bài hát đã thích */}
          <button
            onClick={() => {
              setSelectedArtist(null);
              setActiveTab("favorites");
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              activeTab === "favorites"
                ? "text-[#1db954]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Heart className={`w-5 h-5 ${activeTab === "favorites" ? "fill-current" : ""}`} />
            <span className="text-[10px] font-bold">{t.nav.likedSongs}</span>
          </button>

          {/* 4. Chill Visualizer */}
          <button
            onClick={() => {
              setSelectedArtist(null);
              setActiveTab("chill");
            }}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-purple-400 hover:text-purple-300 transition group"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-amber-400 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
              <Waves className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold">{t.nav.chill}</span>
          </button>

          {/* 5. Menu Drawer */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-gray-400 hover:text-white transition"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-bold">Menu</span>
          </button>
        </nav>
      )}
    </div>
  );
}
