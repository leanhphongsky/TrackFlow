import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export interface DailyMixItem {
  id: string;
  mixNumber: number;
  name: string;
  theme: string;
  badge: string;
  description: string;
  coverUrl: string;
  accentGradient: string;
  accentColor: string;
  artistsSummary: string;
  songs: Array<{
    id: string | number;
    title: string;
    artist: string;
    audio_url: string;
    image_url: string | null;
    duration: number;
    source?: string;
    viewsGain24hFormatted?: string;
  }>;
}

// Fisher-Yates array shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Format duration helper
function parseDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "3:30";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export async function GET() {
  try {
    // 1. Fetch latest chart songs grouped by region
    let chartRows: any[] = [];
    try {
      chartRows = await sql`
        SELECT video_id, title, artist, image_url, region, rank, views_gain_24h
        FROM daily_trending_charts
        ORDER BY chart_date DESC, rank ASC
        LIMIT 200
      `;
    } catch (dbErr) {
      console.warn("Could not query daily_trending_charts:", dbErr);
    }

    // Deduplicate songs by video_id
    const seenVideos = new Set<string>();
    const deduplicatedRows = chartRows.filter((r) => {
      if (!r.video_id || seenVideos.has(r.video_id)) return false;
      seenVideos.add(r.video_id);
      return true;
    });

    const vpopTracks = deduplicatedRows
      .filter((r) => r.region === "vpop")
      .map((r) => ({
        id: `yt_${r.video_id}`,
        title: r.title,
        artist: r.artist,
        audio_url: `https://www.youtube.com/watch?v=${r.video_id}`,
        image_url: r.image_url,
        duration: 210,
        source: "youtube",
      }));

    const usukTracks = deduplicatedRows
      .filter((r) => r.region === "usuk")
      .map((r) => ({
        id: `yt_${r.video_id}`,
        title: r.title,
        artist: r.artist,
        audio_url: `https://www.youtube.com/watch?v=${r.video_id}`,
        image_url: r.image_url,
        duration: 195,
        source: "youtube",
      }));

    const kpopTracks = deduplicatedRows
      .filter((r) => r.region === "kpop")
      .map((r) => ({
        id: `yt_${r.video_id}`,
        title: r.title,
        artist: r.artist,
        audio_url: `https://www.youtube.com/watch?v=${r.video_id}`,
        image_url: r.image_url,
        duration: 200,
        source: "youtube",
      }));

    const asiaTracks = deduplicatedRows
      .filter((r) => r.region === "asia")
      .map((r) => ({
        id: `yt_${r.video_id}`,
        title: r.title,
        artist: r.artist,
        audio_url: `https://www.youtube.com/watch?v=${r.video_id}`,
        image_url: r.image_url,
        duration: 220,
        source: "youtube",
      }));

    // Curated high-quality Chill & Lo-Fi tracks as backup / enrichment
    const defaultChillTracks = [
      {
        id: "yt_jfKfPfyJRdk",
        title: "lofi hip hop radio - beats to relax/study to",
        artist: "Lofi Girl",
        audio_url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
        image_url: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
        duration: 240,
        source: "youtube",
      },
      {
        id: "yt_5yx6BWlEVcY",
        title: "Chillhop Radio - jazzy & lofi hip hop beats",
        artist: "Chillhop Music",
        audio_url: "https://www.youtube.com/watch?v=5yx6BWlEVcY",
        image_url: "https://i.ytimg.com/vi/5yx6BWlEVcY/hqdefault.jpg",
        duration: 215,
        source: "youtube",
      },
      {
        id: "yt_7NOSDKb0HlU",
        title: "Lạ Lùng (Acoustic Version)",
        artist: "Vũ.",
        audio_url: "https://www.youtube.com/watch?v=7NOSDKb0HlU",
        image_url: "https://i.ytimg.com/vi/7NOSDKb0HlU/hqdefault.jpg",
        duration: 260,
        source: "youtube",
      },
      {
        id: "yt_gZjyK8j9T3c",
        title: "Nàng Thơ (Piano Acoustic)",
        artist: "Hoàng Dũng",
        audio_url: "https://www.youtube.com/watch?v=gZjyK8j9T3c",
        image_url: "https://i.ytimg.com/vi/gZjyK8j9T3c/hqdefault.jpg",
        duration: 250,
        source: "youtube",
      },
      {
        id: "yt_bM7SZ5SBzyY",
        title: "slow dancing in the dark (acoustic)",
        artist: "Joji",
        audio_url: "https://www.youtube.com/watch?v=bM7SZ5SBzyY",
        image_url: "https://i.ytimg.com/vi/bM7SZ5SBzyY/hqdefault.jpg",
        duration: 210,
        source: "youtube",
      },
    ];

    // Build the 4 Daily Mixes
    // 1. MIX 1: V-Pop & Indie Việt
    const mix1Songs = shuffleArray(vpopTracks.length > 0 ? vpopTracks : defaultChillTracks);
    const mix1Artists = Array.from(new Set(mix1Songs.map((s) => s.artist)))
      .slice(0, 3)
      .join(", ") || "Vũ., Hoàng Dũng, Sơn Tùng M-TP";

    // 2. MIX 2: Chill, Lo-Fi & Acoustic
    // Blend mellow V-Pop, Asia and curated chill tracks
    const chillPool = [
      ...defaultChillTracks,
      ...vpopTracks.slice(0, 10),
      ...asiaTracks.slice(0, 6),
      ...kpopTracks.slice(0, 6),
    ];
    const mix2Songs = shuffleArray(chillPool);
    const mix2Artists = Array.from(new Set(mix2Songs.map((s) => s.artist)))
      .slice(0, 3)
      .join(", ") || "Lofi Girl, Vũ., Joji";

    // 3. MIX 3: US-UK Pop & Hip-Hop Trending
    const mix3Songs = shuffleArray(usukTracks.length > 0 ? usukTracks : defaultChillTracks);
    const mix3Artists = Array.from(new Set(mix3Songs.map((s) => s.artist)))
      .slice(0, 3)
      .join(", ") || "Future, Drake, Travis Scott";

    // 4. MIX 4: K-Pop & Asian Vibes
    const kpopAsiaPool = [...kpopTracks, ...asiaTracks];
    const mix4Songs = shuffleArray(kpopAsiaPool.length > 0 ? kpopAsiaPool : defaultChillTracks);
    const mix4Artists = Array.from(new Set(mix4Songs.map((s) => s.artist)))
      .slice(0, 3)
      .join(", ") || "ILLIT, Crush, M!LK";

    const mixes: DailyMixItem[] = [
      {
        id: "mix-1",
        mixNumber: 1,
        name: "Daily Mix 1",
        theme: "V-Pop & Indie Việt",
        badge: "Việt Nam 🇻🇳",
        description: `Tuyển chọn các giai điệu V-Pop, Indie và Ballad Việt Nam từ ${mix1Artists} và nhiều nghệ sĩ khác.`,
        coverUrl:
          mix1Songs[0]?.image_url ||
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
        accentGradient: "from-purple-900/80 via-indigo-950 to-black",
        accentColor: "#a855f7",
        artistsSummary: `${mix1Artists}, và nhiều hơn nữa`,
        songs: mix1Songs,
      },
      {
        id: "mix-2",
        mixNumber: 2,
        name: "Daily Mix 2",
        theme: "Chill, Lo-Fi & Acoustic",
        badge: "Thư giãn ☕",
        description: `Giai điệu lofi êm dịu, acoustic mộc mạc và chillout nhẹ nhàng từ ${mix2Artists} giúp bạn tập trung và thư giãn.`,
        coverUrl:
          mix2Songs[0]?.image_url ||
          "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80",
        accentGradient: "from-sky-950/90 via-slate-900 to-black",
        accentColor: "#38bdf8",
        artistsSummary: `${mix2Artists}, và nhiều hơn nữa`,
        songs: mix2Songs,
      },
      {
        id: "mix-3",
        mixNumber: 3,
        name: "Daily Mix 3",
        theme: "US-UK Pop & Hip-Hop",
        badge: "Âu Mỹ 🌎",
        description: `Bùng nổ cùng những bản hit US-UK, Rap/Hip-hop và Pop đình đám nhất từ ${mix3Artists}.`,
        coverUrl:
          mix3Songs[0]?.image_url ||
          "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
        accentGradient: "from-rose-950/90 via-[#1f0d11] to-black",
        accentColor: "#f43f5e",
        artistsSummary: `${mix3Artists}, và nhiều hơn nữa`,
        songs: mix3Songs,
      },
      {
        id: "mix-4",
        mixNumber: 4,
        name: "Daily Mix 4",
        theme: "K-Pop & Asian Energy",
        badge: "Châu Á 🌸",
        description: `Giai điệu K-Pop & J-Pop bùng nổ năng lượng, vũ đạo và âm nhạc Châu Á từ ${mix4Artists}.`,
        coverUrl:
          mix4Songs[0]?.image_url ||
          "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
        accentGradient: "from-emerald-950/90 via-[#0a1811] to-black",
        accentColor: "#10b981",
        artistsSummary: `${mix4Artists}, và nhiều hơn nữa`,
        songs: mix4Songs,
      },
    ];

    return NextResponse.json({ mixes });
  } catch (error: any) {
    console.error("Failed to generate daily mixes:", error);
    return NextResponse.json(
      { error: "Failed to generate daily mixes", details: error.message },
      { status: 500 }
    );
  }
}
