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

function cleanSongTitleForLyrics(title: string): string {
  if (!title) return "";
  let clean = decodeHtmlEntities(title);
  clean = clean
    .replace(/\s*[\[\(](?:Official\s*(?:Music\s*)?Video|M\/?V|Performance|Visualizer|Lyric\s*Video|Audio|Teaser|Prod\..*?)[\]\)]/gi, "")
    .replace(/\s*\|\s*(?:Official\s*(?:Music\s*)?Video|M\/?V|Official Performance|Visualizer|Lyric Video).*/gi, "")
    .replace(/\s*-\s*(?:Official\s*(?:Music\s*)?Video|M\/?V).*/gi, "")
    .replace(/\s*\(feat\..*?\)/gi, "")
    .replace(/\s*\[feat\..*?\]/gi, "")
    .replace(/\s*ft\..*/gi, "")
    .trim();
  return clean || decodeHtmlEntities(title);
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

    const cleanTitle = cleanSongTitleForLyrics(rawTitle);
    const cleanArtist = cleanArtistForLyrics(rawArtist);

    // 1. Try querying LRCLIB (World's standard open lyrics database with millisecond timestamps)
    if (cleanTitle) {
      try {
        // Method A: Direct Get with track_name & artist_name
        let lrcUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}`;
        if (cleanArtist) {
          lrcUrl += `&artist_name=${encodeURIComponent(cleanArtist)}`;
        }

        const lrcRes = await fetch(lrcUrl, {
          headers: { "User-Agent": "TrackFlow/1.0.0 (https://trackflow.app)" },
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

        // Method B: Search LRCLIB if direct match didn't find synced lyrics
        const searchTerms = [
          cleanArtist ? `${cleanTitle} ${cleanArtist}` : cleanTitle,
          cleanTitle,
        ];

        for (const term of searchTerms) {
          const searchRes = await fetch(
            `https://lrclib.net/api/search?q=${encodeURIComponent(term)}`,
            { headers: { "User-Agent": "TrackFlow/1.0.0 (https://trackflow.app)" } }
          );

          if (searchRes.ok) {
            const results = await searchRes.json();
            if (Array.isArray(results) && results.length > 0) {
              // Prefer match with syncedLyrics
              const syncedMatch = results.find((r) => r.syncedLyrics) || results[0];

              if (syncedMatch.syncedLyrics) {
                const parsed = parseLrc(syncedMatch.syncedLyrics);
                if (parsed.length > 0) {
                  return NextResponse.json({
                    hasLyrics: true,
                    isSynced: true,
                    source: "lrclib",
                    trackName: syncedMatch.trackName,
                    artistName: syncedMatch.artistName,
                    lines: parsed,
                  });
                }
              } else if (syncedMatch.plainLyrics) {
                const plainLines = syncedMatch.plainLyrics
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
                  trackName: syncedMatch.trackName,
                  artistName: syncedMatch.artistName,
                  lines: plainLines,
                });
              }
            }
          }
        }
      } catch (lrclibErr) {
        console.warn("LRCLIB lookup error, falling back to YouTube captions:", lrclibErr);
      }
    }

    // 2. Fallback: YouTube Caption Extractor (if videoId is available)
    if (videoId) {
      let subtitles: any[] = [];
      try {
        subtitles = await getSubtitles({ videoID: videoId, lang: "vi" });
      } catch (e) {
        try {
          subtitles = await getSubtitles({ videoID: videoId, lang: "en" });
        } catch (err) {
          subtitles = [];
        }
      }

      const validLines = (subtitles || [])
        .filter((s) => s.text && s.text.trim() !== "")
        .map((s) => ({
          start: parseFloat(s.start) || 0,
          dur: parseFloat(s.dur) || 0,
          text: decodeHtmlEntities(s.text).trim(),
        }));

      if (validLines.length > 0) {
        return NextResponse.json({
          hasLyrics: true,
          isSynced: true,
          source: "youtube-captions",
          lines: validLines,
        });
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
