"use client";

import React from "react";
import { usePlayer } from "@/context/PlayerContext";
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
}

export default function Player({ onToggleRightPanel, isRightPanelOpen }: PlayerProps) {
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
  } = usePlayer();

  return (
    <>
      {/* Single Persistent YouTube IFrame Container */}
      <div
        className={`fixed bottom-28 right-6 z-40 rounded-xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 bg-black ${
          isYouTube && showVideo
            ? "w-80 h-48 opacity-100 pointer-events-auto"
            : "w-1 h-1 opacity-0 pointer-events-none overflow-hidden"
        }`}
      >
        <div id="youtube-player-frame" className="w-full h-full" />
      </div>

      {/* Spotify Bottom Player Bar */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between z-50 text-white select-none">
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

            <div className="overflow-hidden">
              <p className="font-semibold text-sm text-white truncate hover:underline cursor-pointer">
                {currentSong.title}
              </p>
              <p className="text-xs text-gray-400 truncate hover:underline cursor-pointer">
                {currentSong.artist}
              </p>
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

          {/* Right: Lyrics, Video Toggle & Volume */}
          <div className="flex items-center justify-end gap-3 w-1/4 min-w-[150px]">
            {onToggleRightPanel && (
              <button
                onClick={onToggleRightPanel}
                className={`p-2 rounded-full transition ${
                  isRightPanelOpen
                    ? "text-[#1db954] bg-white/10"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Hiện thông tin & Lời bài hát"
              >
                <Mic2 className="w-5 h-5" />
              </button>
            )}

            {isYouTube && (
              <button
                onClick={() => setShowVideo(!showVideo)}
                className={`p-2 rounded-full transition ${
                  showVideo ? "text-[#1db954] bg-white/10" : "text-gray-400 hover:text-white"
                }`}
                title={showVideo ? "Ẩn Video MV" : "Hiện Video MV"}
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
    </>
  );
}
