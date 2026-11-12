"use client";

import React, { useState, useRef } from "react";
import { X, UploadCloud, Music, Image as ImageIcon, Loader2 } from "lucide-react";
import { Song } from "@/lib/db";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSongUploaded: (song: Song) => void;
}

export default function UploadModal({ isOpen, onClose, onSongUploaded }: UploadModalProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      // Auto-fill title from filename if empty
      if (!title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artist || !audioFile) {
      alert("Vui lòng nhập tên bài hát, nghệ sĩ và chọn file âm thanh!");
      return;
    }

    try {
      setIsLoading(true);

      // 1. Upload audio to Cloudinary via /api/upload
      setStatusMessage("Đang tải file nhạc lên Cloudinary (có thể mất vài giây)...");
      const audioFormData = new FormData();
      audioFormData.append("file", audioFile);
      audioFormData.append("type", "audio");

      const audioRes = await fetch("/api/upload", {
        method: "POST",
        body: audioFormData,
      });

      if (!audioRes.ok) {
        const errorData = await audioRes.json();
        throw new Error(errorData.details || "Không thể tải lên file nhạc");
      }

      const audioData = await audioRes.json();

      // 2. Upload image (if selected)
      let imageUrl = null;
      if (imageFile) {
        setStatusMessage("Đang tải ảnh bìa lên...");
        const imageFormData = new FormData();
        imageFormData.append("file", imageFile);
        imageFormData.append("type", "image");

        const imageRes = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        });

        if (imageRes.ok) {
          const imageData = await imageRes.json();
          imageUrl = imageData.url;
        }
      }

      // 3. Save song record to Neon DB via /api/songs
      setStatusMessage("Đang lưu bài hát vào Neon Database...");
      const songRes = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          artist,
          audio_url: audioData.url,
          image_url: imageUrl,
          duration: audioData.duration || 0,
        }),
      });

      if (!songRes.ok) {
        throw new Error("Không thể lưu bài hát vào cơ sở dữ liệu");
      }

      const { song } = await songRes.json();
      onSongUploaded(song);

      // Reset form & close
      setTitle("");
      setArtist("");
      setAudioFile(null);
      setImageFile(null);
      setImagePreview(null);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert("Lỗi khi đăng bài hát: " + err.message);
    } finally {
      setIsLoading(false);
      setStatusMessage("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#242424] w-full max-w-md rounded-xl p-6 shadow-2xl border border-white/10 relative text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-[#1db954]" />
          Đăng bài hát mới
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên bài hát */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              Tên bài hát *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Nơi Này Có Anh"
              disabled={isLoading}
              required
              className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1db954]"
            />
          </div>

          {/* Nghệ sĩ */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              Nghệ sĩ / Ca sĩ *
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Ví dụ: Sơn Tùng M-TP"
              disabled={isLoading}
              required
              className="w-full bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1db954]"
            />
          </div>

          {/* Chọn File Âm thanh */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              File âm thanh (MP3, M4A, WAV) *
            </label>
            <div
              onClick={() => audioInputRef.current?.click()}
              className="border-2 border-dashed border-gray-600 hover:border-[#1db954] rounded-lg p-3 text-center cursor-pointer bg-[#181818] transition flex items-center justify-center gap-2"
            >
              <Music className="w-5 h-5 text-[#1db954]" />
              <span className="text-xs text-gray-300 truncate max-w-[280px]">
                {audioFile ? audioFile.name : "Nhấn để chọn file nhạc (.mp3)"}
              </span>
            </div>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              className="hidden"
            />
          </div>

          {/* Chọn Ảnh bìa (Cover art) */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              Ảnh bìa album (Không bắt buộc)
            </label>
            <div className="flex items-center gap-3">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-14 h-14 rounded-lg object-cover border border-gray-700"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-[#181818] border border-dashed border-gray-600 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isLoading}
                className="text-xs bg-[#333] hover:bg-[#444] px-3 py-2 rounded-lg text-white font-medium transition"
              >
                {imageFile ? "Đổi ảnh" : "Chọn ảnh bìa"}
              </button>
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Trạng thái loading */}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#1db954] bg-[#181818] p-3 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Nút gửi */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1db954] hover:bg-[#1ed760] disabled:bg-gray-600 text-black font-bold py-2.5 rounded-full transition flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đăng bài hát"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
