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

// Wave Color Presets with True Halo Spectrum Gradient & 4-Edge Reactive Glow
export interface WaveColorPreset {
  id: string;
  name: string;
  gradientPreview: string; // CSS gradient for preview
  getBarColor: (t: number) => string; // t from 0 (top) to 1 (bottom)
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
    getBarColor: (t: number) => {
      // Top: Golden Yellow (45°) -> Mid: Vibrant Orange (24°) -> Hot Pink (330°) -> Bottom: Violet (275°)
      if (t < 0.33) {
        const f = t / 0.33;
        const hue = 46 - f * 22; // 46 -> 24
        return `hsl(${hue}, 98%, ${60 - f * 2}%)`;
      } else if (t < 0.68) {
        const f = (t - 0.33) / 0.35;
        const hue = (384 - f * 54) % 360; // 24 -> 330
        return `hsl(${hue}, 95%, ${58 + f * 3}%)`;
      } else {
        const f = (t - 0.68) / 0.32;
        const hue = 330 - f * 55; // 330 -> 275
        return `hsl(${hue}, 92%, ${61 + f * 3}%)`;
      }
    },
    edgeColors: {
      top: "rgba(251, 191, 36, 0.75)",
      bottom: "rgba(168, 85, 247, 0.85)",
      left: "rgba(249, 115, 22, 0.75)",
      right: "rgba(236, 72, 153, 0.75)",
    },
  },
  {
    id: "rainbow",
    name: "Cầu Vồng (Neon Rainbow)",
    gradientPreview: "linear-gradient(135deg, #ef4444, #eab308, #22c55e, #06b6d4, #a855f7)",
    getBarColor: (t: number) => {
      const hue = (t * 360) % 360;
      return `hsl(${hue}, 96%, 60%)`;
    },
    edgeColors: {
      top: "rgba(239, 68, 68, 0.75)",
      bottom: "rgba(168, 85, 247, 0.8)",
      left: "rgba(234, 179, 8, 0.75)",
      right: "rgba(6, 182, 212, 0.75)",
    },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk (Cyan & Hồng)",
    gradientPreview: "linear-gradient(135deg, #06b6d4, #ec4899, #8b5cf6)",
    getBarColor: (t: number) => {
      if (t < 0.5) {
        const f = t / 0.5;
        const hue = 185 + f * 140; // 185 (cyan) -> 325 (pink)
        return `hsl(${hue}, 96%, 60%)`;
      } else {
        const f = (t - 0.5) / 0.5;
        const hue = 325 - f * 60; // 325 (pink) -> 265 (purple)
        return `hsl(${hue}, 95%, 65%)`;
      }
    },
    edgeColors: {
      top: "rgba(6, 182, 212, 0.75)",
      bottom: "rgba(139, 92, 246, 0.85)",
      left: "rgba(236, 72, 153, 0.8)",
      right: "rgba(6, 182, 212, 0.8)",
    },
  },
  {
    id: "spotify-emerald",
    name: "Spotify Emerald (Xanh Lục)",
    gradientPreview: "linear-gradient(135deg, #1db954, #34d399, #10b981, #065f46)",
    getBarColor: (t: number) => {
      const hue = 138 + t * 25; // 138 (spotify green) -> 163 (teal/emerald)
      return `hsl(${hue}, 88%, ${55 - t * 8}%)`;
    },
    edgeColors: {
      top: "rgba(29, 185, 84, 0.8)",
      bottom: "rgba(5, 150, 105, 0.85)",
      left: "rgba(52, 211, 153, 0.75)",
      right: "rgba(29, 185, 84, 0.75)",
    },
  },
  {
    id: "fire-ice",
    name: "Lửa & Băng (Fire & Ice)",
    gradientPreview: "linear-gradient(135deg, #38bdf8, #2563eb, #f97316, #ef4444)",
    getBarColor: (t: number) => {
      if (t < 0.5) {
        const f = t / 0.5;
        const hue = 196 + f * 20; // Ice Blue
        return `hsl(${hue}, 95%, 62%)`;
      } else {
        const f = (t - 0.5) / 0.5;
        const hue = 22 - f * 24; // 22 (orange) -> 358 (crimson)
        return `hsl(${(hue + 360) % 360}, 96%, 58%)`;
      }
    },
    edgeColors: {
      top: "rgba(56, 189, 248, 0.8)",
      bottom: "rgba(239, 68, 68, 0.85)",
      left: "rgba(56, 189, 248, 0.75)",
      right: "rgba(249, 115, 22, 0.75)",
    },
  },
  {
    id: "luxury-gold",
    name: "Vàng Hoàng Gia (Luxury Gold)",
    gradientPreview: "linear-gradient(135deg, #fef08a, #eab308, #d97706, #78350f)",
    getBarColor: (t: number) => {
      const hue = 48 - t * 16; // 48 (champagne) -> 32 (bronze)
      return `hsl(${hue}, 98%, ${65 - t * 16}%)`;
    },
    edgeColors: {
      top: "rgba(254, 240, 138, 0.75)",
      bottom: "rgba(217, 119, 6, 0.85)",
      left: "rgba(234, 179, 8, 0.8)",
      right: "rgba(245, 158, 11, 0.8)",
    },
  },
  {
    id: "electric-violet",
    name: "Tím Điện Tử (Electric Violet)",
    gradientPreview: "linear-gradient(135deg, #c084fc, #a855f7, #7c3aed, #4f46e5)",
    getBarColor: (t: number) => {
      const hue = 282 - t * 32; // 282 (lavender) -> 250 (indigo)
      return `hsl(${hue}, 94%, ${68 - t * 10}%)`;
    },
    edgeColors: {
      top: "rgba(192, 132, 252, 0.8)",
      bottom: "rgba(79, 70, 229, 0.85)",
      left: "rgba(168, 85, 247, 0.8)",
      right: "rgba(124, 58, 237, 0.8)",
    },
  },
  {
    id: "pure-white",
    name: "Trắng Neon (Pure White Glow)",
    gradientPreview: "linear-gradient(135deg, #ffffff, #e2e8f0, #94a3b8)",
    getBarColor: () => "hsl(0, 0%, 98%)",
    edgeColors: {
      top: "rgba(255, 255, 255, 0.65)",
      bottom: "rgba(255, 255, 255, 0.75)",
      left: "rgba(255, 255, 255, 0.65)",
      right: "rgba(255, 255, 255, 0.65)",
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
  const edgeGlowEnergyRef = useRef<number>(0);

  // 4 Screen Edges refs for 60fps GPU bass kick reaction
  const topEdgeRef = useRef<HTMLDivElement | null>(null);
  const bottomEdgeRef = useRef<HTMLDivElement | null>(null);
  const leftEdgeRef = useRef<HTMLDivElement | null>(null);
  const rightEdgeRef = useRef<HTMLDivElement | null>(null);

  // 60 Symmetrical Frequency Bands for the 120-Bar Halo Waveform
  const numHalfBands = 60;
  const numTotalBars = numHalfBands * 2; // 120 radial bars
  const barHeightsRef = useRef<number[]>(new Array(numHalfBands).fill(4));

  const favorited = currentSong ? isFavorite(currentSong) : false;

  // Restore saved wave color & theme from localStorage on mount
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

  // Keyboard shortcut: Esc to exit, Space to toggle play
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

  // 60FPS High-Definition Halo Waveform Canvas & 4-Edge Reactive Glow Loop
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

      // 1. SIMULATE AUTHENTIC MULTI-BAND AUDIO SPECTRUM (BASS, MIDS, TREBLE)
      // Tempo ~126 BPM -> beat period ~0.476s
      const beatFreq = 2.1;
      const kickCycle = (now * beatFreq) % 1;
      const kickPulse = Math.pow(Math.max(0, 1 - kickCycle * 2.8), 3); // Snappy punch
      const subDrop = Math.pow(Math.max(0, Math.sin(now * Math.PI * 1.05)), 4);
      const bassEnergy = (kickPulse * 0.85 + subDrop * 0.35) * effectiveVol * waveSensitivity;

      // Snare hit on off-beat
      const snareCycle = (now * beatFreq + 0.5) % 1;
      const snarePulse = Math.pow(Math.max(0, 1 - snareCycle * 3.8), 3);
      const snareEnergy = snarePulse * effectiveVol * waveSensitivity;

      // Hi-hats 16th ticks
      const hatPulse = Math.pow(Math.max(0, Math.sin(now * Math.PI * 8.4)), 3.5);

      // Smooth bass scale for center disk container
      const targetScale = 1 + bassEnergy * 0.055;
      bassScaleRef.current += (targetScale - bassScaleRef.current) * 0.25;

      // 2. UPDATE 4 SCREEN EDGES GLOW (GIẬT THEO NHỊP NHẠC)
      let targetEdgeGlow = 0;
      if (isPlaying && effectiveVol > 0) {
        targetEdgeGlow = Math.min(1, bassEnergy * 1.35 + snareEnergy * 0.45);
      }

      if (targetEdgeGlow > edgeGlowEnergyRef.current) {
        edgeGlowEnergyRef.current += (targetEdgeGlow - edgeGlowEnergyRef.current) * 0.75; // Snappy flash
      } else {
        edgeGlowEnergyRef.current -= (edgeGlowEnergyRef.current - targetEdgeGlow) * 0.12; // Smooth decay
      }

      const glowVal = edgeGlowEnergyRef.current;
      const edgeOpacity = isPlaying ? (0.2 + glowVal * 0.78) : 0.18;
      const scaleY = 1 + glowVal * 0.35;
      const scaleX = 1 + glowVal * 0.35;

      if (topEdgeRef.current) {
        topEdgeRef.current.style.opacity = edgeOpacity.toFixed(3);
        topEdgeRef.current.style.transform = `scaleY(${scaleY.toFixed(3)})`;
      }
      if (bottomEdgeRef.current) {
        bottomEdgeRef.current.style.opacity = edgeOpacity.toFixed(3);
        bottomEdgeRef.current.style.transform = `scaleY(${scaleY.toFixed(3)})`;
      }
      if (leftEdgeRef.current) {
        leftEdgeRef.current.style.opacity = edgeOpacity.toFixed(3);
        leftEdgeRef.current.style.transform = `scaleX(${scaleX.toFixed(3)})`;
      }
      if (rightEdgeRef.current) {
        rightEdgeRef.current.style.opacity = edgeOpacity.toFixed(3);
        rightEdgeRef.current.style.transform = `scaleX(${scaleX.toFixed(3)})`;
      }

      // 3. DRAW 120-BAND HALO AUDIO WAVEFORM AROUND VINYL DISK
      const centerX = width / 2;
      const centerY = height / 2 - 40;

      // Calculate inner radius to match vinyl disk border perfectly
      const isMobile = width < 640;
      const diskRadius = isMobile ? 104 : 120;
      const innerRadius = diskRadius + 6;

      const barHeights = barHeightsRef.current;

      // Update 60 half-band frequency amplitudes with audio visualizer physics
      for (let k = 0; k < numHalfBands; k++) {
        let bandEnergy = 0;

        if (isPlaying && effectiveVol > 0) {
          if (k <= 14) {
            // Sub-Bass & Kick (Top region)
            const falloff = 1 - k / 18;
            bandEnergy =
              bassEnergy * falloff * 1.25 +
              Math.sin(now * 7.2 + k * 0.4) * 0.15;
          } else if (k <= 28) {
            // Low-Mids & Rhythm Body
            const falloff = 1 - (k - 14) / 16;
            bandEnergy =
              (snareEnergy * 0.75 + bassEnergy * 0.4) * falloff +
              Math.sin(now * 9.5 + k * 0.6) * 0.18;
          } else if (k <= 44) {
            // Mid-Range Vocals & Instruments
            const vocalMod =
              Math.sin(now * 3.8 + k * 0.35) * 0.35 +
              Math.sin(now * 7.4 - k * 0.5) * 0.25 +
              0.45;
            bandEnergy =
              vocalMod * (0.35 + snareEnergy * 0.35) * effectiveVol * waveSensitivity;
          } else if (k <= 54) {
            // High-Mids & Snare Snap / Hi-hats
            bandEnergy =
              (hatPulse * 0.6 + snareEnergy * 0.35) *
              (0.35 + Math.sin(now * 15.2 + k) * 0.25) *
              effectiveVol *
              waveSensitivity;
          } else {
            // Air & Ultra-Highs (Bottom region)
            bandEnergy =
              (hatPulse * 0.35 + 0.15) *
              (Math.sin(now * 19.8 + k * 1.8) * 0.4 + 0.5) *
              effectiveVol *
              waveSensitivity;
          }

          // Per-bar discrete frequency bin flutter (16Hz micro-noise: toothy waveform, NOT a smooth wave!)
          const barNoise = Math.sin(k * 137.3 + Math.floor(now * 16) * 19.7);
          const flutter = 0.75 + barNoise * 0.35; // Distinct jagged teeth
          bandEnergy = Math.max(0, bandEnergy) * flutter;
        }

        let targetH = 4; // Idle baseline
        if (isPlaying && effectiveVol > 0) {
          targetH = Math.max(4, Math.min(105, bandEnergy * 82));
        }

        // Snappy Attack (0.65) and Smooth Gravity Decay (0.15)
        if (targetH > barHeights[k]) {
          barHeights[k] += (targetH - barHeights[k]) * 0.65;
        } else {
          barHeights[k] -= (barHeights[k] - targetH) * 0.15;
        }
      }

      // Draw Concentric Outer Glow Accent Ring around vinyl disk
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius - 2, 0, Math.PI * 2);
      ctx.strokeStyle = activeWaveColor.getBarColor(0.2);
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = activeWaveColor.getBarColor(0.2);
      ctx.stroke();

      // Render 120 Symmetrical Radial Bars (Right & Left mirror from 12 o'clock to 6 o'clock)
      const lineWidth = isMobile ? 2.6 : 3.2;
      const angleStep = Math.PI / numHalfBands; // pi / 60

      for (let k = 0; k < numHalfBands; k++) {
        const barH = barHeights[k];
        const t = k / (numHalfBands - 1); // 0 at top, 1 at bottom
        const barColor = activeWaveColor.getBarColor(t);

        // Right side: -pi/2 (top) clockwise to +pi/2 (bottom)
        const thetaRight = -Math.PI / 2 + (k + 0.5) * angleStep;
        const x1R = centerX + Math.cos(thetaRight) * innerRadius;
        const y1R = centerY + Math.sin(thetaRight) * innerRadius;
        const x2R = centerX + Math.cos(thetaRight) * (innerRadius + barH);
        const y2R = centerY + Math.sin(thetaRight) * (innerRadius + barH);

        ctx.beginPath();
        ctx.moveTo(x1R, y1R);
        ctx.lineTo(x2R, y2R);
        ctx.strokeStyle = barColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.shadowBlur = 7;
        ctx.shadowColor = barColor;
        ctx.stroke();

        // Left side: -pi/2 (top) counter-clockwise to +pi/2 (bottom)
        const thetaLeft = -Math.PI / 2 - (k + 0.5) * angleStep;
        const x1L = centerX + Math.cos(thetaLeft) * innerRadius;
        const y1L = centerY + Math.sin(thetaLeft) * innerRadius;
        const x2L = centerX + Math.cos(thetaLeft) * (innerRadius + barH);
        const y2L = centerY + Math.sin(thetaLeft) * (innerRadius + barH);

        ctx.beginPath();
        ctx.moveTo(x1L, y1L);
        ctx.lineTo(x2L, y2L);
        ctx.strokeStyle = barColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.shadowBlur = 7;
        ctx.shadowColor = barColor;
        ctx.stroke();
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
            style={{
              backgroundImage: `url(${activeTheme.url})`,
            }}
          />
        )}

        {/* Ambient Dark Tint & Vignette */}
        <div className={`absolute inset-0 ${activeTheme.overlay}`} />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/35 to-black/85" />
      </div>

      {/* 2. 4-Edge Glowing Ambient Borders (Giật theo nhịp bass 60FPS) */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {/* Top Edge Glow */}
        <div
          ref={topEdgeRef}
          className="absolute top-0 left-0 right-0 h-20 md:h-32 pointer-events-none blur-3xl origin-top transition-transform duration-75"
          style={{
            background: `linear-gradient(to bottom, ${activeWaveColor.edgeColors.top}, transparent)`,
            opacity: 0.2,
          }}
        />

        {/* Bottom Edge Glow */}
        <div
          ref={bottomEdgeRef}
          className="absolute bottom-0 left-0 right-0 h-24 md:h-36 pointer-events-none blur-3xl origin-bottom transition-transform duration-75"
          style={{
            background: `linear-gradient(to top, ${activeWaveColor.edgeColors.bottom}, transparent)`,
            opacity: 0.2,
          }}
        />

        {/* Left Edge Glow */}
        <div
          ref={leftEdgeRef}
          className="absolute top-0 bottom-0 left-0 w-20 md:w-36 pointer-events-none blur-3xl origin-left transition-transform duration-75"
          style={{
            background: `linear-gradient(to right, ${activeWaveColor.edgeColors.left}, transparent)`,
            opacity: 0.2,
          }}
        />

        {/* Right Edge Glow */}
        <div
          ref={rightEdgeRef}
          className="absolute top-0 bottom-0 right-0 w-20 md:w-36 pointer-events-none blur-3xl origin-right transition-transform duration-75"
          style={{
            background: `linear-gradient(to left, ${activeWaveColor.edgeColors.right}, transparent)`,
            opacity: 0.2,
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
                  <span>Chọn màu Halo Waveform</span>
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
                          className="w-4 h-4 rounded-full border border-white/40 shadow-sm flex-shrink-0"
                          style={{ background: preset.gradientPreview }}
                        />
                        <span className="truncate">{preset.name}</span>
                      </div>
                      {waveColorId === preset.id && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Background Wallpaper Preset Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setIsThemeMenuOpen(!isThemeMenuOpen);
                setIsColorMenuOpen(false);
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition shadow backdrop-blur-md flex items-center gap-1.5 text-xs font-bold"
              title="Đổi hình nền"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Hình nền</span>
            </button>

            {/* Themes Popover */}
            {isThemeMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#181424]/95 border border-white/15 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-40 space-y-1 animate-fadeIn">
                <p className="text-[11px] font-bold text-gray-400 px-3 py-1 uppercase tracking-wider">
                  Chọn không gian Chill
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
        {/* Background Visualizer Canvas (Halo 120-Band Circular Waveform) */}
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
          {/* Inner Album Art Circle with Outer Ring Accent */}
          <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full overflow-hidden border-4 border-black/80 shadow-[0_0_55px_rgba(249,115,22,0.35)] relative bg-black flex items-center justify-center group select-none">
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
            <div className="absolute inset-0 rounded-full pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_35%,rgba(0,0,0,0.35)_60%,rgba(255,255,255,0.08)_75%,transparent_90%)]" />

            {/* Inner Center Hole Vinyl Ring */}
            <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/85 border-2 border-white/40 backdrop-blur-sm pointer-events-none shadow-inner" />
          </div>
        </div>

        {/* 5. Center Floating Mini-Player Bar (Clean, Uncluttered, with Breathing Room) */}
        <div className="absolute bottom-14 sm:bottom-16 z-30 w-[92%] max-w-md bg-black/70 border border-white/15 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl flex flex-col gap-2 pointer-events-auto animate-fadeIn">
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
