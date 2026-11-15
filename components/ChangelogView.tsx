"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Sparkles,
  PlusCircle,
  MinusCircle,
  Wrench,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Disc3,
  Layers,
  Flame,
  ShieldCheck,
  Music,
  ListPlus,
  Tv,
  Waves,
  Download,
  Smartphone,
  Radio,
  Layout,
  TrendingUp,
  Shuffle,
  Palette,
} from "lucide-react";

interface ChangelogViewProps {
  onBack: () => void;
}

export default function ChangelogView({ onBack }: ChangelogViewProps) {
  const { t, language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-in fade-in duration-300">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition group py-1.5 px-3 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t.common.back}</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-[#181818] to-[#121212] border border-white/10 shadow-2xl relative overflow-hidden mb-8">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#1db954] text-black shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "vi" ? "Phiên bản Beta v3.5" : "Version Beta v3.5"}</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-gray-300 flex items-center gap-1.5 border border-white/5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === "vi" ? "Cập nhật ngày 15/11/2026" : "Updated November 15, 2026"}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {language === "vi" ? "Đang trong giai đoạn phát triển (Active Development)" : "Active Development"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
            {language === "vi" ? "Nhật ký cập nhật hệ thống — Beta v3.5" : "System Changelog & Release Notes — Beta v3.5"}
          </h1>
          <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
            {language === "vi"
              ? "Phiên bản nâng cấp giao diện toàn diện lấy cảm hứng từ ứng dụng Liner: Thu gọn thanh điều hướng thành Slim Icon Rail 72px, phân tách Bảng xếp hạng thành tab riêng biệt, hệ thống 4 Playlist Daily Mixes theo chủ đề được trộn ngẫu nhiên với ảnh bìa nhận diện độc quyền, trang chi tiết MixDetailView và tối ưu hóa trải nghiệm nghe nhạc không gián đoạn."
              : "Comprehensive UI redesign inspired by Liner: Slim Icon Rail 72px, independent Charts tab, 4 curated randomized Daily Mixes with exclusive cover art, MixDetailView page, and bilingual Tiếng Việt & English UI localization."}
          </p>
        </div>
      </div>

      {/* Main Release Notes Content */}
      <div className="space-y-8">
        {/* SECTION 1: TÍNH NĂNG MỚI TRONG V3.5 */}
        <div className="bg-[#181818] border border-emerald-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-[#1db954] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Tính năng mới &amp; Cải tiến nổi bật (Beta v3.5)</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  + Mới v3.5
                </span>
              </h2>
              <p className="text-xs text-gray-400">Các cải tiến giao diện Liner và tính năng Daily Mixes vừa được phát hành</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* V3.5 Feature 1: Liner-Inspired UI Redesign */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-[#202020] border border-emerald-500/30 space-y-1.5 shadow-md">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Layout className="w-4 h-4 text-[#1db954]" />
                <h3 className="text-emerald-400">Cải tổ giao diện hiện đại lấy cảm hứng từ Liner</h3>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed pl-6">
                Thu gọn thanh điều hướng bên trái thành <strong>Slim Icon Rail 72px</strong> siêu gọn gàng, giải phóng gần 200px chiều ngang màn hình. Đi kèm <strong>Smart Library Flyout</strong> trượt ra mượt mà khi click biểu tượng Thư viện và thanh <strong>Player Dock</strong> bo tròn tối giản ở đáy màn hình.
              </p>
            </div>

            {/* V3.5 Feature 2: Dedicated Charts Tab */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-[#202020] border border-emerald-500/30 space-y-1.5 shadow-md">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-emerald-400">Tách Bảng xếp hạng thành Tab riêng biệt</h3>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed pl-6">
                Chuyển toàn bộ Bảng xếp hạng bài hát và Top nghệ sĩ thịnh hành (24h Velocity Growth theo 4 khu vực: Việt Nam, Hàn Quốc, Âu Mỹ, Châu Á) thành <strong>Tab độc lập</strong> trên thanh Rail và thanh phân loại đầu trang. Trang chủ được dọn sạch hoàn toàn, mang lại không gian thoáng đãng và tốc độ tải trang vượt trội.
              </p>
            </div>

            {/* V3.5 Feature 3: Authentic Thematic Daily Mixes */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-[#202020] border border-emerald-500/30 space-y-1.5 shadow-md">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Shuffle className="w-4 h-4 text-emerald-400" />
                <h3 className="text-emerald-400">Hệ thống 4 Playlist Daily Mixes theo chủ đề được trộn ngẫu nhiên</h3>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed pl-6">
                Các MIX trên trang chủ là <strong>các playlist thực thụ được phân loại theo chủ đề âm nhạc</strong> (MIX 1: V-Pop &amp; Indie Việt, MIX 2: Chill, Lo-Fi &amp; Coffee Acoustic, MIX 3: US-UK Pop &amp; Hip-Hop, MIX 4: K-Pop &amp; Asian Vibes). Thuật toán Fisher-Yates tự động xáo trộn bài hát ngẫu nhiên. Đi kèm trang chi tiết <code>MixDetailView</code> với tính năng Phát trộn, Trộn lại và <strong>Lưu thành Playlist riêng</strong> vào Thư viện.
              </p>
            </div>

            {/* V3.5 Feature 4: Fixed Signature Mix Visuals */}
            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Palette className="w-4 h-4 text-purple-400" />
                <h3>Bộ ảnh bìa nhận diện cố định (Fixed Signature Covers)</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Mỗi MIX được gắn một <strong>artwork nhận diện đặc trưng cố định</strong> lưu trữ cục bộ tại <code>public/mixes/</code> với phong cách hình ảnh riêng biệt, chữ typography Liner <code>MIX 1 - 4</code> cỡ lớn sắc nét và nút Play xanh tròn nổi lên khi rê chuột.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: BẢN CẬP NHẬT TRƯỚC (BETA V3.0) */}
        <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-[#1db954] flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Tính năng mới bổ sung (Beta v3.0)</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  + Mới v3.0
                </span>
              </h2>
              <p className="text-xs text-gray-400">Các chức năng đột phá vừa được phát triển trong phiên bản 3.0</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* V3.0 Feature 1: Playlist Importer */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-[#202020] border border-emerald-500/30 space-y-1.5 shadow-md">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Download className="w-4 h-4 text-[#1db954]" />
                <h3 className="text-emerald-400">1-Click Playlist Importer (Nhập Playlist Tự Động từ Spotify &amp; YouTube)</h3>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed pl-6">
                Chuyển nhà sang TrackFlow cực nhanh mà không phải tạo lại danh sách bài hát từ đầu! Hỗ trợ dán đường link playlist công khai từ <strong>Spotify</strong> (Playlist &amp; Album), <strong>YouTube &amp; YouTube Music</strong>, hoặc dán danh sách văn bản bất kỳ (Batch Text: <code>Tên bài - Ca sĩ</code>). Thuật toán Smart Matcher tự động quét, tìm bản audio chuẩn nhất trên YouTube và lưu thẳng vào tài khoản của bạn.
              </p>
            </div>

            {/* V3.0 Feature 2: Background Playback & MediaSession */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-[#202020] border border-emerald-500/30 space-y-1.5 shadow-md">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Radio className="w-4 h-4 text-emerald-400" />
                <h3 className="text-emerald-400">Phát nhạc nền liên tục khi chuyển App &amp; Tích hợp Media Session</h3>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed pl-6">
                Khắc phục triệt để hiện tượng nhạc tự động tạm dừng khi click sang ứng dụng khác (Word, VS Code, Discord, v.v.) do cơ chế Native Window Occlusion của Chromium. Đồng thời tích hợp chuẩn <code>navigator.mediaSession</code> cấp hệ điều hành (hỗ trợ điều khiển bằng phím media trên bàn phím, widget âm lượng Windows và hiển thị ảnh bìa, tên ca khúc chuẩn xác).
              </p>
            </div>

            {/* V3.0 Feature 3: Mobile Bottom Navigation & Mini Player */}
            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <h3>Giao diện di động chuyên dụng: Bottom Navigation &amp; Floating Mini Player</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Thiết kế lại toàn bộ trải nghiệm cho người dùng di động và màn hình cảm ứng: Thanh điều hướng đáy (Bottom Navigation Bar) cố định thuận tiện một tay, thanh Mini Player dạng viên thuốc nổi (Floating Pill) chuẩn Spotify, menu ngăn kéo trượt (Mobile Drawer) và tối ưu cuộn cho màn hình đăng ký/đăng nhập.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Waves className="w-4 h-4 text-purple-400" />
                <h3>Chế độ Chill &amp; Visualizer sóng âm 360° đồng bộ nhịp điệu</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Chế độ trải nghiệm âm nhạc cực chill với vòng sóng âm 360° phát sáng rực rỡ quanh đĩa nhạc xoay tròn, dải sóng equalizer dưới đáy màn hình, đồng hồ Dynamic Island và bộ đổi hình nền nghệ thuật (Windows 11 Bloom Dark, Lofi City, Deep Space...). Sóng âm tự động phản hồi độ lớn âm lượng và nhịp bass thực tế.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Layers className="w-4 h-4 text-[#1db954]" />
                <h3>Thanh điều hướng phân loại Spotify (Category Filter Bar)</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Bổ sung thanh lọc danh mục chuẩn Spotify trên đầu trang: <strong>Tất cả</strong>, <strong>Âm nhạc</strong> (tự động xuất hiện nút phụ <strong>Đang theo dõi</strong> để hiển thị ca khúc của nghệ sĩ bạn follow), <strong>Podcasts</strong> (tự động hiển thị các show truyền cảm hứng và nút theo dõi), và danh mục <strong>Sách nói</strong> gắn nhãn &quot;Đang phát triển&quot;.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Disc3 className="w-4 h-4 text-[#1db954]" />
                <h3>Ghi nhớ mốc thời gian &amp; bài hát khi tắt/tải lại trang (Playback Persistence)</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Khi bạn đang nghe nhạc mà vô tình tắt tab hoặc reload lại trang web, TrackFlow tự động lưu trữ chính xác bài hát và mốc thời gian đang nghe dở (timestamp scrubber), phục hồi ngay lập tức để bạn tiếp tục thưởng thức mà không bị mất dấu.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ListPlus className="w-4 h-4 text-[#1db954]" />
                <h3>Hệ thống tạo &amp; quản lý Playlist cá nhân chuẩn Spotify</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Người dùng có thể tạo không giới hạn danh sách phát cá nhân, tự động đặt tên theo số thứ tự, chỉnh sửa tên và mô tả trực tiếp (Inline Edit), xóa playlist và phát toàn bộ bài hát theo hàng đợi (Queue) liền mạch. Ảnh bìa playlist được tự động trích xuất từ bài hát đầu tiên chuẩn phong cách Spotify.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <PlusCircle className="w-4 h-4 text-[#1db954]" />
                <h3>Modal &amp; Nút &quot;Thêm vào danh sách phát&quot; toàn diện</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Bổ sung nút dấu cộng <strong>(+)</strong> trên tất cả vị trí: Trang nghệ sĩ, Bảng xếp hạng thịnh hành, Kết quả tìm kiếm, Thẻ bài hát, Player bar và Bảng phát nhạc bên phải. Modal cho phép tìm kiếm nhanh playlist, tạo playlist mới ngay trong modal và đánh dấu checkmark trực quan nếu bài hát đã có trong danh sách.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3>Bảng xếp hạng thịnh hành đa khu vực &amp; Tăng trưởng 24h</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Phân chia bảng xếp hạng bài hát và nghệ sĩ theo từng thị trường cụ thể: <strong>V-Pop (Việt Nam)</strong>, <strong>K-Pop (Hàn Quốc)</strong>, <strong>Âu Mỹ (US-UK)</strong> và <strong>Toàn cầu (All)</strong>. Thứ hạng bài hát được tính toán dựa trên mức độ tăng trưởng lượt xem thực tế trong vòng 24 giờ qua (<code>+views / 24h</code>).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Music className="w-4 h-4 text-sky-400" />
                <h3>Hiển thị lượt xem thực tế trên từng bài hát</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Mỗi bài hát trên bảng xếp hạng, trang nghệ sĩ và kết quả tìm kiếm đều hiển thị số lượt xem thực tế (ví dụ: <code>378.1 Tr lượt xem</code> hoặc <code>2.4 Tr lượt xem</code>) ngay cạnh nút yêu thích.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3>Lời bài hát đồng bộ thời gian thực (LRC Synced Lyrics) &amp; Bấm tua nhạc</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Tích hợp cơ sở dữ liệu mở LRCLIB. Lời bài hát tự động highlight và cuộn mượt mà theo từng giây bài hát phát. Người nghe có thể nhấp vào bất kỳ câu hát nào để phát ngay đoạn nhạc đó (Click-to-seek).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Tv className="w-4 h-4 text-emerald-400" />
                <h3>Tự động mở bảng Now Playing bên phải khi phát bài hát</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Mỗi khi người dùng chọn nghe một bài hát bất kỳ, giao diện bên phải sẽ tự động hiển thị để cung cấp trải nghiệm trọn vẹn: xem ảnh bìa / Canvas video, theo dõi lời bài hát và thông tin nghệ sĩ.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <h3>Trang Điều khoản &amp; Khẳng định tính pháp lý</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Bổ sung văn bản pháp lý minh bạch giải thích cơ chế hoạt động: phát nhạc qua YouTube Iframe API chính thức và Cloudinary, khẳng định TrackFlow không vi phạm bản quyền hay khai thác nội dung trái phép.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: NHỮNG GÌ ĐÃ LOẠI BỎ (WHAT WAS REMOVED) */}
        <div className="bg-[#181818] border border-rose-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <MinusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Những nội dung &amp; hạn chế đã loại bỏ</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">
                  Đã loại bỏ
                </span>
              </h2>
              <p className="text-xs text-gray-400">Loại bỏ các yếu tố gây phiền toái hoặc hạn chế trải nghiệm người dùng</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <MinusCircle className="w-4 h-4 text-rose-400" />
                <h3>Loại bỏ 100% video YouTube Shorts</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Toàn bộ video định dạng Shorts (thời lượng dưới 60 giây, dạng video dọc hoặc link /shorts/) đã bị lọc bỏ hoàn toàn khỏi bộ tìm kiếm và bảng xếp hạng âm nhạc.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <MinusCircle className="w-4 h-4 text-rose-400" />
                <h3>Loại bỏ video rác không liên quan đến âm nhạc</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Lọc bỏ các video tin tức, podcast trò chuyện, livestream, game hoặc video reaction dài để đảm bảo mọi kết quả trả về đều là các ca khúc âm nhạc và MV chính thức.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <MinusCircle className="w-4 h-4 text-rose-400" />
                <h3>Loại bỏ lớp mờ (mask blur) che khuất thông số nghệ sĩ</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Gỡ bỏ lớp mask làm mờ bên trong banner nghệ sĩ vốn làm tối và che mất thông tin số người đăng ký, tổng lượt xem và handle của nghệ sĩ.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <MinusCircle className="w-4 h-4 text-rose-400" />
                <h3>Loại bỏ sự phụ thuộc vào hạn ngạch YouTube API Token (Quota)</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Chuyển đổi toàn bộ cơ chế tìm kiếm và lấy thông tin sang module zero-quota hiệu năng cao, xoá bỏ hoàn toàn nguy cơ bị giới hạn hạn ngạch hoặc lỗi dừng dịch vụ đột ngột.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: CẢI TIẾN & SỬA LỖI (IMPROVEMENTS & BUG FIXES) */}
        <div className="bg-[#181818] border border-sky-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Cải tiến giao diện &amp; Sửa lỗi (Fixes)</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400">
                  Cải tiến
                </span>
              </h2>
              <p className="text-xs text-gray-400">Nâng cấp trải nghiệm người dùng và khắc phục các lỗi trước đó</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <h3>Sửa lỗi bộ lọc tìm kiếm khiến không hiển thị đúng bài hát cụ thể</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Khắc phục lỗi khi người dùng gõ tìm tên một bài hát cụ thể nhưng bộ lọc quá khắt khe khiến bài hát biến mất. Giờ đây thuật toán tìm kiếm nhận diện chính xác ý định và trả về bài hát phù hợp nhất ở đầu danh sách.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <h3>Cải tiến hiệu ứng chuyển đổi mờ (Ambient Blur Transition)</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Tạo dải ambient blur mượt mà giữa banner nghệ sĩ và danh sách bài hát bên dưới với khoảng đệm hợp lý, không làm đè lên nút chức năng &quot;Phát tất cả&quot; hay &quot;Đang theo dõi&quot;.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <h3>Tính năng Thu gọn / Mở rộng bảng xếp hạng</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Mặc định bảng xếp hạng bài hát chỉ hiển thị top 5 bài dẫn đầu để tiết kiệm diện tích cuộn trang. Người dùng có thể bấm nút &quot;Xem thêm bài hát thịnh hành&quot; để mở rộng danh sách đầy đủ.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#202020] border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <h3>Khóa tương tác chống click nhầm trên Canvas Video</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                Thêm lớp màn khóa trong suốt bảo vệ iframe YouTube, ngăn ngừa việc người dùng vô tình nhấp chuột vào các liên kết ngoài hoặc quảng cáo nhúng trên video.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
