"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "vi" | "en";

export interface Translations {
  nav: {
    home: string;
    charts: string;
    search: string;
    library: string;
    chill: string;
    importPlaylist: string;
    uploadMp3: string;
    upload: string;
    terms: string;
    changelog: string;
    betaBadge: string;
    yourLibrary: string;
    yourPlaylists: string;
    createPlaylist: string;
    likedSongs: string;
    followedArtists: string;
    artist: string;
    emptyLibrary: string;
    noPlaylistsYet: string;
    all: string;
    music: string;
    following: string;
    podcasts: string;
    audiobooks: string;
    inDevelopment: string;
    audiobooksDevTooltip: string;
    musicCharts: string;
    trendingAndBreakout: string;
    chartsHeroDesc: string;
    searchResultsFor: string;
    matchingArtists: string;
    songs: string;
    recentLikedSongs: string;
    viewAll: string;
    searchPlaceholder: string;
    searchButton: string;
    uploadButton: string;
    login: string;
    logout: string;
    guest: string;
  };
  mixes: {
    title: string;
    subtitle: string;
    hint: string;
    playMix: string;
    dailyMix: string;
    mix1Theme: string;
    mix1Desc: string;
    mix1Artists: string;
    mix2Theme: string;
    mix2Desc: string;
    mix2Artists: string;
    mix3Theme: string;
    mix3Desc: string;
    mix3Artists: string;
    mix4Theme: string;
    mix4Desc: string;
    mix4Artists: string;
    backToHome: string;
    updatedDaily: string;
    badgeShuffle: string;
    randomMixBadge: string;
    songsCount: string;
    shufflePlay: string;
    pause: string;
    reshuffle: string;
    saveToLibrary: string;
    saving: string;
    saved: string;
    savedSuccess: string;
    songsInMix: string;
    tracklistTitle: string;
    clickToPlay: string;
    notableArtists: string;
    featuredArtists: string;
  };
  charts: {
    title: string;
    subtitle: string;
    backToHome: string;
    trendingSongsTitle: string;
    velocityBadge: string;
    allRegionsDesc: string;
    playAll: string;
    refresh24h: string;
    collapseTop10: string;
    expandAll: string;
    regions: {
      all: string;
      vpop: string;
      kpop: string;
      usuk: string;
      asia: string;
    };
  };
  home: {
    recentLiked: string;
    viewAll: string;
    uploadedSongs: string;
    noUploadedSongs: string;
    noUploadedDesc: string;
    uploadPrompt: string;
  };
  player: {
    previous: string;
    next: string;
    play: string;
    pause: string;
    loop: string;
    repeat: string;
    favorite: string;
    unfavorite: string;
    addToPlaylist: string;
    chillMode: string;
    lyrics: string;
    karaokeLyrics: string;
    nowPlayingInfo: string;
    songInfo: string;
    mute: string;
    unmute: string;
    volume: string;
  };
  footer: {
    platformDesc: string;
    changelogLink: string;
    legalLink: string;
  };
  auth: {
    loginTitle: string;
    registerTitle: string;
    username: string;
    password: string;
    displayName: string;
    continueAsGuest: string;
    noAdsBadge: string;
  };
}

const translations: Record<Language, Translations> = {
  vi: {
    nav: {
      home: "Trang chủ",
      charts: "Bảng xếp hạng",
      search: "Tìm kiếm",
      library: "Thư viện & Danh sách phát",
      chill: "Chế độ Chill & Visualizer 360°",
      importPlaylist: "Nhập playlist từ Spotify hoặc YouTube",
      uploadMp3: "Đăng bài hát MP3",
      upload: "Đăng nhạc",
      terms: "Điều khoản dịch vụ & Pháp lý",
      changelog: "Nhật ký cập nhật",
      betaBadge: "Beta v3.5",
      yourLibrary: "Thư viện của bạn",
      yourPlaylists: "Danh sách phát",
      createPlaylist: "Tạo danh sách phát",
      likedSongs: "Bài hát đã thích",
      followedArtists: "Nghệ sĩ đang theo dõi",
      artist: "Nghệ sĩ",
      emptyLibrary: "Bạn chưa có playlist nào. Hãy tạo mới hoặc nhập kho nhạc ngay!",
      noPlaylistsYet: "Bạn chưa có playlist nào. Hãy tạo mới hoặc nhập kho nhạc ngay!",
      all: "Tất cả",
      music: "Âm nhạc",
      following: "Đang theo dõi",
      podcasts: "Podcasts",
      audiobooks: "Sách nói",
      inDevelopment: "Đang phát triển",
      audiobooksDevTooltip: "Tính năng Sách nói đang trong tiến trình phát triển và sẽ sớm ra mắt!",
      musicCharts: "Bảng xếp hạng âm nhạc",
      trendingAndBreakout: "Top Thịnh Hành & Bứt Phá",
      chartsHeroDesc: "Bảng xếp hạng thời gian thực dựa trên độ tăng trưởng lượt xem (24h Velocity Growth) và thứ hạng từ YouTube Music trên toàn cầu.",
      searchResultsFor: "Kết quả tìm kiếm cho",
      matchingArtists: "Nghệ sĩ phù hợp",
      songs: "Bài hát",
      recentLikedSongs: "Bài hát bạn đã thích gần đây",
      viewAll: "Xem tất cả",
      searchPlaceholder: "Tìm bài hát, nghệ sĩ từ YouTube...",
      searchButton: "Tìm kiếm",
      uploadButton: "Đăng nhạc",
      login: "Đăng nhập",
      logout: "Đăng xuất",
      guest: "Khách",
    },
    mixes: {
      title: "Your Mixes",
      subtitle: "Playlist theo chủ đề & Trộn ngẫu nhiên",
      hint: "Nhấn để xem danh sách hoặc rê chuột để phát ngay",
      playMix: "Phát trộn",
      dailyMix: "Daily Mix",
      mix1Theme: "V-Pop & Indie Việt",
      mix1Desc: "Tuyển chọn các giai điệu V-Pop, Indie và Ballad Việt Nam được chọn lọc dành riêng cho bạn.",
      mix1Artists: "Sơn Tùng M-TP, Vũ., Hoàng Dũng, Ngọt, Grey D",
      mix2Theme: "Chill, Lo-Fi & Coffee Acoustic",
      mix2Desc: "Giai điệu lofi êm dịu, acoustic mộc mạc và chillout nhẹ nhàng giúp bạn tập trung và thư giãn.",
      mix2Artists: "Lofi Girl, Joji, Keshi, Wave to Earth",
      mix3Theme: "US-UK Pop & Hip-Hop",
      mix3Desc: "Bùng nổ cùng những bản hit US-UK, Rap/Hip-hop và Pop đỉnh cao 24h qua.",
      mix3Artists: "The Weeknd, Drake, Travis Scott, Billie Eilish",
      mix4Theme: "K-Pop & Asian Vibes",
      mix4Desc: "Giai điệu K-Pop & J-Pop bùng nổ năng lượng, vũ đạo và âm nhạc Châu Á.",
      mix4Artists: "NewJeans, IVE, Jung Kook, YOASOBI, Aespa",
      backToHome: "Quay lại Trang chủ",
      updatedDaily: "Cập nhật mỗi ngày • TrackFlow Mix Engine",
      badgeShuffle: "Tuyển tập trộn ngẫu nhiên",
      randomMixBadge: "Tuyển tập trộn ngẫu nhiên",
      songsCount: "bài hát",
      shufflePlay: "Phát trộn danh sách",
      pause: "Tạm dừng",
      reshuffle: "Trộn lại",
      saveToLibrary: "Lưu thành Playlist",
      saving: "Đang lưu...",
      saved: "Đã lưu vào Thư viện!",
      savedSuccess: "Đã lưu vào Thư viện!",
      songsInMix: "Danh sách bài hát trong Mix",
      tracklistTitle: "Danh sách bài hát trong Mix",
      clickToPlay: "Nhấn vào bất kỳ bài hát nào để phát tiếp",
      notableArtists: "Nghệ sĩ tiêu biểu",
      featuredArtists: "Nghệ sĩ tiêu biểu",
    },
    charts: {
      title: "Top Thịnh Hành & Bứt Phá",
      subtitle: "Bảng xếp hạng thời gian thực dựa trên độ tăng trưởng lượt xem (24h Velocity Growth) và thứ hạng từ YouTube Music trên toàn cầu.",
      backToHome: "Quay lại Trang chủ",
      trendingSongsTitle: "Listening right now",
      velocityBadge: "24h Growth",
      allRegionsDesc: "Bảng xếp hạng bài hát đang được nghe nhiều nhất và tăng trưởng nhanh nhất",
      playAll: "Phát tất cả",
      refresh24h: "Làm mới 24h",
      collapseTop10: "Thu gọn bảng xếp hạng (Hiện Top 10)",
      expandAll: "Xem toàn bộ bảng xếp hạng",
      regions: {
        all: "Toàn cầu",
        vpop: "Việt Nam 🇻🇳",
        kpop: "Hàn Quốc 🇰🇷",
        usuk: "Âu Mỹ 🌎",
        asia: "Châu Á 🏮",
      },
    },
    home: {
      recentLiked: "Bài hát bạn đã thích gần đây",
      viewAll: "Xem tất cả →",
      uploadedSongs: "Bài hát bạn đã tải lên",
      noUploadedSongs: "Bạn chưa tải lên bài hát nào",
      noUploadedDesc: "Bấm nút Đăng nhạc để tải file MP3 của riêng bạn lên thư viện cá nhân!",
      uploadPrompt: "Đăng bài hát MP3",
    },
    player: {
      previous: "Bài trước",
      next: "Bài tiếp theo",
      play: "Phát",
      pause: "Tạm dừng",
      loop: "Lặp lại bài hát",
      repeat: "Lặp lại bài hát",
      favorite: "Yêu thích",
      unfavorite: "Bỏ yêu thích",
      addToPlaylist: "Thêm vào danh sách phát",
      chillMode: "Mở chế độ Chill & Visualizer sóng âm 360°",
      lyrics: "Xem Lời bài hát Karaoke toàn màn hình",
      karaokeLyrics: "Xem Lời bài hát Karaoke toàn màn hình",
      nowPlayingInfo: "Thông tin bài hát & Ảnh bìa",
      songInfo: "Thông tin bài hát & Ảnh bìa",
      mute: "Tắt tiếng",
      unmute: "Bật tiếng",
      volume: "Âm lượng",
    },
    footer: {
      platformDesc: "TrackFlow Beta v3.5 • Nền tảng nghe nhạc trực tuyến",
      changelogLink: "Nhật ký cập nhật",
      legalLink: "Điều khoản & Pháp lý bản quyền",
    },
    auth: {
      loginTitle: "Đăng nhập TrackFlow",
      registerTitle: "Đăng ký tài khoản",
      username: "Tên đăng nhập",
      password: "Mật khẩu",
      displayName: "Tên hiển thị",
      continueAsGuest: "Dùng thử với tư cách Khách",
      noAdsBadge: "Chuẩn giao diện Spotify • 100% Không quảng cáo",
    },
  },
  en: {
    nav: {
      home: "Home",
      charts: "Charts",
      search: "Search",
      library: "Library & Playlists",
      chill: "Chill Mode & 360° Visualizer",
      importPlaylist: "Import playlist from Spotify or YouTube",
      uploadMp3: "Upload MP3 Track",
      upload: "Upload",
      terms: "Terms of Service & Legal",
      changelog: "Changelog",
      betaBadge: "Beta v3.5",
      yourLibrary: "Your Library",
      yourPlaylists: "Playlists",
      createPlaylist: "Create Playlist",
      likedSongs: "Liked Songs",
      followedArtists: "Followed Artists",
      artist: "Artist",
      emptyLibrary: "You have no playlists yet. Create a new one or import your music now!",
      noPlaylistsYet: "You have no playlists yet. Create a new one or import your music now!",
      all: "All",
      music: "Music",
      following: "Following",
      podcasts: "Podcasts",
      audiobooks: "Audiobooks",
      inDevelopment: "In Development",
      audiobooksDevTooltip: "Audiobooks feature is currently in active development and coming soon!",
      musicCharts: "Music Charts",
      trendingAndBreakout: "Top Trending & Breakthroughs",
      chartsHeroDesc: "Real-time ranking powered by 24h velocity view growth and charts from YouTube Music worldwide.",
      searchResultsFor: "Search results for",
      matchingArtists: "Matching Artists",
      songs: "Songs",
      recentLikedSongs: "Recently Liked Songs",
      viewAll: "View All",
      searchPlaceholder: "Search songs, artists from YouTube...",
      searchButton: "Search",
      uploadButton: "Upload",
      login: "Log in",
      logout: "Log out",
      guest: "Guest",
    },
    mixes: {
      title: "Your Mixes",
      subtitle: "Thematic Playlists & Randomly Shuffled",
      hint: "Click to explore tracklist or hover to play instantly",
      playMix: "Shuffle Play",
      dailyMix: "Daily Mix",
      mix1Theme: "V-Pop & Indie Vietnam",
      mix1Desc: "Handpicked Vietnamese Pop, Indie, and Ballad melodies curated just for you.",
      mix1Artists: "Son Tung M-TP, Vu., Hoang Dung, Ngot, Grey D",
      mix2Theme: "Chill, Lo-Fi & Coffee Acoustic",
      mix2Desc: "Mellow lo-fi beats, rustic acoustic ballads, and ambient chillout to help you focus and unwind.",
      mix2Artists: "Lofi Girl, Joji, Keshi, Wave to Earth",
      mix3Theme: "US-UK Pop & Hip-Hop",
      mix3Desc: "High-energy US-UK chart toppers, trap, hip-hop, and global hits trending over the last 24 hours.",
      mix3Artists: "The Weeknd, Drake, Travis Scott, Billie Eilish",
      mix4Theme: "K-Pop & Asian Vibes",
      mix4Desc: "High-voltage K-Pop & J-Pop anthems, dance performances, and vibrant East Asian melodies.",
      mix4Artists: "NewJeans, IVE, Jung Kook, YOASOBI, Aespa",
      backToHome: "Back to Home",
      updatedDaily: "Updated Daily • TrackFlow Mix Engine",
      badgeShuffle: "Auto-Shuffled Collection",
      randomMixBadge: "Auto-Shuffled Collection",
      songsCount: "songs",
      shufflePlay: "Shuffle Play",
      pause: "Pause",
      reshuffle: "Re-shuffle",
      saveToLibrary: "Save to Playlist",
      saving: "Saving...",
      saved: "Saved to Library!",
      savedSuccess: "Saved to Library!",
      songsInMix: "Songs in this Mix",
      tracklistTitle: "Songs in this Mix",
      clickToPlay: "Click any track to start playing",
      notableArtists: "Featured Artists",
      featuredArtists: "Featured Artists",
    },
    charts: {
      title: "Top Trending & Breakthroughs",
      subtitle: "Real-time ranking powered by 24h velocity view growth and charts from YouTube Music worldwide.",
      backToHome: "Back to Home",
      trendingSongsTitle: "Listening right now",
      velocityBadge: "24h Growth",
      allRegionsDesc: "Real-time chart of most listened and fastest growing tracks globally",
      playAll: "Play All",
      refresh24h: "Refresh 24h",
      collapseTop10: "Collapse Chart (Show Top 10)",
      expandAll: "View Complete Chart",
      regions: {
        all: "Global",
        vpop: "Vietnam 🇻🇳",
        kpop: "Korea 🇰🇷",
        usuk: "US-UK 🌎",
        asia: "Asia 🏮",
      },
    },
    home: {
      recentLiked: "Recently Liked Songs",
      viewAll: "View All →",
      uploadedSongs: "Your Uploaded Songs",
      noUploadedSongs: "No uploaded songs yet",
      noUploadedDesc: "Click the Upload button to upload your own MP3 tracks to your personal library!",
      uploadPrompt: "Upload MP3 Songs",
    },
    player: {
      previous: "Previous",
      next: "Next",
      play: "Play",
      pause: "Pause",
      loop: "Repeat Track",
      repeat: "Repeat Track",
      favorite: "Favorite",
      unfavorite: "Unfavorite",
      addToPlaylist: "Add to Playlist",
      chillMode: "Open Chill Mode & 360° Visualizer",
      lyrics: "Full-screen Karaoke Lyrics",
      karaokeLyrics: "Full-screen Karaoke Lyrics",
      nowPlayingInfo: "Track Info & Canvas Artwork",
      songInfo: "Track Info & Canvas Artwork",
      mute: "Mute",
      unmute: "Unmute",
      volume: "Volume",
    },
    footer: {
      platformDesc: "TrackFlow Beta v3.5 • Ad-free Online Music Streaming Platform",
      changelogLink: "Changelog",
      legalLink: "Terms & Legal Disclaimer",
    },
    auth: {
      loginTitle: "Log in to TrackFlow",
      registerTitle: "Create an Account",
      username: "Username",
      password: "Password",
      displayName: "Display Name",
      continueAsGuest: "Continue as Guest",
      noAdsBadge: "Spotify Standard Interface • 100% Ad-Free",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "trackflow_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (savedLang === "vi" || savedLang === "en") {
        setLanguageState(savedLang);
        document.documentElement.lang = savedLang;
      }
    } catch {
      // LocalStorage might be inaccessible in some environments
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      // Ignore storage errors
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "vi" ? "en" : "vi");
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
