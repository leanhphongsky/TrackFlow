"use client";

import React, { useState } from "react";
import {
  X,
  Link2,
  FileText,
  Loader2,
  Check,
  Music,
  Download,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ListMusic,
  CheckSquare,
  Square,
  Clock,
  ExternalLink,
} from "lucide-react";
import { usePlaylist } from "@/context/PlaylistContext";

interface TrackPreview {
  videoId?: string;
  title: string;
  artist: string;
  duration?: number;
  image_url?: string;
  audio_url?: string;
  spotifyUri?: string;
}

interface ImportPlaylistModalProps {
  onSuccess?: (playlistId: number) => void;
}

export default function ImportPlaylistModal({ onSuccess }: ImportPlaylistModalProps) {
  const { isImportModalOpen, closeImportModal, refreshPlaylists, setSelectedPlaylistId } =
    usePlaylist();

  const [activeTab, setActiveTab] = useState<"url" | "text">("url");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");

  // Scan & preview state
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Scanned data
  const [scannedPlatform, setScannedPlatform] = useState<"spotify" | "youtube" | "text" | null>(
    null
  );
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [playlistDesc, setPlaylistDesc] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [tracks, setTracks] = useState<TrackPreview[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  // Import execution state
  const [isImporting, setIsImporting] = useState(false);
  const [importProgressText, setImportProgressText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  if (!isImportModalOpen) return null;

  const resetState = () => {
    setUrlInput("");
    setTextInput("");
    setIsScanning(false);
    setScanError(null);
    setScannedPlatform(null);
    setPlaylistTitle("");
    setPlaylistDesc("");
    setCoverImage(null);
    setTracks([]);
    setSelectedIndices(new Set());
    setIsImporting(false);
    setImportProgressText("");
    setImportError(null);
  };

  const handleClose = () => {
    if (isImporting) return; // Prevent closing while saving
    resetState();
    closeImportModal();
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (activeTab === "url") {
        setUrlInput(text.trim());
      } else {
        setTextInput(text);
      }
    } catch (e) {
      // Clipboard access denied or not supported
    }
  };

  // Step 1: Scan & preview playlist
  const handleScanPlaylist = async () => {
    setScanError(null);
    setImportError(null);

    const payload =
      activeTab === "url"
        ? { action: "preview", url: urlInput.trim() }
        : { action: "preview", text: textInput.trim() };

    if (activeTab === "url" && !urlInput.trim()) {
      setScanError("Vui lòng dán đường link playlist từ Spotify hoặc YouTube.");
      return;
    }
    if (activeTab === "text" && !textInput.trim()) {
      setScanError("Vui lòng dán danh sách bài hát (mỗi bài một dòng).");
      return;
    }

    try {
      setIsScanning(true);
      const res = await fetch("/api/playlists/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể quét danh sách bài hát này.");
      }

      setScannedPlatform(data.platform);
      setPlaylistTitle(data.title || "Playlist đã nhập");
      setPlaylistDesc(data.description || "");
      setCoverImage(data.cover_image || null);
      setTracks(data.tracks || []);

      // Select all by default
      const allSet = new Set<number>();
      (data.tracks || []).forEach((_: any, idx: number) => allSet.add(idx));
      setSelectedIndices(allSet);
    } catch (err: any) {
      setScanError(err.message || "Đã xảy ra lỗi khi quét playlist.");
    } finally {
      setIsScanning(false);
    }
  };

  // Toggle individual song checkbox
  const toggleSongSelection = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIndices.size === tracks.length) {
      setSelectedIndices(new Set());
    } else {
      const all = new Set<number>();
      tracks.forEach((_, idx) => all.add(idx));
      setSelectedIndices(all);
    }
  };

  // Format seconds to mm:ss
  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Step 2: Confirm & Save to Supabase
  const handleConfirmImport = async () => {
    if (selectedIndices.size === 0) {
      setImportError("Vui lòng chọn ít nhất 1 bài hát để nhập vào playlist.");
      return;
    }

    const selectedTracks = tracks.filter((_, idx) => selectedIndices.has(idx));
    setIsImporting(true);
    setImportError(null);
    setImportProgressText(
      scannedPlatform === "youtube"
        ? `Đang lưu ${selectedTracks.length} bài hát vào tài khoản...`
        : `Đang tìm kiếm và đồng bộ ${selectedTracks.length} bài hát từ YouTube...`
    );

    try {
      const res = await fetch("/api/playlists/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          name: playlistTitle.trim() || "Playlist đã nhập",
          description: playlistDesc.trim(),
          cover_image: coverImage,
          tracks: selectedTracks,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Lỗi khi lưu danh sách phát.");
      }

      // Success! Refresh playlists list
      await refreshPlaylists();

      // Open new playlist directly
      if (data.playlist?.id) {
        setSelectedPlaylistId(data.playlist.id);
        onSuccess?.(data.playlist.id);
      }

      handleClose();
    } catch (err: any) {
      setImportError(err.message || "Đã xảy ra lỗi khi nhập danh sách phát.");
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl bg-[#181818] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-[#202020]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1db954] to-emerald-400 flex items-center justify-center text-black shadow-lg">
              <Download className="w-5 h-5 font-black" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Nhập danh sách phát</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#1db954] border border-[#1db954]/30 uppercase tracking-wider">
                  1-Click
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Chuyển kho nhạc từ Spotify, YouTube Music hoặc danh sách bài hát
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* If NOT scanned yet: Show input options */}
          {tracks.length === 0 ? (
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="grid grid-cols-2 p-1 bg-black/40 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("url");
                    setScanError(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                    activeTab === "url"
                      ? "bg-[#282828] text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Link2 className="w-4 h-4 text-[#1db954]" />
                  <span>Dán đường link (URL)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("text");
                    setScanError(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                    activeTab === "text"
                      ? "bg-[#282828] text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Danh sách bài hát (Text)</span>
                </button>
              </div>

              {activeTab === "url" ? (
                <div className="space-y-3">
                  {/* Platform Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-gray-400 text-[11px]">Hỗ trợ:</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Spotify Playlist / Album
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      YouTube / YouTube Music
                    </span>
                  </div>

                  {/* URL Input Box */}
                  <div className="relative">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Dán link Spotify hoặc YouTube playlist vào đây..."
                      className="w-full bg-[#121212] border border-white/15 focus:border-[#1db954] text-white placeholder-gray-500 text-xs sm:text-sm rounded-xl px-4 py-3 pr-24 focus:outline-none transition shadow-inner font-mono"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handlePasteClipboard}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold rounded-lg transition"
                    >
                      Dán link
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    💡 <strong>Ví dụ:</strong>{" "}
                    <code className="text-gray-400">
                      https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
                    </code>{" "}
                    hoặc{" "}
                    <code className="text-gray-400">
                      https://music.youtube.com/playlist?list=PL...
                    </code>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Mỗi bài một dòng theo định dạng:{" "}
                      <strong className="text-gray-200">Tên bài - Ca sĩ</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handlePasteClipboard}
                      className="text-xs text-[#1db954] hover:underline font-semibold"
                    >
                      Dán từ bộ nhớ tạm
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={`Chúng ta của tương lai - Sơn Tùng M-TP\nWaiting For Never - Post Malone\nDie With A Smile - Lady Gaga, Bruno Mars`}
                    className="w-full bg-[#121212] border border-white/15 focus:border-[#1db954] text-white placeholder-gray-500 text-xs sm:text-sm rounded-xl p-3 focus:outline-none transition shadow-inner font-mono"
                  />
                </div>
              )}

              {/* Error Message */}
              {scanError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{scanError}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleScanPlaylist}
                disabled={isScanning}
                className="w-full py-3 bg-[#1db954] hover:bg-[#1ed760] disabled:bg-gray-700 text-black font-extrabold rounded-xl transition flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01]"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Đang quét danh sách bài hát...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Quét danh sách bài hát</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Scanned Results Preview */
            <div className="space-y-4">
              {/* Playlist Info Header Box */}
              <div className="flex items-center gap-4 p-3.5 bg-black/40 border border-white/10 rounded-2xl">
                <div className="w-16 h-16 rounded-xl bg-[#282828] overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={playlistTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-white/10 text-white">
                      {scannedPlatform === "spotify"
                        ? "🟢 Spotify"
                        : scannedPlatform === "youtube"
                        ? "🔴 YouTube"
                        : "📝 Text List"}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {selectedIndices.size} / {tracks.length} bài được chọn
                    </span>
                  </div>
                  <input
                    type="text"
                    value={playlistTitle}
                    onChange={(e) => setPlaylistTitle(e.target.value)}
                    placeholder="Tên danh sách phát..."
                    className="w-full bg-transparent text-sm sm:text-base font-extrabold text-white border-b border-white/10 focus:border-[#1db954] focus:outline-none transition py-0.5"
                  />
                  <input
                    type="text"
                    value={playlistDesc}
                    onChange={(e) => setPlaylistDesc(e.target.value)}
                    placeholder="Thêm mô tả danh sách phát (tùy chọn)..."
                    className="w-full bg-transparent text-xs text-gray-400 border-b border-transparent focus:border-white/20 focus:outline-none transition py-0.5 truncate"
                  />
                </div>
              </div>

              {/* Track Selection Bar */}
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
                >
                  {selectedIndices.size === tracks.length ? (
                    <CheckSquare className="w-4 h-4 text-[#1db954]" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-500" />
                  )}
                  <span>Chọn tất cả ({tracks.length} bài)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTracks([]);
                    setSelectedIndices(new Set());
                  }}
                  className="text-xs text-gray-400 hover:text-white hover:underline"
                >
                  Quét link khác
                </button>
              </div>

              {/* Scrollable Tracks Preview */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20 max-h-60 overflow-y-auto divide-y divide-white/5">
                {tracks.map((track, idx) => {
                  const isChecked = selectedIndices.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSongSelection(idx)}
                      className={`flex items-center justify-between p-2.5 transition cursor-pointer ${
                        isChecked ? "bg-white/[0.04] hover:bg-white/[0.08]" : "opacity-40 hover:opacity-70"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex-shrink-0 text-gray-400">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#1db954]" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <span className="text-xs font-mono text-gray-500 w-5 text-right flex-shrink-0">
                          {idx + 1}
                        </span>
                        {track.image_url && (
                          <img
                            src={track.image_url}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{track.title}</p>
                          <p className="text-[11px] text-gray-400 truncate">{track.artist}</p>
                        </div>
                      </div>

                      {track.duration ? (
                        <span className="text-[11px] font-mono text-gray-500 ml-2">
                          {formatDuration(track.duration)}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* Import Error Message */}
              {importError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Import Execution Progress / Button */}
              {isImporting ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm font-bold text-[#1db954]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#1db954]" />
                    <span>{importProgressText}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Vui lòng không tắt trang trong giây lát...
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTracks([]);
                      setSelectedIndices(new Set());
                    }}
                    className="px-4 py-3 bg-[#242424] hover:bg-[#2e2e2e] text-white text-xs font-bold rounded-xl transition"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={selectedIndices.size === 0}
                    className="flex-1 py-3 bg-[#1db954] hover:bg-[#1ed760] disabled:bg-gray-700 text-black font-extrabold rounded-xl transition flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01]"
                  >
                    <span>Lưu {selectedIndices.size} bài vào TrackFlow</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
