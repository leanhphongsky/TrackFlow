"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { usePlaylist } from "@/context/PlaylistContext";
import { Song } from "@/lib/db";
import {
  Mic,
  Play,
  Heart,
  Plus,
  Users,
  Check,
  UserPlus,
  Radio,
  Sparkles,
  Clock,
  Search,
} from "lucide-react";

interface PodcastsSectionProps {
  subFilter: "all" | "following";
  onPlaySong: (song: Song, queue?: Song[], isPlaylistContext?: boolean) => void;
  onOpenArtist: (artist: { channelId?: string; name?: string }) => void;
}

interface PodcastShow {
  id: string;
  title: string;
  host: string;
  avatar: string;
  banner?: string;
  category: string;
  description: string;
  channelId?: string;
  episodes: {
    id: string;
    videoId: string;
    title: string;
    duration: string;
    publishedAt: string;
    thumbnail: string;
    description: string;
  }[];
}

const FEATURED_PODCASTS: PodcastShow[] = [
  {
    id: "have-a-sip",
    title: "Have A Sip",
    host: "Vietcetera (Thùy Minh)",
    avatar: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&h=300&fit=crop",
    category: "Trò chuyện",
    description: "Không gian trò chuyện cởi mở cùng các khách mời đặc biệt bên ly đồ uống yêu thích.",
    episodes: [
      {
        id: "has_1",
        videoId: "dQw4w9WgXcQ", // fallback placeholder video or real podcast
        title: "Have A Sip #150: Học cách lắng nghe chính mình sau những chông chênh",
        duration: "48:20",
        publishedAt: "2 ngày trước",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=280&fit=crop",
        description: "Lắng nghe câu chuyện vượt qua những giai đoạn khủng hoảng tuổi trẻ và tìm lại sự bình yên nội tại.",
      },
      {
        id: "has_2",
        videoId: "3JZ_D3ELwOQ",
        title: "Have A Sip #149: Đừng để sự kỳ vọng làm mờ đi những giá trị thật",
        duration: "52:15",
        publishedAt: "1 tuần trước",
        thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=500&h=280&fit=crop",
        description: "Cuộc trò chuyện thẳng thắn về áp lực thành công và sự giải phóng khỏi định kiến xã hội.",
      },
    ],
  },
  {
    id: "tan-man-radio",
    title: "Tân Mạn Radio",
    host: "Aly Ngan",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
    category: "Tâm lý & Cuộc sống",
    description: "Những tản mạn nhẹ nhàng về cuộc sống, tình yêu và những đêm muộn một mình.",
    episodes: [
      {
        id: "tm_1",
        videoId: "fJ9rUzIMcZQ",
        title: "Tân Mạn Radio #45: Ta chỉ sống một lần trên đời, cái gì vui thì mình ưu tiên",
        duration: "32:10",
        publishedAt: "3 ngày trước",
        thumbnail: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&h=280&fit=crop",
        description: "Dành cho những ngày bạn cảm thấy mỏi mệt và muốn tìm một chốn bình yên để tự vỗ về mình.",
      },
      {
        id: "tm_2",
        videoId: "kJQP7kiw5Fk",
        title: "Tân Mạn Radio #44: Học cách tha thứ cho những tiếc nuối đã qua",
        duration: "28:40",
        publishedAt: "2 tuần trước",
        thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=280&fit=crop",
        description: "Nhẹ nhàng khép lại quá khứ để bước tiếp với trái tim trọn vẹn yêu thương.",
      },
    ],
  },
  {
    id: "tri-ky-cam-xuc",
    title: "Tri Kỷ Cảm Xúc",
    host: "Web5Ngay",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    category: "Tâm lý & Cuộc sống",
    description: "Tâm sự thẳng thắn, ấm áp mỗi sáng thứ hai giúp bạn nhìn nhận lại cuộc đời và các mối quan hệ.",
    episodes: [
      {
        id: "tkcx_1",
        videoId: "RgKAFK5djSk",
        title: "Tri Kỷ Cảm Xúc: Cách đối diện với cảm giác thua kém bạn bè cùng trang lứa",
        duration: "24:18",
        publishedAt: "4 ngày trước",
        thumbnail: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500&h=280&fit=crop",
        description: "Đừng so sánh chương 1 của mình với chương 20 của người khác. Mỗi người có một múi giờ riêng.",
      },
    ],
  },
  {
    id: "hieu-tv",
    title: "Hiếu TV",
    host: "Nguyễn Ngọc Hiếu",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop",
    category: "Kinh doanh & Tài chính",
    description: "Những bài học thực tế về tự do tài chính, tư duy đầu tư và sự nghiệp từ hơn 20 năm làm việc quốc tế.",
    episodes: [
      {
        id: "htv_1",
        videoId: "L_LUpnjgPso",
        title: "Hiếu TV: Tự do tài chính không phải là kiếm thật nhiều tiền, mà là làm chủ thời gian",
        duration: "38:45",
        publishedAt: "5 ngày trước",
        thumbnail: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=500&h=280&fit=crop",
        description: "Phương pháp xây dựng quỹ dự phòng và lộ trình đạt tự do tài chính vững chắc, an toàn.",
      },
    ],
  },
  {
    id: "thuan-podcast",
    title: "Thuần Podcast",
    host: "Thuần",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop",
    category: "Triết lý & Nghệ thuật",
    description: "Những góc nhìn giản dị, lắng đọng về sách, cuộc sống và vẻ đẹp của sự tĩnh lặng.",
    episodes: [
      {
        id: "thuan_1",
        videoId: "JGwWNGJdvx8",
        title: "Thuần Podcast: Nghệ thuật sống tối giản trong suy nghĩ",
        duration: "26:50",
        publishedAt: "1 tuần trước",
        thumbnail: "https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=500&h=280&fit=crop",
        description: "Bỏ bớt những suy nghĩ vụn vặt để tâm hồn nhẹ nhàng và không gian sáng rõ hơn.",
      },
    ],
  },
  {
    id: "nguyen-huu-tri",
    title: "Nguyễn Hữu Trí Podcast",
    host: "Nguyễn Hữu Trí (Thầy Trí)",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
    category: "Khoa học & Giáo dục",
    description: "Kỹ năng làm việc, rèn luyện tư duy và vượt qua bế tắc cùng chuyên gia huấn luyện Nguyễn Hữu Trí.",
    episodes: [
      {
        id: "nht_1",
        videoId: "OPf0YbXqDm0",
        title: "Nguyễn Hữu Trí: Kỷ luật bản thân mà không cần đến động lực",
        duration: "29:15",
        publishedAt: "1 tuần trước",
        thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&h=280&fit=crop",
        description: "Xây dựng hệ thống thói quen nhỏ để duy trì kỷ luật dài hạn mà không bị kiệt sức.",
      },
    ],
  },
];

const CATEGORIES = [
  "Tất cả",
  "Trò chuyện",
  "Tâm lý & Cuộc sống",
  "Kinh doanh & Tài chính",
  "Triết lý & Nghệ thuật",
  "Khoa học & Giáo dục",
];

export default function PodcastsSection({
  subFilter,
  onPlaySong,
  onOpenArtist,
}: PodcastsSectionProps) {
  const { followedArtists, isFollowingArtist, toggleFollowArtist } = useAuth();
  const { currentSong, isPlaying } = usePlayer();
  const { isFavorite, toggleFavorite } = useAuth();
  const { openAddToPlaylist } = usePlaylist();

  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  // Convert episode to standard Song object for playback
  const playEpisode = (ep: any, show: PodcastShow) => {
    const song: Song = {
      id: `pod_${ep.id}`,
      title: ep.title,
      artist: show.title,
      image_url: ep.thumbnail || show.avatar,
      audio_url: `https://www.youtube.com/watch?v=${ep.videoId}`,
      videoId: ep.videoId,
      duration: ep.duration,
      views: "Podcast",
    };
    onPlaySong(song, [song], false);
  };

  // Followed filter check
  const followedShows = FEATURED_PODCASTS.filter((p) =>
    isFollowingArtist(p.title)
  );

  const displayedShows =
    subFilter === "following"
      ? followedShows
      : selectedCategory === "Tất cả"
      ? FEATURED_PODCASTS
      : FEATURED_PODCASTS.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Podcasts Header Banner */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-purple-950/80 via-indigo-950/60 to-[#121212] border border-white/10 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6">
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl flex-shrink-0">
          <Mic className="w-14 h-14 text-white drop-shadow-md" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>TrackFlow Podcasts & Shows</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
            Podcasts & Chương trình truyền cảm hứng
          </h1>
          <p className="text-gray-300 text-sm max-w-xl leading-relaxed">
            Khám phá các tập podcast sâu sắc về cuộc sống, tâm lý, sự nghiệp và tài chính. Nghe hoàn toàn không quảng cáo.
          </p>
        </div>
      </div>

      {/* Sub-Filter: Following vs All Shows */}
      {subFilter === "following" ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span>Chương trình bạn đang theo dõi ({followedShows.length})</span>
            </h2>
          </div>

          {followedShows.length === 0 ? (
            <div className="rounded-2xl p-8 bg-[#181818]/60 border border-white/5 text-center max-w-xl mx-auto shadow-xl">
              <div className="w-14 h-14 rounded-full bg-[#242424] flex items-center justify-center text-purple-400 mx-auto mb-3">
                <Mic className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Bạn chưa theo dõi podcast nào
              </h3>
              <p className="text-xs text-gray-400 mb-6">
                Bấm vào nút &quot;Theo dõi&quot; ở các podcast bên dưới để nhận thông báo các tập mới nhất!
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {FEATURED_PODCASTS.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() =>
                      toggleFollowArtist({ name: p.title, avatar: p.avatar })
                    }
                    className="flex items-center gap-2 bg-[#252525] hover:bg-white hover:text-black text-white text-xs font-bold px-3 py-1.5 rounded-full transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Theo dõi {p.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {followedShows.map((show) => (
                <div
                  key={show.id}
                  className="p-4 rounded-2xl bg-[#181818] border border-white/5 hover:border-white/10 transition shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={show.avatar}
                      alt={show.title}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-white text-base truncate">
                          {show.title}
                        </h4>
                        <button
                          onClick={() =>
                            toggleFollowArtist({
                              name: show.title,
                              avatar: show.avatar,
                            })
                          }
                          className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 transition flex items-center gap-1 flex-shrink-0"
                        >
                          <Check className="w-3 h-3 text-[#1db954]" />
                          <span>Đang theo dõi</span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{show.host}</p>
                      <p className="text-xs text-gray-300 mt-2 line-clamp-2 leading-relaxed">
                        {show.description}
                      </p>
                    </div>
                  </div>

                  {/* Episodes List */}
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                    {show.episodes.map((ep) => (
                      <div
                        key={ep.id}
                        onClick={() => playEpisode(ep, show)}
                        className="group flex items-center justify-between p-2 rounded-lg bg-[#202020] hover:bg-[#282828] transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-full bg-[#1db954] text-black flex items-center justify-center flex-shrink-0 opacity-80 group-hover:opacity-100 transition shadow">
                            <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate group-hover:text-[#1db954] transition">
                              {ep.title}
                            </p>
                            <span className="text-[10px] text-gray-400">
                              {ep.duration} • {ep.publishedAt}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Sub-Filter: All Shows */
        <div>
          {/* Category Filter Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex-shrink-0 ${
                  selectedCategory === cat
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-[#222222] text-gray-300 hover:bg-[#2c2c2c]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Shows Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedShows.map((show) => {
              const following = isFollowingArtist(show.title);
              return (
                <div
                  key={show.id}
                  className="p-5 rounded-2xl bg-[#181818] border border-white/5 hover:border-white/10 transition shadow-lg flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start gap-4 mb-3">
                      <img
                        src={show.avatar}
                        alt={show.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-md group-hover:scale-105 transition"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-white text-base truncate group-hover:text-purple-400 transition">
                            {show.title}
                          </h4>
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                            {show.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{show.host}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed mb-4">
                      {show.description}
                    </p>

                    {/* Latest Episode Preview */}
                    {show.episodes.length > 0 && (
                      <div
                        onClick={() => playEpisode(show.episodes[0], show)}
                        className="p-3 rounded-xl bg-[#222222] hover:bg-[#2a2a2a] transition cursor-pointer border border-white/5 group/ep"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1db954] text-black flex items-center justify-center flex-shrink-0 shadow">
                            <Play className="w-4 h-4 fill-black ml-0.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate group-hover/ep:text-[#1db954] transition">
                              {show.episodes[0].title}
                            </p>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{show.episodes[0].duration}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() =>
                        toggleFollowArtist({
                          name: show.title,
                          avatar: show.avatar,
                        })
                      }
                      className={`text-xs font-bold px-3 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                        following
                          ? "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400"
                          : "bg-white text-black hover:bg-[#1db954]"
                      }`}
                    >
                      {following ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#1db954]" />
                          <span>Đang theo dõi</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Theo dõi</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => playEpisode(show.episodes[0], show)}
                      className="text-xs font-semibold text-gray-400 hover:text-white transition flex items-center gap-1"
                    >
                      <span>Nghe ngay</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
