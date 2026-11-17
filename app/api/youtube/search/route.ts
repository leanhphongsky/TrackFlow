import { NextResponse } from "next/server";
import ytSearch from "yt-search";
import { searchYouTubeMusicInnertube } from "@/lib/innertube";

export const dynamic = "force-dynamic";

// High-speed In-Memory Cache with LRU & TTL (inspired by Liner queryCache)
interface CacheEntry {
  data: { results: any[]; channels: any[] };
  timestamp: number;
}

const SEARCH_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_ENTRIES = 250;
const searchCache = new Map<string, CacheEntry>();
const inFlightSearches = new Map<string, Promise<{ results: any[]; channels: any[] }>>();

function getCachedSearch(key: string) {
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > SEARCH_CACHE_TTL_MS) {
    searchCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedSearch(key: string, data: { results: any[]; channels: any[] }) {
  if (searchCache.size >= MAX_CACHE_ENTRIES) {
    // Delete oldest 20 entries
    const oldestKeys = Array.from(searchCache.keys()).slice(0, 20);
    for (const k of oldestKeys) searchCache.delete(k);
  }
  searchCache.set(key, { data, timestamp: Date.now() });
}

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

function formatViews(views?: number | string): string {
  if (!views) return "";
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
    const cacheKey = trimmedQuery.toLowerCase();

    // 1. Instant Cache Hit (sub-millisecond response)
    const cached = getCachedSearch(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "X-Cache": "HIT",
        },
      });
    }

    // 2. In-Flight Request Deduplication (Liner technique)
    let searchPromise = inFlightSearches.get(cacheKey);
    if (!searchPromise) {
      searchPromise = (async () => {
        let musicVideos: any[] = [];
        let channels: any[] = [];

        // METHOD 1: Ultra High-Speed InnerTube Search (Liner Architecture: 500-700ms, Zero Quota)
        try {
          const innertubeData = await searchYouTubeMusicInnertube(trimmedQuery);
          if (innertubeData?.results && innertubeData.results.length > 0) {
            // If InnerTube did not find an official artist card with avatar, look up direct channel avatar
            if (!innertubeData.channels?.[0]?.avatar) {
              const chLookup = await (ytSearch as any)({ query: trimmedQuery, type: "channel" }).catch(() => null);
              if (chLookup?.channels?.[0]) {
                const bestCh = chLookup.channels[0];
                const channelAvatar = bestCh.image || bestCh.thumbnail;
                if (channelAvatar) {
                  if (innertubeData.channels.length > 0) {
                    innertubeData.channels[0].avatar = channelAvatar;
                    if (!innertubeData.channels[0].subscribers && bestCh.subCountLabel) {
                      innertubeData.channels[0].subscribers = `${bestCh.subCountLabel} người đăng ký`;
                    }
                  } else {
                    innertubeData.channels.push({
                      channelId: bestCh.id || (bestCh.url ? bestCh.url.split("/channel/")[1] || "" : ""),
                      title: bestCh.name || bestCh.title,
                      avatar: channelAvatar,
                      description: bestCh.about || `Kênh nghệ sĩ: ${bestCh.name || bestCh.title}`,
                      subscribers: bestCh.subCountLabel ? `${bestCh.subCountLabel} người đăng ký` : "",
                      verified: Boolean(bestCh.verified),
                    });
                  }
                }
              }
            }

            setCachedSearch(cacheKey, innertubeData);
            return innertubeData;
          }
        } catch (innerErr) {
          console.warn("InnerTube search failed, proceeding to yt-search fallback:", innerErr);
        }

        // METHOD 2: High-Performance, Zero-Quota Fallback via yt-search (NO sequential author scraping)
        try {
          const [searchResult, directChannelResult] = await Promise.all([
            ytSearch(trimmedQuery),
            (ytSearch as any)({ query: trimmedQuery, type: "channel" }).catch(() => null),
          ]);
          const rawVideos = searchResult?.videos || [];

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
              views: v.views || 0,
              viewsFormatted: formatViews(v.views),
            });
          }

          // Instant channel extraction without slow sequential HTTP requests
          const seenNames = new Set<string>();
          if (directChannelResult?.channels && directChannelResult.channels.length > 0) {
            for (const ch of directChannelResult.channels) {
              const name = ch.name || ch.title;
              if (!name || seenNames.has(name.toLowerCase())) continue;
              seenNames.add(name.toLowerCase());

              channels.push({
                channelId: ch.id || (ch.url ? ch.url.split("/channel/")[1] || "" : ""),
                title: name,
                avatar: ch.image || ch.thumbnail || null,
                description: ch.about || `Kênh: ${name}`,
                subscribers: ch.subCountLabel ? `${ch.subCountLabel} người đăng ký` : "",
                verified: Boolean(ch.verified),
              });

              if (channels.length >= 3) break;
            }
          }

          // Supplement with video authors if direct channel was empty
          if (channels.length === 0) {
            for (const v of rawVideos.slice(0, 6)) {
              const name = v.author?.name;
              if (!name || seenNames.has(name.toLowerCase())) continue;
              seenNames.add(name.toLowerCase());
              const channelId = v.author?.url ? v.author.url.split("/channel/")[1] || "" : "";

              channels.push({
                channelId: channelId,
                title: name,
                avatar: null,
                description: `Kênh nghệ sĩ: ${name}`,
                subscribers: "",
                verified: false,
              });

              if (channels.length >= 3) break;
            }
          }
        } catch (ytSearchErr) {
          console.warn("yt-search lookup failed, falling back to YouTube Data API:", ytSearchErr);
        }

        // METHOD 2: Official YouTube Data API Fallback
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
                  detailUrl.searchParams.set("part", "snippet,contentDetails,statistics");
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
                      const rawViews = item.statistics?.viewCount ? parseInt(item.statistics.viewCount, 10) : 0;

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
                        views: rawViews,
                        viewsFormatted: formatViews(rawViews),
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

        const payload = { results: musicVideos, channels };
        setCachedSearch(cacheKey, payload);
        return payload;
      })();

      inFlightSearches.set(cacheKey, searchPromise);
    }

    try {
      const data = await searchPromise;
      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "X-Cache": "MISS",
        },
      });
    } finally {
      inFlightSearches.delete(cacheKey);
    }
  } catch (error: any) {
    console.error("YouTube search route error:", error);
    return NextResponse.json(
      { error: "Failed to search YouTube", details: error.message },
      { status: 500 }
    );
  }
}
