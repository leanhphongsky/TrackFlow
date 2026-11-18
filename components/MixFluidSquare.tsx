"use client";

import React from "react";

interface MixFluidSquareProps {
  className?: string;
  color1?: string;
  color2?: string;
}

export default function MixFluidSquare({
  className = "",
  color1 = "#0088cc",
  color2 = "#00d2ff",
}: MixFluidSquareProps) {
  return (
    <div
      className={`relative w-[32px] h-[32px] rounded-[10px] overflow-hidden flex-shrink-0 select-none shadow-md ${className}`}
    >
      {/* Base color */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{ backgroundColor: color1 }}
      />

      {/* Blob Bottom Right */}
      <div
        className="absolute -right-1.5 -bottom-1.5 w-7 h-7 rounded-full blur-[5px] opacity-95 animate-pulse"
        style={{
          backgroundColor: color2,
          animationDuration: "4s",
        }}
      />

      {/* Blob Center Swirl */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-[38%_62%_65%_35%/45%_55%_45%_55%] blur-[4px] opacity-80 animate-spin"
        style={{
          backgroundColor: color2,
          animationDuration: "8s",
        }}
      />

      {/* Blob Top Left */}
      <div
        className="absolute -left-1.5 -top-1.5 w-6 h-6 rounded-full blur-[4px] opacity-85"
        style={{ backgroundColor: color1 }}
      />
    </div>
  );
}
