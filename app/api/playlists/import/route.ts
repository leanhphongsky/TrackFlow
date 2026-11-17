import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import ytSearch from "yt-search";

export const dynamic = "force-dynamic";

// Helper to decode HTML entities
function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// 1. YouTube & YouTube Music playlist fetcher
async function fetchYouTubePlaylist(listId: string, apiKey?: string) {
  let playlistTitle = "Danh sách phát YouTube";
  let playlistDesc = "";
  let coverImage = "";
  let tracks: any[] = [];

  const key = apiKey || process.env.YOUTUBE_API_KEY;

  if (key) {
    try {
      // 1. Fetch playlist metadata
      const metaRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${listId}&key=${key}`
      );
      if (metaRes.ok) {
        const metaData = await metaRes.json();
        if (metaData.items?.[0]?.snippet) {
          const s = metaData.items[0].snippet;
          playlistTitle = decodeHtmlEntities(s.title || playlistTitle);
          playlistDesc = decodeHtmlEntities(s.description || "");
          coverImage =
            s.thumbnails?.maxres?.url ||
            s.thumbnails?.high?.url ||
            s.thumbnails?.medium?.url ||
            s.thumbnails?.default?.url ||
            "";
        }
      }

      // 2. Fetch playlist items (up to 100 items with pagination)
      let nextPageToken = "";
      let pageCount = 0;

      do {
        pageCount++;
        const pageParam = nextPageToken ? `&pageToken=${nextPageToken}` : "";
        const itemsRes = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${listId}&key=${key}${pageParam}`
        );
        if (!itemsRes.ok) break;
        const itemsData = await itemsRes.json();
        const items = itemsData.items || [];

        for (const item of items) {
          const vid = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
          const rawTitle = item.snippet?.title;
          if (!vid || rawTitle === "Private video" || rawTitle === "Deleted video") continue;

          const title = decodeHtmlEntities(rawTitle);
          const artist = decodeHtmlEntities(
            item.snippet?.videoOwnerChannelTitle || item.snippet?.channelTitle || "YouTube"
          );
          const thumbnail =
            item.snippet?.thumbnails?.high?.url ||
            item.snippet?.thumbnails?.medium?.url ||
            item.snippet?.thumbnails?.default?.url ||
            `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;

          tracks.push({
            videoId: vid,
            title,
            artist,
            audio_url: `https://www.youtube.com/watch?v=${vid}`,
            image_url: thumbnail,
            duration: 0,
          });
        }

        nextPageToken = itemsData.nextPageToken || "";
      } while (nextPageToken && pageCount < 4);
    } catch (err) {
      console.error("YouTube API playlist error:", err);
    }
  }

  if (tracks.length === 0) {
    throw new Error(
      "Không thể tải danh sách bài hát từ YouTube playlist này. Vui lòng đảm bảo playlist ở chế độ Công khai (Public) hoặc Không công khai (Unlisted)."
    );
  }

  return {
    platform: "youtube",
    title: playlistTitle,
    description: playlistDesc,
    cover_image: coverImage || tracks[0]?.image_url || null,
    tracks,
  };
}

// 2. Spotify playlist or album fetcher
async function fetchSpotifyPlaylist(type: "playlist" | "album", id: string) {
  const url = `https://open.spotify.com/embed/${type}/${id}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) {
    throw new Error("Không thể tải thông tin từ Spotify. Vui lòng kiểm tra lại đường link.");
  }

  const html = await res.text();
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );

  if (!match) {
    throw new Error("Không tìm thấy dữ liệu từ link Spotify này.");
  }

  let data: any;
  try {
    data = JSON.parse(match[1]);
  } catch (e) {
    throw new Error("Lỗi khi đọc cấu trúc dữ liệu Spotify.");
  }

  const entity = data.props?.pageProps?.state?.data?.entity;
  if (!entity) {
    throw new Error("Danh sách phát Spotify này không tồn tại hoặc ở chế độ riêng tư.");
  }

  const title = entity.name || (type === "album" ? "Album Spotify" : "Playlist Spotify");
  const description = entity.description || "";
  const coverImage = entity.coverArt?.sources?.[0]?.url || null;
  const rawList = entity.trackList || [];

  const tracks = rawList.map((t: any) => ({
    title: t.title || "Bài hát",
    artist: t.subtitle || "Nghệ sĩ",
    duration: Math.round((t.duration || 0) / 1000),
    image_url: coverImage,
    spotifyUri: t.uri,
  }));

  if (tracks.length === 0) {
    throw new Error("Playlist Spotify này hiện chưa có bài hát nào.");
  }

  return {
    platform: "spotify",
    title,
    description,
    cover_image: coverImage,
    tracks,
  };
}

// 3. Raw text playlist parser
function parseTextPlaylist(rawText: string) {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const tracks: Array<{ title: string; artist: string }> = [];

  for (const line of lines) {
    // Remove leading numbers, brackets, e.g. "1. ", "01 - ", "[1] "
    const cleaned = line.replace(/^\s*(?:\[\d+\]|\d+[\.\)\-:]|\#\d+)\s*/, "").trim();
    if (!cleaned) continue;

    let title = cleaned;
    let artist = "Nghệ sĩ chưa rõ";

    if (cleaned.includes(" - ")) {
      const parts = cleaned.split(" - ");
      title = parts[0].trim();
      artist = parts.slice(1).join(" - ").trim();
    } else if (cleaned.includes(" – ")) {
      const parts = cleaned.split(" – ");
      title = parts[0].trim();
      artist = parts.slice(1).join(" – ").trim();
    } else if (cleaned.includes(" | ")) {
      const parts = cleaned.split(" | ");
      title = parts[0].trim();
      artist = parts.slice(1).join(" | ").trim();
    }

    tracks.push({ title, artist });
  }

  if (tracks.length === 0) {
    throw new Error("Không nhận diện được bài hát nào trong văn bản bạn dán.");
  }

  return {
    platform: "text",
    title: `Danh sách nhập (${tracks.length} bài hát)`,
    description: "Nhập tự động từ danh sách văn bản",
    cover_image: null,
    tracks,
  };
}

// Clean search query helper to strip extraneous tags (remaster, feat, audio, etc.)
function cleanSearchQuery(title: string, artist?: string): { cleanTitle: string; cleanArtist: string } {
  const cleanTitle = (title || "")
    .replace(/\s*[\(\[][^\)\]]*(?:feat|ft\.|remaster|mix|version|official|audio|video|ost|live|edit|karaoke|beat|instrumental)[^\)\]]*[\)\]]/gi, "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  let cleanArtist = (artist || "").trim();
  if (
    cleanArtist.toLowerCase().includes("chưa rõ") ||
    cleanArtist.toLowerCase().includes("unknown") ||
    cleanArtist.toLowerCase().includes("various artists")
  ) {
    cleanArtist = "";
  }

  return {
    cleanTitle: cleanTitle || (title || "").trim(),
    cleanArtist,
  };
}

// Robust multi-tiered track matcher that guarantees a match and never drops a track
async function matchTrackToYouTube(track: {
  title: string;
  artist: string;
  duration?: number;
  image_url?: string | null;
}) {
  const rawTitle = (track.title || "").trim();
  const rawArtist = (track.artist || "").trim();
  const { cleanTitle, cleanArtist } = cleanSearchQuery(rawTitle, rawArtist);

  // Build ordered candidate queries from specific to broad
  const candidates: string[] = [];

  if (cleanArtist) {
    candidates.push(`${cleanTitle} ${cleanArtist} official audio`);
    candidates.push(`${cleanTitle} ${cleanArtist}`);
  }
  if (rawArtist && rawArtist !== cleanArtist) {
    candidates.push(`${rawTitle} ${rawArtist}`);
  }
  candidates.push(cleanTitle);
  if (rawTitle && rawTitle !== cleanTitle) {
    candidates.push(rawTitle);
  }

  const firstSegment = rawTitle.split(/[-–—:|]/)[0]?.trim();
  if (firstSegment && firstSegment.length >= 3 && firstSegment !== rawTitle && firstSegment !== cleanTitle) {
    if (cleanArtist) candidates.push(`${firstSegment} ${cleanArtist}`);
    candidates.push(firstSegment);
  }

  const uniqueCandidates = Array.from(new Set(candidates.filter((c) => c && c.length >= 2)));

  // Try queries in order with retry for network resilience
  for (const q of uniqueCandidates) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await ytSearch(q);
        const top = res.videos?.[0];
        if (top && top.videoId) {
          return {
            title: rawTitle || top.title,
            artist: rawArtist || top.author?.name || "YouTube",
            videoId: top.videoId,
            audio_url: `https://www.youtube.com/watch?v=${top.videoId}`,
            image_url:
              track.image_url ||
              top.thumbnail ||
              top.image ||
              `https://i.ytimg.com/vi/${top.videoId}/hqdefault.jpg`,
            duration: top.duration?.seconds || track.duration || 0,
            views: top.views ? String(top.views) : null,
          };
        }
        // If query succeeded but had 0 videos, break attempt loop and try next query candidate
        break;
      } catch (err: any) {
        if (attempt === 0) {
          // Brief pause before single retry
          await new Promise((r) => setTimeout(r, 200));
        } else {
          console.warn(`ytSearch error for candidate "${q}":`, err?.message || err);
        }
      }
    }
  }

  // Guaranteed fallback: NEVER drop the track, keep song metadata intact
  console.warn(`Could not match video for "${rawTitle}" by "${rawArtist}". Using safe fallback.`);
  const fallbackQuery = encodeURIComponent(`${rawTitle} ${rawArtist}`.trim());
  return {
    title: rawTitle || "Bài hát đã nhập",
    artist: rawArtist || "Nghệ sĩ chưa rõ",
    videoId: "",
    audio_url: `https://www.youtube.com/results?search_query=${fallbackQuery}`,
    image_url: track.image_url || null,
    duration: track.duration || 0,
    views: null,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, url, text, name, description, cover_image, tracks } = body;

    // STEP A: PREVIEW ACTION (Scan & parse playlist metadata without saving)
    if (action === "preview") {
      // 1. Handle URL input
      if (url && typeof url === "string" && url.trim()) {
        const trimmedUrl = url.trim();

        // 1.1 Check YouTube / YouTube Music playlist
        const ytMatch = trimmedUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/);
        if (ytMatch) {
          const listId = ytMatch[1];
          const result = await fetchYouTubePlaylist(listId);
          return NextResponse.json({ success: true, ...result });
        }

        // 1.2 Check Spotify playlist or album
        const spotifyMatch = trimmedUrl.match(
          /(?:open\.spotify\.com\/(?:intl-[a-z]{2}\/)?|spotify:)(playlist|album)[\/:]([a-zA-Z0-9]{22})/
        );
        if (spotifyMatch) {
          const type = spotifyMatch[1] as "playlist" | "album";
          const id = spotifyMatch[2];
          const result = await fetchSpotifyPlaylist(type, id);
          return NextResponse.json({ success: true, ...result });
        }

        return NextResponse.json(
          {
            error:
              "Đường link không được hỗ trợ. Vui lòng dán link playlist từ Spotify (open.spotify.com/playlist/...) hoặc YouTube/YouTube Music (youtube.com/playlist?list=...).",
          },
          { status: 400 }
        );
      }

      // 1.3 Handle Text input
      if (text && typeof text === "string" && text.trim()) {
        const result = parseTextPlaylist(text);
        return NextResponse.json({ success: true, ...result });
      }

      return NextResponse.json(
        { error: "Vui lòng cung cấp đường link hoặc danh sách bài hát" },
        { status: 400 }
      );
    }

    // STEP B: CONFIRM ACTION (Match songs to YouTube & save to Supabase)
    if (action === "confirm" || action === "save") {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json(
          { error: "Vui lòng đăng nhập để lưu playlist vào tài khoản" },
          { status: 401 }
        );
      }

      if (!Array.isArray(tracks) || tracks.length === 0) {
        return NextResponse.json(
          { error: "Danh sách bài hát cần nhập đang trống" },
          { status: 400 }
        );
      }

      const playlistName = (name && name.trim()) || "Playlist đã nhập";
      const playlistDesc = (description && description.trim()) || "Được nhập tự động vào TrackFlow";

      // 1. High-Performance Worker Pool Concurrency (Liner technique: mapConcurrent)
      // Multiple workers concurrently pull from a shared cursor, avoiding pipeline stalls
      const CONCURRENCY = 4;
      const mapConcurrent = async <T, R>(
        items: T[],
        limit: number,
        fn: (item: T, index: number) => Promise<R>
      ): Promise<R[]> => {
        const results: R[] = new Array(items.length);
        let cursor = 0;
        const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
          while (cursor < items.length) {
            const idx = cursor++;
            results[idx] = await fn(items[idx], idx);
          }
        });
        await Promise.all(workers);
        return results;
      };

      const resolvedTracks = await mapConcurrent(
        tracks,
        CONCURRENCY,
        async (t: any, idx: number) => {
          if (t.videoId && t.audio_url) {
            return {
              title: t.title || "Bài hát",
              artist: t.artist || "Nghệ sĩ",
              videoId: t.videoId,
              audio_url: t.audio_url,
              image_url: t.image_url || `https://i.ytimg.com/vi/${t.videoId}/hqdefault.jpg`,
              duration: t.duration || 0,
              views: t.views ? String(t.views) : null,
            };
          }
          const matched = await matchTrackToYouTube(t);
          if (matched) return matched;

          // Insurance fallback: 100% preservation guarantee
          return {
            title: t.title || "Bài hát",
            artist: t.artist || "Nghệ sĩ chưa rõ",
            videoId: t.videoId || "",
            audio_url:
              t.audio_url ||
              `https://www.youtube.com/results?search_query=${encodeURIComponent(
                `${t.title || ""} ${t.artist || ""}`
              )}`,
            image_url: t.image_url || null,
            duration: t.duration || 0,
            views: null,
          };
        }
      );

      const matchedTracks = resolvedTracks.filter(Boolean);

      if (matchedTracks.length === 0) {
        return NextResponse.json(
          { error: "Không thể tìm thấy bài hát tương ứng trên YouTube" },
          { status: 400 }
        );
      }

      // 2. Insert into playlists table
      const finalCover = cover_image || matchedTracks[0]?.image_url || null;
      const plRes = await sql`
        INSERT INTO playlists (user_id, name, description, image_url, updated_at)
        VALUES (${user.id}, ${playlistName}, ${playlistDesc}, ${finalCover}, NOW())
        RETURNING id, user_id, name, description, image_url, created_at, updated_at
      `;
      const createdPlaylist = plRes[0];

      // 3. Insert songs into playlist_songs table with retry per song for DB resilience
      for (let pos = 0; pos < matchedTracks.length; pos++) {
        const song = matchedTracks[pos];
        let inserted = false;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            await sql`
              INSERT INTO playlist_songs (
                playlist_id,
                title,
                artist,
                audio_url,
                image_url,
                duration,
                views,
                position,
                added_at
              )
              VALUES (
                ${createdPlaylist.id},
                ${song.title || "Bài hát"},
                ${song.artist || "Nghệ sĩ chưa rõ"},
                ${song.audio_url || "https://www.youtube.com"},
                ${song.image_url || null},
                ${song.duration || 0},
                ${song.views ? String(song.views) : null},
                ${pos},
                NOW()
              )
            `;
            inserted = true;
            break;
          } catch (dbErr) {
            console.warn(`Retry insert song #${pos} (${song.title}):`, dbErr);
            await new Promise((r) => setTimeout(r, 120));
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Đã nhập thành công ${matchedTracks.length} bài hát vào danh sách phát!`,
        playlist: createdPlaylist,
        songCount: matchedTracks.length,
      });
    }

    return NextResponse.json({ error: "Thao tác (action) không hợp lệ" }, { status: 400 });
  } catch (error: any) {
    console.error("Import playlist error:", error);
    return NextResponse.json(
      { error: error.message || "Đã xảy ra lỗi khi nhập danh sách phát" },
      { status: 500 }
    );
  }
}
