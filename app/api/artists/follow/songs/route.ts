import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import ytSearch from "yt-search";

export const dynamic = "force-dynamic";

// In-memory cache for followed artist songs (10 minutes TTL)
const songsCache = new Map<string, { timestamp: number; songs: any[] }>();
const CACHE_TTL = 10 * 60 * 1000;

function formatViews(views?: number | string): string {
  if (!views) return "0 lượt xem";
  const num = typeof views === "string" ? parseInt(views.replace(/[^0-9]/g, ""), 10) : Number(views);
  if (isNaN(num) || num <= 0) return String(views);
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + " Tỷ lượt xem";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + " Tr lượt xem";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + " N lượt xem";
  }
  return num.toLocaleString("vi-VN") + " lượt xem";
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({
        artists: [],
        songs: [],
        message: "Vui lòng đăng nhập để xem bài hát từ nghệ sĩ theo dõi",
      });
    }

    // 1. Fetch user's followed artists from PostgreSQL
    const artists = await sql`
      SELECT id, artist_name, channel_id, avatar_url, created_at
      FROM followed_artists
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 12
    `;

    if (!artists || artists.length === 0) {
      return NextResponse.json({
        artists: [],
        songs: [],
      });
    }

    // 2. Fetch songs for followed artists in parallel (capped at top 8 to stay fast)
    const topFollowed = artists.slice(0, 8);
    const songsPromises = topFollowed.map(async (art: any) => {
      const cacheKey = art.artist_name.trim().toLowerCase();
      const cached = songsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.songs;
      }

      try {
        const query = `${art.artist_name} official music`;
        const res = await (ytSearch as any)(query);
        const videos = (res.videos || []).slice(0, 4);

        const artistSongs = videos.map((v: any) => ({
          id: `yt_${v.videoId}`,
          title: v.title,
          artist: art.artist_name,
          artistAvatar: art.avatar_url || null,
          channelId: art.channel_id || null,
          image_url: v.thumbnail || v.image,
          audio_url: `https://www.youtube.com/watch?v=${v.videoId}`,
          videoId: v.videoId,
          duration: v.timestamp || `${Math.floor(v.seconds / 60)}:${(v.seconds % 60).toString().padStart(2, "0")}`,
          duration_seconds: v.seconds || 0,
          views: formatViews(v.views),
          rawViews: v.views || 0,
          source: "youtube",
        }));

        songsCache.set(cacheKey, { timestamp: Date.now(), songs: artistSongs });
        return artistSongs;
      } catch (e) {
        console.warn(`Error fetching songs for followed artist ${art.artist_name}:`, e);
        return [];
      }
    });

    const nestedSongs = await Promise.all(songsPromises);
    // Interleave or combine songs from different artists
    const allSongs = nestedSongs.flat();

    // Sort by views or recency
    allSongs.sort((a, b) => (b.rawViews || 0) - (a.rawViews || 0));

    return NextResponse.json({
      artists,
      songs: allSongs,
    });
  } catch (error: any) {
    console.error("Error in followed songs route:", error);
    return NextResponse.json(
      { error: "Failed to fetch followed songs", details: error.message },
      { status: 500 }
    );
  }
}
