"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import UploadModal from "@/components/UploadModal";
import SongCard from "@/components/SongCard";
import ArtistView from "@/components/ArtistView";
import NowPlayingPanel from "@/components/NowPlayingPanel";
import { Song } from "@/lib/db";
import {
  Search,
  Plus,
  Music2,
  Play,
  BookmarkPlus,
  Check,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Home as HomeIcon,
  Bell,
  Users,
  Mic2,
  Sparkles,
} from "lucide-react";
import YoutubeIcon from "@/components/icons/YoutubeIcon";
import { usePlayer } from "@/context/PlayerContext";

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // YouTube Search state
  const [ytResults, setYtResults] = useState<any[]>([]);
  const [ytChannels, setYtChannels] = useState<any[]>([]);
  const [isSearchingYt, setIsSearchingYt] = useState(false);
  const [savedYtIds, setSavedYtIds] = useState<Set<string>>(new Set());

  // Selected Artist Profile state
  const [selectedArtist, setSelectedArtist] = useState<{
    channelId?: string;
    name?: string;
  } | null>(null);

  // Right Now Playing / Lyrics Panel
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const { currentSong, playSong } = usePlayer();

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

  // Search YouTube
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearchingYt(true);
      setSelectedArtist(null);
      setActiveTab("search");
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setYtResults(data.results || []);
        setYtChannels(data.channels || []);
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

  const handleSaveToLibrary = async (item: any) => {
    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          artist: item.artist,
          audio_url: item.audio_url,
          image_url: item.image_url,
          duration: item.duration || 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSongs((prev) => [data.song, ...prev]);
        setSavedYtIds((prev) => new Set(prev).add(item.videoId));
      }
    } catch (err) {
      console.error("Error saving song:", err);
    }
  };

  const handleSongUploaded = (newSong: Song) => {
    setSongs((prev) => [newSong, ...prev]);
  };

  // Preset quick access cards matching Spotify screenshot
  const quickAccessCards = [
    {
      title: "USUK",
      query: "USUK top hits",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
    },
    {
      title: "Tuyển tập của Sơn Tùng M-TP",
      query: "tuyen tap son tung m-tp",
      image: "https://yt3.ggpht.com/ru3SakOhxGBHZnrVeKPwmMndF81j1-gIrsPtmGSHV1YbX3Y6JoFVMR93UdlfpKp9_xIeh62t=s240-c-k-c0xffffffff-no-rj-mo",
    },
    {
      title: "Sơn Tùng M-TP",
      artist: "Sơn Tùng M-TP",
      image: "https://yt3.ggpht.com/ru3SakOhxGBHZnrVeKPwmMndF81j1-gIrsPtmGSHV1YbX3Y6JoFVMR93UdlfpKp9_xIeh62t=s240-c-k-c0xffffffff-no-rj-mo",
    },
    {
      title: "Deep Ambient",
      query: "deep ambient music",
      image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop",
    },
    {
      title: "Tổng Hợp",
      query: "nhac tre tong hop",
      image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=300&h=300&fit=crop",
    },
    {
      title: "Piano nhạc Việt",
      query: "piano nhac viet nhe nhang",
      image: "https://images.unsplash.com/photo-1520523839898-507121c43b9e?w=300&h=300&fit=crop",
    },
    {
      title: "(14/9) 3 TIẾNG FOCUS COME MY WAY",
      query: "come my way son tung",
      image: "https://i.ytimg.com/vi/SlQR9iu09bQ/hqdefault.jpg",
    },
    {
      title: "lofi chill",
      query: "lofi chill nhac thu gian",
      image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=300&fit=crop",
    },
  ];

  // Daily mixes matching Spotify screenshot
  const dailyMixes = [
    {
      title: "Daily Mix 01",
      number: "01",
      color: "from-teal-500 to-emerald-700",
      desc: "MONO, Sơn Tùng M-TP, TĂNG DUY TÂN và nhiều hơn",
      query: "mono son tung m-tp",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop",
    },
    {
      title: "Daily Mix 02",
      number: "02",
      color: "from-lime-500 to-yellow-600",
      desc: "Fieldnote, coldlakes, undercurrent và nhiều hơn",
      query: "chill acoustic guitar",
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop",
    },
    {
      title: "Daily Mix 03",
      number: "03",
      color: "from-orange-500 to-amber-700",
      desc: "Chill With Lofi, Lô-fiykko, Peaceful Melody",
      query: "peaceful lofi beats",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
    },
    {
      title: "Daily Mix 04",
      number: "04",
      color: "from-pink-500 to-rose-700",
      desc: "SUNI, JustaTee, TÌNH HÀ SAY HI",
      query: "justatee suni ha linh",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
    },
    {
      title: "Daily Mix 05",
      number: "05",
      color: "from-yellow-400 to-orange-600",
      desc: "HappyKids and LSPLASH và các bản nhạc vui nhộn",
      query: "happy upbeat pop music",
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300&h=300&fit=crop",
    },
    {
      title: "Daily Mix 06",
      number: "06",
      color: "from-cyan-500 to-blue-700",
      desc: "Maroon 5, Ariana Grande, Lady Gaga",
      query: "maroon 5 ariana grande",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
    },
    {
      title: "Discover Weekly",
      number: "✦",
      color: "from-purple-600 to-indigo-800",
      desc: "Khám phá các bài hát mới mỗi tuần dành cho bạn",
      query: "vietnamese trending songs",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    },
  ];

  // Top artist mixes
  const topMixes = [
    {
      title: "Harry Styles Mix",
      desc: "sombr, Billie Eilish and Olivia Rodrigo",
      query: "harry styles billie eilish",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop",
    },
    {
      title: "Hngle Mix",
      desc: "Fishy, Dangrangto and GREY D",
      query: "grey d dangrangto",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    },
    {
      title: "Happy Mix",
      desc: "The Weeknd, The Kid LAROI, OneRepublic",
      query: "the weeknd onerepublic",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
    },
    {
      title: "Hip Hop Mix",
      desc: "Sơn Tùng M-TP, bbno$, Fat Papi",
      query: "vietnamese hip hop rap",
      image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=300&fit=crop",
    },
    {
      title: "Chill Mix",
      desc: "Oscar Lauran, The Weeknd, The Rare",
      query: "chill indie acoustic",
      image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&h=300&fit=crop",
    },
    {
      title: "Pop Mix",
      desc: "Lady Gaga, Djo, Post Malone",
      query: "lady gaga post malone",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
    },
    {
      title: "2020s Mix",
      desc: "KSLV Noh, chris nova, insomnia",
      query: "phonk 2020s hits",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop",
    },
  ];

  const triggerQuickSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchingYt(true);
    setSelectedArtist(null);
    setActiveTab("search");
    fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setYtResults(data.results || []);
        setYtChannels(data.channels || []);
      })
      .catch(console.error)
      .finally(() => setIsSearchingYt(false));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white font-sans">
      {/* Left Sidebar */}
      <Sidebar
        onOpenUpload={() => setIsUploadOpen(true)}
        activeTab={selectedArtist ? "artist" : activeTab}
        setActiveTab={(tab) => {
          setSelectedArtist(null);
          setActiveTab(tab);
        }}
        onOpenArtist={(name) => openArtist({ name })}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#121212] m-2 ml-0 mr-0 rounded-xl relative">
        {/* Top Spotify Header */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-[#121212]/90 backdrop-blur-md sticky top-0 z-40">
          {/* Left: History Nav & Home */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedArtist) setSelectedArtist(null);
                  else if (activeTab === "search") setActiveTab("home");
                }}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-gray-300 hover:text-white flex items-center justify-center transition"
                title="Quay lại"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="w-8 h-8 rounded-full bg-black/60 text-gray-500 flex items-center justify-center cursor-not-allowed"
                title="Tiến lên"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedArtist(null);
                setActiveTab("home");
              }}
              className="w-10 h-10 rounded-full bg-[#1f1f1f] hover:scale-105 flex items-center justify-center text-white transition shadow"
              title="Trang chủ"
            >
              <HomeIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Center: Search input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Bạn muốn phát gì? (Tìm kiếm YouTube & Thư viện)"
                className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-sm text-white placeholder-gray-400 pl-11 pr-4 py-2.5 rounded-full border border-transparent focus:border-white/20 focus:outline-none transition shadow-inner"
              />
            </div>
          </form>

          {/* Right: Notifications & User Avatar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-white text-black text-xs font-bold px-3.5 py-2 rounded-full hover:scale-105 transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng nhạc</span>
            </button>

            <button className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition">
              <Bell className="w-5 h-5" />
            </button>

            {/* User Profile Pill ("anh phong le") */}
            <div className="flex items-center gap-2 bg-[#1f1f1f] hover:bg-[#282828] p-1 pr-3 rounded-full cursor-pointer transition border border-white/5">
              <div className="w-7 h-7 rounded-full bg-[#f97316] text-black font-extrabold flex items-center justify-center text-xs shadow">
                A
              </div>
              <span className="text-xs font-bold text-white hidden md:block">
                anh phong le
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
          {/* VIEW 1: ARTIST PROFILE PAGE */}
          {selectedArtist ? (
            <ArtistView
              channelId={selectedArtist.channelId}
              artistName={selectedArtist.name}
              onBack={() => setSelectedArtist(null)}
              onSongSaved={(song) => setSongs((prev) => [song, ...prev])}
            />
          ) : activeTab === "search" ? (
            /* VIEW 2: SEARCH RESULTS */
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <YoutubeIcon className="w-7 h-7 text-red-500" />
                  <span>Kết quả tìm kiếm cho: &quot;{searchQuery}&quot;</span>
                </h2>
                <button
                  onClick={() => setActiveTab("home")}
                  className="text-xs text-gray-400 hover:text-white underline"
                >
                  Quay lại Trang chủ
                </button>
              </div>

              {isSearchingYt ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                  <div className="w-8 h-8 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm">Đang tìm kiếm bài hát và nghệ sĩ...</p>
                </div>
              ) : (
                <>
                  {/* Channels / Artists matches */}
                  {ytChannels.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-sky-400" />
                        <span>Nghệ sĩ phù hợp</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {ytChannels.map((ch) => (
                          <div
                            key={ch.channelId}
                            onClick={() => openArtist({ channelId: ch.channelId, name: ch.title })}
                            className="group flex items-center gap-4 p-4 rounded-2xl bg-[#181818] hover:bg-[#252525] border border-white/5 hover:border-white/10 transition cursor-pointer shadow-lg"
                          >
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-black flex-shrink-0 border-2 border-white/10 group-hover:scale-105 transition">
                              <img src={ch.avatar} alt={ch.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="overflow-hidden flex-1">
                              <p className="font-bold text-white text-base group-hover:text-[#1db954] transition truncate">
                                {ch.title}
                              </p>
                              <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full inline-block mt-1">
                                Trang nghệ sĩ
                              </span>
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
                      <span>Bài hát ({ytResults.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {ytResults.map((item) => {
                        const isSaved = savedYtIds.has(item.videoId);
                        return (
                          <div
                            key={item.id}
                            className="group flex items-center gap-3 p-3 bg-[#181818] hover:bg-[#242424] rounded-xl transition border border-white/5 hover:border-white/10"
                          >
                            <div
                              onClick={() => playSong(item, ytResults)}
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
                                onClick={() => playSong(item, ytResults)}
                                className="text-sm font-semibold text-white line-clamp-1 group-hover:text-[#1db954] transition cursor-pointer"
                              >
                                {item.title}
                              </p>
                              <p
                                onClick={() => openArtist({ name: item.artist, channelId: item.channelId })}
                                className="text-xs text-gray-400 hover:text-white hover:underline cursor-pointer truncate mt-0.5"
                              >
                                {item.artist}
                              </p>
                            </div>

                            <button
                              onClick={() => handleSaveToLibrary(item)}
                              disabled={isSaved}
                              title={isSaved ? "Đã lưu vào thư viện" : "Lưu vào Thư viện của bạn"}
                              className={`p-2 rounded-full transition flex-shrink-0 ${
                                isSaved
                                  ? "text-[#1db954] bg-[#1db954]/10 cursor-default"
                                  : "text-gray-400 hover:text-white hover:bg-white/10"
                              }`}
                            >
                              {isSaved ? <Check className="w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" />}
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
            /* VIEW 3: SPOTIFY HOME DASHBOARD */
            <div className="space-y-8">
              {/* Category Filter Pills (All, Music, Podcasts, Audiobooks) */}
              <div className="flex items-center gap-2">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "music", label: "Âm nhạc" },
                  { id: "podcasts", label: "Podcasts" },
                  { id: "audiobooks", label: "Sách nói" },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setFilterCategory(pill.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                      filterCategory === pill.id
                        ? "bg-white text-black"
                        : "bg-[#242424] text-white hover:bg-[#2a2a2a]"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Top 8 Quick-Access Cards Grid (Matching Spotify Screenshot) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickAccessCards.map((card, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (card.artist) openArtist({ name: card.artist });
                      else if (card.query) triggerQuickSearch(card.query);
                    }}
                    className="group relative flex items-center gap-3 bg-white/5 hover:bg-white/15 rounded-lg overflow-hidden transition cursor-pointer shadow-md pr-3"
                  >
                    <div className="w-16 h-16 flex-shrink-0 bg-black">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-bold text-sm text-white line-clamp-2 flex-1">
                      {card.title}
                    </span>
                    <button
                      className="w-10 h-10 rounded-full bg-[#1db954] hover:bg-[#1ed760] hover:scale-105 opacity-0 group-hover:opacity-100 flex items-center justify-center text-black shadow-xl transition duration-200 flex-shrink-0"
                    >
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Section 1: Made For anh phong le */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                      Dành cho
                    </p>
                    <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">
                      anh phong le
                    </h2>
                  </div>
                  <button className="text-xs font-bold text-gray-400 hover:underline">
                    Hiện tất cả
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {dailyMixes.map((mix, idx) => (
                    <div
                      key={idx}
                      onClick={() => triggerQuickSearch(mix.query)}
                      className="group p-3 bg-[#181818] hover:bg-[#282828] rounded-xl transition cursor-pointer flex flex-col gap-3 border border-transparent hover:border-white/5"
                    >
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black shadow-lg">
                        <img
                          src={mix.image}
                          alt={mix.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div
                          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${mix.color}`}
                        />
                        <span className="absolute bottom-1.5 left-2 font-mono text-[11px] font-extrabold text-white bg-black/60 px-1.5 py-0.5 rounded">
                          {mix.number}
                        </span>

                        <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1db954] hover:bg-[#1ed760] hover:scale-110 opacity-0 group-hover:opacity-100 flex items-center justify-center text-black shadow-xl transition-all duration-300">
                          <Play className="w-5 h-5 fill-black ml-0.5" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold text-sm text-white truncate">
                          {mix.title}
                        </h4>
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {mix.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Your top mixes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">
                    Your top mixes
                  </h2>
                  <button className="text-xs font-bold text-gray-400 hover:underline">
                    Hiện tất cả
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {topMixes.map((mix, idx) => (
                    <div
                      key={idx}
                      onClick={() => triggerQuickSearch(mix.query)}
                      className="group p-3 bg-[#181818] hover:bg-[#282828] rounded-xl transition cursor-pointer flex flex-col gap-3 border border-transparent hover:border-white/5"
                    >
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black shadow-lg">
                        <img
                          src={mix.image}
                          alt={mix.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1db954] hover:bg-[#1ed760] hover:scale-110 opacity-0 group-hover:opacity-100 flex items-center justify-center text-black shadow-xl transition-all duration-300">
                          <Play className="w-5 h-5 fill-black ml-0.5" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold text-sm text-white truncate">
                          {mix.title}
                        </h4>
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {mix.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: User's Uploaded / Saved Songs Library */}
              {songs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Music2 className="w-6 h-6 text-[#1db954]" />
                      <span>Bài hát đã lưu ({songs.length})</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {songs.map((song) => (
                      <SongCard key={song.id} song={song} songsList={songs} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Spotify Right Sidebar: Now Playing & Synchronized Lyrics Panel */}
      <NowPlayingPanel
        isOpen={isRightPanelOpen && currentSong !== null}
        onClose={() => setIsRightPanelOpen(false)}
        onOpenArtist={(name) => openArtist({ name })}
      />

      {/* Persistent Audio Player */}
      <Player
        isRightPanelOpen={isRightPanelOpen}
        onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
      />

      {/* Upload Song Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSongUploaded={handleSongUploaded}
      />
    </div>
  );
}
