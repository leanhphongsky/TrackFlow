"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { usePlaylist } from "@/context/PlaylistContext";
import {
  X,
  Heart,
  Maximize2,
  Minimize2,
  Music,
  Loader2,
  ExternalLink,
  Lock,
  Unlock,
  Image as ImageIcon,
  Sparkles,
  Play,
  Pause,
  Plus,
} from "lucide-react";
import { extractYouTubeId } from "@/context/PlayerContext";

interface LyricLine {
  start: number;
  dur: number;
  text: string;
}

interface NowPlayingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenArtist: (name: string) => void;
}

export default function NowPlayingPanel({
  isOpen,
  onClose,
  onOpenArtist,
}: NowPlayingPanelProps) {
  const {
    currentSong,
    currentTime,
    isPlaying,
    togglePlay,
    isYouTube,
    showVideo,
    setShowVideo,
    seekTo,
    lyrics,
    hasLyrics,
    isSyncedLyrics,
    lyricsSource,
    lyricsOffset,
    setLyricsOffset,
    lyricsMessage,
    loadingLyrics,
    toggleLyricsFullscreen,
  } = usePlayer();
  const { isFavorite, toggleFavorite } = useAuth();
  const { openAddToPlaylist } = usePlaylist();

  const activeLineRef = useRef<HTMLParagraphElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  const favorited = currentSong ? isFavorite(currentSong) : false;
  const isCanvasMode = Boolean(isYouTube && showVideo);
  const isPanelVisible = isOpen && currentSong !== null;

  const effectiveCurrentTime = currentTime + lyricsOffset;

  // Auto-scroll lyrics
  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [effectiveCurrentTime]);

  const activeIndex = lyrics.findIndex(
    (line, idx) =>
      effectiveCurrentTime >= line.start &&
      (idx === lyrics.length - 1 || effectiveCurrentTime < lyrics[idx + 1].start)
  );

  return (
    <aside
      className={`bg-[#121212] flex flex-col h-full select-none flex-shrink-0 z-30 transition-all duration-300 ease-in-out ${
        isPanelVisible
          ? "w-80 md:w-88 lg:w-96 opacity-100 pointer-events-auto border-l border-[#242424] overflow-hidden"
          : "w-0 opacity-0 pointer-events-none overflow-hidden border-0 p-0 m-0"
      } ${currentSong ? "pb-28" : ""}`}
    >
      <div className="w-80 md:w-88 lg:w-96 h-full flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
          <span className="font-bold text-sm text-white truncate">
            {currentSong?.artist || ""}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
            title="Đóng panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-28">
          
          {/* Large Song Artwork / Spotify Canvas Frame */}
          <div className="space-y-3 relative">
            {/* Ambient Diffuse Glow */}
            {currentSong?.image_url && (
              <div
                className="absolute -inset-1 rounded-3xl opacity-20 blur-xl pointer-events-none -z-10"
                style={{
                  backgroundImage: `url(${currentSong.image_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            <div
              className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 group select-none"
              style={{
                WebkitMaskImage: "linear-gradient(to bottom, black 82%, rgba(0,0,0,0.4) 93%, transparent 100%)",
                maskImage: "linear-gradient(to bottom, black 82%, rgba(0,0,0,0.4) 93%, transparent 100%)",
              }}
            >
              
              {/* 1. Static Album Cover Image (Always shown when paused or when Canvas is turned off) */}
              <div
                className={`absolute inset-0 w-full h-full z-10 transition-opacity duration-300 ${
                  isCanvasMode && isPlaying
                    ? "opacity-0 pointer-events-none"
                    : "opacity-100"
                }`}
              >
                {currentSong?.image_url ? (
                  <img
                    src={currentSong.image_url}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <Music className="w-16 h-16 text-gray-600" />
                  </div>
                )}
              </div>

              {/* 2. YouTube Canvas Video Container (Always Mounted in DOM) */}
              <div
                className={
                  isCanvasMode && isPanelVisible
                    ? "absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-300 opacity-100 z-0"
                    : "fixed -left-[9999px] top-0 w-[320px] h-[180px] overflow-hidden pointer-events-none opacity-100 z-[-100]"
                }
              >
                {/* 16:9 Oversized Crop: 160% height x 284% width permanently eliminates title, watermark, and black bars */}
                <div className="w-full h-full relative overflow-hidden bg-black">
                  <div
                    className={
                      isCanvasMode && isPanelVisible
                        ? "absolute flex items-center justify-center pointer-events-none select-none"
                        : "w-full h-full"
                    }
                    style={
                      isCanvasMode && isPanelVisible
                        ? {
                            width: "284%",
                            height: "160%",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                          }
                        : undefined
                    }
                  >
                    <div
                      id="youtube-player-frame"
                      className="w-full h-full pointer-events-none select-none"
                    />
                  </div>
                </div>

                {/* 3. 100% Locked Transparent Overlay: blocks all clicks and touches permanently */}
                <div
                  className="absolute inset-0 z-10 pointer-events-auto cursor-default select-none"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
              </div>

              {/* 4. Bottom Smooth Gradient Vignette (Pure natural ease-out fade, no artificial grey haze) */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent pointer-events-none z-10" />

              {/* 5. Top Subtle Vignette */}
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-10" />

              {/* 6. Top Utility Switcher: Canvas / Cover Art */}
              {isYouTube && (
                <div className="absolute top-2.5 right-2.5 z-20 pointer-events-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowVideo(!showVideo);
                    }}
                    className="bg-black/70 hover:bg-black/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20 transition flex items-center gap-1.5 shadow-lg"
                    title={
                      showVideo
                        ? "Chuyển sang xem ảnh bìa tĩnh"
                        : "Chuyển sang xem video Canvas"
                    }
                  >
                    {showVideo ? (
                      <>
                        <ImageIcon className="w-3 h-3 text-gray-300" />
                        <span>Ảnh bìa</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-[#1db954]" />
                        <span>Canvas</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Title & Artist with Interactive Heart Button */}
            {currentSong && (
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <h2 className="text-xl font-extrabold text-white truncate hover:underline cursor-pointer">
                    {currentSong.title}
                  </h2>
                  <p
                    onClick={() => onOpenArtist(currentSong.artist)}
                    className="text-sm font-medium text-gray-400 hover:text-white hover:underline cursor-pointer truncate mt-0.5"
                  >
                    {currentSong.artist}
                  </p>
                </div>

                {/* Action Buttons: Add to Playlist & Favorite Heart */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openAddToPlaylist(currentSong)}
                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
                    title="Thêm vào danh sách phát"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleFavorite(currentSong)}
                    className="p-2 rounded-full hover:bg-white/5 transition"
                    title={favorited ? "Bỏ yêu thích" : "Yêu thích"}
                  >
                    <Heart
                      className={`w-6 h-6 transition ${
                        favorited
                          ? "fill-[#1db954] text-[#1db954]"
                          : "text-gray-400 hover:text-white"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Redesigned Premium Glassmorphic Lyrics Box */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-neutral-900/90 via-[#181818] to-neutral-950 border border-white/10 shadow-2xl relative overflow-hidden group">
            {/* Ambient Accent Aura */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1db954]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#1db954]" />
                  <span>Lời bài hát</span>
                </span>
                {isSyncedLyrics && (
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {lyricsSource === "youtube-captions" ? "Khớp chuẩn video" : "Đồng bộ thời gian"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {isSyncedLyrics && (
                  <div
                    className="flex items-center gap-0.5 text-[10px] bg-white/5 border border-white/10 rounded-lg px-1.5 py-0.5 mr-1"
                    title="Điều chỉnh độ trễ lời bài hát"
                  >
                    <button
                      onClick={() => setLyricsOffset((prev) => Math.round((prev - 0.5) * 10) / 10)}
                      className="px-1 text-gray-400 hover:text-white transition font-mono hover:bg-white/10 rounded"
                      title="Chạy sớm hơn 0.5s"
                    >
                      -0.5s
                    </button>
                    {lyricsOffset !== 0 && (
                      <span
                        onClick={() => setLyricsOffset(0)}
                        className="text-[10px] font-bold text-[#1db954] cursor-pointer hover:underline px-0.5"
                        title="Bấm để đặt lại về 0s"
                      >
                        {lyricsOffset > 0 ? `+${lyricsOffset}s` : `${lyricsOffset}s`}
                      </span>
                    )}
                    <button
                      onClick={() => setLyricsOffset((prev) => Math.round((prev + 0.5) * 10) / 10)}
                      className="px-1 text-gray-400 hover:text-white transition font-mono hover:bg-white/10 rounded"
                      title="Chạy trễ hơn 0.5s"
                    >
                      +0.5s
                    </button>
                  </div>
                )}

                {/* Fullscreen Karaoke Launch Button */}
                <button
                  onClick={toggleLyricsFullscreen}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition border border-white/5 shadow-sm"
                  title="Mở toàn màn hình Karaoke"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lyrics Content Stream */}
            {loadingLyrics ? (
              <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#1db954]" />
                <span className="text-xs">Đang tải lời bài hát...</span>
              </div>
            ) : !hasLyrics ? (
              <div className="py-6 text-center">
                <p className="text-xs text-gray-400 italic font-medium">
                  {lyricsMessage || "Hiện bài hát này chưa có lời"}
                </p>
              </div>
            ) : (
              <div
                ref={lyricsContainerRef}
                className="space-y-3 max-h-64 overflow-y-auto pr-1 select-text scroll-smooth scrollbar-none"
              >
                {lyrics.map((line, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <div
                      key={idx}
                      ref={isActive ? activeLineRef : null}
                      onClick={() => {
                        if (isSyncedLyrics && typeof line.start === "number") {
                          seekTo(line.start);
                        }
                      }}
                      className={`group/line flex items-start gap-2.5 transition-all duration-200 ${
                        isSyncedLyrics ? "cursor-pointer" : ""
                      }`}
                      title={isSyncedLyrics ? "Bấm để phát từ đoạn này" : undefined}
                    >
                      {/* Active Indicator Bar & Wave */}
                      {isActive && (
                        <div className="flex items-center gap-0.5 pt-1 flex-shrink-0">
                          <span className="w-1 h-3 bg-[#1db954] rounded-full animate-pulse" />
                          <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                          <span className="w-1 h-2 bg-[#1db954] rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                        </div>
                      )}

                      <p
                        className={`transition-all duration-200 leading-relaxed flex-1 ${
                          isActive
                            ? "text-white font-extrabold text-sm drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] scale-[1.01] origin-left"
                            : "text-gray-400 hover:text-white font-medium text-xs hover:scale-[1.005] origin-left"
                        }`}
                      >
                        {line.text}
                      </p>

                      {/* Line Hover Jump Icon */}
                      {isSyncedLyrics && !isActive && (
                        <span className="opacity-0 group-hover/line:opacity-100 text-gray-400 hover:text-[#1db954] text-[10px] flex-shrink-0 pt-0.5">
                          <Play className="w-3 h-3 fill-current" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Fullscreen Pill Button */}
            {hasLyrics && (
              <button
                onClick={toggleLyricsFullscreen}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1db954]" />
                <span>Xem toàn màn hình Karaoke</span>
              </button>
            )}
          </div>

          {/* About the artist Card */}
          {currentSong && (
            <div
              onClick={() => onOpenArtist(currentSong.artist)}
              className="group relative rounded-xl overflow-hidden bg-[#1c181a] border border-white/5 cursor-pointer shadow-lg hover:border-white/15 transition"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                {currentSong.image_url && (
                  <img
                    src={currentSong.image_url}
                    alt={currentSong.artist}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c181a] via-transparent to-black/30" />
                <span className="absolute top-3 left-3 text-xs font-bold text-white uppercase tracking-wider drop-shadow">
                  About the artist
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-white text-base group-hover:text-[#1db954] transition truncate">
                    {currentSong.artist}
                  </p>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">
                  Bấm để xem tất cả bài hát và thông tin chi tiết trên trang nghệ sĩ.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </aside>
  );
}
