"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";
import {
  X,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Music,
  Loader2,
  ExternalLink,
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
  const { currentSong, currentTime } = usePlayer();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [hasLyrics, setHasLyrics] = useState<boolean>(false);
  const [lyricsMessage, setLyricsMessage] = useState<string>("");
  const [loadingLyrics, setLoadingLyrics] = useState<boolean>(false);
  const [isExpandedLyrics, setIsExpandedLyrics] = useState<boolean>(false);

  const activeLineRef = useRef<HTMLParagraphElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

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

  // Auto-scroll lyrics
  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentTime]);

  if (!isOpen || !currentSong) return null;

  const activeIndex = lyrics.findIndex(
    (line, idx) =>
      currentTime >= line.start &&
      (idx === lyrics.length - 1 || currentTime < lyrics[idx + 1].start)
  );

  return (
    <aside className="w-80 md:w-88 lg:w-96 bg-[#121212] border-l border-[#242424] flex flex-col h-full select-none overflow-hidden flex-shrink-0 z-30">
      {/* Top Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-white/5">
        <span className="font-bold text-sm text-white truncate">
          {currentSong.artist}
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
        {/* Large Song Artwork */}
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

          {/* Title & Artist with Verified Checkmark */}
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
            <CheckCircle2 className="w-6 h-6 text-[#1db954] fill-black flex-shrink-0" />
          </div>
        </div>

        {/* Lyrics Box */}
        <div
          className={`rounded-xl p-4 transition-all duration-300 ${
            isExpandedLyrics
              ? "bg-[#1c181a] fixed inset-4 z-50 overflow-hidden flex flex-col shadow-2xl border border-white/20"
              : "bg-[#1c181a] border border-white/5"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-base text-white">Lyrics</span>
            <button
              onClick={() => setIsExpandedLyrics(!isExpandedLyrics)}
              className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
              title={isExpandedLyrics ? "Thu nhỏ" : "Mở rộng"}
            >
              {isExpandedLyrics ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {loadingLyrics ? (
            <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#1db954]" />
              <span className="text-xs">Đang tải lời bài hát...</span>
            </div>
          ) : !hasLyrics ? (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-400 italic font-medium">
                {lyricsMessage || "Hiện bài hát này chưa có lời"}
              </p>
            </div>
          ) : (
            <div
              ref={lyricsContainerRef}
              className={`space-y-3.5 overflow-y-auto pr-1 select-text scroll-smooth ${
                isExpandedLyrics ? "flex-1 max-h-none py-6" : "max-h-60"
              }`}
            >
              {lyrics.map((line, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <p
                    key={idx}
                    ref={isActive ? activeLineRef : null}
                    className={`transition-all duration-200 leading-relaxed ${
                      isActive
                        ? "text-white font-extrabold text-base drop-shadow"
                        : "text-gray-500 font-semibold text-sm hover:text-gray-300 cursor-pointer"
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* About the artist Card */}
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
      </div>
    </aside>
  );
}
