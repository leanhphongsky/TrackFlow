import { NextResponse } from "next/server";
import ytSearch from "yt-search";

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

function formatCount(countStr?: string | number): string {
  if (!countStr) return "0";
  const num = typeof countStr === "string" ? parseInt(countStr, 10) : Number(countStr);
  if (isNaN(num)) return String(countStr);
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + " Tỷ";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let channelId = searchParams.get("channelId");
    const query = searchParams.get("q");

    const apiKey = process.env.YOUTUBE_API_KEY;

    let artistData: any = null;
    let popularSongs: any[] = [];

    // METHOD 1: Try official YouTube Data API v3 if API key is configured
    if (apiKey) {
      try {
        // 1. Search for channel if not provided
        if (!channelId && query) {
          const searchChannelUrl = new URL("https://www.googleapis.com/youtube/v3/search");
          searchChannelUrl.searchParams.set("part", "snippet");
          searchChannelUrl.searchParams.set("type", "channel");
          searchChannelUrl.searchParams.set("maxResults", "1");
          searchChannelUrl.searchParams.set("q", query);
          searchChannelUrl.searchParams.set("key", apiKey);

          const res = await fetch(searchChannelUrl.toString());
          if (res.ok) {
            const data = await res.json();
            if (data.items && data.items.length > 0) {
              channelId = data.items[0].id.channelId;
            }
          }
        }

        // 2. Fetch Channel Details
        if (channelId) {
          const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
          channelUrl.searchParams.set("part", "snippet,statistics,brandingSettings");
          channelUrl.searchParams.set("id", channelId);
          channelUrl.searchParams.set("key", apiKey);

          const channelRes = await fetch(channelUrl.toString());
          if (channelRes.ok) {
            const channelPayload = await channelRes.json();
            if (channelPayload.items && channelPayload.items.length > 0) {
              const channel = channelPayload.items[0];
              const snippet = channel.snippet;
              const statistics = channel.statistics;
              const branding = channel.brandingSettings;

              artistData = {
                id: channelId,
                name: decodeHtmlEntities(snippet.title || ""),
                customUrl: snippet.customUrl || "",
                description: decodeHtmlEntities(snippet.description || ""),
                avatar:
                  snippet.thumbnails?.high?.url ||
                  snippet.thumbnails?.medium?.url ||
                  snippet.thumbnails?.default?.url,
                banner: branding?.image?.bannerExternalUrl || null,
                subscribers: formatCount(statistics?.subscriberCount),
                views: formatCount(statistics?.viewCount),
                videoCount: statistics?.videoCount || 0,
              };

              // 3. Fetch popular videos ordered by viewCount
              const popularUrl = new URL("https://www.googleapis.com/youtube/v3/search");
              popularUrl.searchParams.set("part", "snippet");
              popularUrl.searchParams.set("channelId", channelId);
              popularUrl.searchParams.set("type", "video");
              popularUrl.searchParams.set("order", "viewCount");
              popularUrl.searchParams.set("maxResults", "20");
              popularUrl.searchParams.set("key", apiKey);

              const popularRes = await fetch(popularUrl.toString());
              if (popularRes.ok) {
                const popularPayload = await popularRes.json();
                const rawItems = popularPayload.items || [];
                const videoIds = rawItems.map((i: any) => i.id?.videoId).filter(Boolean).join(",");

                if (videoIds) {
                  // Fetch statistics (viewCount) for all videos in 1 batch call
                  const videoDetailUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
                  videoDetailUrl.searchParams.set("part", "snippet,statistics");
                  videoDetailUrl.searchParams.set("id", videoIds);
                  videoDetailUrl.searchParams.set("key", apiKey);

                  const videoDetailRes = await fetch(videoDetailUrl.toString());
                  if (videoDetailRes.ok) {
                    const videoDetailPayload = await videoDetailRes.json();
                    for (const vItem of videoDetailPayload.items || []) {
                      const videoId = vItem.id;
                      const vSnippet = vItem.snippet;
                      const rawViews = vItem.statistics?.viewCount
                        ? parseInt(vItem.statistics.viewCount, 10)
                        : 0;

                      popularSongs.push({
                        id: `yt_${videoId}`,
                        videoId: videoId,
                        title: decodeHtmlEntities(vSnippet.title || ""),
                        artist: artistData.name,
                        audio_url: `https://www.youtube.com/watch?v=${videoId}`,
                        image_url:
                          vSnippet.thumbnails?.high?.url ||
                          vSnippet.thumbnails?.medium?.url ||
                          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                        publishedAt: vSnippet.publishedAt,
                        views: rawViews,
                        viewsFormatted: formatViews(rawViews),
                      });
                    }
                  }
                }
              }
            }
          }
        }
      } catch (apiErr) {
        console.warn("YouTube Data API artist lookup error, falling back to yt-search:", apiErr);
      }
    }

    // METHOD 2: Zero-Quota Fallback via ytSearch
    // (Used when API Key quota is exhausted or channel lookup needs backup with exact view counts)
    if (popularSongs.length === 0 || !artistData) {
      const searchTerm = query || artistData?.name || "Music Artist";
      const ytResult = await ytSearch(searchTerm);
      const allVideos = ytResult?.videos || [];

      // Sort videos by views descending
      const sortedVideos = [...allVideos].sort((a, b) => (b.views || 0) - (a.views || 0));

      // Filter out shorts and non-music videos
      const filteredVideos = sortedVideos.filter((v) => {
        const title = v.title || "";
        const dur = v.seconds || 0;
        if (dur > 0 && dur <= 60) return false;
        if (/#shorts?\b/i.test(title)) return false;
        return true;
      });

      const targetVideos = filteredVideos.slice(0, 20);
      const topVideo = targetVideos[0];
      const fallbackArtistName =
        artistData?.name || topVideo?.author?.name || query || "Nghệ sĩ";

      if (!artistData) {
        const totalViews = targetVideos.reduce((acc, v) => acc + (v.views || 0), 0);
        artistData = {
          id: channelId || (topVideo?.author?.url ? topVideo.author.url.split("/channel/")[1] || "" : ""),
          name: decodeHtmlEntities(fallbackArtistName),
          customUrl: "",
          description: `Kênh nghệ sĩ chính thức: ${fallbackArtistName}`,
          avatar: (topVideo?.author as any)?.avatar || topVideo?.thumbnail || `https://i.ytimg.com/vi/${topVideo?.videoId}/hqdefault.jpg`,
          banner: null,
          subscribers: "N/A",
          views: formatViews(totalViews),
          videoCount: targetVideos.length,
        };
      }

      popularSongs = targetVideos.map((v) => ({
        id: `yt_${v.videoId}`,
        videoId: v.videoId,
        title: decodeHtmlEntities(v.title || ""),
        artist: decodeHtmlEntities(v.author?.name || fallbackArtistName),
        audio_url: `https://www.youtube.com/watch?v=${v.videoId}`,
        image_url: v.thumbnail || v.image || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
        publishedAt: v.ago || "",
        views: v.views || 0,
        viewsFormatted: formatViews(v.views),
      }));
    }

    if (!artistData) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    return NextResponse.json({
      artist: artistData,
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
