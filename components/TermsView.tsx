"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Scale,
  FileText,
  Lock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Mail,
  ArrowLeft,
  Sparkles,
  Server,
  Cloud,
  FileCheck,
} from "lucide-react";
import YoutubeIcon from "@/components/icons/YoutubeIcon";

interface TermsViewProps {
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function TermsView({ onBack, showBackButton = true }: TermsViewProps) {
  const [activeSection, setActiveSection] = useState<string>("overview");

  const sections = [
    { id: "overview", label: "Tổng quan & Bản chất dự án" },
    { id: "youtube", label: "Cơ chế YouTube IFrame & Bản quyền" },
    { id: "upload", label: "Lưu trữ nhạc cá nhân (Cloud)" },
    { id: "law", label: "Căn cứ pháp lý (VN & Quốc tế)" },
    { id: "dmca", label: "Quy trình gỡ bỏ nội dung (DMCA)" },
    { id: "privacy", label: "Bảo mật & Quyền riêng tư" },
  ];

  return (
    <div className="w-full h-full overflow-y-auto bg-gradient-to-b from-[#181818] via-[#121212] to-black text-gray-200 select-text p-6 md:p-10 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-4">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại ứng dụng</span>
            </button>
          )}

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Tuyên bố Pháp lý & Điều khoản Dịch vụ
            </span>
            <span className="text-xs text-gray-400 px-2 py-0.5 rounded bg-white/5 border border-white/5">
              Phiên bản 1.2 — Hiệu lực từ: Tháng 11/2026
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Điều khoản Dịch vụ & Minh bạch Pháp lý
          </h1>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            Tài liệu này giải thích chi tiết kiến trúc kỹ thuật của <strong className="text-white font-semibold">TrackFlow</strong>, 
            phương thức vận hành luồng phát trực tuyến và các căn cứ pháp luật khẳng định dự án hoạt động minh bạch, 
            hợp pháp, tuân thủ quyền sở hữu trí tuệ theo luật pháp Việt Nam và thông lệ quốc tế.
          </p>
        </div>

        {/* Highlight Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/10 flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-[#1db954]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">100% Phi thương mại</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Hoàn toàn miễn phí, không bán thuê bao, không chèn banner quảng cáo của bên thứ ba để trục lợi.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/10 flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <YoutubeIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Chuẩn YouTube IFrame SDK</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Không rip hay lưu file lậu. Mọi lượt phát đều tính view và doanh thu chính đáng cho nghệ sĩ trên YouTube.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/10 flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Tuân thủ Luật SHTT & DMCA</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Áp dụng nguyên tắc Safe Harbor, quyền miễn trừ học tập cá nhân theo Luật SHTT 2022 và Đạo luật DMCA.
            </p>
          </div>
        </div>

        {/* Quick Jump Anchors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 text-xs">
          {sections.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              onClick={() => setActiveSection(sec.id)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition font-medium ${
                activeSection === sec.id
                  ? "bg-white text-black font-bold"
                  : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {sec.label}
            </a>
          ))}
        </div>

        {/* Section 1: Overview */}
        <section id="overview" className="space-y-4 scroll-mt-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-[#1db954]">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              1. Bản chất & Mục đích của TrackFlow
            </h2>
          </div>
          <div className="bg-[#181818]/80 border border-white/10 rounded-2xl p-5 md:p-6 space-y-4 text-sm leading-relaxed text-gray-300">
            <p>
              <strong className="text-white">TrackFlow</strong> là một nền tảng trình phát âm thanh và video cá nhân (Personal Media Player Interface) 
              được xây dựng nhằm mục đích nghiên cứu học thuật, trải nghiệm kỹ thuật lập trình web hiện đại (Next.js 14, React Server Components, IFrame Streaming Architecture) 
              và tối ưu hóa trải nghiệm nghe nhạc cá nhân của người dùng.
            </p>
            <ul className="space-y-2 list-none">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1db954] mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-white">Dịch vụ phi lợi nhuận (Zero-monetization):</strong> TrackFlow không thu bất kỳ khoản phí thành viên nào, không bán gói Premium, và tuyệt đối không khai thác quảng cáo trung gian trục lợi từ tác phẩm của nghệ sĩ.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1db954] mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-white">Không can thiệp bản quyền:</strong> Mọi nhãn hiệu, nghệ danh, bài hát, tệp âm thanh, video và lời bài hát hoàn toàn thuộc quyền sở hữu độc quyền của nghệ sĩ, tác giả và nhà phát hành tương ứng.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 2: YouTube IFrame Mechanics */}
        <section id="youtube" className="space-y-4 scroll-mt-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <YoutubeIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              2. Cơ chế Kỹ thuật YouTube IFrame — Khẳng định Không Vi phạm Bản quyền
            </h2>
          </div>

          <div className="bg-[#181818]/80 border border-white/10 rounded-2xl p-5 md:p-6 space-y-4 text-sm leading-relaxed text-gray-300">
            <p>
              Nhiều người dùng và đơn vị pháp lý thường lo ngại về việc ứng dụng web phát nhạc có vi phạm bản quyền hay không. 
              TrackFlow xin giải thích rõ ràng cơ chế kỹ thuật để khẳng định tính pháp lý:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
              <div className="p-4 rounded-xl bg-black/50 border border-red-500/20 space-y-2">
                <h4 className="text-red-400 font-bold flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Hành vi Vi phạm (TrackFlow KHÔNG LÀM)
                </h4>
                <ul className="text-xs space-y-1.5 text-gray-400">
                  <li>• Tải lậu (rip audio) video YouTube về server máy chủ.</li>
                  <li>• Giải mã đường link stream (de-obfuscation) để lưu trữ tệp mp3 lậu.</li>
                  <li>• Tái phân phối các tệp tin chứa nhạc có bản quyền cho người khác.</li>
                  <li>• Chặn lượt xem hoặc làm mất doanh thu quảng cáo của nghệ sĩ.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-black/50 border border-[#1db954]/20 space-y-2">
                <h4 className="text-[#1db954] font-bold flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Cơ chế của TrackFlow (100% HỢP PHÁP)
                </h4>
                <ul className="text-xs space-y-1.5 text-gray-300">
                  <li>• Nhúng trực tiếp thông qua <strong>YouTube IFrame Player API</strong> chính thức.</li>
                  <li>• Luồng phát đi thẳng từ máy chủ Google/YouTube đến máy tính người dùng.</li>
                  <li>• Lượt xem được tính đầy đủ cho kênh chính chủ của nghệ sĩ.</li>
                  <li>• Tôn trọng triệt để quyền bật/tắt nhúng ("Allow Embedding") của tác giả.</li>
                </ul>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
              <p>
                <strong className="text-white">Điều khoản nhà phát triển YouTube (YouTube Terms of Service):</strong> Google cho phép mọi trang web bên thứ ba nhúng nội dung video thông qua IFrame Player API chuẩn với điều kiện không tải trái phép nội dung vào bộ nhớ máy chủ riêng. TrackFlow tuân thủ nghiêm ngặt nguyên tắc này.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Private Cloud Storage */}
        <section id="upload" className="space-y-4 scroll-mt-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Cloud className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              3. Lưu trữ Bài hát Cá nhân (Private Cloud Storage)
            </h2>
          </div>

          <div className="bg-[#181818]/80 border border-white/10 rounded-2xl p-5 md:p-6 space-y-4 text-sm leading-relaxed text-gray-300">
            <p>
              Đối với tính năng <strong className="text-white">"Đăng bài hát MP3"</strong> lên đám mây:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Server className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Mục đích sử dụng cá nhân nội bộ</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Tính năng này cho phép người dùng tự lưu trữ các bản ghi âm cá nhân, bản phối demo của bản thân, hoặc các tệp tin âm thanh họ sở hữu hợp pháp để nghe trên các thiết bị riêng của mình.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Cô lập dữ liệu người dùng tuyệt đối (Multi-User Isolation)</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Hệ thống cơ sở dữ liệu PostgreSQL của TrackFlow được cấu hình kiểm tra quyền nghiêm ngặt theo ID người dùng (<code className="text-[#1db954]">WHERE user_id = current_user.id</code>). 
                    Người dùng khác tuyệt đối không thể xem, tìm kiếm hay nghe trộm các tệp tin do tài khoản của bạn tải lên.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Legal Framework */}
        <section id="law" className="space-y-4 scroll-mt-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              4. Căn cứ Pháp luật Việt Nam & Quốc tế
            </h2>
          </div>

          <div className="bg-[#181818]/80 border border-white/10 rounded-2xl p-5 md:p-6 space-y-4 text-sm leading-relaxed text-gray-300">
            <p>
              Hoạt động của TrackFlow được bảo vệ và công nhận dựa trên các văn bản pháp luật hiện hành sau:
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#1db954]" />
                  Luật Sở hữu Trí tuệ Việt Nam (Luật số 50/2005/QH11, sửa đổi bổ sung năm 2022)
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  <strong>Điều 25 (Các trường hợp ngoại lệ không xâm phạm quyền tác giả):</strong> Cho phép tổ chức, cá nhân sử dụng tác phẩm đã công bố để phục vụ việc học tập, nghiên cứu cá nhân và không nhằm mục đích thương mại.
                  TrackFlow là sản phẩm công nghệ phi lợi nhuận, đóng vai trò giao diện trung gian hiển thị tài nguyên đã được các chủ sở hữu công bố công khai trên Internet.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-400" />
                  Học thuyết Fair Use (Sử dụng Hợp lý - 17 U.S. Code § 107)
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Theo luật bản quyền Hoa Kỳ và thông lệ quốc tế, việc xây dựng giao diện tùy biến (custom front-end) phục vụ nghiên cứu khoa học máy tính và trải nghiệm phi lợi nhuận được xem là <em>Fair Use</em> khi nó không gây thiệt hại tới thị trường hay doanh thu gốc của chủ thể quyền, mà ngược lại còn kích thích tăng số lượt xem cho video gốc.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-purple-400" />
                  Nguyên tắc "Safe Harbor" (Bến đỗ an toàn theo DMCA 17 U.S.C. § 512)
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Bảo vệ các nhà cung cấp nền tảng công nghệ trung gian không phải chịu trách nhiệm pháp lý trực tiếp đối với các nội dung do người dùng tự tải lên hoặc liên kết đến từ các dịch vụ bên ngoài, miễn là nền tảng có quy trình tiếp nhận và gỡ bỏ kịp thời khi nhận được khiếu nại.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: DMCA / Content Takedown */}
        <section id="dmca" className="space-y-4 scroll-mt-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              5. Quy trình Tiếp nhận Khiếu nại & Gỡ bỏ Nội dung (DMCA Notice)
            </h2>
          </div>

          <div className="bg-[#181818]/80 border border-white/10 rounded-2xl p-5 md:p-6 space-y-4 text-sm leading-relaxed text-gray-300">
            <p>
              TrackFlow cam kết tôn trọng tuyệt đối quyền tác giả và quyền liên quan của mọi nghệ sĩ, hãng ghi âm và nhà phát hành. 
              Nếu bạn là chủ sở hữu quyền tác giả hợp pháp của một ca khúc hoặc video và mong muốn nội dung của mình không xuất hiện trong kết quả tìm kiếm của TrackFlow:
            </p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <p className="font-semibold text-white">Vui lòng gửi email thông báo kèm các thông tin sau:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-300">
                <li>Họ tên, pháp nhân và thông tin liên hệ của chủ thể quyền hoặc người đại diện được ủy quyền hợp pháp.</li>
                <li>Tên tác phẩm, đường link YouTube cụ thể cần hạn chế/chặn hiển thị trên hệ thống.</li>
                <li>Tài liệu chứng minh quyền sở hữu hoặc giấy ủy quyền hợp lệ.</li>
              </ol>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-[#1db954]/20 text-xs text-emerald-300">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#1db954]" />
              <div>
                <strong>Cam kết xử lý nhanh chóng:</strong> Ban quản trị sẽ tiến hành xác minh và đưa đường dẫn tác phẩm vào danh sách chặn (Blacklist) trong vòng <strong>24 – 48 giờ làm việc</strong> kể từ khi nhận được thông báo hợp lệ.
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Privacy & User Data */}
        <section id="privacy" className="space-y-4 scroll-mt-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              6. Quyền Riêng tư & Bảo mật Thông tin Tài khoản
            </h2>
          </div>

          <div className="bg-[#181818]/80 border border-white/10 rounded-2xl p-5 md:p-6 space-y-3 text-sm leading-relaxed text-gray-300">
            <p>
              Chúng tôi xem trọng quyền riêng tư của bạn và cam kết:
            </p>
            <ul className="text-xs space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1db954] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Mã hóa mật khẩu an toàn:</strong> Toàn bộ mật khẩu của tài khoản được băm mã hóa một chiều bằng thuật toán an toàn <code className="text-[#1db954]">bcrypt</code> trước khi lưu vào cơ sở dữ liệu. Ngay cả quản trị viên máy chủ cũng không thể xem mật khẩu gốc của bạn.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1db954] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Không bán dữ liệu người dùng:</strong> TrackFlow không thu thập dữ liệu nhạy cảm và tuyệt đối không bao giờ chia sẻ hay bán thông tin người dùng cho bất kỳ bên thứ ba hay công ty quảng cáo nào.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1db954] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Quyền kiểm soát dữ liệu:</strong> Người dùng có toàn quyền xóa tài khoản, xóa bài hát tải lên và danh sách yêu thích của mình bất kỳ lúc nào.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Bottom Disclaimers */}
        <div className="pt-6 border-t border-white/10 text-center space-y-2 text-xs text-gray-500">
          <p>
            TrackFlow không liên kết chính thức với YouTube LLC, Spotify AB hay bất kỳ hãng đĩa nào được đề cập.
          </p>
          <p>
            © 2026 TrackFlow Team. Phát triển với tình yêu âm nhạc và tinh thần tôn trọng quyền tác giả.
          </p>
        </div>

      </div>
    </div>
  );
}
