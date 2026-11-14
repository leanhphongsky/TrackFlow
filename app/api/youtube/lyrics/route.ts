import { NextResponse } from "next/server";
import { getSubtitles } from "youtube-caption-extractor";

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

function cleanSongTitleForLyrics(title: string, artist: string = ""): string {
  if (!title) return "";
  let clean = decodeHtmlEntities(title);

  // Remove common YouTube suffixes and tags in brackets/parentheses
  clean = clean
    .replace(/\s*[\[\(](?:Official\s*(?:Music\s*)?Video|M\/?V|Performance|Visualizer|Lyric\s*Video|Audio|Official Audio|Teaser|Prod\..*?|4K|HD|Full\s*HD)[\]\)]/gi, "")
    .replace(/\s*[\[\(](?:Audio\s*Official|Video\s*Official)[\]\)]/gi, "")
    .replace(/\s*\|\s*(?:Official\s*(?:Music\s*)?Video|M\/?V|Official Performance|Visualizer|Lyric Video|Audio).*/gi, "")
    .replace(/\s*-\s*(?:Official\s*(?:Music\s*)?Video|M\/?V|Audio).*/gi, "")
    .replace(/\s*\(feat\..*?\)/gi, "")
    .replace(/\s*\[feat\..*?\]/gi, "")
    .replace(/\s*ft\..*/gi, "")
    .trim();

  const artistNorm = artist ? artist.toLowerCase().replace(/official|- topic/gi, "").trim() : "";

  // If separated by '|', determine which segment is title
  if (clean.includes("|")) {
    const parts = clean.split("|").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      if (artistNorm && parts[0].toLowerCase().includes(artistNorm)) {
        clean = parts[1];
      } else {
        clean = parts[0];
      }
    }
  }

  // If separated by ' - '
  if (clean.includes(" - ")) {
    const parts = clean.split(" - ").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      if (artistNorm && parts[0].toLowerCase().includes(artistNorm)) {
        clean = parts[1];
      } else {
        clean = parts[0];
      }
    }
  }

  // Remove trailing M/V or MV or Audio
  clean = clean.replace(/\s*(?:M\/?V|Official\s*Audio|Audio)$/gi, "").trim();

  return clean.replace(/['"‘’“”]/g, "").trim() || decodeHtmlEntities(title);
}

function cleanArtistForLyrics(artist: string): string {
  if (!artist) return "";
  let clean = decodeHtmlEntities(artist)
    .replace(/\s*-\s*Topic/gi, "")
    .replace(/\s*Official/gi, "")
    .replace(/\s*VEVO/gi, "")
    .replace(/\s*Channel/gi, "")
    .replace(/\s*Music/gi, "")
    .trim();

  // Strip collaboration artists to get primary artist for LRCLIB lookup
  const delimiters = ["//", " feat.", " ft.", " x ", " X ", ",", " & "];
  for (const delim of delimiters) {
    if (clean.includes(delim)) {
      clean = clean.split(delim)[0].trim();
      break;
    }
  }
  return clean;
}

function parseLrc(lrcText: string): { start: number; dur: number; text: string }[] {
  const lines: { start: number; dur: number; text: string }[] = [];
  const rawLines = lrcText.split("\n");

  for (const raw of rawLines) {
    const match = raw.match(/\[(\d{2}):(\d{2}(?:\.\d{1,3})?)\](.*)/);
    if (match) {
      const min = parseInt(match[1], 10);
      const sec = parseFloat(match[2]);
      const text = match[3].trim();
      if (text) {
        lines.push({
          start: Math.round((min * 60 + sec) * 100) / 100,
          dur: 0,
          text: decodeHtmlEntities(text),
        });
      }
    }
  }

  // Calculate approximate duration for each line based on next line's start
  for (let i = 0; i < lines.length; i++) {
    if (i < lines.length - 1) {
      lines[i].dur = Math.max(1, Math.round((lines[i + 1].start - lines[i].start) * 100) / 100);
    } else {
      lines[i].dur = 5;
    }
  }

  return lines;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");
    const rawTitle = searchParams.get("title") || "";
    const rawArtist = searchParams.get("artist") || "";

    const cleanTitle = cleanSongTitleForLyrics(rawTitle, rawArtist);
    const cleanArtist = cleanArtistForLyrics(rawArtist);

    // =========================================================================
    // PRIORITY 1: Native YouTube Video Captions (100% video-synced & exact song)
    // =========================================================================
    if (videoId) {
      let subtitles: any[] = [];
      const languagesToTry = ["vi", "en", "ko", "ja"];

      for (const lang of languagesToTry) {
        try {
          const res = await getSubtitles({ videoID: videoId, lang });
          if (res && res.length > 3) {
            subtitles = res;
            break;
          }
        } catch {
          // continue
        }
      }

      if (!subtitles || subtitles.length <= 3) {
        try {
          const res = await getSubtitles({ videoID: videoId });
          if (res && res.length > 3) {
            subtitles = res;
          }
        } catch {
          // ignore
        }
      }

      const validLines = (subtitles || [])
        .filter((s) => s.text && s.text.trim() !== "")
        .map((s) => ({
          start: Math.round((parseFloat(s.start) || 0) * 100) / 100,
          dur: Math.round((parseFloat(s.dur) || 0) * 100) / 100,
          text: decodeHtmlEntities(s.text).replace(/\n/g, " ").trim(),
        }));

      if (validLines.length > 3) {
        return NextResponse.json({
          hasLyrics: true,
          isSynced: true,
          source: "youtube-captions",
          lines: validLines,
        });
      }
    }

    // =========================================================================
    // PRIORITY 2: LRCLIB Open Database (Fallback when video has no YT subtitles)
    // =========================================================================
    if (cleanTitle) {
      try {
        // Method A: Direct lookup by exact title & artist
        let lrcUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}`;
        if (cleanArtist) {
          lrcUrl += `&artist_name=${encodeURIComponent(cleanArtist)}`;
        }

        const lrcRes = await fetch(lrcUrl, {
          headers: { "User-Agent": "TrackFlow/2.4.0 (https://trackflow.app)" },
        });

        if (lrcRes.ok) {
          const lrcData = await lrcRes.json();
          if (lrcData.syncedLyrics) {
            const parsedLines = parseLrc(lrcData.syncedLyrics);
            if (parsedLines.length > 0) {
              return NextResponse.json({
                hasLyrics: true,
                isSynced: true,
                source: "lrclib",
                trackName: lrcData.trackName,
                artistName: lrcData.artistName,
                lines: parsedLines,
              });
            }
          } else if (lrcData.plainLyrics) {
            const plainLines = lrcData.plainLyrics
              .split("\n")
              .filter((l: string) => l.trim() !== "")
              .map((text: string, idx: number) => ({
                start: idx * 3,
                dur: 3,
                text: text.trim(),
              }));

            return NextResponse.json({
              hasLyrics: true,
              isSynced: false,
              source: "lrclib",
              trackName: lrcData.trackName,
              artistName: lrcData.artistName,
              lines: plainLines,
            });
          }
        }

        // Method B: Search LRCLIB with Anti-Liveshow & Strict Title Validation
        const isOriginalLive = /\b(live|liveshow|concert|acoustic)\b/i.test(rawTitle);
        const searchTerms = [
          cleanArtist ? `${cleanTitle} ${cleanArtist}` : cleanTitle,
          cleanTitle,
        ];

        for (const term of searchTerms) {
          const searchRes = await fetch(
            `https://lrclib.net/api/search?q=${encodeURIComponent(term)}`,
            { headers: { "User-Agent": "TrackFlow/2.4.0 (https://trackflow.app)" } }
          );

          if (searchRes.ok) {
            const results = await searchRes.json();
            if (Array.isArray(results) && results.length > 0) {
              // Filter: Must match song title, and filter out liveshow/acoustic if original is studio
              const candidates = results.filter((r) => {
                const trackLower = (r.trackName || "").toLowerCase();
                const cleanLower = cleanTitle.toLowerCase();
                const isTitleClose =
                  trackLower.includes(cleanLower) || cleanLower.includes(trackLower);

                if (!isTitleClose) return false;

                // Anti-liveshow filter
                if (!isOriginalLive) {
                  const isResultLive = /\b(live|liveshow|concert|acoustic|remix)\b/i.test(
                    trackLower
                  );
                  if (isResultLive) return false;
                }

                return true;
              });

              const targetMatch =
                candidates.find((r) => r.syncedLyrics) || candidates[0];

              if (targetMatch) {
                if (targetMatch.syncedLyrics) {
                  const parsed = parseLrc(targetMatch.syncedLyrics);
                  if (parsed.length > 0) {
                    return NextResponse.json({
                      hasLyrics: true,
                      isSynced: true,
                      source: "lrclib",
                      trackName: targetMatch.trackName,
                      artistName: targetMatch.artistName,
                      lines: parsed,
                    });
                  }
                } else if (targetMatch.plainLyrics) {
                  const plainLines = targetMatch.plainLyrics
                    .split("\n")
                    .filter((l: string) => l.trim() !== "")
                    .map((text: string, idx: number) => ({
                      start: idx * 3,
                      dur: 3,
                      text: text.trim(),
                    }));

                  return NextResponse.json({
                    hasLyrics: true,
                    isSynced: false,
                    source: "lrclib",
                    trackName: targetMatch.trackName,
                    artistName: targetMatch.artistName,
                    lines: plainLines,
                  });
                }
              }
            }
          }
        }
      } catch (lrclibErr) {
        console.warn("LRCLIB lookup error:", lrclibErr);
      }
    }

    return NextResponse.json({
      hasLyrics: false,
      message: "Hiện bài hát này chưa có lời",
      lines: [],
    });
  } catch (error: any) {
    console.error("Lyrics retrieval error:", error);
    return NextResponse.json({
      hasLyrics: false,
      message: "Hiện bài hát này chưa có lời",
      lines: [],
    });
  }
}
