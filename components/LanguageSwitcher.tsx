"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface LanguageSwitcherProps {
  variant?: "pill" | "icon" | "minimal";
  className?: string;
}

export default function LanguageSwitcher({
  variant = "pill",
  className = "",
}: LanguageSwitcherProps) {
  const { language, toggleLanguage } = useLanguage();

  const isVi = language === "vi";
  const label = isVi ? "EN" : "VI";
  const flag = isVi ? "🇺🇸" : "🇻🇳";
  const tooltip = isVi
    ? "Chuyển sang Tiếng Anh (Switch to English)"
    : "Chuyển sang Tiếng Việt (Switch to Vietnamese)";

  if (variant === "icon") {
    return (
      <button
        onClick={toggleLanguage}
        className={`group relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition border border-white/5 shadow-sm active:scale-95 ${className}`}
        title={tooltip}
      >
        <Globe className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        <span className="absolute -bottom-1 -right-1 text-[9px] font-black uppercase px-1 py-0.2 rounded-md bg-[#242424] text-white border border-white/10 shadow">
          {language.toUpperCase()}
        </span>
      </button>
    );
  }

  if (variant === "minimal") {
    return (
      <button
        onClick={toggleLanguage}
        className={`flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition py-1 px-2 rounded-lg hover:bg-white/5 ${className}`}
        title={tooltip}
      >
        <Globe className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-bold text-[11px] uppercase tracking-wider">
          {isVi ? "English (EN)" : "Tiếng Việt (VI)"}
        </span>
      </button>
    );
  }

  // Default: Pill button (ideal for Top Navbar)
  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border ${
        isVi
          ? "bg-[#202020] hover:bg-[#282828] text-gray-200 hover:text-white border-white/10 hover:border-white/20"
          : "bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border-emerald-500/30 hover:border-emerald-400/50"
      } active:scale-95 ${className}`}
      title={tooltip}
    >
      <Globe className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
      <span className="text-xs">{isVi ? "VI" : "EN"}</span>
      <span className="text-gray-500 text-[10px]">|</span>
      <span className="text-[11px] text-gray-400 group-hover:text-white">
        {isVi ? "EN" : "VI"}
      </span>
    </button>
  );
}
