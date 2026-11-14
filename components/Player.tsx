"use client";

import React from "react";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { usePlaylist } from "@/context/PlaylistContext";
import YoutubeIcon from "@/components/icons/YoutubeIcon";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Repeat,
  Music,
  Tv,
  Mic2,
  Heart,
  Plus,
  Waves,
} from "lucide-react";

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

interface PlayerProps {
  onToggleRightPanel?: () => void;
  isRightPanelOpen?: boolean;
  onOpenChill?: () => void;
}

export default function Player({
  onToggleRightPanel,
  isRightPanelOpen,
  onOpenChill,
}: PlayerProps) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLooping,
    isYouTube,
    showVideo,
    setShowVideo,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    setVolumeLevel,
    toggleMute,
    toggleLoop,
    isLyricsFullscreen,
    toggleLyricsFullscreen,
    hasLyrics,
  } = usePlayer();
  const { isFavorite, toggleFavorite } = useAuth();
  const { openAddToPlaylist } = usePlaylist();

  const isCurrentFav = currentSong ? isFavorite(currentSong) : false;

  return (
    <>
      {/* 1. Desktop Spotify Bottom Player Bar */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#181818] border-t border-[#282828] px-4 hidden md:flex items-center justify-between z-50 text-white select-none">
          {/* Left: Song Info */}
          <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
            <div className="relative group">
              {currentSong.image_url ? (
                <img
                  src={currentSong.image_url}
                  alt={currentSong.title}
                  className="w-14 h-14 rounded-md object-cover shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-md bg-[#282828] flex items-center justify-center">
                  <Music className="w-6 h-6 text-gray-400" />
                </div>
              )}
              {isYouTube && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                  <YoutubeIcon className="w-3 h-3 text-white" />
                </span>
              )}
            </div>

            <div className="overflow-hidden min-w-0 flex-1">
              <p className="font-semibold text-sm text-white truncate hover:underline cursor-pointer">
                {currentSong.title}
              </p>
              <p className="text-xs text-gray-400 truncate hover:underline cursor-pointer">
                {currentSong.artist}
              </p>
            </div>

            {/* Quick Actions: Add to Playlist & Heart */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => openAddToPlaylist(currentSong)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
                title="Thêm vào danh sách phát"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleFavorite(currentSong)}
                className={`p-1.5 rounded-full transition ${
                  isCurrentFav
                    ? "text-[#1db954]"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
                title={isCurrentFav ? "Bỏ thích" : "Yêu thích"}
              >
                <Heart className={`w-4 h-4 ${isCurrentFav ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          {/* Center: Controls & Scrubber */}
          <div className="flex flex-col items-center justify-center w-2/4 max-w-[600px] gap-2">
            <div className="flex items-center gap-5">
              <button
                onClick={toggleLoop}
                className={`transition ${isLooping ? "text-[#1db954]" : "text-gray-400 hover:text-white"}`}
                title="Lặp lại bài hát"
              >
                <Repeat className="w-4 h-4" />
              </button>

              <button
                onClick={prevSong}
                className="text-gray-400 hover:text-white transition"
                title="Bài trước"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-white hover:scale-105 flex items-center justify-center text-black transition shadow"
                title={isPlaying ? "Tạm dừng" : "Phát"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="text-gray-400 hover:text-white transition"
                title="Bài tiếp theo"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>

            {/* Seek Progress Bar */}
            <div className="flex items-center gap-2 w-full text-xs text-gray-400 font-mono">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <div className="relative flex-1 group flex items-center cursor-pointer">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  className="w-full h-1 bg-[#4d4d4d] rounded-lg appearance-none cursor-pointer accent-[#1db954] focus:outline-none"
                />
              </div>
              <span className="w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Lyrics Karaoke, Video/Canvas Toggle & Volume */}
          <div className="flex items-center justify-end gap-2.5 w-1/4 min-w-[150px]">
            {/* Chill Mode Visualizer Toggle */}
            {onOpenChill && (
              <button
                onClick={onOpenChill}
                className="p-2 rounded-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/15 transition shadow-sm"
                title="Mở chế độ Chill & Visualizer sóng âm 360°"
              >
                <Waves className="w-5 h-5" />
              </button>
            )}

            {/* Fullscreen Karaoke Lyrics Toggle */}
            <button
              onClick={toggleLyricsFullscreen}
              className={`p-2 rounded-full transition ${
                isLyricsFullscreen
                  ? "text-[#1db954] bg-[#1db954]/20 shadow-[0_0_12px_rgba(29,185,84,0.3)]"
                  : hasLyrics
                  ? "text-gray-300 hover:text-[#1db954] hover:bg-white/10"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              title="Xem Lời bài hát Karaoke toàn màn hình"
            >
              <Mic2 className="w-5 h-5" />
            </button>

            {/* Right Panel / Canvas Toggle */}
            {onToggleRightPanel && (
              <button
                onClick={onToggleRightPanel}
                className={`p-2 rounded-full transition ${
                  isRightPanelOpen
                    ? "text-[#1db954] bg-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
                title="Thông tin bài hát & Ảnh bìa"
              >
                <Tv className="w-5 h-5" />
              </button>
            )}

            <button onClick={toggleMute} className="text-gray-400 hover:text-white transition">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolumeLevel(Number(e.target.value))}
              className="w-24 h-1 bg-[#4d4d4d] rounded-lg appearance-none cursor-pointer accent-[#1db954] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* 2. Mobile Floating Mini-Player Pill */}
      {currentSong && (
        <div className="fixed bottom-[68px] left-2 right-2 z-40 rounded-2xl bg-[#202020]/95 border border-white/15 backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.85)] p-2.5 flex md:hidden items-center justify-between pointer-events-auto select-none overflow-hidden animate-fadeIn">
          {/* Slim Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white/15">
            <div
              className="h-full bg-[#1db954] transition-all duration-100 ease-linear shadow-sm"
              style={{ width: `${((currentTime || 0) / (duration || 1)) * 100}%` }}
            />
          </div>

          {/* Left: Thumbnail & Title (Tapping opens Chill View or Lyrics) */}
          <div
            onClick={onOpenChill || toggleLyricsFullscreen}
            className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer pr-2"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 border border-white/10 flex-shrink-0 shadow-md">
              {currentSong.image_url ? (
                <img
                  src={currentSong.image_url}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Music className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {currentSong.title}
              </p>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                {currentSong.artist}
              </p>
            </div>
          </div>

          {/* Right: Quick Touch-Friendly Controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Chill View Shortcut */}
            {onOpenChill && (
              <button
                onClick={onOpenChill}
                className="p-2 rounded-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/15 transition active:scale-95"
                title="Mở Visualizer Chill"
              >
                <Waves className="w-4 h-4" />
              </button>
            )}

            {/* Favorite Heart */}
            <button
              onClick={() => toggleFavorite(currentSong)}
              className={`p-2 rounded-full transition active:scale-95 ${
                isCurrentFav ? "text-[#1db954]" : "text-gray-400 hover:text-white"
              }`}
              title={isCurrentFav ? "Bỏ thích" : "Yêu thích"}
            >
              <Heart className={`w-4 h-4 ${isCurrentFav ? "fill-current" : ""}`} />
            </button>

            {/* Play / Pause Circular Button */}
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black shadow-md hover:scale-105 active:scale-90 transition"
              title={isPlaying ? "Tạm dừng" : "Phát"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black ml-0.5" />
              )}
            </button>

            {/* Next Song */}
            <button
              onClick={nextSong}
              className="p-1.5 rounded-full text-gray-400 hover:text-white transition active:scale-95"
              title="Bài tiếp theo"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
