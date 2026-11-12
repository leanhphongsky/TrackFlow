"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";
import {
  X,
  CheckCircle,
  Mic2,
  Maximize2,
  Minimize2,
  Music,
  Loader2,
  Sparkles,
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
  const { currentSong, currentTime, isPlaying } = usePlayer();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [hasLyrics, setHasLyrics] = useState<boolean>(false);
  const [lyricsMessage, setLyricsMessage] = useState<string>("");
  const [loadingLyrics, setLoadingLyrics] = useState<boolean>(false);
  const [isExpandedLyrics, setIsExpandedLyrics] = useState<boolean>(false);

  const activeLineRef = useRef<HTMLParagraphElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  // Fetch lyrics whenever currentSong changes
  useEffect(() => {
    if (!currentSong) {
      setLyrics([]);
      setHasLyrics(false);
      return;
    }

    const videoId =
      currentSong.videoId || extractYouTubeId(currentSong.audio_url);

    if (!videoId) {
      setHasLyrics(false);
      setLyricsMessage("Hiện bài hát này chưa có lời");
      setLyrics([]);
      return;
    }

    async function fetchLyrics() {
      try {
        setLoadingLyrics(true);
        const res = await fetch(`/api/youtube/lyrics?videoId=${videoId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.hasLyrics && data.lines?.length > 0) {
            setHasLyrics(true);
            setLyrics(data.lines);
            setLyricsMessage("");
          } else {
            setHasLyrics(false);
            setLyricsMessage(data.message || "Hiện bài hát này chưa có lời");
            setLyrics([]);
          }
        } else {
          setHasLyrics(false);
          setLyricsMessage("Hiện bài hát này chưa có lời");
          setLyrics([]);
        }
      } catch (err) {
        setHasLyrics(false);
        setLyricsMessage("Hiện bài hát này chưa có lời");
        setLyrics([]);
      } finally {
        setLoadingLyrics(false);
      }
    }

    fetchLyrics();
  }, [currentSong?.id, currentSong?.audio_url]);

  // Auto-scroll lyrics to keep active line centered
  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentTime]);

  if (!isOpen || !currentSong) return null;

  // Find active lyric line
  const activeIndex = lyrics.findIndex(
    (line, idx) =>
      currentTime >= line.start &&
      (idx === lyrics.length - 1 || currentTime < lyrics[idx + 1].start)
  );

  return (
    <aside className="w-80 md:w-96 bg-[#121212] border-l border-[#242424] flex flex-col h-full select-none overflow-hidden flex-shrink-0 relative">
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-[#1db954]" />
          <span className="font-bold text-sm text-white">Đang phát</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
          title="Đóng panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-28">
        {/* Large Album Artwork Poster */}
        <div className="space-y-3">
          <div className="aspect-square w-full rounded-xl overflow-hidden bg-black shadow-2xl border border-white/10">
            {currentSong.image_url ? (
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

          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <h2 className="text-xl font-bold text-white truncate hover:underline cursor-pointer">
                {currentSong.title}
              </h2>
              <p
                onClick={() => onOpenArtist(currentSong.artist)}
                className="text-sm text-gray-400 hover:text-white hover:underline cursor-pointer truncate"
              >
                {currentSong.artist}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-[#1db954] fill-black flex-shrink-0" />
          </div>
        </div>

        {/* Lyrics Section */}
        <div
          className={`rounded-2xl p-5 border border-white/10 transition-all duration-300 relative ${
            isExpandedLyrics
              ? "bg-gradient-to-b from-[#2a1a24] to-[#161014] fixed inset-4 z-50 overflow-hidden flex flex-col"
              : "bg-gradient-to-b from-[#1e171b] to-[#161214]"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mic2 className="w-4 h-4 text-[#1db954]" />
              <span className="font-bold text-sm text-white">Lời bài hát</span>
            </div>
            <button
              onClick={() => setIsExpandedLyrics(!isExpandedLyrics)}
              className="p-1 rounded-md text-gray-400 hover:text-white transition"
              title={isExpandedLyrics ? "Thu nhỏ" : "Mở rộng lời bài hát"}
            >
              {isExpandedLyrics ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {loadingLyrics ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1db954]" />
              <span className="text-xs">Đang tải lời bài hát...</span>
            </div>
          ) : !hasLyrics ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-400 italic font-medium">
                {lyricsMessage || "Hiện bài hát này chưa có lời"}
              </p>
            </div>
          ) : (
            <div
              ref={lyricsContainerRef}
              className={`space-y-4 overflow-y-auto pr-1 select-text scroll-smooth ${
                isExpandedLyrics ? "flex-1 max-h-none py-6" : "max-h-72"
              }`}
            >
              {lyrics.map((line, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <p
                    key={idx}
                    ref={isActive ? activeLineRef : null}
                    className={`transition-all duration-300 leading-relaxed cursor-pointer ${
                      isActive
                        ? "text-white font-extrabold text-lg scale-102 drop-shadow"
                        : "text-gray-500 font-semibold text-sm hover:text-gray-300"
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* About the Artist Card */}
        <div className="bg-[#181818] rounded-2xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white">Về nghệ sĩ</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-black flex-shrink-0">
              {currentSong.image_url ? (
                <img
                  src={currentSong.image_url}
                  alt={currentSong.artist}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                onClick={() => onOpenArtist(currentSong.artist)}
                className="font-bold text-white text-sm hover:underline cursor-pointer truncate"
              >
                {currentSong.artist}
              </p>
              <p className="text-xs text-gray-400">Nghệ sĩ trên YouTube</p>
            </div>
          </div>

          <button
            onClick={() => onOpenArtist(currentSong.artist)}
            className="w-full text-center text-xs font-bold text-white bg-white/10 hover:bg-white/20 py-2.5 rounded-full transition"
          >
            Xem trang cá nhân nghệ sĩ
          </button>
        </div>
      </div>
    </aside>
  );
}
