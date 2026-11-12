"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser } from "@/lib/auth";
import { Song } from "@/lib/db";

export interface FollowedArtist {
  id: number;
  artist_name: string;
  channel_id?: string | null;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "register";
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    username: string,
    password: string,
    displayName: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  favoriteSongs: Song[];
  isFavorite: (song: { id?: number | string; audio_url?: string }) => boolean;
  toggleFavorite: (song: any) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
  followedArtists: FollowedArtist[];
  isFollowingArtist: (artistName?: string, channelId?: string) => boolean;
  toggleFollowArtist: (artist: { name: string; channelId?: string; avatar?: string }) => Promise<boolean>;
  refreshFollowedArtists: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  const [favoriteSongs, setFavoriteSongs] = useState<Song[]>([]);
  const [favoriteSongIds, setFavoriteSongIds] = useState<Set<number>>(new Set());
  const [favoriteAudioUrls, setFavoriteAudioUrls] = useState<Set<string>>(new Set());

  const [followedArtists, setFollowedArtists] = useState<FollowedArtist[]>([]);

  // Check login status on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  // Fetch favorites whenever user logs in or changes
  const refreshFavorites = async () => {
    if (!user) {
      setFavoriteSongs([]);
      setFavoriteSongIds(new Set());
      setFavoriteAudioUrls(new Set());
      return;
    }

    try {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavoriteSongs(data.songs || []);
        setFavoriteSongIds(new Set(data.favoriteSongIds || []));
        setFavoriteAudioUrls(new Set(data.favoriteAudioUrls || []));
      }
    } catch (err) {
      console.error("Error loading favorites:", err);
    }
  };

  // Fetch followed artists
  const refreshFollowedArtists = async () => {
    if (!user) {
      setFollowedArtists([]);
      return;
    }

    try {
      const res = await fetch("/api/artists/follow");
      if (res.ok) {
        const data = await res.json();
        setFollowedArtists(data.artists || []);
      }
    } catch (err) {
      console.error("Error loading followed artists:", err);
    }
  };

  useEffect(() => {
    refreshFavorites();
    refreshFollowedArtists();
  }, [user?.id]);

  const openAuthModal = (tab: "login" | "register" = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Đăng nhập thất bại" };
      }
      setUser(data.user);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const register = async (username: string, password: string, displayName: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, display_name: displayName }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Đăng ký thất bại" };
      }
      setUser(data.user);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setFavoriteSongs([]);
      setFavoriteSongIds(new Set());
      setFavoriteAudioUrls(new Set());
      setFollowedArtists([]);
      openAuthModal("login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isFavorite = (song: { id?: number | string; audio_url?: string }) => {
    if (typeof song.id === "number" && favoriteSongIds.has(song.id)) return true;
    if (song.audio_url && favoriteAudioUrls.has(song.audio_url)) return true;
    return false;
  };

  const isFollowingArtist = (artistName?: string, channelId?: string) => {
    if (!artistName && !channelId) return false;
    return followedArtists.some((a) => {
      if (artistName && a.artist_name.toLowerCase() === artistName.toLowerCase()) return true;
      if (channelId && a.channel_id === channelId) return true;
      return false;
    });
  };

  const toggleFollowArtist = async (artist: {
    name: string;
    channelId?: string;
    avatar?: string;
  }): Promise<boolean> => {
    if (!user) {
      openAuthModal("login");
      return false;
    }

    const currentlyFollowing = isFollowingArtist(artist.name, artist.channelId);

    if (currentlyFollowing) {
      // Optimistic remove
      setFollowedArtists((prev) =>
        prev.filter(
          (a) =>
            a.artist_name.toLowerCase() !== artist.name.toLowerCase() &&
            (!artist.channelId || a.channel_id !== artist.channelId)
        )
      );

      const params = new URLSearchParams();
      if (artist.name) params.set("artistName", artist.name);
      else if (artist.channelId) params.set("channelId", artist.channelId);

      await fetch(`/api/artists/follow?${params.toString()}`, { method: "DELETE" });
      return false;
    } else {
      // Optimistic add
      const tempItem: FollowedArtist = {
        id: Date.now(),
        artist_name: artist.name,
        channel_id: artist.channelId || null,
        avatar_url: artist.avatar || null,
      };
      setFollowedArtists((prev) => [tempItem, ...prev]);

      const res = await fetch("/api/artists/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artist_name: artist.name,
          channel_id: artist.channelId,
          avatar_url: artist.avatar,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.artist) {
          setFollowedArtists((prev) => [
            data.artist,
            ...prev.filter(
              (a) =>
                a.artist_name.toLowerCase() !== artist.name.toLowerCase() &&
                a.id !== tempItem.id
            ),
          ]);
        }
      }
      return true;
    }
  };

  const toggleFavorite = async (song: any): Promise<boolean> => {
    if (!user) {
      openAuthModal("login");
      return false;
    }

    const currentlyFav = isFavorite(song);

    if (currentlyFav) {
      // Remove from favorites
      // Optimistic update
      setFavoriteSongs((prev) =>
        prev.filter((s) => s.id !== song.id && s.audio_url !== song.audio_url)
      );
      if (typeof song.id === "number") {
        setFavoriteSongIds((prev) => {
          const next = new Set(prev);
          next.delete(song.id);
          return next;
        });
      }
      if (song.audio_url) {
        setFavoriteAudioUrls((prev) => {
          const next = new Set(prev);
          next.delete(song.audio_url);
          return next;
        });
      }

      const params = new URLSearchParams();
      if (typeof song.id === "number") params.set("songId", song.id.toString());
      else if (song.audio_url) params.set("audio_url", song.audio_url);

      await fetch(`/api/favorites?${params.toString()}`, { method: "DELETE" });
      return false;
    } else {
      // Add to favorites
      // Optimistic update
      setFavoriteSongs((prev) => [song, ...prev]);
      if (typeof song.id === "number") {
        setFavoriteSongIds((prev) => new Set(prev).add(song.id));
      }
      if (song.audio_url) {
        setFavoriteAudioUrls((prev) => new Set(prev).add(song.audio_url));
      }

      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songId: song.id,
          title: song.title,
          artist: song.artist,
          audio_url: song.audio_url,
          image_url: song.image_url,
          duration: song.duration || 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.songId) {
          setFavoriteSongIds((prev) => new Set(prev).add(data.songId));
        }
      }
      return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        favoriteSongs,
        isFavorite,
        toggleFavorite,
        refreshFavorites,
        followedArtists,
        isFollowingArtist,
        toggleFollowArtist,
        refreshFollowedArtists,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
