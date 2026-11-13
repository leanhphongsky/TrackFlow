import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

interface TrendingRegionConfig {
  id: string;
  name: string;
  badge: string;
  regionCode: string;
  description: string;
}

const SONG_REGIONS: TrendingRegionConfig[] = [
  {
    id: "vpop",
    name: "V-Pop",
    badge: "Việt Nam 🇻🇳",
    regionCode: "VN",
    description: "Xếp hạng theo lượt xem tăng trưởng trong 24 giờ qua tại Việt Nam",
  },
  {
    id: "kpop",
    name: "K-Pop",
    badge: "Hàn Quốc 🇰🇷",
    regionCode: "KR",
    description: "Xếp hạng ca khúc K-Pop bứt phá lượt xem nhiều nhất trong 24 giờ",
  },
  {
    id: "usuk",
    name: "Âu Mỹ",
    badge: "US-UK 🌎",
    regionCode: "US",
    description: "Top ca khúc US-UK tăng trưởng lượt xem mạnh nhất 24 giờ qua",
  },
  {
    id: "asia",
    name: "Châu Á",
    badge: "Châu Á 🏮",
    regionCode: "JP",
    description: "Top ca khúc Châu Á & J-Pop tăng trưởng lượt xem 24 giờ qua",
  },
];

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function cleanSongTitle(title: string): string {
  if (!title) return "";
  let clean = decodeHtmlEntities(title);
  clean = clean
    .replace(/\s*[\[\(](?:Official\s*(?:Music\s*)?Video|M\/?V|Performance|Visualizer|Lyric\s*Video|Audio|Teaser|Prod\..*)[\]\)]/gi, "")
    .replace(/\s*\|\s*(?:Official\s*(?:Music\s*)?Video|M\/?V|Official Performance|Visualizer|Lyric Video).*/gi, "")
    .replace(/\s*-\s*(?:Official\s*(?:Music\s*)?Video|M\/?V).*/gi, "")
    .trim();
  return clean || decodeHtmlEntities(title);
}

function cleanArtistName(channelTitle: string): string {
  if (!channelTitle) return "";
  return decodeHtmlEntities(channelTitle)
    .replace(/\s*-\s*Topic/gi, "")
    .replace(/\s*Official/gi, "")
    .replace(/\s*VEVO/gi, "")
    .replace(/\s*Channel/gi, "")
    .trim();
}

function formatCount(numStr?: string | number): string {
  if (!numStr) return "0";
  const num = typeof numStr === "string" ? parseInt(numStr, 10) : Number(numStr);
  if (isNaN(num)) return "0";
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + " Tỷ";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + " Tr";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + " N";
  }
  return num.toLocaleString("vi-VN");
}

const VN_DIACRITICS_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const HANGUL_REGEX = /[\uac00-\ud7a3\u1100-\u11ff]/;
const JAPANESE_KANA_REGEX = /[\u3040-\u30ff\u31f0-\u31ff]/;
const CHINESE_REGEX = /[\u4e00-\u9fa5]/;

const KPOP_KNOWN_NAMES = [
  "hybe", "smtown", "jyp", "yg", "1thek", "stone music", "starship", "mnet", "bangtantv",
  "blackpink", "newjeans", "ive", "aespa", "twice", "seventeen", "stray kids", "le sserafim",
  "babymonster", "illit", "txt", "enhypen", "nct", "exo", "red velvet", "itzy", "ateez",
  "treasure", "stayc", "nmixx", "boynextdoor", "tws", "zerobaseone", "riize", "kiss of life",
  "qwer", "iu", "taeyeon", "rosé", "jennie", "lisa", "jisoo", "g-dragon", "bigbang", "taeyang",
  "psy", "zico", "crush", "bts", "jungkook", "jimin", "v", "jin", "suga", "rm", "j-hope",
  "isegye idol", "panda gomm"
];

const VN_KNOWN_NAMES = [
  "sơn tùng", "den vau", "đen vâu", "hieuthuhai", "soobin", "vũ.", "wren evans",
  "phan mạnh quỳnh", "mono", "amee", "min", "erik", "đức phúc", "hòa minzy",
  "bích phương", "văn mai hương", "jack", "k-icm", "karik", "justatee", "rhymastic",
  "mck", "tlinh", "grey d", "andiez", "quân a.p", "kay trần", "spacespeakers",
  "đạt g", "b ray", "masew", "pháo", "double2t", "phương mỹ chi", "hoàng thùy linh",
  "trúc nhân", "osad", "coolkid", "quang hùng masterd", "anh tú", "dương domic",
  "rhyder", "captain boy", "hurrykng", "wean", "jsol", "lou hoàng", "ali hoàng dương",
  "pháp kiều", "neko lê", "isaac", "jun phạm", "bb trần", "cường seven", "bằng kiều",
  "quốc thiên", "hà anh tuấn", "trung quân", "vũ cát tường", "chi pu"
];

function isPureRegionSong(title: string, channelTitle: string, regionId: string): boolean {
  const combined = (title + " " + channelTitle).toLowerCase();
  const hasVn = VN_DIACRITICS_REGEX.test(combined) || VN_KNOWN_NAMES.some((n) => combined.includes(n));
  const hasHangul = HANGUL_REGEX.test(combined);
  const hasKpopName = KPOP_KNOWN_NAMES.some((n) => combined.includes(n));
  const hasJapanese = JAPANESE_KANA_REGEX.test(combined);
  const hasChinese = CHINESE_REGEX.test(combined);

  if (regionId === "vpop") {
    // Strictly Vietnamese music & artists, no Korean/Japanese
    return hasVn && !hasHangul && !hasJapanese;
  }
  if (regionId === "kpop") {
    // Strictly Korean music & K-Pop artists, no Vietnamese
    return (hasHangul || hasKpopName) && !hasVn;
  }
  if (regionId === "usuk") {
    // Strictly US-UK/Western music, no Vietnamese, no Korean, no Japanese, no Chinese
    return !hasVn && !hasHangul && !hasJapanese && !hasChinese;
  }
  if (regionId === "asia") {
    // Strictly Asian music (Japan, China, East Asia), no Vietnamese, no pure Western
    return (hasJapanese || hasChinese || hasHangul) && !hasVn;
  }
  return true;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get("refresh") === "true";
    const requestedCategory = searchParams.get("category"); // "all" | "vpop" | "kpop" | "usuk" | "asia"

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const nowTime = Date.now();

    // 1. Check if today's daily chart has already been compiled in Neon DB
    if (!forceRefresh) {
      try {
        const cachedChartRows = await sql`
          SELECT * FROM daily_trending_charts
          WHERE chart_date = ${today}
          ORDER BY region, rank ASC
        `;

        if (cachedChartRows && cachedChartRows.length > 0) {
          // Reconstruct categories from database with strict regional validation
          let allRegionsValid = true;
          const categories = SONG_REGIONS.map((reg) => {
            const rowsForRegion = cachedChartRows.filter(
              (r: any) => r.region === reg.id && isPureRegionSong(r.title, r.artist, reg.id)
            );

            if (rowsForRegion.length < 5) {
              allRegionsValid = false;
            }

            const songs = rowsForRegion.map((r: any) => ({
              id: `yt_${r.video_id}`,
              videoId: r.video_id,
              title: r.title,
              artist: r.artist,
              channelId: r.channel_id,
              audio_url: `https://www.youtube.com/watch?v=${r.video_id}`,
              image_url: r.image_url,
              source: "youtube",
              rank: r.rank,
              views_gain_24h: Number(r.views_gain_24h),
              viewsGain24hFormatted: formatCount(r.views_gain_24h),
              total_views: Number(r.total_views),
              totalViewsFormatted: formatCount(r.total_views),
              region: reg.id,
              regionBadge: reg.badge,
            }));

            return {
              id: reg.id,
              name: reg.name,
              badge: reg.badge,
              description: reg.description,
              songs,
            };
          });

          if (allRegionsValid) {
            // Build Global Mix (All-In-One Chart) sorted by highest 24h view growth
            const allSongs: any[] = [];
            categories.forEach((c) => allSongs.push(...c.songs));
            // Sort by 24h view gain descending
            allSongs.sort((a, b) => b.views_gain_24h - a.views_gain_24h);
            const allTracks = allSongs.slice(0, 20).map((s, idx) => ({
              ...s,
              globalRank: idx + 1,
            }));

            const responseData = {
              chartDate: today,
              rankingCriterion: "Số lượt xem tăng trưởng trong 24 giờ qua (24h Velocity Gain)",
              categories:
                requestedCategory && requestedCategory !== "all"
                  ? categories.filter((c) => c.id === requestedCategory)
                  : categories,
              allTracks,
              updatedAt: new Date().toISOString(),
              fromDatabase: true,
            };

            return NextResponse.json(responseData);
          }
        }
      } catch (dbReadErr) {
        console.warn("Could not read daily_trending_charts from DB, falling back to live compilation:", dbReadErr);
      }
    }

    // 2. Compile today's chart using YouTube Data API + 24-hour delta comparison
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "YOUTUBE_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const regionPromises = SONG_REGIONS.map(async (reg) => {
      try {
        const url = new URL("https://www.googleapis.com/youtube/v3/videos");
        url.searchParams.set("part", "snippet,statistics");
        url.searchParams.set("chart", "mostPopular");
        url.searchParams.set("videoCategoryId", "10"); // Music category
        url.searchParams.set("regionCode", reg.regionCode);
        url.searchParams.set("maxResults", "50");
        url.searchParams.set("key", apiKey);

        const res = await fetch(url.toString());
        if (!res.ok) {
          console.warn(`Trending fetch error for region ${reg.regionCode}:`, res.statusText);
          return { region: reg, songs: [] };
        }

        const data = await res.json();
        const rawItems = data.items || [];
        
        // Strictly filter candidate videos: ONLY songs matching the region's origin & language
        const candidateItems = rawItems.filter((item: any) =>
          isPureRegionSong(
            item.snippet?.title || "",
            item.snippet?.channelTitle || "",
            reg.id
          )
        );

        // Fallback: If less than 10 pure regional songs from mostPopular, fetch supplemental music videos for that genre
        if (candidateItems.length < 10) {
          try {
            const queryMap: Record<string, string> = {
              vpop: "VPOP official music video nhạc trẻ việt nam",
              kpop: "KPOP official music video Korean",
              usuk: "official music video Billboard Hot 100",
              asia: "J-POP official music video Japan",
            };
            const sUrl = new URL("https://www.googleapis.com/youtube/v3/search");
            sUrl.searchParams.set("part", "snippet");
            sUrl.searchParams.set("type", "video");
            sUrl.searchParams.set("videoCategoryId", "10");
            sUrl.searchParams.set("regionCode", reg.regionCode);
            sUrl.searchParams.set("q", queryMap[reg.id] || "music");
            sUrl.searchParams.set("maxResults", "20");
            sUrl.searchParams.set("key", apiKey);

            const sRes = await fetch(sUrl.toString());
            if (sRes.ok) {
              const sData = await sRes.json();
              const sVideoIds = (sData.items || [])
                .map((i: any) => i.id?.videoId)
                .filter(Boolean)
                .join(",");

              if (sVideoIds) {
                const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${sVideoIds}&key=${apiKey}`;
                const detailRes = await fetch(detailUrl);
                if (detailRes.ok) {
                  const detailData = await detailRes.json();
                  for (const dItem of detailData.items || []) {
                    if (
                      isPureRegionSong(
                        dItem.snippet?.title || "",
                        dItem.snippet?.channelTitle || "",
                        reg.id
                      ) &&
                      !candidateItems.some((c: any) => c.id === dItem.id)
                    ) {
                      candidateItems.push(dItem);
                    }
                  }
                }
              }
            }
          } catch (supErr) {
            console.warn(`Supplemental fetch error for ${reg.id}:`, supErr);
          }
        }

        // For each candidate video, calculate exact 24-hour view gain
        const computedSongs: any[] = [];

        for (const item of candidateItems) {
          const videoId = item.id;
          const snippet = item.snippet;
          const stats = item.statistics;
          const currentViews = stats?.viewCount ? parseInt(stats.viewCount, 10) : 0;
          const publishedAt = snippet.publishedAt ? new Date(snippet.publishedAt) : new Date();

          let viewsGain24h = 0;

          // Query previous snapshot for this video before today
          try {
            const prevRows = await sql`
              SELECT current_views, snapshot_date 
              FROM trending_song_snapshots 
              WHERE video_id = ${videoId} AND region = ${reg.id} AND snapshot_date < ${today}
              ORDER BY snapshot_date DESC LIMIT 1
            `;

            if (prevRows && prevRows.length > 0) {
              const prevViews = Number(prevRows[0].current_views);
              viewsGain24h = Math.max(0, currentViews - prevViews);
            } else {
              // No previous day snapshot exists yet:
              // Check hours elapsed since release
              const hoursSinceRelease = Math.max(1, (nowTime - publishedAt.getTime()) / (1000 * 60 * 60));
              if (hoursSinceRelease <= 24) {
                // If released in the last 24h, 100% of views occurred in 24h!
                viewsGain24h = currentViews;
              } else {
                // Video published more than 24h ago: calculate 24h velocity rate
                viewsGain24h = Math.round(currentViews * Math.min(1, 24 / hoursSinceRelease));
              }
            }

            // Save or update today's snapshot
            await sql`
              INSERT INTO trending_song_snapshots 
                (video_id, region, title, artist, channel_id, image_url, current_views, published_at, snapshot_date)
              VALUES 
                (${videoId}, ${reg.id}, ${cleanSongTitle(snippet.title || "")}, ${cleanArtistName(snippet.channelTitle || "")}, ${snippet.channelId || ""}, ${snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || ""}, ${currentViews}, ${snippet.publishedAt}, ${today})
              ON CONFLICT (video_id, region, snapshot_date) 
              DO UPDATE SET current_views = EXCLUDED.current_views, title = EXCLUDED.title, artist = EXCLUDED.artist
            `;
          } catch (snapshotErr) {
            console.warn(`Snapshot tracking error for video ${videoId}:`, snapshotErr);
            // Fallback estimation
            const hours = Math.max(1, (nowTime - publishedAt.getTime()) / (1000 * 60 * 60));
            viewsGain24h = Math.round(currentViews * Math.min(1, 24 / Math.max(24, hours)));
          }

          computedSongs.push({
            id: `yt_${videoId}`,
            videoId: videoId,
            title: cleanSongTitle(snippet.title || ""),
            artist: cleanArtistName(snippet.channelTitle || ""),
            channelId: snippet.channelId,
            channelTitle: decodeHtmlEntities(snippet.channelTitle || ""),
            audio_url: `https://www.youtube.com/watch?v=${videoId}`,
            image_url:
              snippet.thumbnails?.high?.url ||
              snippet.thumbnails?.medium?.url ||
              `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            source: "youtube",
            views_gain_24h: viewsGain24h,
            viewsGain24hFormatted: formatCount(viewsGain24h),
            total_views: currentViews,
            totalViewsFormatted: formatCount(currentViews),
            publishedAt: snippet.publishedAt,
            region: reg.id,
            regionBadge: reg.badge,
          });
        }

        // CRITICAL: Sort songs strictly by 24h view gain descending!
        // The song that gained the most views in the past 24 hours gets Rank #1!
        computedSongs.sort((a, b) => b.views_gain_24h - a.views_gain_24h);

        // Assign rank numbers #1, #2, #3... to top 10
        const rankedSongs = computedSongs.slice(0, 10).map((s, idx) => ({
          ...s,
          rank: idx + 1,
        }));

        // Clean up previous daily entries for this region today before inserting pure ranked songs
        try {
          await sql`DELETE FROM daily_trending_charts WHERE region = ${reg.id} AND chart_date = ${today}`;
        } catch (delErr) {
          console.warn("Could not clean old daily rows:", delErr);
        }

        // Persist compiled chart into daily_trending_charts table
        for (const s of rankedSongs) {
          try {
            await sql`
              INSERT INTO daily_trending_charts
                (video_id, region, rank, title, artist, channel_id, image_url, views_gain_24h, total_views, chart_date)
              VALUES
                (${s.videoId}, ${reg.id}, ${s.rank}, ${s.title}, ${s.artist}, ${s.channelId || ""}, ${s.image_url}, ${s.views_gain_24h}, ${s.total_views}, ${today})
              ON CONFLICT (video_id, region, chart_date)
              DO UPDATE SET rank = EXCLUDED.rank, views_gain_24h = EXCLUDED.views_gain_24h, total_views = EXCLUDED.total_views, updated_at = NOW()
            `;
          } catch (chartSaveErr) {
            console.warn(`Error persisting chart row for ${s.videoId}:`, chartSaveErr);
          }
        }

        return { region: reg, songs: rankedSongs };
      } catch (err) {
        console.warn(`Error compiling trending region ${reg.id}:`, err);
        return { region: reg, songs: [] };
      }
    });

    const regionResults = await Promise.all(regionPromises);

    const categories = regionResults.map(({ region, songs }) => ({
      id: region.id,
      name: region.name,
      badge: region.badge,
      description: region.description,
      songs,
    }));

    // Build Global Top 20 Mix ranked strictly by global 24h view gain!
    const allSongs: any[] = [];
    categories.forEach((c) => allSongs.push(...c.songs));
    allSongs.sort((a, b) => b.views_gain_24h - a.views_gain_24h);
    const allTracks = allSongs.slice(0, 20).map((s, idx) => ({
      ...s,
      globalRank: idx + 1,
    }));

    const responsePayload = {
      chartDate: today,
      rankingCriterion: "Số lượt xem tăng trưởng trong 24 giờ qua (24h Velocity Gain)",
      categories:
        requestedCategory && requestedCategory !== "all"
          ? categories.filter((c) => c.id === requestedCategory)
          : categories,
      allTracks,
      updatedAt: new Date().toISOString(),
      fromDatabase: false,
    };

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("API /api/songs/trending compilation error:", error);
    return NextResponse.json(
      { error: "Failed to compile trending songs chart", details: error.message },
      { status: 500 }
    );
  }
}
