"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Disc3,
  Sparkles,
  Lock,
  User,
  Eye,
  EyeOff,
  Headphones,
  Heart,
  Music2,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Radio,
} from "lucide-react";

interface LoginPageProps {
  onContinueAsGuest?: () => void;
}

export default function LoginPage({ onContinueAsGuest }: LoginPageProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "login") {
        const res = await login(username, password);
        if (!res.success) {
          setError(res.error || "Tên đăng nhập hoặc mật khẩu không chính xác.");
        }
      } else {
        if (!displayName.trim()) {
          setError("Vui lòng nhập tên hiển thị.");
          setLoading(false);
          return;
        }
        const res = await register(username, password, displayName);
        if (!res.success) {
          setError(res.error || "Đăng ký không thành công. Vui lòng thử lại.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0a0a] text-white p-3 sm:p-6 flex flex-col items-center justify-start lg:justify-center">
      {/* Ambient background glows */}
      <div className="fixed top-[-15%] left-[-10%] w-[550px] h-[550px] bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-[40%] right-[30%] w-[350px] h-[350px] bg-[#1db954]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-5xl my-auto bg-[#141414]/95 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 my-3 lg:my-auto">
        
        {/* LEFT COLUMN: Visual Showcase & Brand Story (Appears below form on mobile, side-by-side on desktop) */}
        <div className="order-2 lg:order-1 lg:col-span-6 p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-[#181818] via-[#121212] to-black flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-white/10 relative overflow-hidden">
          {/* Subtle decoration pattern */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-500/10 via-transparent to-transparent rounded-full pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center shadow-lg">
              <Disc3 className="w-6 h-6 text-[#1db954] animate-spin-slow" />
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-gray-200 to-[#1db954] bg-clip-text text-transparent">
              TrackFlow
            </span>
            <span className="ml-2 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#1db954]/15 text-[#1db954] border border-[#1db954]/30">
              Beta v3.0
            </span>
          </div>

          {/* Hero Content */}
          <div className="my-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#1db954]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chuẩn giao diện Spotify • 100% Không quảng cáo</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Dòng chảy âm nhạc{" "}
              <span className="bg-gradient-to-r from-[#1db954] to-emerald-300 bg-clip-text text-transparent">
                cho riêng bạn.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-md">
              Tìm kiếm và phát nhạc trực tiếp từ YouTube, khám phá trang cá nhân của mọi nghệ sĩ yêu thích và tự do lưu trữ bài hát theo tài khoản cá nhân.
            </p>

            {/* Feature List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#1db954] flex-shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <span>Phát nhạc YouTube trực tiếp, không dính quảng cáo</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <span>Trang cá nhân nghệ sĩ với toàn bộ bài hát & MV</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300">
                <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 flex-shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <span>Kho "Bài hát đã thích" độc lập cho từng người dùng</span>
              </div>
            </div>
          </div>

          {/* Bottom Quote / Testimonial Box */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
              <p className="text-xs text-gray-300 italic mb-3">
                “Nơi bạn tự do tận hưởng âm nhạc đỉnh cao cùng bạn bè mà không bị làm phiền bởi quảng cáo hay phí thuê bao.”
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1db954] to-emerald-700 flex items-center justify-center text-[10px] font-bold text-black">
                  TF
                </div>
                <div>
                  <p className="text-xs font-bold text-white">TrackFlow Community</p>
                  <p className="text-[10px] text-gray-500">Dành riêng cho bạn bè & cá nhân</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Modern Form (Ordered first on mobile so user sees inputs immediately!) */}
        <div className="order-1 lg:order-2 lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-[#161616]/80">
          <div className="max-w-md w-full mx-auto">
            {/* Mobile Brand Header */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black border border-white/10 flex items-center justify-center shadow-lg">
                  <Disc3 className="w-5 h-5 text-[#1db954] animate-spin-slow" />
                </div>
                <span className="text-xl font-black tracking-tight text-white">
                  TrackFlow
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#1db954]/15 text-[#1db954] border border-[#1db954]/30">
                  Beta v3.0
                </span>
              </div>
            </div>
            
            {/* Pill Tab Switcher */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex p-1 bg-[#222222] rounded-full border border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setTab("login");
                  }}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition ${
                    tab === "login"
                      ? "bg-[#1db954] text-black shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setTab("register");
                  }}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition ${
                    tab === "register"
                      ? "bg-[#1db954] text-black shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Đăng ký
                </button>
              </div>

              <span className="text-xs text-gray-500">
                {tab === "login" ? "Chào mừng trở lại" : "Tài khoản mới"}
              </span>
            </div>

            {/* Title */}
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {tab === "login" ? "Đăng nhập vào TrackFlow" : "Tạo tài khoản của bạn"}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {tab === "login"
                  ? "Nhập tên đăng nhập và mật khẩu để mở kho nhạc cá nhân"
                  : "Đăng ký chỉ mất 5 giây để lưu bài hát yêu thích"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Display Name (Only in Register) */}
              {tab === "register" && (
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Tên hiển thị của bạn
                  </label>
                  <div className="relative">
                    <Sparkles className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ví dụ: Lê Anh Phong"
                      required
                      disabled={loading}
                      className="w-full bg-[#1e1e1e] border border-white/10 focus:border-[#1db954] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition shadow-inner"
                    />
                  </div>
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ví dụ: phongle"
                    required
                    disabled={loading}
                    autoCapitalize="none"
                    className="w-full bg-[#1e1e1e] border border-white/10 focus:border-[#1db954] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition shadow-inner"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full bg-[#1e1e1e] border border-white/10 focus:border-[#1db954] rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#1db954] hover:bg-[#1ed760] disabled:bg-gray-700 disabled:text-gray-400 text-black font-black text-sm py-3.5 rounded-xl transition shadow-[0_0_20px_rgba(29,185,84,0.3)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <span>{tab === "login" ? "Đăng nhập ngay" : "Tạo tài khoản miễn phí"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Guest continue option */}
            {onContinueAsGuest && (
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="text-xs text-gray-400 hover:text-[#1db954] transition hover:underline"
                >
                  Tiếp tục duyệt thử với tư cách khách →
                </button>
              </div>
            )}

            {/* Footer switcher note */}
            <div className="mt-8 pt-5 border-t border-white/10 text-center">
              {tab === "login" ? (
                <p className="text-xs text-gray-400">
                  Chưa có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setTab("register");
                    }}
                    className="text-[#1db954] font-bold hover:underline"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Đã có tài khoản rồi?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setTab("login");
                    }}
                    className="text-[#1db954] font-bold hover:underline"
                  >
                    Đăng nhập tại đây
                  </button>
                </p>
              )}
              {/* Legal disclaimer link */}
              <p className="text-[11px] text-gray-500 mt-4 leading-relaxed">
                Bằng việc tiếp tục, bạn đồng ý với{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white underline decoration-dotted underline-offset-2"
                >
                  Điều khoản Dịch vụ & Pháp lý
                </a>{" "}
                của TrackFlow.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
