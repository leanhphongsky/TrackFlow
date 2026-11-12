import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let channelId = searchParams.get("channelId");
    const query = searchParams.get("q");

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "YOUTUBE_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // 1. If channelId is not provided, search for the channel by name
    if (!channelId && query) {
      const searchChannelUrl = new URL("https://www.googleapis.com/youtube/v3/search");
      searchChannelUrl.searchParams.set("part", "snippet");
      searchChannelUrl.searchParams.set("type", "channel");
      searchChannelUrl.searchParams.set("maxResults", "1");
      searchChannelUrl.searchParams.set("q", query);
      searchChannelUrl.searchParams.set("key", apiKey);

      const res = await fetch(searchChannelUrl.toString());
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        channelId = data.items[0].id.channelId;
      }
    }

    if (!channelId) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    // 2. Fetch Channel Details (snippet, statistics, brandingSettings)
    const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
    channelUrl.searchParams.set("part", "snippet,statistics,brandingSettings");
    channelUrl.searchParams.set("id", channelId);
    channelUrl.searchParams.set("key", apiKey);

    const channelRes = await fetch(channelUrl.toString());
    const channelData = await channelRes.json();

    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json({ error: "Artist details not found" }, { status: 404 });
    }

    const channel = channelData.items[0];
    const snippet = channel.snippet;
    const statistics = channel.statistics;
    const branding = channel.brandingSettings;

    // 3. Fetch Popular Songs / Videos (ordered by viewCount)
    const popularUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    popularUrl.searchParams.set("part", "snippet");
    popularUrl.searchParams.set("channelId", channelId);
    popularUrl.searchParams.set("type", "video");
    popularUrl.searchParams.set("order", "viewCount");
    popularUrl.searchParams.set("maxResults", "20");
    popularUrl.searchParams.set("key", apiKey);

    const popularRes = await fetch(popularUrl.toString());
    const popularData = await popularRes.json();

    const popularSongs = (popularData.items || []).map((item: any) => {
      const videoId = item.id.videoId;
      return {
        id: `yt_${videoId}`,
        videoId: videoId,
        title: decodeHtmlEntities(item.snippet.title || ""),
        artist: decodeHtmlEntities(snippet.title || ""),
        audio_url: `https://www.youtube.com/watch?v=${videoId}`,
        image_url:
          item.snippet.thumbnails?.high?.url ||
          item.snippet.thumbnails?.medium?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        publishedAt: item.snippet.publishedAt,
      };
    });

    return NextResponse.json({
      artist: {
        id: channelId,
        name: decodeHtmlEntities(snippet.title || ""),
        customUrl: snippet.customUrl || "",
        description: decodeHtmlEntities(snippet.description || ""),
        avatar:
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url,
        banner:
          branding?.image?.bannerExternalUrl ||
          null,
        subscribers: formatCount(statistics?.subscriberCount),
        views: formatCount(statistics?.viewCount),
        videoCount: statistics?.videoCount || 0,
      },
      popularSongs,
    });
  } catch (error: any) {
    console.error("Artist profile API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch artist profile", details: error.message },
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

function formatCount(countStr?: string): string {
  if (!countStr) return "0";
  const num = parseInt(countStr, 10);
  if (isNaN(num)) return countStr;
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num.toLocaleString();
}
