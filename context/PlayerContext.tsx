"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Song } from "@/lib/db";

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export interface LyricLine {
  start: number;
  dur: number;
  text: string;
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
  isPlaylist: boolean;
  showVideo: boolean;
  setShowVideo: (show: boolean) => void;
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (open: boolean) => void;
  toggleRightPanel: () => void;
  playSong: (song: Song, newQueue?: Song[], isPlaylistContext?: boolean) => void;
  togglePlay: () => void;
  nextSong: () => Promise<void> | void;
  prevSong: () => void;
  seekTo: (time: number) => void;
  setVolumeLevel: (vol: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  // Lyrics state
  lyrics: LyricLine[];
  hasLyrics: boolean;
  isSyncedLyrics: boolean;
  lyricsSource: string;
  lyricsOffset: number;
  setLyricsOffset: React.Dispatch<React.SetStateAction<number>>;
  lyricsMessage: string;
  loadingLyrics: boolean;
  isLyricsFullscreen: boolean;
  setIsLyricsFullscreen: (open: boolean) => void;
  toggleLyricsFullscreen: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

export function cleanArtistName(artist?: string): string {
  if (!artist) return "";
  let clean = artist
    .replace(/\s*-\s*Topic/gi, "")
    .replace(/\s*Official/gi, "")
    .replace(/\s*VEVO/gi, "")
    .replace(/\s*Channel/gi, "")
    .replace(/\s*Music/gi, "")
    .trim();

  // Split on collaboration delimiters to isolate primary artist name
  const delimiters = ["//", " feat.", " ft.", " x ", " X ", ",", " & "];
  for (const delim of delimiters) {
    if (clean.includes(delim)) {
      clean = clean.split(delim)[0].trim();
      break;
    }
  }
  return clean;
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
  const [isPlaylist, setIsPlaylist] = useState(false);
  const [isYouTube, setIsYouTube] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  const toggleRightPanel = () => setIsRightPanelOpen((prev) => !prev);

  // Global Lyrics state shared across NowPlayingPanel and FullscreenLyricsView
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [hasLyrics, setHasLyrics] = useState<boolean>(false);
  const [isSyncedLyrics, setIsSyncedLyrics] = useState<boolean>(false);
  const [lyricsSource, setLyricsSource] = useState<string>("");
  const [lyricsOffset, setLyricsOffset] = useState<number>(0);
  const [lyricsMessage, setLyricsMessage] = useState<string>("");
  const [loadingLyrics, setLoadingLyrics] = useState<boolean>(false);
  const [isLyricsFullscreen, setIsLyricsFullscreen] = useState<boolean>(false);

  const toggleLyricsFullscreen = () => setIsLyricsFullscreen((prev) => !prev);

  // Automatically fetch lyrics whenever current song changes
  useEffect(() => {
    setLyricsOffset(0);
    if (!currentSong) {
      setLyrics([]);
      setHasLyrics(false);
      setIsSyncedLyrics(false);
      setLyricsSource("");
      setLyricsMessage("");
      return;
    }

    const videoId = currentSong.videoId || extractYouTubeId(currentSong.audio_url);

    async function fetchLyrics() {
      try {
        setLoadingLyrics(true);
        const params = new URLSearchParams();
        if (videoId) params.set("videoId", videoId);
        if (currentSong?.title) params.set("title", currentSong.title);
        if (currentSong?.artist) params.set("artist", currentSong.artist);

        const res = await fetch(`/api/youtube/lyrics?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.hasLyrics && data.lines?.length > 0) {
            setHasLyrics(true);
            setIsSyncedLyrics(Boolean(data.isSynced));
            setLyricsSource(data.source || "");
            setLyrics(data.lines);
            setLyricsMessage("");
          } else {
            setHasLyrics(false);
            setIsSyncedLyrics(false);
            setLyricsSource("");
            setLyricsMessage(data.message || "Hiện bài hát này chưa có lời");
            setLyrics([]);
          }
        } else {
          setHasLyrics(false);
          setIsSyncedLyrics(false);
          setLyricsSource("");
          setLyricsMessage("Hiện bài hát này chưa có lời");
          setLyrics([]);
        }
      } catch (err) {
        setHasLyrics(false);
        setIsSyncedLyrics(false);
        setLyricsSource("");
        setLyricsMessage("Hiện bài hát này chưa có lời");
        setLyrics([]);
      } finally {
        setLoadingLyrics(false);
      }
    }

    fetchLyrics();
  }, [currentSong?.id, currentSong?.audio_url, currentSong?.title, currentSong?.artist]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fresh refs to prevent stale closure in YouTube and Audio callbacks
  const currentSongRef = useRef<Song | null>(currentSong);
  const queueRef = useRef<Song[]>(queue);
  const isLoopingRef = useRef<boolean>(isLooping);
  const isPlaylistRef = useRef<boolean>(false);
  const isAutoplayingRef = useRef<boolean>(false);
  const playedHistoryRef = useRef<string[]>([]);
  const nextSongRef = useRef<() => void>(() => {});
  const currentTimeRef = useRef<number>(currentTime);
  const durationRef = useRef<number>(duration);
  const isYouTubeRef = useRef<boolean>(isYouTube);
  const lastSavedTimeRef = useRef<number>(0);
  const hasRestoredRef = useRef<boolean>(false);

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  useEffect(() => {
    isPlaylistRef.current = isPlaylist;
  }, [isPlaylist]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    isYouTubeRef.current = isYouTube;
  }, [isYouTube]);

  // Helper to persist playback state to localStorage
  const saveCurrentPlayerState = () => {
    if (typeof window === "undefined") return;
    const song = currentSongRef.current;
    if (!song) return;

    try {
      const state = {
        song,
        queue: queueRef.current,
        isPlaylist: isPlaylistRef.current,
        currentTime: currentTimeRef.current,
        duration: durationRef.current,
        isYouTube: isYouTubeRef.current,
        savedAt: Date.now(),
      };
      localStorage.setItem("trackflow_saved_player_state", JSON.stringify(state));
    } catch (e) {
      // Ignore quota errors
    }
  };

  // Throttle saving state to localStorage during playback
  useEffect(() => {
    if (!currentSong) return;
    const now = Date.now();
    if (now - lastSavedTimeRef.current > 1500) {
      lastSavedTimeRef.current = now;
      saveCurrentPlayerState();
    }
  }, [currentTime, currentSong]);

  // Save immediately before page unloads or reloads
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleBeforeUnload = () => {
      saveCurrentPlayerState();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
    };
  }, []);

  // Autoplay function: fetches next track from the same artist, or trending hits
  const autoplayNextSong = async (song: Song) => {
    if (isAutoplayingRef.current) return;
    isAutoplayingRef.current = true;

    try {
      const played = new Set(playedHistoryRef.current);
      if (song.id !== undefined && song.id !== null) played.add(String(song.id));
      if (song.audio_url) played.add(song.audio_url);
      if (song.videoId) played.add(`yt_${song.videoId}`);

      const artistName = cleanArtistName(song.artist);
      let candidates: Song[] = [];

      // Step 1: Try fetching top popular tracks by the same artist
      if (artistName) {
        try {
          const artistRes = await fetch(
            `/api/youtube/artist?q=${encodeURIComponent(artistName)}`
          );
          if (artistRes.ok) {
            const data = await artistRes.json();
            if (data.popularSongs && Array.isArray(data.popularSongs)) {
              candidates = data.popularSongs;
            }
          }
        } catch (e) {
          console.warn("Autoplay: artist endpoint failed", e);
        }

        // Fallback search for the artist's songs
        if (candidates.length === 0) {
          try {
            const searchRes = await fetch(
              `/api/youtube/search?q=${encodeURIComponent(
                artistName + " official audio"
              )}`
            );
            if (searchRes.ok) {
              const data = await searchRes.json();
              if (data.results && Array.isArray(data.results)) {
                candidates = data.results;
              }
            }
          } catch (e) {
            console.warn("Autoplay: search artist failed", e);
          }
        }
      }

      // Filter out played tracks and current track
      let unplayed = candidates.filter((item) => {
        if (item.id === song.id || item.audio_url === song.audio_url) return false;
        if (item.videoId && song.videoId && item.videoId === song.videoId) return false;
        if (item.id && played.has(String(item.id))) return false;
        if (item.audio_url && played.has(item.audio_url)) return false;
        if (item.videoId && played.has(`yt_${item.videoId}`)) return false;
        return true;
      });

      // If all candidate tracks have been heard, allow any except current song
      if (unplayed.length === 0 && candidates.length > 0) {
        unplayed = candidates.filter(
          (item) =>
            item.id !== song.id &&
            item.audio_url !== song.audio_url &&
            item.videoId !== song.videoId
        );
      }

      // Found a song by the same artist
      if (unplayed.length > 0) {
        const nextTrack = unplayed[0];
        playSong(nextTrack, unplayed, false);
        return;
      }

      // Step 2: Fallback to "một bài bất kì" (trending / hot songs)
      const fallbackQueries = [
        "nhac viet hot trending",
        "nhac tre hay nhat",
        "top hits vietnam",
      ];
      const randomQuery =
        fallbackQueries[Math.floor(Math.random() * fallbackQueries.length)];

      try {
        const fallbackRes = await fetch(
          `/api/youtube/search?q=${encodeURIComponent(randomQuery)}`
        );
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const fallbackList: Song[] = fallbackData.results || [];
          const fallbackUnplayed = fallbackList.filter(
            (item) =>
              item.id !== song.id &&
              item.audio_url !== song.audio_url &&
              (!item.id || !played.has(String(item.id))) &&
              (!item.audio_url || !played.has(item.audio_url))
          );

          if (fallbackUnplayed.length > 0) {
            playSong(fallbackUnplayed[0], fallbackUnplayed, false);
            return;
          }
        }
      } catch (e) {
        console.warn("Autoplay fallback query error", e);
      }

      // Step 3: Loop queue if everything else fails
      if (queueRef.current.length > 0) {
        playSong(queueRef.current[0], queueRef.current, false);
      }
    } finally {
      isAutoplayingRef.current = false;
    }
  };

  const nextSong = async () => {
    const song = currentSongRef.current;
    const currentQueue = queueRef.current;
    const isPlaylistMode = isPlaylistRef.current;

    if (!song) return;

    // 1. If currently in a playlist with upcoming songs, play the next one
    if (isPlaylistMode && currentQueue.length > 1) {
      const currentIndex = currentQueue.findIndex(
        (s) => s.id === song.id || s.audio_url === song.audio_url
      );
      if (currentIndex !== -1 && currentIndex < currentQueue.length - 1) {
        playSong(currentQueue[currentIndex + 1], currentQueue, true);
        return;
      }
    }

    // 2. If outside a playlist (single track, search play, or playlist finished):
    // Autoplay next track: prioritize same artist, then trending hits
    await autoplayNextSong(song);
  };

  // Keep nextSongRef updated
  useEffect(() => {
    nextSongRef.current = nextSong;
  });

  // Initialize HTML5 Audio
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;

      const audio = audioRef.current;

      if (currentSongRef.current && !isYouTubeRef.current && currentSongRef.current.audio_url) {
        audio.src = currentSongRef.current.audio_url;
        audio.currentTime = currentTimeRef.current || 0;
      }

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
          if (isLoopingRef.current) {
            audio.currentTime = 0;
            audio.play().catch(console.error);
          } else {
            nextSongRef.current();
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
  }, [isYouTube]);

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

  const initYouTubePlayer = (
    videoId: string,
    startSeconds: number = 0,
    autoPlay: boolean = true
  ) => {
    const onPlayerReady = (event: any) => {
      event.target.setVolume(volume * 100);
      if (isMuted) event.target.mute();
      if (startSeconds > 0) {
        event.target.seekTo(startSeconds, true);
      }
      if (autoPlay) {
        event.target.playVideo();
        setIsPlaying(true);
      } else {
        event.target.pauseVideo();
        setIsPlaying(false);
      }
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
        if (isLoopingRef.current) {
          event.target.seekTo(0);
          event.target.playVideo();
        } else {
          nextSongRef.current();
        }
      }
    };

    const onPlayerError = (event: any) => {
      console.warn("YouTube player encountered error:", event.data);
      setTimeout(() => {
        nextSongRef.current();
      }, 1000);
    };

    if (window.YT && window.YT.Player) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === "function") {
        if (autoPlay) {
          ytPlayerRef.current.loadVideoById({ videoId, startSeconds });
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        } else {
          if (typeof ytPlayerRef.current.cueVideoById === "function") {
            ytPlayerRef.current.cueVideoById({ videoId, startSeconds });
          } else {
            ytPlayerRef.current.loadVideoById({ videoId, startSeconds });
            ytPlayerRef.current.pauseVideo();
          }
          setIsPlaying(false);
        }
      } else {
        ytPlayerRef.current = new window.YT.Player("youtube-player-frame", {
          videoId: videoId,
          playerVars: {
            autoplay: autoPlay ? 1 : 0,
            start: Math.floor(startSeconds),
            controls: 0,
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError,
          },
        });
      }
    } else {
      // Retry once YT API is ready
      window.onYouTubeIframeAPIReady = () => {
        ytPlayerRef.current = new window.YT.Player("youtube-player-frame", {
          videoId: videoId,
          playerVars: {
            autoplay: autoPlay ? 1 : 0,
            start: Math.floor(startSeconds),
            controls: 0,
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError,
          },
        });
      };
    }
  };

  // Restore persisted player state on mount (reload/reopen)
  useEffect(() => {
    if (typeof window === "undefined" || hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    try {
      const savedStr = localStorage.getItem("trackflow_saved_player_state");
      if (!savedStr) return;
      const saved = JSON.parse(savedStr);
      if (!saved || !saved.song) return;

      const song: Song = saved.song;
      setCurrentSong(song);
      currentSongRef.current = song;

      if (Array.isArray(saved.queue) && saved.queue.length > 0) {
        setQueue(saved.queue);
        queueRef.current = saved.queue;
      }

      const isPl = Boolean(saved.isPlaylist);
      setIsPlaylist(isPl);
      isPlaylistRef.current = isPl;

      const savedTime =
        typeof saved.currentTime === "number" && !isNaN(saved.currentTime)
          ? saved.currentTime
          : 0;
      const savedDur =
        typeof saved.duration === "number" && !isNaN(saved.duration)
          ? saved.duration
          : 0;

      setCurrentTime(savedTime);
      currentTimeRef.current = savedTime;
      setDuration(savedDur);
      durationRef.current = savedDur;

      const ytId = song.videoId || extractYouTubeId(song.audio_url);
      const isYT = Boolean(saved.isYouTube || ytId);
      setIsYouTube(isYT);
      isYouTubeRef.current = isYT;

      // isPlaying stays false on mount to avoid violating browser autoplay policies
      setIsPlaying(false);

      if (isYT && ytId) {
        initYouTubePlayer(ytId, savedTime, false);
      } else if (song.audio_url) {
        if (audioRef.current) {
          audioRef.current.src = song.audio_url;
          audioRef.current.currentTime = savedTime;
        }
      }
    } catch (err) {
      console.warn("Could not restore saved player state:", err);
    }
  }, []);

  const playSong = (song: Song, newQueue?: Song[], isPlaylistContext?: boolean) => {
    setCurrentSong(song);
    currentSongRef.current = song;
    // Auto-open right panel (Spotify Now Playing Canvas) whenever a song is played
    setIsRightPanelOpen(true);

    if (song.id !== undefined && song.id !== null) playedHistoryRef.current.push(String(song.id));
    if (song.audio_url) playedHistoryRef.current.push(song.audio_url);
    if (song.videoId) playedHistoryRef.current.push(`yt_${song.videoId}`);
    if (playedHistoryRef.current.length > 50) {
      playedHistoryRef.current = playedHistoryRef.current.slice(-50);
    }

    if (newQueue) {
      setQueue(newQueue);
      queueRef.current = newQueue;
    }

    const playlistFlag =
      isPlaylistContext !== undefined
        ? isPlaylistContext
        : Boolean(newQueue && newQueue.length > 1);
    setIsPlaylist(playlistFlag);
    isPlaylistRef.current = playlistFlag;

    const ytId = song.videoId || extractYouTubeId(song.audio_url);

    if (ytId) {
      // YouTube mode
      setIsYouTube(true);
      isYouTubeRef.current = true;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      initYouTubePlayer(ytId, 0, true);
    } else {
      // Native audio file (Cloudinary)
      setIsYouTube(false);
      isYouTubeRef.current = false;
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

    currentTimeRef.current = 0;
    saveCurrentPlayerState();
  };

  const togglePlay = () => {
    const song = currentSongRef.current || currentSong;
    if (!song) return;

    if (isYouTube) {
      if (!ytPlayerRef.current || typeof ytPlayerRef.current.playVideo !== "function") {
        const ytId = song.videoId || extractYouTubeId(song.audio_url);
        if (ytId) {
          initYouTubePlayer(ytId, currentTimeRef.current, true);
        }
        return;
      }
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
        saveCurrentPlayerState();
      } else {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
    } else {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        saveCurrentPlayerState();
      } else {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(console.error);
      }
    }
  };

  const prevSong = () => {
    const song = currentSongRef.current;
    const currentQueue = queueRef.current;
    if (!song || currentQueue.length === 0) return;
    if (currentTime > 3) {
      seekTo(0);
      return;
    }
    const currentIndex = currentQueue.findIndex(
      (s) => s.id === song.id || s.audio_url === song.audio_url
    );
    if (currentIndex > 0) {
      playSong(currentQueue[currentIndex - 1], currentQueue, isPlaylistRef.current);
    } else {
      playSong(currentQueue[currentQueue.length - 1], currentQueue, isPlaylistRef.current);
    }
  };

  const seekTo = (time: number) => {
    setCurrentTime(time);
    currentTimeRef.current = time;
    if (isYouTube) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === "function") {
        ytPlayerRef.current.seekTo(time, true);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    }
    saveCurrentPlayerState();
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
        isPlaylist,
        showVideo,
        setShowVideo,
        isRightPanelOpen,
        setIsRightPanelOpen,
        toggleRightPanel,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        seekTo,
        setVolumeLevel,
        toggleMute,
        toggleLoop,
        lyrics,
        hasLyrics,
        isSyncedLyrics,
        lyricsSource,
        lyricsOffset,
        setLyricsOffset,
        lyricsMessage,
        loadingLyrics,
        isLyricsFullscreen,
        setIsLyricsFullscreen,
        toggleLyricsFullscreen,
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
