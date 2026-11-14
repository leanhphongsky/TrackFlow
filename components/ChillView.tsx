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
  Sliders,
  Palette,
  Sparkles,
  Music,
  Waves,
} from "lucide-react";

interface ChillViewProps {
  onBack: () => void;
  onOpenArtist?: (name: string) => void;
}

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Background Theme Presets
const BACKGROUND_THEMES = [
  {
    id: "bloom-dark",
    name: "Bloom Dark (Windows 11)",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=85&fit=crop",
    overlay: "bg-black/40",
  },
  {
    id: "album-aura",
    name: "Album Aura",
    url: "",
    overlay: "bg-black/60 backdrop-blur-3xl",
  },
  {
    id: "lofi-night",
    name: "Lofi City Night",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=85&fit=crop",
    overlay: "bg-black/50",
  },
  {
    id: "cosmic-space",
    name: "Deep Cosmic Space",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&q=85&fit=crop",
    overlay: "bg-black/45",
  },
  {
    id: "aurora",
    name: "Aurora Lights",
    url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=85&fit=crop",
    overlay: "bg-black/40",
  },
];

export default function ChillView({ onBack, onOpenArtist }: ChillViewProps) {
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
  } = usePlayer();

  const { isFavorite, toggleFavorite } = useAuth();
  const { openAddToPlaylist } = usePlaylist();

  const [currentTheme, setCurrentTheme] = useState("bloom-dark");
  const [waveSensitivity, setWaveSensitivity] = useState<number>(1.2);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [wallClock, setWallClock] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const rotationAngleRef = useRef<number>(0);
  const bassScaleRef = useRef<number>(1);

  // Bars frequency interpolation buffers
  const numCircleBars = 96;
  const circleBarsRef = useRef<number[]>(new Array(numCircleBars).fill(0));
  const numBottomBars = 120;
  const bottomBarsRef = useRef<number[]>(new Array(numBottomBars).fill(0));

  const favorited = currentSong ? isFavorite(currentSong) : false;

  // Real-time wall clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setWallClock(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut: Esc to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onBack();
      } else if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack, togglePlay]);

  // Toggle browser native fullscreen
  const toggleFullscreen = () => {
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

  // Main 60FPS Canvas Animation Loop for 360° Circular Wave & Bottom Spectrum
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const effectiveVol = isMuted ? 0 : volume;
      const now = performance.now() / 1000;

      // Calculate rhythmic audio energy
      let beatIntensity = 0;
      if (isPlaying && effectiveVol > 0) {
        // Multi-frequency rhythm simulation
        const beat1 = Math.pow(Math.max(0, Math.sin(now * Math.PI * 2 * 2.1)), 4);
        const beat2 = Math.pow(Math.max(0, Math.sin(now * Math.PI * 2 * 1.05 + 0.3)), 3);
        beatIntensity = (beat1 * 0.7 + beat2 * 0.5) * effectiveVol * waveSensitivity;

        // Rotate album disk slowly while playing
        rotationAngleRef.current += 0.25;
      }

      // Smooth bass scale for center disk
      const targetScale = 1 + beatIntensity * 0.08;
      bassScaleRef.current += (targetScale - bassScaleRef.current) * 0.15;

      const centerX = width / 2;
      // Position center circle slightly above center to accommodate the floating mini-player below
      const centerY = height / 2 - 40;
      const innerRadius = Math.min(width, height) * 0.16; // ~110px-130px

      // 1. DRAW 360° CIRCULAR AUDIO SPECTRUM AROUND DISK
      const circleBars = circleBarsRef.current;
      for (let i = 0; i < numCircleBars; i++) {
        let targetHeight = 2; // idle baseline
        if (isPlaying && effectiveVol > 0) {
          const angle = (i / numCircleBars) * Math.PI * 2;
          // Harmonic frequency bands
          const f1 = Math.sin(now * 5.2 + i * 0.35) * 0.5 + 0.5;
          const f2 = Math.cos(now * 3.7 - i * 0.2) * 0.5 + 0.5;
          const f3 = Math.sin(now * 9.1 + angle * 4) * 0.5 + 0.5;
          const f4 = Math.abs(Math.sin(angle * 2)); // symmetry emphasis

          const combined = (f1 * 0.4 + f2 * 0.35 + f3 * 0.25) * (0.6 + f4 * 0.4);
          const dynamicBoost = combined * (1 + beatIntensity * 1.8);
          targetHeight = Math.max(3, dynamicBoost * 68 * effectiveVol * waveSensitivity);
        }

        // Damping / Spring interpolation
        circleBars[i] += (targetHeight - circleBars[i]) * 0.18;

        const theta = (i / numCircleBars) * Math.PI * 2 - Math.PI / 2;
        const barH = circleBars[i];

        const x1 = centerX + Math.cos(theta) * (innerRadius + 4);
        const y1 = centerY + Math.sin(theta) * (innerRadius + 4);
        const x2 = centerX + Math.cos(theta) * (innerRadius + 4 + barH);
        const y2 = centerY + Math.sin(theta) * (innerRadius + 4 + barH);

        // Warm Gold -> Orange -> Pink -> Purple gradient based on angle
        // Matching exact colors from user's screenshot
        const normAngle = (theta + Math.PI / 2) / (Math.PI * 2);
        const hue = 38 + normAngle * 280; // 38 (gold) -> 318 (magenta/purple)

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `hsl(${hue}, 95%, 62%)`;
        ctx.lineWidth = Math.max(2, (2 * Math.PI * innerRadius) / numCircleBars - 3);
        ctx.lineCap = "round";
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsla(${hue}, 95%, 55%, 0.45)`;
        ctx.stroke();
      }

      // 2. DRAW BOTTOM EQUALIZER SPECTRUM BAR
      const bottomBars = bottomBarsRef.current;
      const barWidth = width / numBottomBars;
      const bottomY = height;

      for (let j = 0; j < numBottomBars; j++) {
        let targetBottomH = 3;
        if (isPlaying && effectiveVol > 0) {
          const normX = j / numBottomBars;
          const distCenter = 1 - Math.abs(normX - 0.5) * 1.4; // higher near center
          const w1 = Math.sin(now * 4.5 + j * 0.25) * 0.5 + 0.5;
          const w2 = Math.cos(now * 7.1 - j * 0.15) * 0.5 + 0.5;
          const w3 = Math.sin(now * 2.8 + j * 0.08) * 0.5 + 0.5;

          const energy = (w1 * 0.45 + w2 * 0.35 + w3 * 0.2) * Math.max(0.3, distCenter);
          targetBottomH = Math.max(
            3,
            energy * (38 + beatIntensity * 28) * effectiveVol * waveSensitivity
          );
        }

        bottomBars[j] += (targetBottomH - bottomBars[j]) * 0.2;
        const bH = bottomBars[j];
        const bx = j * barWidth + barWidth * 0.15;
        const bw = Math.max(2, barWidth * 0.7);

        // Vertical gradient: gold at bottom to purple at top
        const barGrad = ctx.createLinearGradient(bx, bottomY, bx, bottomY - bH);
        barGrad.addColorStop(0, "#fbbf24");
        barGrad.addColorStop(0.5, "#f97316");
        barGrad.addColorStop(1, "#c084fc");

        ctx.fillStyle = barGrad;
        ctx.shadowBlur = 4;
        ctx.shadowColor = "rgba(249, 115, 22, 0.4)";
        ctx.fillRect(bx, bottomY - bH, bw, bH);
      }

      ctx.restore();
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, volume, isMuted, waveSensitivity]);

  const activeTheme =
    BACKGROUND_THEMES.find((t) => t.id === currentTheme) || BACKGROUND_THEMES[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#0a070e] text-white flex flex-col overflow-hidden select-none animate-fadeIn">
      {/* 1. Background Image / Ambient Wallpaper Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-20">
        {activeTheme.id === "album-aura" ? (
          currentSong?.image_url && (
            <div
              className="absolute -inset-10 opacity-50 blur-[140px] scale-125 transition-all duration-1000"
              style={{
                backgroundImage: `url(${currentSong.image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url(${activeTheme.url})` }}
          />
        )}

        {/* Ambient Dark Tint & Vignette */}
        <div className={`absolute inset-0 ${activeTheme.overlay}`} />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/30 to-black/80" />
      </div>

      {/* 2. Top Bar & Dynamic Island */}
      <div className="h-16 px-6 md:px-10 flex items-center justify-between z-20 flex-shrink-0">
        {/* Left: TrackFlow Chill Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Waves className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-wide text-white drop-shadow">
            TrackFlow Chill
          </span>
        </div>

        {/* Center: Dynamic Island Clock & Audio Pulse Indicator (Exact match to screenshot) */}
        <div className="bg-black/65 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2.5 shadow-2xl">
          <span className="w-2 h-2 rounded-full bg-[#1db954] animate-pulse" />
          <span className="text-xs font-mono font-bold text-gray-200">
            {wallClock || "12:00 PM"}
          </span>
          {isPlaying && (
            <div className="flex items-center gap-0.5 ml-1">
              <span className="w-0.5 h-2 bg-[#1db954] rounded-full animate-pulse" />
              <span className="w-0.5 h-3.5 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
              <span className="w-0.5 h-2 bg-[#1db954] rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>

        {/* Right: Theme Switcher, Sensitivity & Fullscreen / Close */}
        <div className="flex items-center gap-2 relative">
          {/* Theme Palette Button */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition shadow backdrop-blur-md"
              title="Đổi hình nền Chill"
            >
              <Palette className="w-4 h-4" />
            </button>

            {/* Theme Dropdown Menu */}
            {isThemeMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1622]/95 border border-white/15 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-30 space-y-1">
                <p className="text-[11px] font-bold text-gray-400 px-3 py-1 uppercase tracking-wider">
                  Chọn hình nền
                </p>
                {BACKGROUND_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setCurrentTheme(theme.id);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                      currentTheme === theme.id
                        ? "bg-purple-600 text-white font-bold"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{theme.name}</span>
                    {currentTheme === theme.id && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wave Sensitivity Toggle */}
          <button
            onClick={() => {
              setWaveSensitivity((prev) => (prev === 0.8 ? 1.3 : prev === 1.3 ? 1.8 : 0.8));
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition shadow backdrop-blur-md flex items-center gap-1 text-[11px] font-bold"
            title="Độ nhạy sóng âm (Thấp / Vừa / Cao)"
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">
              {waveSensitivity === 0.8 ? "Nhẹ" : waveSensitivity === 1.3 ? "Vừa" : "Mạnh"}
            </span>
          </button>

          {/* Browser Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition shadow backdrop-blur-md"
            title={isBrowserFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình F11"}
          >
            {isBrowserFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>

          {/* Exit Chill Button */}
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition shadow backdrop-blur-md hover:scale-105 active:scale-95 ml-1"
            title="Thoát chế độ Chill (Phím Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. Main Center Stage: Audio Visualizer Canvas + Center Album Disk */}
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
        {/* Background Visualizer Canvas (360° Circular Waves + Bottom Spectrum) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Center Circular Rotating Album Cover Disk */}
        <div
          className="relative z-10 transition-transform duration-75 flex flex-col items-center pointer-events-auto"
          style={{
            transform: `translateY(-40px) scale(${bassScaleRef.current})`,
          }}
        >
          {/* Inner Album Art Circle */}
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-black/40 shadow-[0_0_50px_rgba(249,115,22,0.35)] relative bg-black flex items-center justify-center group">
            {currentSong?.image_url ? (
              <img
                src={currentSong.image_url}
                alt={currentSong.title}
                className="w-full h-full object-cover transition-transform"
                style={{
                  transform: `rotate(${rotationAngleRef.current}deg)`,
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-neutral-900 to-neutral-800 flex items-center justify-center">
                <Music className="w-16 h-16 text-amber-400/80" />
              </div>
            )}

            {/* Inner Center Hole Vinyl Ring */}
            <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/70 border-2 border-white/30 backdrop-blur-sm pointer-events-none" />
          </div>
        </div>

        {/* 4. Center Floating Mini-Player Bar (Exact match below center circle in screenshot) */}
        <div className="absolute bottom-16 sm:bottom-20 z-20 w-[92%] max-w-md bg-black/60 border border-white/15 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl flex flex-col gap-2 pointer-events-auto animate-fadeIn">
          {/* Top Row: Artwork Thumbnail, Title, Artist, and Favorite/Playlist */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg overflow-hidden bg-black/60 border border-white/10 flex-shrink-0 shadow">
              {currentSong?.image_url ? (
                <img
                  src={currentSong.image_url}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <Music className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-extrabold text-white truncate hover:underline cursor-pointer">
                {currentSong?.title || "Chưa phát bài hát nào"}
              </p>
              <p
                onClick={() => currentSong?.artist && onOpenArtist?.(currentSong.artist)}
                className="text-[11px] text-gray-400 truncate hover:text-white hover:underline cursor-pointer mt-0.5"
              >
                {currentSong?.artist || "TrackFlow"}
              </p>
            </div>

            {/* Actions */}
            {currentSong && (
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
                  className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
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

          {/* Middle Row: Scrubber Bar */}
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <div className="relative flex-1 flex items-center cursor-pointer">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#fbbf24] focus:outline-none"
              />
            </div>
            <span className="w-8">{formatTime(duration)}</span>
          </div>

          {/* Bottom Row: Playback Controls & Volume */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <button
              onClick={toggleLoop}
              className={`p-1.5 rounded-full transition ${
                isLooping ? "text-[#fbbf24]" : "text-gray-400 hover:text-white"
              }`}
              title="Lặp lại"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>

            {/* Center: Prev, Play/Pause, Next */}
            <div className="flex items-center gap-4">
              <button
                onClick={prevSong}
                className="text-gray-300 hover:text-white transition"
                title="Bài trước"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-white hover:scale-105 active:scale-95 flex items-center justify-center text-black shadow-[0_0_15px_rgba(251,191,36,0.5)] transition"
                title={isPlaying ? "Tạm dừng" : "Phát"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-black" />
                ) : (
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="text-gray-300 hover:text-white transition"
                title="Bài tiếp theo"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Right: Mute toggle */}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full text-gray-400 hover:text-white transition"
              title={isMuted ? "Bật âm thanh" : "Tắt tiếng"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
