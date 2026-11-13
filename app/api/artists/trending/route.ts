import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Map of top artists grouped by regions with verified official channel IDs and fallback metadata
const ARTIST_REGIONS = [
  {
    id: "vpop",
    name: "V-Pop",
    badge: "Việt Nam 🇻🇳",
    description: "Nghệ sĩ Việt Nam thịnh hành & triệu lượt stream",
    artists: [
      { name: "Sơn Tùng M-TP", channelId: "UClyA28-01x4z60eWQ2kiNbA", tag: "Pop / R&B" },
      { name: "Đen Vâu", channelId: "UCWu91J5KWEj1bQhCBuGeJxw", tag: "Rap / Hip-Hop" },
      { name: "HIEUTHUHAI", channelId: "UCe8b9jSSD-bNabF4hkNN5PQ", tag: "Rap / Hip-Hop" },
      { name: "Vũ.", channelId: "UCePWSQHSdXqzQlzyJfwY1Jg", tag: "Indie Pop" },
      { name: "SOOBIN", channelId: "UCpVvunMbMvVj9DgCiOSBdcg", tag: "R&B / Ballad" },
      { name: "tlinh", channelId: "UC3O-gNkOsgemkuhuAopEGbA", tag: "R&B / Hip-Hop" },
      { name: "Wren Evans", channelId: "UCtpX-hGGBtH2ZvVX9_5RwFg", tag: "Indie Pop / R&B" },
      { name: "MONO", channelId: "UCi_RaMQ4Hhdml1Cff4SCpQA", tag: "Dance-Pop" },
      { name: "MCK", channelId: "UC8EB7c0E_TS4tpTQwMtv6fw", tag: "Rap / Melody" },
    ],
  },
  {
    id: "kpop",
    name: "K-Pop",
    badge: "Hàn Quốc 🇰🇷",
    description: "Thần tượng K-Pop bùng nổ toàn cầu",
    artists: [
      { name: "BLACKPINK", channelId: "UCOmHUn--16B90oW2L6FRR3A", tag: "K-Pop / Dance" },
      { name: "BTS", channelId: "UCLkAepWjdylmXSltofFvsYQ", tag: "K-Pop / Hip-Hop" },
      { name: "NewJeans", channelId: "UCMki_UkHb4qSc0qyEcOHHJw", tag: "K-Pop / R&B" },
      { name: "IU", channelId: "UC3SyT4_WLHzN7JmHQwKQZww", tag: "K-Pop / Ballad" },
      { name: "aespa", channelId: "UC9GtSLeksfK4yuJ_g1lgQbg", tag: "K-Pop / Hyperpop" },
      { name: "SEVENTEEN", channelId: "UCfkXDY7vwkcJ8ddFGz8KusA", tag: "K-Pop / Performance" },
      { name: "TWICE", channelId: "UCzgxx_DM2Dcb9Y1spb9mUJA", tag: "K-Pop / Pop" },
      { name: "BABYMONSTER", channelId: "UCqwUnggBBct-AY2lAdI88jQ", tag: "K-Pop / Hip-Hop" },
    ],
  },
  {
    id: "usuk",
    name: "Âu Mỹ",
    badge: "US-UK 🌎",
    description: "Ngôi sao âm nhạc quốc tế & Billboard Hot 100",
    artists: [
      { name: "Taylor Swift", channelId: "UCqECaJ8Gagnn7YCbPEzWH6g", tag: "Pop / Country" },
      { name: "The Weeknd", channelId: "UC0WP5P-ufpRfjbNrmOWwLBQ", tag: "R&B / Synth-Pop" },
      { name: "Bruno Mars", channelId: "UCoUM-UJ7rirJYP8CQ0EIaHA", tag: "Pop / Funk / Soul" },
      { name: "Billie Eilish", channelId: "UCiGm_E4ZwYSHV3bcW1pnSeQ", tag: "Alt-Pop / Indie" },
      { name: "Charlie Puth", channelId: "UCwppdrjsBPAZg5_cUwQjfMQ", tag: "Pop / R&B" },
      { name: "Ariana Grande", channelId: "UC9CoOnJkIBMdeijd9qYoT_g", tag: "Pop / R&B" },
      { name: "Justin Bieber", channelId: "UCIwFjwMjI0y7PDBVEO9-bkQ", tag: "Pop / R&B" },
      { name: "Drake", channelId: "UCByOQJjav0CUDwxCk-jVNRQ", tag: "Hip-Hop / Rap" },
    ],
  },
  {
    id: "asia",
    name: "Châu Á",
    badge: "C-Pop & J-Pop 🏮",
    description: "Giai điệu Á Đông cuốn hút & J-Pop/C-Pop thịnh hành",
    artists: [
      { name: "YOASOBI", channelId: "UCvpredjG93ifbCP1Y77JyFA", tag: "J-Pop / Electronic" },
      { name: "G.E.M. (Đặng Tử Kỳ)", channelId: "UCsLWG2t7n9LFsvH0wR2rtpw", tag: "C-Pop / Mandopop" },
      { name: "Châu Kiệt Luân (Jay Chou)", channelId: "UCL2MDNdwEtV6aYUgNjFQGZA", tag: "C-Pop / R&B" },
      { name: "Kenshi Yonezu", channelId: "UCvg_hs42MVVO2744211VEaA", tag: "J-Pop / Rock" },
    ],
  },
];

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

// In-memory cache to ensure instant loading and zero quota waste
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
          updatedAt: cached.updatedAt,
          cached: true,
        });
      }
      return NextResponse.json({ ...cached, cached: true });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    // Collect all channel IDs across all regions
    const allChannelIds: string[] = [];
    const channelToMetaMap = new Map<string, { customName: string; regionId: string; tag: string }>();

    for (const region of ARTIST_REGIONS) {
      for (const art of region.artists) {
        allChannelIds.push(art.channelId);
        channelToMetaMap.set(art.channelId, {
          customName: art.name,
          regionId: region.id,
          tag: art.tag,
        });
      }
    }

    let ytDataMap = new Map<string, any>();

    if (apiKey && allChannelIds.length > 0) {
      try {
        // YouTube API allows up to 50 IDs per call, so 27 channels fit into 1 single call!
        const channelsUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
        channelsUrl.searchParams.set("part", "snippet,statistics");
        channelsUrl.searchParams.set("id", allChannelIds.join(","));
        channelsUrl.searchParams.set("key", apiKey);

        const ytRes = await fetch(channelsUrl.toString());
        if (ytRes.ok) {
          const ytJson = await ytRes.json();
          for (const item of ytJson.items || []) {
            ytDataMap.set(item.id, item);
          }
        }
      } catch (ytErr) {
        console.warn("Trending artists live YouTube fetch warning:", ytErr);
      }
    }

    // Build finalized region structure with real live data
    const categories = ARTIST_REGIONS.map((region) => {
      const enrichedArtists = region.artists.map((art) => {
        const liveItem = ytDataMap.get(art.channelId);
        const snippet = liveItem?.snippet;
        const stats = liveItem?.statistics;

        const subCount = stats?.subscriberCount ? parseInt(stats.subscriberCount, 10) : 0;
        const viewCount = stats?.viewCount ? parseInt(stats.viewCount, 10) : 0;

        return {
          id: art.channelId,
          channelId: art.channelId,
          name: art.name, // Keep clean human-friendly artist name
          officialTitle: snippet?.title || art.name,
          customUrl: snippet?.customUrl || "",
          tag: art.tag,
          region: region.id,
          avatar:
            snippet?.thumbnails?.high?.url ||
            snippet?.thumbnails?.medium?.url ||
            `https://yt3.googleusercontent.com/default_avatar.png`,
          subscribers: formatCount(subCount),
          subscriberCount: subCount,
          views: formatCount(viewCount),
          viewCount: viewCount,
          videoCount: stats?.videoCount || 0,
        };
      });

      return {
        id: region.id,
        name: region.name,
        badge: region.badge,
        description: region.description,
        artists: enrichedArtists,
      };
    });

    const responsePayload = {
      categories,
      updatedAt: new Date().toISOString(),
      cached: false,
    };

    memoryCache = {
      timestamp: now,
      data: responsePayload,
    };

    if (requestedCategory && requestedCategory !== "all") {
      const filtered = categories.filter((c) => c.id === requestedCategory);
      return NextResponse.json({
        categories: filtered,
        updatedAt: responsePayload.updatedAt,
        cached: false,
      });
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("API /api/artists/trending error:", error);
    return NextResponse.json(
      { error: "Failed to load trending artists", details: error.message },
      { status: 500 }
    );
  }
}
