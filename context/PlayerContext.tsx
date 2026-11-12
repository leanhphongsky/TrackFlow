"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Song } from "@/lib/db";

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Song[];
  isMuted: boolean;
  isLooping: boolean;
  isYouTube: boolean;
  showVideo: boolean;
  setShowVideo: (show: boolean) => void;
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (time: number) => void;
  setVolumeLevel: (vol: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isYouTube, setIsYouTube] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize HTML5 Audio
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;

      const audio = audioRef.current;

      const handleTimeUpdate = () => {
        if (!isYouTube) {
          setCurrentTime(audio.currentTime);
        }
      };

      const handleLoadedMetadata = () => {
        if (!isYouTube) {
          setDuration(audio.duration || 0);
        }
      };

      const handleEnded = () => {
        if (!isYouTube) {
          if (isLooping) {
            audio.currentTime = 0;
            audio.play().catch(console.error);
          } else {
            nextSong();
          }
        }
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("ended", handleEnded);
        audio.pause();
      };
    }
  }, [isLooping, isYouTube]);

  // Load YouTube IFrame API Script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Poll YouTube player progress when active
  useEffect(() => {
    if (isYouTube && isPlaying) {
      timerRef.current = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === "function") {
          const curr = ytPlayerRef.current.getCurrentTime() || 0;
          const dur = ytPlayerRef.current.getDuration() || 0;
          setCurrentTime(curr);
          if (dur > 0) setDuration(dur);
        }
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isYouTube, isPlaying]);

  const initYouTubePlayer = (videoId: string) => {
    const onPlayerReady = (event: any) => {
      event.target.setVolume(volume * 100);
      if (isMuted) event.target.mute();
      event.target.playVideo();
      setIsPlaying(true);
    };

    const onPlayerStateChange = (event: any) => {
      // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
      if (event.data === 1) {
        setIsPlaying(true);
        if (event.target.getDuration) {
          setDuration(event.target.getDuration());
        }
      } else if (event.data === 2) {
        setIsPlaying(false);
      } else if (event.data === 0) {
        if (isLooping) {
          event.target.seekTo(0);
          event.target.playVideo();
        } else {
          nextSong();
        }
      }
    };

    if (window.YT && window.YT.Player) {
      if (ytPlayerRef.current && ytPlayerRef.current.loadVideoById) {
        ytPlayerRef.current.loadVideoById(videoId);
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      } else {
        ytPlayerRef.current = new window.YT.Player("youtube-player-frame", {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
        });
      }
    } else {
      // Retry once YT API is ready
      window.onYouTubeIframeAPIReady = () => {
        ytPlayerRef.current = new window.YT.Player("youtube-player-frame", {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
        });
      };
    }
  };

  const playSong = (song: Song, newQueue?: Song[]) => {
    setCurrentSong(song);
    if (newQueue) {
      setQueue(newQueue);
    }

    const ytId = song.videoId || extractYouTubeId(song.audio_url);

    if (ytId) {
      // YouTube mode
      setIsYouTube(true);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      initYouTubePlayer(ytId);
    } else {
      // Native audio file (Cloudinary)
      setIsYouTube(false);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === "function") {
        ytPlayerRef.current.pauseVideo();
      }
      if (audioRef.current) {
        audioRef.current.src = song.audio_url;
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error("Playback error:", err);
            setIsPlaying(false);
          });
      }
    }
  };

  const togglePlay = () => {
    if (!currentSong) return;

    if (isYouTube) {
      if (!ytPlayerRef.current) return;
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
    } else {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(console.error);
      }
    }
  };

  const nextSong = () => {
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      playSong(queue[currentIndex + 1]);
    } else if (queue.length > 0) {
      playSong(queue[0]);
    }
  };

  const prevSong = () => {
    if (!currentSong || queue.length === 0) return;
    if (currentTime > 3) {
      seekTo(0);
      return;
    }
    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex > 0) {
      playSong(queue[currentIndex - 1]);
    } else {
      playSong(queue[queue.length - 1]);
    }
  };

  const seekTo = (time: number) => {
    setCurrentTime(time);
    if (isYouTube) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === "function") {
        ytPlayerRef.current.seekTo(time, true);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    }
  };

  const setVolumeLevel = (vol: number) => {
    setVolume(vol);
    setIsMuted(vol === 0);
    if (isYouTube) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === "function") {
        ytPlayerRef.current.setVolume(vol * 100);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.volume = vol;
      }
    }
  };

  const toggleMute = () => {
    if (isYouTube) {
      if (!ytPlayerRef.current) return;
      if (isMuted) {
        ytPlayerRef.current.unMute();
        setIsMuted(false);
      } else {
        ytPlayerRef.current.mute();
        setIsMuted(true);
      }
    } else {
      if (!audioRef.current) return;
      if (isMuted) {
        audioRef.current.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleLoop = () => {
    setIsLooping((prev) => !prev);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        queue,
        isMuted,
        isLooping,
        isYouTube,
        showVideo,
        setShowVideo,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        seekTo,
        setVolumeLevel,
        toggleMute,
        toggleLoop,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
