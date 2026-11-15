"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  Shuffle,
  Heart,
  ArrowLeft,
  Music2,
  FolderPlus,
  Sparkles,
  Share2,
  Check,
  Disc3,
  Flame,
  Plus,
  MoreVertical,
} from "lucide-react";
import { DailyMixItem } from "@/app/api/songs/mixes/route";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { usePlaylist } from "@/context/PlaylistContext";
import { useLanguage } from "@/context/LanguageContext";

interface MixDetailViewProps {
  mix: DailyMixItem;
  onBack: () => void;
  onPlaySong: (song: any, queue?: any[], isPlaylistContext?: boolean) => void;
  onOpenArtist: (artist: { channelId?: string; name?: string }) => void;
}

export default function MixDetailView({
  mix,
  onBack,
  onPlaySong,
  onOpenArtist,
}: MixDetailViewProps) {
  const [songsList, setSongsList] = useState(mix.songs || []);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { currentSong, isPlaying, togglePlay } = usePlayer();
  const { user, openAuthModal, isFavorite, toggleFavorite } = useAuth();
  const { createPlaylist, addSongToPlaylist, openAddToPlaylist } = usePlaylist();
  const { t } = useLanguage();

  // Check if current playing song belongs to this mix
  const isCurrentMixPlaying =
    isPlaying &&
    currentSong &&
    songsList.some((s) => s.audio_url === currentSong.audio_url);

  // Play mix (shuffled)
  const handlePlayAll = () => {
    if (songsList.length === 0) return;
    if (isCurrentMixPlaying) {
      togglePlay();
    } else {
      onPlaySong(songsList[0], songsList, true);
    }
  };

  // Re-shuffle songs order
  const handleReshuffle = () => {
    const shuffled = [...songsList];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setSongsList(shuffled);
  };

  // Save this mix into user's custom library playlists
  const handleSaveToLibrary = async () => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    try {
      setIsSaving(true);
      const newPlaylist = await createPlaylist(
        `${mix.name}: ${mix.theme}`,
        `Tuyển tập ${mix.theme} được lưu từ Daily Mix của TrackFlow. Gồm ${songsList.length} ca khúc.`
      );

      if (newPlaylist && songsList.length > 0) {
        // Add songs sequentially
        for (const s of songsList.slice(0, 30)) {
          await addSongToPlaylist(newPlaylist.id, s);
        }
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Lỗi khi lưu mix vào thư viện:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition border border-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.mixes.backToHome}</span>
        </button>

        <span className="text-xs font-mono text-gray-400">
          {t.mixes.updatedDaily}
        </span>
      </div>

      {/* Hero Banner (Liner & Spotify Mixed Style) */}
      <div
        className={`relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${mix.accentGradient} border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8`}
      >
        {/* Cover Art with Giant MIX Typography */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 group bg-black border border-white/10">
          <img
            src={mix.coverUrl}
            alt={mix.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

          {/* Top Left Mini Logo */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <span className="w-6 h-6 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-xs font-black text-white border border-white/10">
              ♫
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white/20 text-white backdrop-blur-md">
              {mix.badge}
            </span>
          </div>

          {/* Bottom Bold MIX Typography */}
          <div className="absolute bottom-3 left-4 z-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none drop-shadow-md">
              MIX {mix.mixNumber}
            </h2>
          </div>
        </div>

        {/* Hero Metadata */}
        <div className="flex-1 text-center md:text-left min-w-0">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
              {t.mixes.randomMixBadge}
            </span>
            <span className="text-xs font-medium text-gray-300">
              • {songsList.length} {t.mixes.songsCount}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {mix.name}: {mix.theme}
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-2xl leading-relaxed">
            {mix.description}
          </p>

          <p className="text-xs text-gray-400 mt-1.5 truncate">
            <span className="text-white/80 font-semibold">{t.mixes.featuredArtists}:</span>{" "}
            {mix.artistsSummary}
          </p>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-5">
            {/* Play All / Shuffle Button */}
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-extrabold text-sm shadow-xl hover:scale-105 active:scale-95 transition"
            >
              {isCurrentMixPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-black" />
                  <span>{t.mixes.pause}</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                  <span>{t.mixes.shufflePlay}</span>
                </>
              )}
            </button>

            {/* Re-shuffle Order Button */}
            <button
              onClick={handleReshuffle}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition hover:scale-105"
              title="Đổi thứ tự ngẫu nhiên trong mix"
            >
              <Shuffle className="w-4 h-4 text-[#1db954]" />
              <span>{t.mixes.reshuffle}</span>
            </button>

            {/* Save to Library Button */}
            <button
              onClick={handleSaveToLibrary}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full font-bold text-xs transition border ${
                savedSuccess
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-white/10 hover:bg-white/15 text-white border-white/10 hover:scale-105"
              }`}
              title="Lưu danh sách này thành playlist riêng trong Thư viện"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{t.mixes.saved}</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4 text-sky-400" />
                  <span>{isSaving ? t.mixes.saving : t.mixes.saveToLibrary}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#1db954]" />
          <h3 className="text-base sm:text-lg font-bold text-white">
            {t.mixes.tracklistTitle} ({songsList.length})
          </h3>
        </div>
        <span className="text-xs text-gray-400">
          {t.mixes.clickToPlay}
        </span>
      </div>

      {/* Dual-Column Tracklist (Liner Style) */}
      <div className="bg-[#181818]/40 border border-white/5 rounded-2xl overflow-hidden p-2.5 sm:p-3.5 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
          {songsList.map((song, index) => {
            const isCurrent =
              currentSong?.id === song.id || currentSong?.audio_url === song.audio_url;
            const favorited = isFavorite(song);
            const rank = index + 1;

            return (
              <div
                key={song.id || index}
                onClick={() => onPlaySong(song, songsList, true)}
                className={`group flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-[#222222] transition cursor-pointer border border-transparent hover:border-white/5 ${
                  isCurrent ? "bg-[#242424] border-white/10" : "bg-[#161616]/70"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Rank / Playing Equalizer */}
                  <div className="w-6 text-center flex-shrink-0">
                    {isCurrent && isPlaying ? (
                      <div className="flex items-center justify-center gap-0.5 h-3.5">
                        <span className="w-1 bg-[#1db954] h-2.5 animate-bounce rounded-full" />
                        <span className="w-1 bg-[#1db954] h-3.5 animate-bounce delay-75 rounded-full" />
                        <span className="w-1 bg-[#1db954] h-2 animate-bounce delay-150 rounded-full" />
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-gray-500">
                        #{rank}
                      </span>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-black flex-shrink-0 shadow border border-white/5 flex items-center justify-center">
                    {song.image_url ? (
                      <img
                        src={song.image_url}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        loading="lazy"
                      />
                    ) : (
                      <Music2 className="w-5 h-5 text-gray-500" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      {isCurrent && isPlaying ? (
                        <Pause className="w-4 h-4 fill-white text-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs sm:text-sm font-bold truncate transition ${
                        isCurrent ? "text-[#1db954]" : "text-white group-hover:text-[#1db954]"
                      }`}
                    >
                      {song.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 truncate">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenArtist({ name: song.artist });
                        }}
                        className="text-xs text-gray-400 hover:text-white hover:underline truncate cursor-pointer font-medium"
                      >
                        {song.artist}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(song);
                    }}
                    className={`p-1.5 rounded-full hover:bg-white/10 transition ${
                      favorited ? "text-[#1db954]" : "text-gray-500 hover:text-white"
                    }`}
                    title={favorited ? "Bỏ yêu thích" : "Yêu thích"}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${favorited ? "fill-[#1db954]" : ""}`}
                    />
                  </button>

                  {/* 3-dots Menu / Add to Playlist */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddToPlaylist(song);
                    }}
                    className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
                    title="Thêm vào danh sách phát"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
