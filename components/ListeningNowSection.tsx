"use client";

import React, { useState } from "react";
import { Play, MoreVertical, Heart, Plus, Music } from "lucide-react";
import { Song } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import { usePlaylist } from "@/context/PlaylistContext";
import { useLanguage } from "@/context/LanguageContext";

interface ListeningNowSectionProps {
  tracks: Song[];
  onPlaySong: (song: Song, queue: Song[]) => void;
  onOpenArtist?: (name: string) => void;
}

function formatDuration(seconds?: number): string {
  if (!seconds || isNaN(seconds)) return "3:15";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ListeningNowSection({
  tracks,
  onPlaySong,
  onOpenArtist,
}: ListeningNowSectionProps) {
  const { isFavorite, toggleFavorite } = useAuth();
  const { openAddToPlaylist } = usePlaylist();
  const { t, language } = useLanguage();
  const [activeMenuId, setActiveMenuId] = useState<number | string | null>(null);

  // Take exactly up to 10 tracks, arranged in 2 columns of 5
  const displayTracks = tracks.slice(0, 10);
  if (displayTracks.length === 0) return null;

  return (
    <section className="flex flex-col mt-7 mb-6 select-none">
      {/* Section Heading with Fire Icon */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-xl">🔥</span>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
          {language === "vi" ? "Đang nghe nhiều nhất" : "Listening right now"}
        </h2>
      </div>

      {/* 2-Column Grid Container (2026 Bento Standard: 2 cols, 5 rows) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] p-3 backdrop-blur-sm">
        {displayTracks.map((song, index) => {
          const favorited = isFavorite(song);
          const isMenuOpen = activeMenuId === (song.id || index);

          return (
            <div
              key={song.id || index}
              className="group relative flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-white/[0.06] transition-colors duration-150 cursor-pointer"
              onClick={() => onPlaySong(song, displayTracks)}
            >
              {/* Left: Thumbnail & Title + Artist */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Cover art with hover Play overlay */}
                <div className="relative w-[42px] h-[42px] rounded-xl overflow-hidden bg-[#18181b] border border-white/10 shrink-0 shadow-sm">
                  {song.image_url ? (
                    <img
                      src={song.image_url}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40">
                      <Music className="w-4 h-4" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                  </div>
                </div>

                {/* Title & Artist */}
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-white group-hover:text-[#1db954] truncate leading-tight transition-colors">
                    {song.title}
                  </h4>
                  <p
                    onClick={(e) => {
                      if (onOpenArtist) {
                        e.stopPropagation();
                        onOpenArtist(song.artist);
                      }
                    }}
                    className="text-xs text-white/50 truncate hover:text-white hover:underline transition mt-0.5"
                  >
                    {song.artist}
                  </p>
                </div>
              </div>

              {/* Right: Duration & Context Menu */}
              <div className="flex items-center gap-2.5 shrink-0 ml-2">
                <span className="text-xs text-white/40 font-mono">
                  {formatDuration(song.duration)}
                </span>

                {/* Options button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(isMenuOpen ? null : (song.id || index));
                    }}
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition active:scale-95"
                    title={language === "vi" ? "Tùy chọn" : "Options"}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 w-44 bg-[#141418]/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl py-1 z-50 animate-fadeIn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          onPlaySong(song, displayTracks);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-white/10 flex items-center gap-2 transition"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{t.player.play}</span>
                      </button>
                      <button
                        onClick={() => {
                          toggleFavorite(song);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-white/10 flex items-center gap-2 transition"
                      >
                        <Heart className={`w-3.5 h-3.5 ${favorited ? "fill-[#1db954] text-[#1db954]" : ""}`} />
                        <span>{favorited ? t.player.unfavorite : t.player.favorite}</span>
                      </button>
                      <button
                        onClick={() => {
                          openAddToPlaylist(song);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-white/10 flex items-center gap-2 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t.player.addToPlaylist}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
