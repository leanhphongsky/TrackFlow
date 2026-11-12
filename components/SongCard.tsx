"use client";

import React from "react";
import { Song } from "@/lib/db";
import { Play, Pause, Music, Heart } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";

interface SongCardProps {
  song: Song;
  songsList: Song[];
}

export default function SongCard({ song, songsList }: SongCardProps) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { isFavorite, toggleFavorite } = useAuth();

  const isCurrent = currentSong?.id === song.id;
  const favorited = isFavorite(song);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, songsList, Boolean(songsList && songsList.length > 1));
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(song);
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group relative p-3 rounded-xl bg-[#181818] hover:bg-[#282828] transition duration-300 cursor-pointer border border-transparent hover:border-white/5 flex flex-col gap-3 ${
        isCurrent ? "bg-[#282828] border-white/10" : ""
      }`}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#242424] shadow-lg">
        {song.image_url ? (
          <img
            src={song.image_url}
            alt={song.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#121212]">
            <Music className="w-12 h-12 text-gray-500" />
          </div>
        )}

        {/* Favorite Heart Button on Top-Right */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition ${
            favorited
              ? "opacity-100 text-[#1db954]"
              : "opacity-0 group-hover:opacity-100 text-white/70 hover:text-white bg-black/40 hover:bg-black/60"
          }`}
          title={favorited ? "Bỏ yêu thích" : "Yêu thích"}
        >
          <Heart
            className={`w-4 h-4 ${favorited ? "fill-[#1db954] text-[#1db954]" : ""}`}
          />
        </button>

        {/* Floating Green Play Button on Hover / Active */}
        <button
          onClick={handlePlayClick}
          className={`absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1db954] hover:bg-[#1ed760] hover:scale-110 flex items-center justify-center text-black shadow-xl transition-all duration-300 ${
            isCurrent
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
          }`}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-5 h-5 fill-black" />
          ) : (
            <Play className="w-5 h-5 fill-black ml-0.5" />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 min-w-0">
        <h3
          className={`font-semibold text-sm truncate ${
            isCurrent ? "text-[#1db954]" : "text-white"
          }`}
        >
          {song.title}
        </h3>
        <p className="text-xs text-gray-400 truncate">{song.artist}</p>
      </div>
    </div>
  );
}
