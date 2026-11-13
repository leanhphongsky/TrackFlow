import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseDuration(iso?: string): number {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

const NON_MUSIC_REGEX =
  /\b(reaction|reacting|podcast|unboxing|review|phỏng vấn|interview|hậu trường|behind the scenes|gameplay|bình luận game|tập \d+|phim ngắn|hài kịch|trailer|vlog)\b/i;

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

    // 1. Parallel search:
    // Query A: Strictly Music Category videos (videoCategoryId: "10")
    // Query B: Relevant Artist Channels
    const videoSearchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    videoSearchUrl.searchParams.set("part", "snippet");
    videoSearchUrl.searchParams.set("type", "video");
    videoSearchUrl.searchParams.set("videoCategoryId", "10"); // Strict Music Only
    videoSearchUrl.searchParams.set("maxResults", "25");
    videoSearchUrl.searchParams.set("q", query);
    videoSearchUrl.searchParams.set("key", apiKey);

    const channelSearchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    channelSearchUrl.searchParams.set("part", "snippet");
    channelSearchUrl.searchParams.set("type", "channel");
    channelSearchUrl.searchParams.set("maxResults", "3");
    channelSearchUrl.searchParams.set("q", query);
    channelSearchUrl.searchParams.set("key", apiKey);

    const [videoRes, channelRes] = await Promise.all([
      fetch(videoSearchUrl.toString()),
      fetch(channelSearchUrl.toString()),
    ]);

    const [videoData, channelData] = await Promise.all([
      videoRes.json(),
      channelRes.json(),
    ]);

    if (!videoRes.ok) {
      console.error("YouTube Search API error:", videoData);
      return NextResponse.json(
        { error: videoData.error?.message || "YouTube API error" },
        { status: videoRes.status }
      );
    }

    // 2. Process artist channels
    const channels: any[] = [];
    (channelData.items || []).forEach((item: any) => {
      const snippet = item.snippet;
      if (item.id?.channelId && snippet) {
        channels.push({
          channelId: item.id.channelId,
          title: decodeHtmlEntities(snippet.title || ""),
          avatar:
            snippet.thumbnails?.high?.url ||
            snippet.thumbnails?.medium?.url ||
            snippet.thumbnails?.default?.url,
          description: decodeHtmlEntities(snippet.description || ""),
        });
      }
    });

    // 3. Batch retrieve video details to check duration & filter out YouTube Shorts
    const rawVideoItems = videoData.items || [];
    const videoIds = rawVideoItems
      .map((item: any) => item.id?.videoId)
      .filter(Boolean)
      .join(",");

    let musicVideos: any[] = [];

    if (videoIds) {
      const detailUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      detailUrl.searchParams.set("part", "snippet,contentDetails,statistics");
      detailUrl.searchParams.set("id", videoIds);
      detailUrl.searchParams.set("key", apiKey);

      const detailRes = await fetch(detailUrl.toString());
      if (detailRes.ok) {
        const detailData = await detailRes.json();
        const detailItems = detailData.items || [];

        detailItems.forEach((item: any) => {
          const videoId = item.id;
          const snippet = item.snippet;
          const contentDetails = item.contentDetails;
          const duration = parseDuration(contentDetails?.duration);
          const title = decodeHtmlEntities(snippet?.title || "");
          const description = snippet?.description || "";

          // STRICT FILTER 1: Exclude YouTube Shorts (duration <= 60s or containing #shorts)
          if (duration > 0 && duration <= 60) return;
          if (/#shorts|\bshorts\b|#short|tiktok/i.test(title + " " + description)) return;

          // STRICT FILTER 2: Exclude non-music content (reactions, reviews, podcasts, gameplay, etc.)
          if (NON_MUSIC_REGEX.test(title)) return;

          const thumbnail =
            snippet.thumbnails?.high?.url ||
            snippet.thumbnails?.medium?.url ||
            snippet.thumbnails?.default?.url ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

          musicVideos.push({
            id: `yt_${videoId}`,
            videoId: videoId,
            channelId: snippet.channelId,
            title: title,
            artist: decodeHtmlEntities(snippet.channelTitle || "YouTube"),
            audio_url: `https://www.youtube.com/watch?v=${videoId}`,
            image_url: thumbnail,
            duration: duration,
          });
        });
      }
    }

    // Fallback if detail fetch didn't return (use raw video list filtered by title)
    if (musicVideos.length === 0 && rawVideoItems.length > 0) {
      rawVideoItems.forEach((item: any) => {
        const videoId = item.id?.videoId;
        if (!videoId) return;
        const snippet = item.snippet;
        const title = decodeHtmlEntities(snippet.title || "");
        if (NON_MUSIC_REGEX.test(title)) return;
        if (/#shorts|\bshorts\b/i.test(title)) return;

        musicVideos.push({
          id: `yt_${videoId}`,
          videoId: videoId,
          channelId: snippet.channelId,
          title: title,
          artist: decodeHtmlEntities(snippet.channelTitle || "YouTube"),
          audio_url: `https://www.youtube.com/watch?v=${videoId}`,
          image_url:
            snippet.thumbnails?.high?.url ||
            snippet.thumbnails?.medium?.url ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          duration: 0,
        });
      });
    }

    return NextResponse.json({ results: musicVideos, channels });
  } catch (error: any) {
    console.error("YouTube search error:", error);
    return NextResponse.json(
      { error: "Failed to search YouTube", details: error.message },
      { status: 500 }
    );
  }
}
