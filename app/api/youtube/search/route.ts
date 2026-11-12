import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({ results: [], channels: [] });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "YOUTUBE_API_KEY is not configured on server" },
        { status: 500 }
      );
    }

    // Call official YouTube Data API v3 for both video and channel
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video,channel");
    url.searchParams.set("maxResults", "20");
    url.searchParams.set("q", query);
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (!res.ok) {
      console.error("YouTube API error:", data);
      return NextResponse.json(
        { error: data.error?.message || "YouTube API error" },
        { status: res.status }
      );
    }

    const channels: any[] = [];
    const videos: any[] = [];

    (data.items || []).forEach((item: any) => {
      const snippet = item.snippet;
      if (item.id?.kind === "youtube#channel") {
        channels.push({
          channelId: item.id.channelId,
          title: decodeHtmlEntities(snippet.title || ""),
          avatar:
            snippet.thumbnails?.high?.url ||
            snippet.thumbnails?.medium?.url ||
            snippet.thumbnails?.default?.url,
          description: decodeHtmlEntities(snippet.description || ""),
        });
      } else if (item.id?.kind === "youtube#video" && item.id.videoId) {
        const videoId = item.id.videoId;
        const thumbnail =
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        videos.push({
          id: `yt_${videoId}`,
          videoId: videoId,
          channelId: snippet.channelId,
          title: decodeHtmlEntities(snippet.title || ""),
          artist: decodeHtmlEntities(snippet.channelTitle || "YouTube"),
          audio_url: `https://www.youtube.com/watch?v=${videoId}`,
          image_url: thumbnail,
          duration: 0,
        });
      }
    });

    return NextResponse.json({ results: videos, channels });
  } catch (error: any) {
    console.error("YouTube search error:", error);
    return NextResponse.json(
      { error: "Failed to search YouTube", details: error.message },
      { status: 500 }
    );
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
