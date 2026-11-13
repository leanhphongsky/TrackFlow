import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TrendingRegionConfig {
  id: string;
  name: string;
  badge: string;
  regionCode: string;
  description: string;
}

const SONG_REGIONS: TrendingRegionConfig[] = [
  {
    id: "vpop",
    name: "V-Pop",
    badge: "Việt Nam 🇻🇳",
    regionCode: "VN",
    description: "Top ca khúc thịnh hành nhất tại Việt Nam hôm nay",
  },
  {
    id: "kpop",
    name: "K-Pop",
    badge: "Hàn Quốc 🇰🇷",
    regionCode: "KR",
    description: "Top ca khúc K-Pop xu hướng tại Hàn Quốc",
  },
  {
    id: "usuk",
    name: "Âu Mỹ",
    badge: "US-UK 🌎",
    regionCode: "US",
    description: "Top ca khúc US-UK đang thống trị bảng xếp hạng quốc tế",
  },
  {
    id: "asia",
    name: "Châu Á",
    badge: "Châu Á 🏮",
    regionCode: "JP",
    description: "Top ca khúc J-Pop & Châu Á được nghe nhiều nhất",
  },
];

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function cleanSongTitle(title: string): string {
  if (!title) return "";
  let clean = decodeHtmlEntities(title);
  clean = clean
    .replace(/\s*[\[\(](?:Official\s*(?:Music\s*)?Video|M\/?V|Performance|Visualizer|Lyric\s*Video|Audio|Teaser|Prod\..*)[\]\)]/gi, "")
    .replace(/\s*\|\s*(?:Official\s*(?:Music\s*)?Video|M\/?V|Official Performance|Visualizer|Lyric Video).*/gi, "")
    .replace(/\s*-\s*(?:Official\s*(?:Music\s*)?Video|M\/?V).*/gi, "")
    .trim();
  return clean || decodeHtmlEntities(title);
}

function cleanArtistName(channelTitle: string): string {
  if (!channelTitle) return "";
  return decodeHtmlEntities(channelTitle)
    .replace(/\s*-\s*Topic/gi, "")
    .replace(/\s*Official/gi, "")
    .replace(/\s*VEVO/gi, "")
    .replace(/\s*Channel/gi, "")
    .trim();
}

function formatCount(numStr?: string | number): string {
  if (!numStr) return "0";
  const num = typeof numStr === "string" ? parseInt(numStr, 10) : numStr;
  if (isNaN(num)) return "0";
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + " Tỷ";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + " Tr";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + " N";
  }
  return num.toLocaleString("vi-VN");
}

// In-memory cache
let memoryCache: {
  timestamp: number;
  data: any;
} | null = null;

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get("refresh") === "true";
    const requestedCategory = searchParams.get("category"); // "all" | "vpop" | "kpop" | "usuk" | "asia"

    const now = Date.now();
    if (!forceRefresh && memoryCache && now - memoryCache.timestamp < CACHE_TTL) {
      const cached = memoryCache.data;
      if (requestedCategory && requestedCategory !== "all") {
        const filtered = cached.categories.filter((c: any) => c.id === requestedCategory);
        return NextResponse.json({
          categories: filtered,
          allTracks: cached.allTracks,
          updatedAt: cached.updatedAt,
          cached: true,
        });
      }
      return NextResponse.json({ ...cached, cached: true });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "YOUTUBE_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Fetch trending music for all 4 regions in parallel
    const regionPromises = SONG_REGIONS.map(async (reg) => {
      try {
        const url = new URL("https://www.googleapis.com/youtube/v3/videos");
        url.searchParams.set("part", "snippet,statistics");
        url.searchParams.set("chart", "mostPopular");
        url.searchParams.set("videoCategoryId", "10"); // Music category
        url.searchParams.set("regionCode", reg.regionCode);
        url.searchParams.set("maxResults", "10");
        url.searchParams.set("key", apiKey);

        const res = await fetch(url.toString());
        if (!res.ok) {
          console.warn(`Trending fetch error for region ${reg.regionCode}:`, res.statusText);
          return { region: reg, songs: [] };
        }

        const data = await res.json();
        const songs = (data.items || []).map((item: any, idx: number) => {
          const videoId = item.id;
          const snippet = item.snippet;
          const stats = item.statistics;

          return {
            id: `yt_${videoId}`,
            videoId: videoId,
            title: cleanSongTitle(snippet.title || ""),
            rawTitle: decodeHtmlEntities(snippet.title || ""),
            artist: cleanArtistName(snippet.channelTitle || ""),
            channelId: snippet.channelId,
            channelTitle: decodeHtmlEntities(snippet.channelTitle || ""),
            audio_url: `https://www.youtube.com/watch?v=${videoId}`,
            image_url:
              snippet.thumbnails?.high?.url ||
              snippet.thumbnails?.medium?.url ||
              `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            source: "youtube",
            rank: idx + 1,
            views: formatCount(stats?.viewCount),
            viewCount: stats?.viewCount ? parseInt(stats.viewCount, 10) : 0,
            publishedAt: snippet.publishedAt,
            region: reg.id,
            regionBadge: reg.badge,
          };
        });

        return { region: reg, songs };
      } catch (err) {
        console.warn(`Error fetching region ${reg.id}:`, err);
        return { region: reg, songs: [] };
      }
    });

    const regionResults = await Promise.all(regionPromises);

    // Build categories payload
    const categories = regionResults.map(({ region, songs }) => ({
      id: region.id,
      name: region.name,
      badge: region.badge,
      description: region.description,
      songs,
    }));

    // Interleave / mix top tracks from each region to build the Global All-In-One Trending Chart
    // e.g.: Rank 1 from VN, US, KR, Asia -> Rank 2 from VN, US, KR, Asia...
    const allTracks: any[] = [];
    const maxPerRegion = Math.max(...regionResults.map((r) => r.songs.length), 0);
    const seenVideoIds = new Set<string>();

    for (let i = 0; i < maxPerRegion; i++) {
      for (const regRes of regionResults) {
        if (regRes.songs[i]) {
          const song = regRes.songs[i];
          if (!seenVideoIds.has(song.videoId)) {
            seenVideoIds.add(song.videoId);
            allTracks.push({
              ...song,
              globalRank: allTracks.length + 1,
            });
          }
        }
      }
    }

    const payload = {
      categories,
      allTracks,
      updatedAt: new Date().toISOString(),
      cached: false,
    };

    memoryCache = {
      timestamp: now,
      data: payload,
    };

    if (requestedCategory && requestedCategory !== "all") {
      const filtered = categories.filter((c) => c.id === requestedCategory);
      return NextResponse.json({
        categories: filtered,
        allTracks,
        updatedAt: payload.updatedAt,
        cached: false,
      });
    }

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error("API /api/songs/trending error:", error);
    return NextResponse.json(
      { error: "Failed to load trending songs", details: error.message },
      { status: 500 }
    );
  }
}
