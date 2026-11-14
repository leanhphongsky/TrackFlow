"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

export interface PlaylistSongItem {
  id: number;
  playlist_id: number;
  song_id?: number | null;
  title: string;
  artist: string;
  audio_url: string;
  image_url: string | null;
  duration: number;
  views?: string | number | null;
  position: number;
  added_at: string;
}

export interface PlaylistSummary {
  id: number;
  user_id: number;
  name: string;
  description: string;
  image_url: string | null;
  cover_image: string | null;
  song_count: number;
  created_at: string;
  updated_at: string;
  hasSong?: boolean;
}

interface PlaylistContextType {
  playlists: PlaylistSummary[];
  loading: boolean;
  refreshPlaylists: () => Promise<void>;
  createPlaylist: (name?: string, description?: string) => Promise<PlaylistSummary | null>;
  updatePlaylist: (id: number, data: { name?: string; description?: string; image_url?: string }) => Promise<boolean>;
  deletePlaylist: (id: number) => Promise<boolean>;
  addSongToPlaylist: (playlistId: number, song: any) => Promise<{ success: boolean; message?: string; alreadyExists?: boolean }>;
  removeSongFromPlaylist: (playlistId: number, audioUrl: string, songEntryId?: number) => Promise<boolean>;
  
  // Navigation & selection
  selectedPlaylistId: number | null;
  setSelectedPlaylistId: (id: number | null) => void;

  // Add to Playlist Modal
  isAddToPlaylistOpen: boolean;
  songForPlaylist: any | null;
  openAddToPlaylist: (song: any) => void;
  closeAddToPlaylist: () => void;

  // Import Playlist Modal
  isImportModalOpen: boolean;
  openImportModal: () => void;
  closeImportModal: () => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const { user, openAuthModal } = useAuth();
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);

  // Add to Playlist modal state
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [songForPlaylist, setSongForPlaylist] = useState<any | null>(null);

  // Import Playlist modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const openImportModal = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    setIsImportModalOpen(true);
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
  };

  const refreshPlaylists = useCallback(async () => {
    if (!user) {
      setPlaylists([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/playlists");
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data.playlists || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách phát:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshPlaylists();
  }, [refreshPlaylists]);

  const createPlaylist = async (name?: string, description?: string): Promise<PlaylistSummary | null> => {
    if (!user) {
      openAuthModal("login");
      return null;
    }

    try {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) {
        throw new Error("Không thể tạo playlist");
      }

      const data = await res.json();
      const newPlaylist = data.playlist;

      setPlaylists((prev) => [newPlaylist, ...prev]);
      return newPlaylist;
    } catch (err) {
      console.error("Create playlist error:", err);
      return null;
    }
  };

  const updatePlaylist = async (
    id: number,
    data: { name?: string; description?: string; image_url?: string }
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await fetch(`/api/playlists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) return false;

      await refreshPlaylists();
      return true;
    } catch (err) {
      console.error("Update playlist error:", err);
      return false;
    }
  };

  const deletePlaylist = async (id: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await fetch(`/api/playlists/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) return false;

      setPlaylists((prev) => prev.filter((p) => p.id !== id));
      if (selectedPlaylistId === id) {
        setSelectedPlaylistId(null);
      }
      return true;
    } catch (err) {
      console.error("Delete playlist error:", err);
      return false;
    }
  };

  const addSongToPlaylist = async (
    playlistId: number,
    song: any
  ): Promise<{ success: boolean; message?: string; alreadyExists?: boolean }> => {
    if (!user) {
      openAuthModal("login");
      return { success: false, message: "Vui lòng đăng nhập" };
    }

    try {
      const audioUrl = song.audio_url || song.url || (song.videoId ? `https://www.youtube.com/watch?v=${song.videoId}` : "");
      const title = song.title || "Bài hát không tên";
      const artist = song.artist || song.author?.name || "Nghệ sĩ chưa rõ";
      const imageUrl = song.image_url || song.thumbnail || null;
      const duration = song.duration || song.seconds || 0;
      const views = song.views || song.viewsFormatted || null;
      const songId = typeof song.id === "number" ? song.id : null;

      const res = await fetch(`/api/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songId,
          title,
          artist,
          audio_url: audioUrl,
          image_url: imageUrl,
          duration,
          views,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || "Không thể thêm bài hát" };
      }

      await refreshPlaylists();
      return { 
        success: true, 
        message: data.message || "Đã thêm vào danh sách phát",
        alreadyExists: data.alreadyExists
      };
    } catch (err: any) {
      console.error("Add song to playlist error:", err);
      return { success: false, message: err.message };
    }
  };

  const removeSongFromPlaylist = async (
    playlistId: number,
    audioUrl: string,
    songEntryId?: number
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const url = songEntryId
        ? `/api/playlists/${playlistId}/songs?song_entry_id=${songEntryId}`
        : `/api/playlists/${playlistId}/songs?audio_url=${encodeURIComponent(audioUrl)}`;

      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) return false;

      await refreshPlaylists();
      return true;
    } catch (err) {
      console.error("Remove song error:", err);
      return false;
    }
  };

  const openAddToPlaylist = (song: any) => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    setSongForPlaylist(song);
    setIsAddToPlaylistOpen(true);
  };

  const closeAddToPlaylist = () => {
    setIsAddToPlaylistOpen(false);
    setSongForPlaylist(null);
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        loading,
        refreshPlaylists,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        selectedPlaylistId,
        setSelectedPlaylistId,
        isAddToPlaylistOpen,
        songForPlaylist,
        openAddToPlaylist,
        closeAddToPlaylist,
        isImportModalOpen,
        openImportModal,
        closeImportModal,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
}
