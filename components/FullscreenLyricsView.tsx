"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { usePlaylist } from "@/context/PlaylistContext";
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  Plus,
  Maximize,
  Minimize,
  Type,
  AlignLeft,
  AlignCenter,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Music,
  Lock,
  Unlock,
  Radio,
  Tv,
} from "lucide-react";

interface FullscreenLyricsViewProps {
  onClose: () => void;
  onOpenArtist?: (name: string) => void;
}

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function FullscreenLyricsView({
  onClose,
  onOpenArtist,
}: FullscreenLyricsViewProps) {
  const {
    currentSong,
    currentTime,
    duration,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    volume,
    setVolumeLevel,
    isMuted,
    toggleMute,
    isLooping,
    toggleLoop,
    isYouTube,
    showVideo,
    setShowVideo,
    lyrics,
    hasLyrics,
    isSyncedLyrics,
    lyricsSource,
    lyricsOffset,
    setLyricsOffset,
    lyricsMessage,
    loadingLyrics,
  } = usePlayer();

  const { isFavorite, toggleFavorite } = useAuth();
  const { openAddToPlaylist } = usePlaylist();

  // Customization States
  const [fontSize, setFontSize] = useState<"normal" | "large" | "huge">("large");
  const [alignment, setAlignment] = useState<"left" | "center">("left");
  const [isAutoScrollLocked, setIsAutoScrollLocked] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState<boolean>(false);
  const [offsetToast, setOffsetToast] = useState<string | null>(null);

  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const userScrollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isUserScrollingRef = useRef<boolean>(false);

  const favorited = currentSong ? isFavorite(currentSong) : false;
  const effectiveCurrentTime = currentTime + lyricsOffset;

  // Active line calculation
  const activeIndex = lyrics.findIndex(
    (line, idx) =>
      effectiveCurrentTime >= line.start &&
      (idx === lyrics.length - 1 || effectiveCurrentTime < lyrics[idx + 1].start)
  );

  // Auto-scroll to active line smoothly
  useEffect(() => {
    if (isAutoScrollLocked || isUserScrollingRef.current) return;
    if (activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [effectiveCurrentTime, isAutoScrollLocked]);

  // Handle user manual scroll: temporarily suspend auto-scroll for 3.5s
  const handleScroll = () => {
    isUserScrollingRef.current = true;
    if (userScrollingTimerRef.current) clearTimeout(userScrollingTimerRef.current);
    userScrollingTimerRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 3500);
  };

  // Keyboard navigation: Escape closes fullscreen lyrics
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, togglePlay]);

  // Copy full lyrics to clipboard
  const handleCopyLyrics = () => {
    if (lyrics.length === 0) return;
    const text = lyrics.map((l) => l.text).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle browser native fullscreen
  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsBrowserFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsBrowserFullscreen(false);
    }
  };

  // Offset change toast
  const adjustOffset = (delta: number) => {
    setLyricsOffset((prev) => {
      const next = Math.round((prev + delta) * 10) / 10;
      setOffsetToast(next > 0 ? `Độ trễ: +${next}s` : next < 0 ? `Độ trễ: ${next}s` : "Độ trễ: 0s (Mặc định)");
      setTimeout(() => setOffsetToast(null), 1800);
      return next;
    });
  };

  // Typography sizing classes
  const fontClasses = {
    normal: "text-xl sm:text-2xl md:text-3xl leading-relaxed",
    large: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight",
    huge: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight",
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0c0e] text-white flex flex-col overflow-hidden select-none animate-fadeIn">
      {/* 1. Animated Ambient Aurora Mesh Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Dynamic blurred cover glow */}
        {currentSong?.image_url && (
          <div
            className="absolute -inset-10 opacity-30 blur-[130px] scale-125 transition-all duration-1000"
            style={{
              backgroundImage: `url(${currentSong.image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        {/* Floating gradient orbs */}
        <div className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full bg-emerald-500/15 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 right-10 w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[140px] animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute bottom-10 left-1/4 w-[550px] h-[550px] rounded-full bg-indigo-600/15 blur-[130px] animate-pulse" style={{ animationDuration: "8s" }} />

        {/* Translucent frosted glass veneer */}
        <div className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-3xl" />
      </div>

      {/* 2. Top Header & Floating Toolbar */}
      <header className="h-20 px-6 md:px-10 flex items-center justify-between border-b border-white/10 z-20 flex-shrink-0 bg-black/20 backdrop-blur-md">
        {/* Left: Song Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/50 border border-white/10 shadow-lg flex-shrink-0">
            {currentSong?.image_url ? (
              <img
                src={currentSong.image_url}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Music className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="font-extrabold text-base md:text-lg text-white truncate hover:underline cursor-pointer">
              {currentSong?.title || "Không có bài hát"}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                onClick={() => currentSong?.artist && onOpenArtist?.(currentSong.artist)}
                className="text-xs md:text-sm text-gray-300 font-medium hover:text-white hover:underline cursor-pointer truncate"
              >
                {currentSong?.artist}
              </span>
              {isSyncedLyrics && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#1db954]" />
                  <span>{lyricsSource === "youtube-captions" ? "Khớp chuẩn video" : "LRC Đồng bộ"}</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {currentSong && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => openAddToPlaylist(currentSong)}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
                title="Thêm vào danh sách phát"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleFavorite(currentSong)}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
                title={favorited ? "Bỏ yêu thích" : "Yêu thích"}
              >
                <Heart
                  className={`w-4 h-4 transition ${
                    favorited ? "fill-[#1db954] text-[#1db954]" : ""
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Right: Customization Controls & Close */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {/* Offset Tuning Pills */}
          {isSyncedLyrics && (
            <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-full px-2 py-1 text-xs">
              <span className="text-[11px] text-gray-400 mr-1.5 font-medium">Độ lệch:</span>
              <button
                onClick={() => adjustOffset(-0.5)}
                className="px-2 py-0.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 font-mono transition"
                title="Chạy sớm hơn 0.5s"
              >
                -0.5s
              </button>
              {lyricsOffset !== 0 && (
                <button
                  onClick={() => {
                    setLyricsOffset(0);
                    setOffsetToast("Đã đặt lại về 0s");
                    setTimeout(() => setOffsetToast(null), 1500);
                  }}
                  className="px-2 py-0.5 rounded-full text-xs font-bold text-[#1db954] hover:bg-[#1db954]/20 transition"
                  title="Đặt lại về 0s"
                >
                  {lyricsOffset > 0 ? `+${lyricsOffset}s` : `${lyricsOffset}s`}
                </button>
              )}
              <button
                onClick={() => adjustOffset(0.5)}
                className="px-2 py-0.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 font-mono transition"
                title="Chạy trễ hơn 0.5s"
              >
                +0.5s
              </button>
            </div>
          )}

          {/* Alignment Switcher */}
          <button
            onClick={() => setAlignment((prev) => (prev === "left" ? "center" : "left"))}
            className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition"
            title={alignment === "left" ? "Căn giữa lời bài hát" : "Căn trái lời bài hát"}
          >
            {alignment === "left" ? (
              <AlignCenter className="w-5 h-5" />
            ) : (
              <AlignLeft className="w-5 h-5" />
            )}
          </button>

          {/* Font Size Switcher */}
          <button
            onClick={() =>
              setFontSize((prev) =>
                prev === "normal" ? "large" : prev === "large" ? "huge" : "normal"
              )
            }
            className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition flex items-center gap-0.5"
            title="Đổi cỡ chữ"
          >
            <Type className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">{fontSize}</span>
          </button>

          {/* Auto-Scroll Lock */}
          <button
            onClick={() => setIsAutoScrollLocked((prev) => !prev)}
            className={`p-2 rounded-full transition ${
              isAutoScrollLocked
                ? "bg-amber-500/20 text-amber-300"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
            title={
              isAutoScrollLocked
                ? "Bật lại tự động cuộn theo bài hát"
                : "Tạm khóa tự động cuộn để đọc lời tự do"
            }
          >
            {isAutoScrollLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </button>

          {/* Copy Lyrics */}
          <button
            onClick={handleCopyLyrics}
            className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition relative"
            title="Sao chép toàn bộ lời bài hát"
          >
            {copied ? <Check className="w-5 h-5 text-[#1db954]" /> : <Copy className="w-5 h-5" />}
          </button>

          {/* Browser Fullscreen */}
          <button
            onClick={toggleBrowserFullscreen}
            className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition"
            title={isBrowserFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình trình duyệt"}
          >
            {isBrowserFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition hover:scale-105 active:scale-95 ml-2"
            title="Đóng (phím Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Offset Toast Notification */}
      {offsetToast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-[#1f1f1f]/90 border border-white/15 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-white shadow-2xl z-40 animate-fadeIn">
          {offsetToast}
        </div>
      )}

      {/* 3. Main Scrolling Lyrics Area */}
      <main
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 md:px-16 lg:px-24 py-24 scroll-smooth scrollbar-none"
      >
        {loadingLyrics ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-spin">
              <Radio className="w-6 h-6 text-[#1db954]" />
            </div>
            <p className="text-sm font-semibold tracking-wide">
              Đang tải lời bài hát và khớp nhịp điệu...
            </p>
          </div>
        ) : !hasLyrics ? (
          /* Empty State: Aesthetic vinyl disk with encouraging message */
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 border-4 border-white/10 flex items-center justify-center shadow-2xl mb-6 relative animate-spin-slow">
              <div className="w-14 h-14 rounded-full bg-black border border-white/20 flex items-center justify-center">
                <Music className="w-6 h-6 text-[#1db954]" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {currentSong?.title || "Chưa có bài hát"}
            </h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              {lyricsMessage ||
                "Hiện ca khúc này chưa có bản lời đồng bộ trên hệ thống. Hãy thả mình vào giai điệu nhé!"}
            </p>
          </div>
        ) : (
          /* Rich Synced Lyrics Stream */
          <div
            className={`max-w-4xl mx-auto space-y-8 md:space-y-10 ${
              alignment === "center" ? "text-center" : "text-left"
            }`}
          >
            {lyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = activeIndex !== -1 && idx < activeIndex;

              // Compute syllable/sentence duration progress for karaoke indicator
              const nextStart =
                idx < lyrics.length - 1 ? lyrics[idx + 1].start : line.start + (line.dur || 4);
              const lineDur = Math.max(0.5, nextStart - line.start);
              const progressRatio = Math.min(
                1,
                Math.max(0, (effectiveCurrentTime - line.start) / lineDur)
              );

              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => {
                    if (isSyncedLyrics && typeof line.start === "number") {
                      seekTo(line.start);
                    }
                  }}
                  className={`group relative transition-all duration-300 ${
                    isSyncedLyrics ? "cursor-pointer" : ""
                  } ${alignment === "center" ? "flex flex-col items-center" : ""}`}
                >
                  {/* Lyric Text Line */}
                  <div className="relative inline-block">
                    <p
                      className={`font-sans tracking-tight transition-all duration-300 ${
                        fontClasses[fontSize]
                      } ${
                        isActive
                          ? "text-white font-black drop-shadow-[0_0_35px_rgba(255,255,255,0.7)] scale-[1.03] origin-left"
                          : isPast
                          ? "text-white/35 font-bold hover:text-white/80 hover:scale-[1.01] origin-left"
                          : "text-white/25 font-bold hover:text-white/70 hover:scale-[1.01] origin-left"
                      }`}
                    >
                      {line.text}
                    </p>

                    {/* Animated Sentence Progress Bar for Active Karaoke Line */}
                    {isActive && isSyncedLyrics && (
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-3 shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-[#1db954] via-emerald-400 to-teal-300 rounded-full transition-all duration-100 ease-linear shadow-[0_0_12px_#1db954]"
                          style={{ width: `${progressRatio * 100}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Play from this line tooltip on hover */}
                  {isSyncedLyrics && (
                    <div
                      className={`opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-[11px] font-bold text-[#1db954] flex items-center gap-1 ${
                        alignment === "center" ? "justify-center" : ""
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Nhấn để phát từ đoạn này ({formatTime(line.start)})</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 4. Bottom Floating Mini Player Bar */}
      <footer className="h-24 px-6 md:px-12 flex items-center justify-between border-t border-white/10 bg-black/40 backdrop-blur-xl z-20 flex-shrink-0">
        {/* Left: Current Time & Scrubber */}
        <div className="flex items-center gap-4 w-full max-w-xl mx-auto">
          <span className="text-xs text-gray-400 font-mono w-10 text-right">
            {formatTime(currentTime)}
          </span>

          <div className="flex-1 relative flex items-center group cursor-pointer">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#1db954] focus:outline-none"
            />
          </div>

          <span className="text-xs text-gray-400 font-mono w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLoop}
            className={`p-2 rounded-full transition ${
              isLooping ? "text-[#1db954]" : "text-gray-400 hover:text-white"
            }`}
            title="Lặp lại"
          >
            <Repeat className="w-4 h-4" />
          </button>

          <button
            onClick={prevSong}
            className="p-2 rounded-full text-gray-300 hover:text-white hover:scale-105 transition"
            title="Bài trước"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-white hover:scale-105 active:scale-95 flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] transition"
            title={isPlaying ? "Tạm dừng" : "Phát"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-black" />
            ) : (
              <Play className="w-6 h-6 fill-black ml-0.5" />
            )}
          </button>

          <button
            onClick={nextSong}
            className="p-2 rounded-full text-gray-300 hover:text-white hover:scale-105 transition"
            title="Bài tiếp theo"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Right: Volume & Video Canvas */}
        <div className="hidden md:flex items-center gap-3">
          {isYouTube && (
            <button
              onClick={() => setShowVideo(!showVideo)}
              className={`p-2 rounded-full transition ${
                showVideo ? "text-[#1db954] bg-white/10" : "text-gray-400 hover:text-white"
              }`}
              title={showVideo ? "Tắt Canvas video" : "Bật Canvas video"}
            >
              <Tv className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={toggleMute}
            className="p-2 rounded-full text-gray-400 hover:text-white transition"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolumeLevel(Number(e.target.value))}
            className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#1db954]"
          />
        </div>
      </footer>
    </div>
  );
}
