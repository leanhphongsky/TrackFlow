import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({ results: [] });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "YOUTUBE_API_KEY is not configured on server" },
        { status: 500 }
      );
    }

    // Call official YouTube Data API v3
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
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

    const videos = (data.items || [])
      .filter((item: any) => item.id?.videoId)
      .map((item: any) => {
        const videoId = item.id.videoId;
        const snippet = item.snippet;
        const thumbnail =
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        return {
          id: `yt_${videoId}`,
          videoId: videoId,
          title: decodeHtmlEntities(snippet.title || ""),
          artist: decodeHtmlEntities(snippet.channelTitle || "YouTube"),
          audio_url: `https://www.youtube.com/watch?v=${videoId}`,
          image_url: thumbnail,
          duration: 0,
        };
      });

    return NextResponse.json({ results: videos });
  } catch (error: any) {
    console.error("YouTube search error:", error);
    return NextResponse.json(
      { error: "Failed to search YouTube", details: error.message },
      { status: 500 }
    );
  }
}

// Decode basic HTML entities that YouTube titles often have (e.g. &amp;, &quot;, &#39;)
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
