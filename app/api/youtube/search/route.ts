import { NextResponse } from "next/server";
import ytSearch from "yt-search";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({ results: [] });
    }

    // Search YouTube for music/videos
    const searchResults = await ytSearch(query);

    const videos = (searchResults.videos || []).slice(0, 20).map((v) => ({
      id: `yt_${v.videoId}`,
      videoId: v.videoId,
      title: v.title,
      artist: v.author?.name || "YouTube",
      audio_url: `https://www.youtube.com/watch?v=${v.videoId}`,
      image_url: v.thumbnail || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
      duration: v.seconds || 0,
      timestamp: v.timestamp || "",
      views: v.views || 0,
    }));

    return NextResponse.json({ results: videos });
  } catch (error: any) {
    console.error("YouTube search error:", error);
    return NextResponse.json(
      { error: "Failed to search YouTube", details: error.message },
      { status: 500 }
    );
  }
}
