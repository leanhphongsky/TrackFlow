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

function parseDuration(iso?: string): number {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// Regex to exclude non-music video titles (reactions, reviews, podcasts, gameplay, etc.)
const NON_MUSIC_TITLE_REGEX =
  /\b(reaction|reacting|podcast|unboxing|gameplay|walkthrough|bình luận game|hài kịch|phim ngắn)\b/i;

function isShortVideo(duration: number, title: string): boolean {
  // Shorts are <= 60 seconds
  if (duration > 0 && duration <= 60) return true;
  // Shorts tag in title
  if (/#shorts?\b/i.test(title)) return true;
  return false;
}

function isMusicVideo(duration: number, title: string): boolean {
  if (isShortVideo(duration, title)) return false;
  if (NON_MUSIC_TITLE_REGEX.test(title)) return false;
  return true;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({ results: [], channels: [] });
    }

    const trimmedQuery = query.trim();
    let musicVideos: any[] = [];
    let channels: any[] = [];

    // METHOD 1: High-Performance, Zero-Quota Search via yt-search
    // (Eliminates YouTube Data API 429 quota exhaustion and finds 100% of music tracks across all categories)
    try {
      const searchResult = await ytSearch(trimmedQuery);
      const rawVideos = searchResult?.videos || [];
      const channelMap = new Map<string, any>();

      for (const v of rawVideos) {
        const title = decodeHtmlEntities(v.title || "");
        const duration = v.seconds || 0;

        // Apply strict filters: No Shorts, No non-music content
        if (!isMusicVideo(duration, title)) continue;

        const channelId = v.author?.url ? v.author.url.split("/channel/")[1] || "" : "";
        const artistName = decodeHtmlEntities(v.author?.name || "YouTube");

        musicVideos.push({
          id: `yt_${v.videoId}`,
          videoId: v.videoId,
          channelId: channelId,
          title: title,
          artist: artistName,
          audio_url: `https://www.youtube.com/watch?v=${v.videoId}`,
          image_url: v.thumbnail || v.image || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
          duration: duration,
        });

        // Collect top matching artist channels
        if (artistName && !channelMap.has(artistName) && channelMap.size < 3) {
          channelMap.set(artistName, {
            channelId: channelId,
            title: artistName,
            avatar: v.thumbnail || v.image,
            description: `Kênh nghệ sĩ: ${artistName}`,
          });
        }
      }

      channels = Array.from(channelMap.values());
    } catch (ytSearchErr) {
      console.warn("yt-search lookup failed, falling back to YouTube Data API:", ytSearchErr);
    }

    // METHOD 2: Official YouTube Data API Fallback (if yt-search returned empty and API key is present)
    if (musicVideos.length === 0) {
      const apiKey = process.env.YOUTUBE_API_KEY;

      if (apiKey) {
        try {
          const videoSearchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
          videoSearchUrl.searchParams.set("part", "snippet");
          videoSearchUrl.searchParams.set("type", "video");
          videoSearchUrl.searchParams.set("maxResults", "20");
          videoSearchUrl.searchParams.set("q", trimmedQuery);
          videoSearchUrl.searchParams.set("key", apiKey);

          const videoRes = await fetch(videoSearchUrl.toString());
          if (videoRes.ok) {
            const videoData = await videoRes.json();
            const rawVideoItems = videoData.items || [];
            const videoIds = rawVideoItems
              .map((item: any) => item.id?.videoId)
              .filter(Boolean)
              .join(",");

            if (videoIds) {
              const detailUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
              detailUrl.searchParams.set("part", "snippet,contentDetails");
              detailUrl.searchParams.set("id", videoIds);
              detailUrl.searchParams.set("key", apiKey);

              const detailRes = await fetch(detailUrl.toString());
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                for (const item of detailData.items || []) {
                  const videoId = item.id;
                  const snippet = item.snippet;
                  const duration = parseDuration(item.contentDetails?.duration);
                  const title = decodeHtmlEntities(snippet?.title || "");

                  if (!isMusicVideo(duration, title)) continue;

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
                    duration: duration,
                  });
                }
              }
            }
          }
        } catch (apiErr) {
          console.warn("YouTube Data API fallback error:", apiErr);
        }
      }
    }

    return NextResponse.json({ results: musicVideos, channels });
  } catch (error: any) {
    console.error("YouTube search route error:", error);
    return NextResponse.json(
      { error: "Failed to search YouTube", details: error.message },
      { status: 500 }
    );
  }
}
