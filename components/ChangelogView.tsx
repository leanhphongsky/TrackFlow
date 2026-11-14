"use client";

import React from "react";
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
} from "lucide-react";

interface ChangelogViewProps {
  onBack: () => void;
}

export default function ChangelogView({ onBack }: ChangelogViewProps) {
  return (
    <div className="max-w-4xl mx-auto pb-24 animate-in fade-in duration-300">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition group py-1.5 px-3 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-[#181818] to-[#121212] border border-white/10 shadow-2xl relative overflow-hidden mb-8">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#1db954] text-black shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phiên bản Beta v2.4</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-gray-300 flex items-center gap-1.5 border border-white/5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cập nhật ngày 13/11/2026</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Đang trong giai đoạn phát triển (Active Development)
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
            Nhật ký cập nhật hệ thống
          </h1>
          <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
            Tổng hợp các tính năng mới, các nội dung đã được loại bỏ và toàn bộ cải tiến, sửa lỗi trong phiên bản TrackFlow Beta v2.4. Trang web đang trong quá trình phát triển tích cực để mang lại trải nghiệm âm nhạc tốt nhất.
          </p>
        </div>
      </div>

      {/* Main Release Notes Content */}
      <div className="space-y-8">
        {/* SECTION 1: TÍNH NĂNG MỚI (WHAT'S NEW / ADDED) */}
        <div className="bg-[#181818] border border-emerald-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-[#1db954] flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Tính năng mới bổ sung</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  + Mới
                </span>
              </h2>
              <p className="text-xs text-gray-400">Các chức năng được phát triển mới hoàn toàn trong phiên bản này</p>
            </div>
          </div>

          <div className="space-y-4">
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
