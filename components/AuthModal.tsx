"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Lock, User, Sparkles, Loader2, Disc3 } from "lucide-react";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    login,
    register,
  } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (authModalTab === "login") {
        const res = await login(username, password);
        if (!res.success) {
          setError(res.error || "Đăng nhập thất bại");
        } else {
          setUsername("");
          setPassword("");
        }
      } else {
        if (!displayName.trim()) {
          setError("Vui lòng nhập tên hiển thị");
          setLoading(false);
          return;
        }
        const res = await register(username, password, displayName);
        if (!res.success) {
          setError(res.error || "Đăng ký thất bại");
        } else {
          setUsername("");
          setPassword("");
          setDisplayName("");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#181818] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/10 relative text-white my-auto max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2 mb-6">
          <Disc3 className="w-7 h-7 text-[#1db954] animate-spin-slow" />
          <span className="font-extrabold text-xl tracking-tight text-white">
            TrackFlow
          </span>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center border-b border-white/10 mb-6">
          <button
            type="button"
            onClick={() => {
              setError("");
              openAuthModal("login");
            }}
            className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition ${
              authModalTab === "login"
                ? "border-[#1db954] text-white"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setError("");
              openAuthModal("register");
            }}
            className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition ${
              authModalTab === "register"
                ? "border-[#1db954] text-white"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Tạo tài khoản mới
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name (Only in Register) */}
          {authModalTab === "register" && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Tên của bạn / Tên hiển thị
              </label>
              <div className="relative">
                <Sparkles className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ví dụ: Anh Phong"
                  required
                  disabled={loading}
                  className="w-full bg-[#242424] border border-gray-700 focus:border-[#1db954] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none transition"
                />
              </div>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              Tên đăng nhập
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ví dụ: phongle"
                required
                disabled={loading}
                className="w-full bg-[#242424] border border-gray-700 focus:border-[#1db954] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full bg-[#242424] border border-gray-700 focus:border-[#1db954] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1db954] hover:bg-[#1ed760] disabled:bg-gray-600 text-black font-extrabold text-sm py-2.5 rounded-full transition shadow-lg flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Đang xử lý...</span>
              </>
            ) : authModalTab === "login" ? (
              "Đăng nhập"
            ) : (
              "Tạo tài khoản"
            )}
          </button>
        </form>

        <p className="text-[11px] text-gray-500 text-center mt-4">
          Mỗi tài khoản có danh sách bài hát yêu thích riêng biệt.
        </p>
      </div>
    </div>
  );
}
