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
  Check,
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

// Background Wallpaper Presets
const BACKGROUND_THEMES = [
  {
    id: "bloom-dark",
    name: "Bloom Dark (Windows 11)",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=85&fit=crop",
    overlay: "bg-black/35",
  },
  {
    id: "album-aura",
    name: "Album Aura (Ánh sáng bài hát)",
    url: "",
    overlay: "bg-black/55 backdrop-blur-3xl",
  },
  {
    id: "lofi-night",
    name: "Lofi City Night",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=85&fit=crop",
    overlay: "bg-black/45",
  },
  {
    id: "cosmic-space",
    name: "Deep Cosmic Space",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&q=85&fit=crop",
    overlay: "bg-black/40",
  },
  {
    id: "aurora",
    name: "Aurora Lights",
    url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=85&fit=crop",
    overlay: "bg-black/35",
  },
];

// Wave Color Presets with 360° Circular, Bottom Spectrum & 4-Edge Glow configurations
export interface WaveColorPreset {
  id: string;
  name: string;
  gradientPreview: string; // CSS gradient for swatch preview
  getCircularColor: (normAngle: number) => string;
  bottomStops: [number, string][];
  edgeColors: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
}

const WAVE_COLOR_PRESETS: WaveColorPreset[] = [
  {
    id: "sunset",
    name: "Hoàng Hôn (Sunset Glow)",
    gradientPreview: "linear-gradient(135deg, #fbbf24, #f97316, #ec4899, #a855f7)",
    getCircularColor: (normAngle) => {
      const hue = 38 + normAngle * 280; // 38 (gold) -> 318 (magenta/purple)
      return `hsl(${hue}, 96%, 62%)`;
    },
    bottomStops: [
      [0, "#fbbf24"],
      [0.45, "#f97316"],
      [0.85, "#ec4899"],
      [1, "#a855f7"],
    ],
    edgeColors: {
      top: "rgba(168, 85, 247, 0.45)",
      bottom: "rgba(249, 115, 22, 0.55)",
      left: "rgba(251, 191, 36, 0.45)",
      right: "rgba(249, 115, 22, 0.45)",
    },
  },
  {
    id: "rainbow",
    name: "Cầu Vồng (Neon Rainbow)",
    gradientPreview: "linear-gradient(135deg, #ef4444, #eab308, #22c55e, #06b6d4, #a855f7)",
    getCircularColor: (normAngle) => {
      const hue = normAngle * 360;
      return `hsl(${hue}, 96%, 60%)`;
    },
    bottomStops: [
      [0, "#ef4444"],
      [0.25, "#eab308"],
      [0.5, "#22c55e"],
      [0.75, "#06b6d4"],
      [1, "#a855f7"],
    ],
    edgeColors: {
      top: "rgba(236, 72, 153, 0.4)",
      bottom: "rgba(34, 197, 94, 0.45)",
      left: "rgba(239, 68, 68, 0.4)",
      right: "rgba(6, 182, 212, 0.4)",
    },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk (Cyan & Hồng)",
    gradientPreview: "linear-gradient(135deg, #06b6d4, #ec4899, #8b5cf6)",
    getCircularColor: (normAngle) => {
      const hue = 180 + normAngle * 140; // 180 (cyan) -> 320 (magenta/pink)
      return `hsl(${hue}, 96%, 62%)`;
    },
    bottomStops: [
      [0, "#06b6d4"],
      [0.5, "#ec4899"],
      [1, "#8b5cf6"],
    ],
    edgeColors: {
      top: "rgba(236, 72, 153, 0.5)",
      bottom: "rgba(6, 182, 212, 0.5)",
      left: "rgba(6, 182, 212, 0.45)",
      right: "rgba(236, 72, 153, 0.45)",
    },
  },
  {
    id: "spotify-emerald",
    name: "Spotify Emerald (Xanh Lục)",
    gradientPreview: "linear-gradient(135deg, #1db954, #34d399, #10b981, #065f46)",
    getCircularColor: (normAngle) => {
      const hue = 135 + Math.sin(normAngle * Math.PI) * 40;
      return `hsl(${hue}, 88%, 56%)`;
    },
    bottomStops: [
      [0, "#1db954"],
      [0.5, "#34d399"],
      [1, "#059669"],
    ],
    edgeColors: {
      top: "rgba(29, 185, 84, 0.45)",
      bottom: "rgba(52, 211, 153, 0.55)",
      left: "rgba(29, 185, 84, 0.45)",
      right: "rgba(29, 185, 84, 0.45)",
    },
  },
  {
    id: "fire-ice",
    name: "Lửa & Băng (Fire & Ice)",
    gradientPreview: "linear-gradient(135deg, #38bdf8, #2563eb, #f97316, #ef4444)",
    getCircularColor: (normAngle) => {
      if (normAngle < 0.5) {
        const hue = 195 + normAngle * 40; // Ice Blue
        return `hsl(${hue}, 96%, 62%)`;
      } else {
        const hue = 15 + (normAngle - 0.5) * 45; // Fire Orange/Red
        return `hsl(${hue}, 96%, 58%)`;
      }
    },
    bottomStops: [
      [0, "#38bdf8"],
      [0.5, "#f97316"],
      [1, "#ef4444"],
    ],
    edgeColors: {
      top: "rgba(56, 189, 248, 0.45)",
      bottom: "rgba(239, 68, 68, 0.55)",
      left: "rgba(56, 189, 248, 0.45)",
      right: "rgba(249, 115, 22, 0.45)",
    },
  },
  {
    id: "luxury-gold",
    name: "Vàng Hoàng Gia (Luxury Gold)",
    gradientPreview: "linear-gradient(135deg, #fef08a, #eab308, #d97706, #78350f)",
    getCircularColor: (normAngle) => {
      const hue = 40 + Math.sin(normAngle * Math.PI * 2) * 10;
      return `hsl(${hue}, 96%, 58%)`;
    },
    bottomStops: [
      [0, "#fef08a"],
      [0.45, "#eab308"],
      [1, "#b45309"],
    ],
    edgeColors: {
      top: "rgba(254, 240, 138, 0.4)",
      bottom: "rgba(234, 179, 8, 0.55)",
      left: "rgba(251, 191, 36, 0.5)",
      right: "rgba(245, 158, 11, 0.5)",
    },
  },
  {
    id: "electric-violet",
    name: "Tím Điện Tử (Electric Violet)",
    gradientPreview: "linear-gradient(135deg, #c084fc, #a855f7, #7c3aed, #4f46e5)",
    getCircularColor: (normAngle) => {
      const hue = 265 + normAngle * 50;
      return `hsl(${hue}, 95%, 66%)`;
    },
    bottomStops: [
      [0, "#c084fc"],
      [0.5, "#a855f7"],
      [1, "#4f46e5"],
    ],
    edgeColors: {
      top: "rgba(192, 132, 252, 0.5)",
      bottom: "rgba(168, 85, 247, 0.55)",
      left: "rgba(147, 51, 234, 0.45)",
      right: "rgba(124, 58, 237, 0.45)",
    },
  },
  {
    id: "pure-white",
    name: "Trắng Neon (Pure White Glow)",
    gradientPreview: "linear-gradient(135deg, #ffffff, #e2e8f0, #94a3b8)",
    getCircularColor: () => "hsl(0, 0%, 98%)",
    bottomStops: [
      [0, "#ffffff"],
      [0.5, "#e2e8f0"],
      [1, "#cbd5e1"],
    ],
    edgeColors: {
      top: "rgba(255, 255, 255, 0.35)",
      bottom: "rgba(255, 255, 255, 0.45)",
      left: "rgba(255, 255, 255, 0.35)",
      right: "rgba(255, 255, 255, 0.35)",
    },
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
    isMuted,
    toggleMute,
    isLooping,
    toggleLoop,
  } = usePlayer();

  const { isFavorite, toggleFavorite } = useAuth();
  const { openAddToPlaylist } = usePlaylist();

  // Customization States with localStorage persistence
  const [currentTheme, setCurrentTheme] = useState<string>("bloom-dark");
  const [waveColorId, setWaveColorId] = useState<string>("sunset");
  const [waveSensitivity, setWaveSensitivity] = useState<number>(1.2);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [wallClock, setWallClock] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const bassScaleRef = useRef<number>(1);
  const beatIntensityRef = useRef<number>(0);

  // Bars frequency interpolation buffers
  const numCircleBars = 96;
  const circleBarsRef = useRef<number[]>(new Array(numCircleBars).fill(0));
  const numBottomBars = 120;
  const bottomBarsRef = useRef<number[]>(new Array(numBottomBars).fill(0));

  const favorited = currentSong ? isFavorite(currentSong) : false;

  // Restore saved wave color from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedColor = localStorage.getItem("trackflow_chill_wave_color");
      if (savedColor && WAVE_COLOR_PRESETS.some((p) => p.id === savedColor)) {
        setWaveColorId(savedColor);
      }
      const savedTheme = localStorage.getItem("trackflow_chill_theme");
      if (savedTheme && BACKGROUND_THEMES.some((t) => t.id === savedTheme)) {
        setCurrentTheme(savedTheme);
      }
    }
  }, []);

  const handleSelectWaveColor = (id: string) => {
    setWaveColorId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("trackflow_chill_wave_color", id);
    }
  };

  const handleSelectTheme = (id: string) => {
    setCurrentTheme(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("trackflow_chill_theme", id);
    }
  };

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

  const activeWaveColor =
    WAVE_COLOR_PRESETS.find((p) => p.id === waveColorId) || WAVE_COLOR_PRESETS[0];

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

      // Calculate rhythmic audio beat energy
      let beatIntensity = 0;
      if (isPlaying && effectiveVol > 0) {
        const beat1 = Math.pow(Math.max(0, Math.sin(now * Math.PI * 2 * 2.1)), 4);
        const beat2 = Math.pow(Math.max(0, Math.sin(now * Math.PI * 2 * 1.05 + 0.3)), 3);
        beatIntensity = (beat1 * 0.7 + beat2 * 0.5) * effectiveVol * waveSensitivity;
      }
      beatIntensityRef.current = beatIntensity;

      // Smooth bass scale for center disk container
      const targetScale = 1 + beatIntensity * 0.08;
      bassScaleRef.current += (targetScale - bassScaleRef.current) * 0.15;

      const centerX = width / 2;
      const centerY = height / 2 - 40;
      const innerRadius = Math.min(width, height) * 0.16;

      // 1. DRAW 360° CIRCULAR AUDIO SPECTRUM AROUND VINYL DISK
      const circleBars = circleBarsRef.current;
      for (let i = 0; i < numCircleBars; i++) {
        let targetHeight = 2.5; // idle baseline
        if (isPlaying && effectiveVol > 0) {
          const angle = (i / numCircleBars) * Math.PI * 2;
          const f1 = Math.sin(now * 5.2 + i * 0.35) * 0.5 + 0.5;
          const f2 = Math.cos(now * 3.7 - i * 0.2) * 0.5 + 0.5;
          const f3 = Math.sin(now * 9.1 + angle * 4) * 0.5 + 0.5;
          const f4 = Math.abs(Math.sin(angle * 2));

          const combined = (f1 * 0.4 + f2 * 0.35 + f3 * 0.25) * (0.6 + f4 * 0.4);
          const dynamicBoost = combined * (1 + beatIntensity * 1.8);
          targetHeight = Math.max(3, dynamicBoost * 72 * effectiveVol * waveSensitivity);
        }

        circleBars[i] += (targetHeight - circleBars[i]) * 0.2;

        const theta = (i / numCircleBars) * Math.PI * 2 - Math.PI / 2;
        const barH = circleBars[i];

        const x1 = centerX + Math.cos(theta) * (innerRadius + 5);
        const y1 = centerY + Math.sin(theta) * (innerRadius + 5);
        const x2 = centerX + Math.cos(theta) * (innerRadius + 5 + barH);
        const y2 = centerY + Math.sin(theta) * (innerRadius + 5 + barH);

        const normAngle = (theta + Math.PI / 2) / (Math.PI * 2);
        const strokeColor = activeWaveColor.getCircularColor(normAngle);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = Math.max(2.2, (2 * Math.PI * innerRadius) / numCircleBars - 2.8);
        ctx.lineCap = "round";
        ctx.shadowBlur = 9;
        ctx.shadowColor = strokeColor;
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
          const distCenter = 1 - Math.abs(normX - 0.5) * 1.4;
          const w1 = Math.sin(now * 4.5 + j * 0.25) * 0.5 + 0.5;
          const w2 = Math.cos(now * 7.1 - j * 0.15) * 0.5 + 0.5;
          const w3 = Math.sin(now * 2.8 + j * 0.08) * 0.5 + 0.5;

          const energy = (w1 * 0.45 + w2 * 0.35 + w3 * 0.2) * Math.max(0.3, distCenter);
          targetBottomH = Math.max(
            3,
            energy * (42 + beatIntensity * 32) * effectiveVol * waveSensitivity
          );
        }

        bottomBars[j] += (targetBottomH - bottomBars[j]) * 0.2;
        const bH = bottomBars[j];
        const bx = j * barWidth + barWidth * 0.15;
        const bw = Math.max(2, barWidth * 0.7);

        // Vertical gradient based on active wave color preset
        const barGrad = ctx.createLinearGradient(bx, bottomY, bx, bottomY - bH);
        activeWaveColor.bottomStops.forEach(([stop, color]) => {
          barGrad.addColorStop(stop, color);
        });

        ctx.fillStyle = barGrad;
        ctx.shadowBlur = 5;
        ctx.shadowColor = activeWaveColor.bottomStops[0][1];
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
  }, [isPlaying, volume, isMuted, waveSensitivity, waveColorId, activeWaveColor]);

  const activeTheme =
    BACKGROUND_THEMES.find((t) => t.id === currentTheme) || BACKGROUND_THEMES[0];

  return (
    <div className="fixed inset-0 z-[60] bg-[#0a070e] text-white flex flex-col overflow-hidden select-none animate-fadeIn">
      {/* CSS Pure Keyframe for Butter-Smooth GPU Vinyl Rotation */}
      <style jsx global>{`
        @keyframes chillVinylSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-vinyl-continuous {
          animation: chillVinylSpin 20s linear infinite;
        }
      `}</style>

      {/* 1. Background Wallpaper Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-30">
        {activeTheme.id === "album-aura" ? (
          currentSong?.image_url && (
            <div
              className="absolute -inset-10 opacity-55 blur-[140px] scale-125 transition-all duration-1000"
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
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/35 to-black/85" />
      </div>

      {/* 2. 4-Edge Glowing Ambient Borders (Exact match to user's reference image) */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {/* Top Edge Glow */}
        <div
          className="absolute top-0 left-0 right-0 h-16 md:h-24 transition-opacity duration-300 pointer-events-none blur-2xl"
          style={{
            background: `linear-gradient(to bottom, ${activeWaveColor.edgeColors.top}, transparent)`,
            opacity: 0.75,
          }}
        />

        {/* Bottom Edge Glow (behind the spectrum bars) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 md:h-28 transition-opacity duration-300 pointer-events-none blur-2xl"
          style={{
            background: `linear-gradient(to top, ${activeWaveColor.edgeColors.bottom}, transparent)`,
            opacity: 0.85,
          }}
        />

        {/* Left Edge Glow */}
        <div
          className="absolute top-0 bottom-0 left-0 w-16 md:w-28 transition-opacity duration-300 pointer-events-none blur-2xl"
          style={{
            background: `linear-gradient(to right, ${activeWaveColor.edgeColors.left}, transparent)`,
            opacity: 0.7,
          }}
        />

        {/* Right Edge Glow */}
        <div
          className="absolute top-0 bottom-0 right-0 w-16 md:w-28 transition-opacity duration-300 pointer-events-none blur-2xl"
          style={{
            background: `linear-gradient(to left, ${activeWaveColor.edgeColors.right}, transparent)`,
            opacity: 0.7,
          }}
        />
      </div>

      {/* 3. Top Header Bar & Dynamic Island */}
      <div className="h-16 px-6 md:px-10 flex items-center justify-between z-30 flex-shrink-0">
        {/* Left: TrackFlow Chill Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Waves className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-wide text-white drop-shadow">
            TrackFlow Chill
          </span>
        </div>

        {/* Center: Dynamic Island Clock & Audio Pulse Indicator */}
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

        {/* Right: Wave Color Switcher, Background Theme, Sensitivity & Fullscreen / Close */}
        <div className="flex items-center gap-2 relative">
          {/* Wave Color Customizer Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsColorMenuOpen(!isColorMenuOpen);
                setIsThemeMenuOpen(false);
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition shadow backdrop-blur-md flex items-center gap-1.5 text-xs font-bold"
              title="Đổi màu sắc của sóng âm"
            >
              <div
                className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                style={{ background: activeWaveColor.gradientPreview }}
              />
              <span className="hidden sm:inline">Màu sóng</span>
            </button>

            {/* Wave Color Palette Popover */}
            {isColorMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#181424]/95 border border-white/15 rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl z-40 space-y-1 animate-fadeIn">
                <p className="text-[11px] font-bold text-gray-400 px-3 py-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chọn màu sóng âm (Wave)</span>
                </p>
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-white/20">
                  {WAVE_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        handleSelectWaveColor(preset.id);
                        setIsColorMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                        waveColorId === preset.id
                          ? "bg-white/20 text-white font-bold border border-white/20"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-4 h-4 rounded-full border border-white/40 flex-shrink-0 shadow"
                          style={{ background: preset.gradientPreview }}
                        />
                        <span>{preset.name}</span>
                      </div>
                      {waveColorId === preset.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Wallpaper Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setIsThemeMenuOpen(!isThemeMenuOpen);
                setIsColorMenuOpen(false);
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition shadow backdrop-blur-md"
              title="Đổi hình nền Chill"
            >
              <Palette className="w-4 h-4" />
            </button>

            {/* Theme Dropdown Menu */}
            {isThemeMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1622]/95 border border-white/15 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-40 space-y-1 animate-fadeIn">
                <p className="text-[11px] font-bold text-gray-400 px-3 py-1 uppercase tracking-wider">
                  Chọn hình nền
                </p>
                {BACKGROUND_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      handleSelectTheme(theme.id);
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

      {/* 4. Main Center Stage: Audio Visualizer Canvas + Rotating Vinyl Album Disk */}
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
        {/* Background Visualizer Canvas (360° Circular Waves + Bottom Spectrum) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Center Circular Rotating Album Cover Disk (Continuous 60FPS CSS GPU Rotation) */}
        <div
          className="relative z-10 transition-transform duration-75 flex flex-col items-center pointer-events-auto"
          style={{
            transform: `translateY(-40px) scale(${bassScaleRef.current})`,
          }}
        >
          {/* Inner Album Art Circle with Outer Glow */}
          <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full overflow-hidden border-4 border-black/60 shadow-[0_0_55px_rgba(249,115,22,0.4)] relative bg-black flex items-center justify-center group select-none">
            {/* Smoothly Rotating Vinyl Image (100% Continuous, Non-Stuttering) */}
            <div
              className="w-full h-full rounded-full overflow-hidden animate-vinyl-continuous flex items-center justify-center"
              style={{
                animationPlayState: isPlaying ? "running" : "paused",
              }}
            >
              {currentSong?.image_url ? (
                <img
                  src={currentSong.image_url}
                  alt={currentSong.title}
                  className="w-full h-full object-cover scale-110 select-none pointer-events-none"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-neutral-900 to-neutral-800 flex items-center justify-center">
                  <Music className="w-16 h-16 text-amber-400/80" />
                </div>
              )}
            </div>

            {/* Subtle Vinyl Grooves Radial Highlight */}
            <div className="absolute inset-0 rounded-full pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_35%,rgba(0,0,0,0.3)_60%,rgba(255,255,255,0.08)_75%,transparent_90%)]" />

            {/* Inner Center Hole Vinyl Ring */}
            <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/80 border-2 border-white/40 backdrop-blur-sm pointer-events-none shadow-inner" />
          </div>
        </div>

        {/* 5. Center Floating Mini-Player Bar (Directly below circle, unobstructed by bottom bar) */}
        <div className="absolute bottom-16 sm:bottom-20 z-30 w-[92%] max-w-md bg-black/65 border border-white/15 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl flex flex-col gap-2 pointer-events-auto animate-fadeIn">
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

          {/* Middle Row: Scrubber Progress Bar */}
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
