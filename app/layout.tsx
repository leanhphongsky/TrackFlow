import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { AuthProvider } from "@/context/AuthContext";
import { PlaylistProvider } from "@/context/PlaylistContext";

export const metadata: Metadata = {
  title: "TrackFlow - Trình Nghe Nhạc Không Quảng Cáo",
  description: "Dự án nghe nhạc trực tuyến không quảng cáo chia sẻ cho nhóm bạn, hỗ trợ tải nhạc lên Cloudinary và lưu dữ liệu trên Neon PostgreSQL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="bg-black text-white antialiased">
        <LanguageProvider>
          <AuthProvider>
            <PlaylistProvider>
              <PlayerProvider>{children}</PlayerProvider>
            </PlaylistProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
