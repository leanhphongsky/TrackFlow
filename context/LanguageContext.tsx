"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "vi" | "en";

export interface Translations {
  common: {
    loading: string;
    back: string;
    cancel: string;
    save: string;
    create: string;
    close: string;
    done: string;
    delete: string;
    edit: string;
    refresh: string;
    playAll: string;
    pause: string;
    play: string;
    search: string;
    views: string;
    subscribers: string;
    followers: string;
    songsCount: string;
    artist: string;
    hoursAgo: string;
    daysAgo: string;
    weeksAgo: string;
  };
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
    openNavMenu: string;
    connecting: string;
  };
  mixes: {
    title: string;
    subtitle: string;
    hint: string;
    playMix: string;
    dailyMix: string;
    mix1Theme: string;
    mix1Badge: string;
    mix1Desc: string;
    mix1Artists: string;
    mix2Theme: string;
    mix2Badge: string;
    mix2Desc: string;
    mix2Artists: string;
    mix3Theme: string;
    mix3Badge: string;
    mix3Desc: string;
    mix3Artists: string;
    mix4Theme: string;
    mix4Badge: string;
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
    datePrefix: string;
    regions: {
      all: string;
      vpop: string;
      kpop: string;
      usuk: string;
      asia: string;
    };
  };
  trendingArtists: {
    title: string;
    liveBadge: string;
    allSubtitle: string;
    defaultSubtitle: string;
    refresh: string;
    refreshTooltip: string;
    allTab: string;
    followers: string;
  };
  artist: {
    loadingProfile: string;
    notFound: string;
    back: string;
    verifiedOnYoutube: string;
    subscribers: string;
    views: string;
    playAll: string;
    following: string;
    follow: string;
    popularSongs: string;
    viewsCount: string;
  };
  playlist: {
    loadingPlaylist: string;
    notFound: string;
    publicPlaylistBadge: string;
    clickToRename: string;
    placeholderName: string;
    placeholderDesc: string;
    save: string;
    cancel: string;
    editInfo: string;
    importMore: string;
    deletePlaylist: string;
    confirmDelete: string;
    confirmRemoveSong: string;
    emptyTitle: string;
    emptyDesc: string;
    exploreSongs: string;
    importFromSpotifyYt: string;
    tableIndex: string;
    tableTitle: string;
    tableArtist: string;
    tableDuration: string;
    approxMinutes: string;
    userDefault: string;
    addToAnotherPlaylist: string;
    removeFromPlaylist: string;
  };
  favorites: {
    playlistType: string;
    title: string;
    playAllTooltip: string;
    emptyTitle: string;
    emptyDesc: string;
    you: string;
  };
  addToPlaylistModal: {
    title: string;
    artistFallback: string;
    createNew: string;
    newPlaylistPlaceholder: string;
    create: string;
    cancel: string;
    searchPlaceholder: string;
    loading: string;
    noMatching: string;
    noPlaylistsYet: string;
    getStartedHint: string;
    done: string;
    toastRemoved: string;
    toastAdded: string;
    toastCreatedAndAdded: string;
  };
  uploadModal: {
    title: string;
    songTitleLabel: string;
    songTitlePlaceholder: string;
    artistLabel: string;
    artistPlaceholder: string;
    audioFileLabel: string;
    audioFilePlaceholder: string;
    coverArtLabel: string;
    chooseCover: string;
    changeCover: string;
    processing: string;
    uploadButton: string;
    uploadingAudioStatus: string;
    uploadingCoverStatus: string;
    savingDbStatus: string;
    alertFillFields: string;
  };
  importModal: {
    title: string;
    subtitle: string;
    tabUrl: string;
    tabText: string;
    supportedLabel: string;
    urlPlaceholder: string;
    pasteButton: string;
    exampleLabel: string;
    textFormatHint: string;
    pasteFromClipboard: string;
    textPlaceholder: string;
    scanButton: string;
    scanningStatus: string;
    selectedCount: string;
    playlistNamePlaceholder: string;
    playlistDescPlaceholder: string;
    selectAll: string;
    scanAnotherLink: string;
    importingNotice: string;
    saveToTrackFlow: string;
  };
  nowPlayingPanel: {
    close: string;
    artwork: string;
    canvas: string;
    switchToArtwork: string;
    switchToCanvas: string;
    lyricsTitle: string;
    syncedExact: string;
    syncedTime: string;
    offsetAdjust: string;
    offsetEarlier: string;
    offsetLater: string;
    offsetReset: string;
    fullscreenKaraoke: string;
    loadingLyrics: string;
    noLyricsAvailable: string;
    clickToSeek: string;
    aboutArtist: string;
    aboutArtistDesc: string;
  };
  lyricsView: {
    offsetLabel: string;
    offsetEarlier: string;
    offsetLater: string;
    offsetResetToast: string;
    alignCenterTooltip: string;
    alignLeftTooltip: string;
    fontSizeTooltip: string;
    autoScrollUnlockTooltip: string;
    autoScrollLockTooltip: string;
    exitFullscreenTooltip: string;
    loadingLyrics: string;
    noLyricsAvailable: string;
    clickToSeek: string;
  };
  chillView: {
    chillTitle: string;
    lyricsTooltip: string;
    lyricsSubtitle: string;
    lyricsPanel: string;
    lyricsOff: string;
    lyricsEffectsTitle: string;
    subtitleTitle: string;
    subtitleDesc: string;
    panelTitle: string;
    panelDesc: string;
    offTitle: string;
    offDesc: string;
    exitChillTooltip: string;
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
    submitLogin: string;
    submitRegister: string;
    processing: string;
    separateFavHint: string;
    loginHeroDesc: string;
  };
  podcasts: {
    heroBadge: string;
    heroTitle: string;
    heroDesc: string;
    categories: {
      all: string;
      chat: string;
      psychology: string;
      business: string;
      philosophy: string;
      science: string;
    };
    episodesCount: string;
    playEpisode: string;
    listenNow: string;
  };
}

const translations: Record<Language, Translations> = {
  vi: {
    common: {
      loading: "Đang tải...",
      back: "Quay lại",
      cancel: "Huỷ",
      save: "Lưu",
      create: "Tạo",
      close: "Đóng",
      done: "Xong",
      delete: "Xoá",
      edit: "Chỉnh sửa",
      refresh: "Làm mới",
      playAll: "Phát tất cả",
      pause: "Tạm dừng",
      play: "Phát",
      search: "Tìm kiếm",
      views: "lượt xem",
      subscribers: "người đăng ký",
      followers: "theo dõi",
      songsCount: "bài hát",
      artist: "Nghệ sĩ",
      hoursAgo: "giờ trước",
      daysAgo: "ngày trước",
      weeksAgo: "tuần trước",
    },
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
      openNavMenu: "Mở menu điều hướng",
      connecting: "Đang kết nối TrackFlow...",
    },
    mixes: {
      title: "Your Mixes",
      subtitle: "Playlist theo chủ đề & Trộn ngẫu nhiên",
      hint: "Nhấn để xem danh sách hoặc rê chuột để phát ngay",
      playMix: "Phát trộn",
      dailyMix: "Daily Mix",
      mix1Theme: "V-Pop & Indie Việt",
      mix1Badge: "Việt Nam 🇻🇳",
      mix1Desc: "Tuyển chọn các giai điệu V-Pop, Indie và Ballad Việt Nam từ Sơn Tùng M-TP, Vũ., Hoàng Dũng, Ngọt, Grey D và nhiều nghệ sĩ khác.",
      mix1Artists: "Sơn Tùng M-TP, Vũ., Hoàng Dũng, Ngọt...",
      mix2Theme: "Chill, Lo-Fi & Coffee Acoustic",
      mix2Badge: "Thư giãn ☕",
      mix2Desc: "Giai điệu lofi êm dịu, acoustic mộc mạc và chillout nhẹ nhàng giúp bạn tập trung và thư giãn.",
      mix2Artists: "Lofi Girl, Joji, Keshi, Wave to Earth...",
      mix3Theme: "US-UK Pop & Hip-Hop",
      mix3Badge: "Âu Mỹ 🌎",
      mix3Desc: "Bùng nổ cùng những bản hit US-UK, Rap/Hip-hop và Pop đỉnh cao 24h qua.",
      mix3Artists: "The Weeknd, Drake, Travis Scott, Billie Eilish...",
      mix4Theme: "K-Pop & Asian Vibes",
      mix4Badge: "Châu Á 🌸",
      mix4Desc: "Giai điệu K-Pop & J-Pop bùng nổ năng lượng, vũ đạo và âm nhạc Châu Á.",
      mix4Artists: "NewJeans, IVE, Jung Kook, YOASOBI, Aespa...",
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
      datePrefix: "Ngày",
      regions: {
        all: "Toàn cầu",
        vpop: "Việt Nam 🇻🇳",
        kpop: "Hàn Quốc 🇰🇷",
        usuk: "Âu Mỹ 🌎",
        asia: "Châu Á 🏮",
      },
    },
    trendingArtists: {
      title: "Nghệ sĩ thịnh hành",
      liveBadge: "Live YouTube",
      allSubtitle: "Tuyển tập nghệ sĩ nổi bật toàn cầu (V-Pop, K-Pop, US-UK, Châu Á) • Tự động cập nhật số liệu thật",
      defaultSubtitle: "Cập nhật số liệu & avatar từ YouTube",
      refresh: "Làm mới",
      refreshTooltip: "Làm mới dữ liệu từ YouTube Data API",
      allTab: "Tất cả (Trộn toàn cầu)",
      followers: "theo dõi",
    },
    artist: {
      loadingProfile: "Đang tải trang cá nhân nghệ sĩ...",
      notFound: "Không tìm thấy thông tin nghệ sĩ.",
      back: "Quay lại",
      verifiedOnYoutube: "Nghệ sĩ đã xác minh trên YouTube",
      subscribers: "người đăng ký",
      views: "lượt xem",
      playAll: "Phát tất cả",
      following: "Đang theo dõi",
      follow: "Theo dõi",
      popularSongs: "Bài hát phổ biến nhất",
      viewsCount: "lượt xem",
    },
    playlist: {
      loadingPlaylist: "Đang tải danh sách phát...",
      notFound: "Không tìm thấy danh sách phát hoặc đã bị xoá.",
      publicPlaylistBadge: "Danh sách phát công khai",
      clickToRename: "Bấm để đổi tên",
      placeholderName: "Tên danh sách phát...",
      placeholderDesc: "Thêm mô tả tuỳ chọn...",
      save: "Lưu",
      cancel: "Huỷ",
      editInfo: "Chỉnh sửa thông tin",
      importMore: "Nhập thêm bài hát từ Spotify hoặc YouTube",
      deletePlaylist: "Xoá danh sách phát",
      confirmDelete: "Bạn có chắc chắn muốn xoá danh sách phát này?",
      confirmRemoveSong: "Xoá bài hát này khỏi danh sách phát?",
      emptyTitle: "Danh sách phát này đang trống",
      emptyDesc: "Bạn có thể tìm kiếm bài hát mới, hoặc chuyển toàn bộ playlist yêu thích từ Spotify hay YouTube vào đây chỉ với 1 click!",
      exploreSongs: "Khám phá bài hát",
      importFromSpotifyYt: "Nhập từ Spotify / YouTube",
      tableIndex: "#",
      tableTitle: "Tiêu đề",
      tableArtist: "Nghệ sĩ",
      tableDuration: "Thời lượng",
      approxMinutes: "khoảng",
      userDefault: "Người dùng",
      addToAnotherPlaylist: "Thêm vào danh sách phát khác",
      removeFromPlaylist: "Xoá khỏi danh sách phát này",
    },
    favorites: {
      playlistType: "Danh sách phát",
      title: "Bài hát đã thích",
      playAllTooltip: "Phát tất cả bài hát yêu thích",
      emptyTitle: "Chưa có bài hát yêu thích nào",
      emptyDesc: "Nhấn vào biểu tượng trái tim ở bất kỳ bài hát nào để lưu vào danh sách riêng của bạn!",
      you: "Bạn",
    },
    addToPlaylistModal: {
      title: "Thêm vào danh sách phát",
      artistFallback: "Nghệ sĩ",
      createNew: "Tạo danh sách phát mới",
      newPlaylistPlaceholder: "Tên danh sách phát mới...",
      create: "Tạo",
      cancel: "Huỷ",
      searchPlaceholder: "Tìm danh sách phát...",
      loading: "Đang tải danh sách phát...",
      noMatching: "Không tìm thấy danh sách phát phù hợp",
      noPlaylistsYet: "Bạn chưa có danh sách phát nào",
      getStartedHint: "Hãy bấm nút \"Tạo danh sách phát mới\" ở trên để bắt đầu!",
      done: "Xong",
      toastRemoved: "Đã xoá khỏi",
      toastAdded: "Đã thêm vào",
      toastCreatedAndAdded: "Đã tạo và thêm vào",
    },
    uploadModal: {
      title: "Đăng bài hát mới",
      songTitleLabel: "Tên bài hát *",
      songTitlePlaceholder: "Ví dụ: Nơi Này Có Anh",
      artistLabel: "Nghệ sĩ / Ca sĩ *",
      artistPlaceholder: "Ví dụ: Sơn Tùng M-TP",
      audioFileLabel: "File âm thanh (MP3, M4A, WAV) *",
      audioFilePlaceholder: "Nhấn để chọn file nhạc (.mp3)",
      coverArtLabel: "Ảnh bìa album (Không bắt buộc)",
      chooseCover: "Chọn ảnh bìa",
      changeCover: "Đổi ảnh",
      processing: "Đang xử lý...",
      uploadButton: "Đăng bài hát",
      uploadingAudioStatus: "Đang tải file nhạc lên Cloudinary (có thể mất vài giây)...",
      uploadingCoverStatus: "Đang tải ảnh bìa lên...",
      savingDbStatus: "Đang lưu bài hát vào Neon Database...",
      alertFillFields: "Vui lòng nhập tên bài hát, nghệ sĩ và chọn file âm thanh!",
    },
    importModal: {
      title: "Nhập danh sách phát",
      subtitle: "Chuyển kho nhạc từ Spotify, YouTube Music hoặc danh sách bài hát",
      tabUrl: "Dán đường link (URL)",
      tabText: "Danh sách bài hát (Text)",
      supportedLabel: "Hỗ trợ:",
      urlPlaceholder: "Dán link Spotify hoặc YouTube playlist vào đây...",
      pasteButton: "Dán link",
      exampleLabel: "Ví dụ:",
      textFormatHint: "Mỗi bài một dòng theo định dạng: Tên bài - Ca sĩ",
      pasteFromClipboard: "Dán từ bộ nhớ tạm",
      textPlaceholder: "Chúng ta của tương lai - Sơn Tùng M-TP\nWaiting For Never - Post Malone\nDie With A Smile - Lady Gaga, Bruno Mars",
      scanButton: "Quét danh sách bài hát",
      scanningStatus: "Đang quét danh sách bài hát...",
      selectedCount: "bài được chọn",
      playlistNamePlaceholder: "Tên danh sách phát...",
      playlistDescPlaceholder: "Thêm mô tả danh sách phát (tùy chọn)...",
      selectAll: "Chọn tất cả",
      scanAnotherLink: "Quét link khác",
      importingNotice: "Vui lòng không tắt trang trong giây lát...",
      saveToTrackFlow: "Lưu bài vào TrackFlow",
    },
    nowPlayingPanel: {
      close: "Đóng panel",
      artwork: "Ảnh bìa",
      canvas: "Canvas",
      switchToArtwork: "Chuyển sang xem ảnh bìa tĩnh",
      switchToCanvas: "Chuyển sang xem video Canvas",
      lyricsTitle: "Lời bài hát",
      syncedExact: "Khớp chuẩn video",
      syncedTime: "Đồng bộ thời gian",
      offsetAdjust: "Điều chỉnh độ trễ lời bài hát",
      offsetEarlier: "Chạy sớm hơn 0.5s",
      offsetLater: "Chạy trễ hơn 0.5s",
      offsetReset: "Bấm để đặt lại về 0s",
      fullscreenKaraoke: "Xem toàn màn hình Karaoke",
      loadingLyrics: "Đang tải lời bài hát...",
      noLyricsAvailable: "Hiện bài hát này chưa có lời đồng bộ",
      clickToSeek: "Bấm để phát từ đoạn này",
      aboutArtist: "About the artist",
      aboutArtistDesc: "Bấm để xem tất cả bài hát và thông tin chi tiết trên trang nghệ sĩ.",
    },
    lyricsView: {
      offsetLabel: "Độ lệch:",
      offsetEarlier: "Chạy sớm hơn 0.5s",
      offsetLater: "Chạy trễ hơn 0.5s",
      offsetResetToast: "Đã đặt lại về 0s",
      alignCenterTooltip: "Căn giữa lời bài hát",
      alignLeftTooltip: "Căn trái lời bài hát",
      fontSizeTooltip: "Đổi cỡ chữ",
      autoScrollUnlockTooltip: "Bật lại tự động cuộn theo bài hát",
      autoScrollLockTooltip: "Tạm khóa tự động cuộn để đọc lời tự do",
      exitFullscreenTooltip: "Thoát toàn màn hình",
      loadingLyrics: "Đang tải lời bài hát...",
      noLyricsAvailable: "Bài hát này chưa có lời đồng bộ",
      clickToSeek: "Bấm để chuyển tới đoạn này",
    },
    chillView: {
      chillTitle: "TrackFlow Chill",
      lyricsTooltip: "Tuỳ chỉnh lời bài hát (Lyrics)",
      lyricsSubtitle: "Phụ đề",
      lyricsPanel: "Bảng lời",
      lyricsOff: "Tắt lời",
      lyricsEffectsTitle: "Hiệu ứng lời bài hát",
      subtitleTitle: "Phụ đề dạ quang",
      subtitleDesc: "Dòng karaoke bay bổng dưới đĩa",
      panelTitle: "Bảng lời cuộn",
      panelDesc: "Phong cách Apple Music kính mờ",
      offTitle: "Tắt lời bài hát",
      offDesc: "Chỉ hiển thị đĩa xoay và sóng âm",
      exitChillTooltip: "Thoát chế độ Chill (Esc)",
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
      displayName: "Tên của bạn / Tên hiển thị",
      continueAsGuest: "Dùng thử với tư cách Khách",
      noAdsBadge: "Chuẩn giao diện Spotify • 100% Không quảng cáo",
      submitLogin: "Đăng nhập",
      submitRegister: "Tạo tài khoản",
      processing: "Đang xử lý...",
      separateFavHint: "Mỗi tài khoản có danh sách bài hát yêu thích riêng biệt.",
      loginHeroDesc: "Đăng nhập để trải nghiệm nghe nhạc cá nhân hóa, lưu bài hát yêu thích và đồng bộ danh sách phát trên mọi thiết bị.",
    },
    podcasts: {
      heroBadge: "TrackFlow Podcasts & Shows",
      heroTitle: "Podcasts & Chương trình truyền cảm hứng",
      heroDesc: "Khám phá các tập podcast sâu sắc về cuộc sống, tâm lý, sự nghiệp và tài chính. Nghe hoàn toàn không quảng cáo.",
      categories: {
        all: "Tất cả",
        chat: "Trò chuyện",
        psychology: "Tâm lý & Cuộc sống",
        business: "Kinh doanh & Tài chính",
        philosophy: "Triết lý & Nghệ thuật",
        science: "Khoa học & Giáo dục",
      },
      episodesCount: "tập phát",
      playEpisode: "Phát tập podcast này",
      listenNow: "Nghe ngay",
    },
  },
  en: {
    common: {
      loading: "Loading...",
      back: "Back",
      cancel: "Cancel",
      save: "Save",
      create: "Create",
      close: "Close",
      done: "Done",
      delete: "Delete",
      edit: "Edit",
      refresh: "Refresh",
      playAll: "Play All",
      pause: "Pause",
      play: "Play",
      search: "Search",
      views: "views",
      subscribers: "subscribers",
      followers: "followers",
      songsCount: "songs",
      artist: "Artist",
      hoursAgo: "hours ago",
      daysAgo: "days ago",
      weeksAgo: "weeks ago",
    },
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
      openNavMenu: "Open navigation menu",
      connecting: "Connecting to TrackFlow...",
    },
    mixes: {
      title: "Your Mixes",
      subtitle: "Thematic Playlists & Randomly Shuffled",
      hint: "Click to explore tracklist or hover to play instantly",
      playMix: "Shuffle Play",
      dailyMix: "Daily Mix",
      mix1Theme: "V-Pop & Indie Vietnam",
      mix1Badge: "Vietnam 🇻🇳",
      mix1Desc: "Handpicked Vietnamese Pop, Indie, and Ballad melodies from Son Tung M-TP, Vu., Hoang Dung, Ngot, Grey D and more.",
      mix1Artists: "Sơn Tùng M-TP, Vũ., Hoàng Dũng, Ngọt...",
      mix2Theme: "Chill, Lo-Fi & Coffee Acoustic",
      mix2Badge: "Relax ☕",
      mix2Desc: "Mellow lo-fi beats, rustic acoustic ballads, and ambient chillout to help you focus and unwind.",
      mix2Artists: "Lofi Girl, Joji, Keshi, Wave to Earth...",
      mix3Theme: "US-UK Pop & Hip-Hop",
      mix3Badge: "US-UK 🌎",
      mix3Desc: "High-energy US-UK chart toppers, trap, hip-hop, and global hits trending over the last 24 hours.",
      mix3Artists: "The Weeknd, Drake, Travis Scott, Billie Eilish...",
      mix4Theme: "K-Pop & Asian Vibes",
      mix4Badge: "Asia 🌸",
      mix4Desc: "High-voltage K-Pop & J-Pop anthems, dance performances, and vibrant East Asian melodies.",
      mix4Artists: "NewJeans, IVE, Jung Kook, YOASOBI, Aespa...",
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
      datePrefix: "Date",
      regions: {
        all: "Global",
        vpop: "Vietnam 🇻🇳",
        kpop: "Korea 🇰🇷",
        usuk: "US-UK 🌎",
        asia: "Asia 🏮",
      },
    },
    trendingArtists: {
      title: "Trending Artists",
      liveBadge: "Live YouTube",
      allSubtitle: "Global spotlight artists (V-Pop, K-Pop, US-UK, Asian Vibes) • Real-time metrics",
      defaultSubtitle: "Live YouTube stats & official avatars",
      refresh: "Refresh",
      refreshTooltip: "Refresh data from YouTube Data API",
      allTab: "All (Global Mix)",
      followers: "followers",
    },
    artist: {
      loadingProfile: "Loading artist profile...",
      notFound: "Artist profile not found.",
      back: "Back",
      verifiedOnYoutube: "Verified Artist on YouTube",
      subscribers: "subscribers",
      views: "views",
      playAll: "Play All",
      following: "Following",
      follow: "Follow",
      popularSongs: "Popular Songs",
      viewsCount: "views",
    },
    playlist: {
      loadingPlaylist: "Loading playlist...",
      notFound: "Playlist not found or has been deleted.",
      publicPlaylistBadge: "Public Playlist",
      clickToRename: "Click to rename",
      placeholderName: "Playlist name...",
      placeholderDesc: "Add an optional description...",
      save: "Save",
      cancel: "Cancel",
      editInfo: "Edit details",
      importMore: "Import more tracks from Spotify or YouTube",
      deletePlaylist: "Delete playlist",
      confirmDelete: "Are you sure you want to delete this playlist?",
      confirmRemoveSong: "Remove this song from the playlist?",
      emptyTitle: "This playlist is currently empty",
      emptyDesc: "You can search for new tracks, or transfer an entire playlist from Spotify or YouTube in 1 click!",
      exploreSongs: "Explore Songs",
      importFromSpotifyYt: "Import from Spotify / YouTube",
      tableIndex: "#",
      tableTitle: "Title",
      tableArtist: "Artist",
      tableDuration: "Duration",
      approxMinutes: "about",
      userDefault: "User",
      addToAnotherPlaylist: "Add to another playlist",
      removeFromPlaylist: "Remove from this playlist",
    },
    favorites: {
      playlistType: "Playlist",
      title: "Liked Songs",
      playAllTooltip: "Play all liked songs",
      emptyTitle: "No liked songs yet",
      emptyDesc: "Click the heart icon on any track to save it to your personal favorites!",
      you: "You",
    },
    addToPlaylistModal: {
      title: "Add to Playlist",
      artistFallback: "Artist",
      createNew: "Create new playlist",
      newPlaylistPlaceholder: "New playlist name...",
      create: "Create",
      cancel: "Cancel",
      searchPlaceholder: "Search playlists...",
      loading: "Loading playlists...",
      noMatching: "No matching playlists found",
      noPlaylistsYet: "You have no playlists yet",
      getStartedHint: "Click \"Create new playlist\" above to get started!",
      done: "Done",
      toastRemoved: "Removed from",
      toastAdded: "Added to",
      toastCreatedAndAdded: "Created and added to",
    },
    uploadModal: {
      title: "Upload New Track",
      songTitleLabel: "Song Title *",
      songTitlePlaceholder: "e.g. Blinding Lights",
      artistLabel: "Artist / Performer *",
      artistPlaceholder: "e.g. The Weeknd",
      audioFileLabel: "Audio File (MP3, M4A, WAV) *",
      audioFilePlaceholder: "Click to select audio file (.mp3)",
      coverArtLabel: "Album Artwork (Optional)",
      chooseCover: "Choose artwork",
      changeCover: "Change artwork",
      processing: "Processing...",
      uploadButton: "Upload Song",
      uploadingAudioStatus: "Uploading audio to Cloudinary (may take a few seconds)...",
      uploadingCoverStatus: "Uploading cover artwork...",
      savingDbStatus: "Saving track to Neon Database...",
      alertFillFields: "Please enter song title, artist, and select an audio file!",
    },
    importModal: {
      title: "Import Playlist",
      subtitle: "Transfer your music library from Spotify, YouTube Music, or plain text tracklists",
      tabUrl: "Paste link (URL)",
      tabText: "Tracklist (Text)",
      supportedLabel: "Supported:",
      urlPlaceholder: "Paste Spotify or YouTube playlist link here...",
      pasteButton: "Paste link",
      exampleLabel: "Example:",
      textFormatHint: "One song per line in format: Song Title - Artist",
      pasteFromClipboard: "Paste from clipboard",
      textPlaceholder: "Starboy - The Weeknd\nWaiting For Never - Post Malone\nDie With A Smile - Lady Gaga, Bruno Mars",
      scanButton: "Scan Playlist",
      scanningStatus: "Scanning tracklist...",
      selectedCount: "tracks selected",
      playlistNamePlaceholder: "Playlist name...",
      playlistDescPlaceholder: "Add an optional playlist description...",
      selectAll: "Select all",
      scanAnotherLink: "Scan another link",
      importingNotice: "Please do not close this page while importing...",
      saveToTrackFlow: "Save tracks to TrackFlow",
    },
    nowPlayingPanel: {
      close: "Close panel",
      artwork: "Artwork",
      canvas: "Canvas",
      switchToArtwork: "Switch to static cover artwork",
      switchToCanvas: "Switch to video Canvas",
      lyricsTitle: "Lyrics",
      syncedExact: "Exact Video Sync",
      syncedTime: "Time-Synced",
      offsetAdjust: "Adjust lyrics sync offset",
      offsetEarlier: "0.5s earlier",
      offsetLater: "0.5s later",
      offsetReset: "Click to reset to 0s",
      fullscreenKaraoke: "View Fullscreen Karaoke",
      loadingLyrics: "Loading lyrics...",
      noLyricsAvailable: "No synchronized lyrics available for this song",
      clickToSeek: "Click to jump to this line",
      aboutArtist: "About the artist",
      aboutArtistDesc: "Click to view full discography and details on the artist profile page.",
    },
    lyricsView: {
      offsetLabel: "Offset:",
      offsetEarlier: "-0.5s",
      offsetLater: "+0.5s",
      offsetResetToast: "Reset to 0s",
      alignCenterTooltip: "Center-align lyrics",
      alignLeftTooltip: "Left-align lyrics",
      fontSizeTooltip: "Change font size",
      autoScrollUnlockTooltip: "Resume auto-scrolling with music",
      autoScrollLockTooltip: "Lock auto-scrolling to browse freely",
      exitFullscreenTooltip: "Exit Fullscreen",
      loadingLyrics: "Loading lyrics...",
      noLyricsAvailable: "No synchronized lyrics available for this song",
      clickToSeek: "Click to jump to this line",
    },
    chillView: {
      chillTitle: "TrackFlow Chill",
      lyricsTooltip: "Customize Lyrics",
      lyricsSubtitle: "Subtitles",
      lyricsPanel: "Lyrics Panel",
      lyricsOff: "Lyrics Off",
      lyricsEffectsTitle: "Lyrics Display Mode",
      subtitleTitle: "Glowing Subtitles",
      subtitleDesc: "Floating karaoke line below the vinyl",
      panelTitle: "Scrolling Panel",
      panelDesc: "Frosted glass Apple Music style",
      offTitle: "Lyrics Off",
      offDesc: "Show vinyl disk and audio visualizer only",
      exitChillTooltip: "Exit Chill Mode (Esc)",
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
      displayName: "Your Name / Display Name",
      continueAsGuest: "Continue as Guest",
      noAdsBadge: "Spotify Standard Interface • 100% Ad-Free",
      submitLogin: "Log In",
      submitRegister: "Create Account",
      processing: "Processing...",
      separateFavHint: "Each account has its own personal liked songs and library.",
      loginHeroDesc: "Log in for a personalized listening experience, saving favorites, and syncing playlists across all your devices.",
    },
    podcasts: {
      heroBadge: "TrackFlow Podcasts & Shows",
      heroTitle: "Podcasts & Inspiring Shows",
      heroDesc: "Explore insightful podcasts about life, psychology, career, and finance. Completely ad-free.",
      categories: {
        all: "All",
        chat: "Talk Shows",
        psychology: "Psychology & Life",
        business: "Business & Finance",
        philosophy: "Philosophy & Art",
        science: "Science & Education",
      },
      episodesCount: "episodes",
      playEpisode: "Play this episode",
      listenNow: "Listen now",
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
    const next = language === "vi" ? "en" : "vi";
    setLanguage(next);
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
