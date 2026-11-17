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

/**
 * Robust title cleaner for YouTube music titles
 */
function cleanSongTitleForLyrics(title: string, artist: string = ""): { primary: string; candidates: string[] } {
  if (!title) return { primary: "", candidates: [] };
  let clean = decodeHtmlEntities(title);

  // 1. Check Asian brackets: e.g. YOASOBI「勇者」 Official MV -> 勇者
  const bracketMatch = clean.match(/[「『【](.+?)[」』】]/);
  let bracketTitle = "";
  if (bracketMatch && bracketMatch[1] && !/official|mv|audio|video|teaser|live/i.test(bracketMatch[1])) {
    bracketTitle = bracketMatch[1].trim();
  }

  // 2. Remove standard YouTube tags and brackets
  clean = clean
    .replace(/\s*[\[\(](?:Official\s*(?:Music\s*)?Video|M\/?V|Performance|Visualizer|Lyric\s*Video|Audio|Official Audio|Teaser|Prod\..*?|4K|HD|Full\s*HD)[\]\)]/gi, "")
    .replace(/\s*[\[\(](?:Audio\s*Official|Video\s*Official)[\]\)]/gi, "")
    .replace(/\s*\|\s*(?:Official\s*(?:Music\s*)?Video|M\/?V|Official Performance|Visualizer|Lyric Video|Audio).*/gi, "")
    .replace(/\s*-\s*(?:Official\s*(?:Music\s*)?Video|M\/?V|Audio).*/gi, "")
    .replace(/\s*[\(\[].*?[\)\]]/gi, "") // strip ALL remaining parentheses
    .trim();

  const artistNorm = artist ? artist.toLowerCase().replace(/official|- topic|vevo|channel|music|labels/gi, "").trim() : "";

  const candidates: string[] = [];
  if (bracketTitle) candidates.push(bracketTitle);

  // 3. Handle pipe '|'
  if (clean.includes("|")) {
    const parts = clean.split("|").map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      if (!artistNorm || !part.toLowerCase().includes(artistNorm)) {
        candidates.push(part);
      }
    }
  }

  // 4. Handle hyphen ' - '
  if (clean.includes(" - ")) {
    const parts = clean.split(" - ").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      // Check if part 0 or part 1 is song title
      if (artistNorm && parts[0].toLowerCase().includes(artistNorm)) {
        candidates.push(parts[1]);
      } else if (artistNorm && parts[1].toLowerCase().includes(artistNorm)) {
        candidates.push(parts[0]);
      } else {
        candidates.push(parts[1]);
        candidates.push(parts[0]);
      }
    }
  }

  // 5. Clean up base string
  let baseClean = clean
    .replace(/\s*(?:ft\.|feat\.).*/gi, "")
    .replace(/\s*(?:M\/?V|Official\s*(?:Music\s*)?Video|Official\s*Audio|Audio)$/gi, "")
    .replace(/['"‘’“”]/g, "")
    .trim();

  if (baseClean) candidates.unshift(baseClean);

  // Deduplicate candidates
  const uniqueCandidates = Array.from(new Set(candidates.map((c) => c.trim()).filter((c) => c.length > 0)));

  return {
    primary: uniqueCandidates[0] || decodeHtmlEntities(title),
    candidates: uniqueCandidates,
  };
}

function cleanArtistForLyrics(artist: string): string[] {
  if (!artist) return [];
  let clean = decodeHtmlEntities(artist)
    .replace(/\s*-\s*Topic/gi, "")
    .replace(/\s*Official/gi, "")
    .replace(/\s*VEVO/gi, "")
    .replace(/\s*Channel/gi, "")
    .replace(/\s*Music/gi, "")
    .replace(/\s*LABELS/gi, "")
    .trim();

  const artists: string[] = [clean];

  const delimiters = ["//", "/", " feat.", " ft.", " x ", " X ", ",", " & "];
  for (const delim of delimiters) {
    if (clean.includes(delim)) {
      const primary = clean.split(delim)[0].trim();
      if (primary) artists.push(primary);
      const secondary = clean.split(delim)[1]?.trim();
      if (secondary) artists.push(secondary);
      break;
    }
  }

  return Array.from(new Set(artists.map((a) => a.trim()).filter((a) => a.length > 0)));
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

  // Ensure lines are strictly sorted by timestamp
  lines.sort((a, b) => a.start - b.start);

  // Calculate approximate duration for each line based on next line's start
  for (let i = 0; i < lines.length; i++) {
    if (i < lines.length - 1) {
      lines[i].dur = Math.max(1, Math.min(8, Math.round((lines[i + 1].start - lines[i].start) * 100) / 100));
    } else {
      lines[i].dur = 5;
    }
  }

  return lines;
}

/**
 * Liner-inspired Lyric Candidate Quality & Sync Scoring Engine
 * Distinguishes studio versions from concerts, acoustic, and remixes
 */
function scoreCandidate(
  c: any,
  cleanTitle: string,
  primaryArtist: string,
  targetDuration: number,
  isOriginalLive: boolean,
  isOriginalRemix: boolean
): number {
  if (!c || (!c.syncedLyrics && !c.plainLyrics)) return -9999;
  let score = 0;

  const cTitle = (c.trackName || "").toLowerCase();
  const cArtist = (c.artistName || "").toLowerCase();
  const cAlbum = (c.albumName || "").toLowerCase();
  const normTitle = cleanTitle.toLowerCase();
  const normArtist = primaryArtist.toLowerCase();

  // 1. Sync level priority
  if (c.syncedLyrics) {
    score += 250;
  } else if (c.plainLyrics) {
    score += 30;
  }

  // 2. Strict live/concert penalty
  const isCandidateLive =
    /\b(live|concert|tour|the eras tour|live in|live at|live from|session|trực tiếp|show|festival)\b/i.test(cTitle) ||
    /\b(live|concert|tour)\b/i.test(cAlbum);

  const isCandidateRemix =
    /\b(remix|speed up|slowed|reverb|karaoke|instrumental|tribute|cover|parody|acoustic)\b/i.test(cTitle);

  if (isCandidateLive && !isOriginalLive) {
    score -= 600; // Heavily reject live concert lyrics if user is playing studio song
  } else if (!isCandidateLive && isOriginalLive) {
    score -= 80;
  }

  if (isCandidateRemix && !isOriginalRemix) {
    score -= 300; // Reject remix/speed up if original is standard
  }

  // 3. Title match accuracy
  if (cTitle === normTitle) {
    score += 120;
  } else if (cTitle.includes(normTitle) || normTitle.includes(cTitle)) {
    score += 70;
  }

  // 4. Artist match accuracy
  if (normArtist && cArtist.includes(normArtist)) {
    score += 90;
  } else if (normArtist && normArtist.includes(cArtist)) {
    score += 50;
  }

  // 5. Proximity to playing audio duration (Critical for selecting exact studio version)
  if (targetDuration > 0 && c.duration > 0) {
    const diff = Math.abs(c.duration - targetDuration);
    if (diff <= 3) {
      score += 200; // Near-perfect match
    } else if (diff <= 8) {
      score += 130;
    } else if (diff <= 16) {
      score += 70; // Video intro/outro range
    } else if (diff <= 25) {
      score += 0;
    } else if (diff <= 35) {
      score -= 150;
    } else {
      score -= 350; // Drastically different length (e.g. concert, acoustic, skit cut)
    }
  }

  return score;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");
    const rawTitle = searchParams.get("title") || "";
    const rawArtist = searchParams.get("artist") || "";
    const targetDuration = parseFloat(searchParams.get("duration") || "0");

    const isOriginalLive = /\b(live|concert|tour|the eras tour|live in|live at|live from|session|trực tiếp|show|festival)\b/i.test(rawTitle);
    const isOriginalRemix = /\b(remix|speed up|slowed|reverb)\b/i.test(rawTitle);

    const { primary: cleanTitle, candidates: titleCandidates } = cleanSongTitleForLyrics(rawTitle, rawArtist);
    const artistCandidates = cleanArtistForLyrics(rawArtist);
    const primaryArtist = artistCandidates[0] || "";

    // =========================================================================
    // PRIORITY 1: LRCLIB (Verified studio synchronized karaoke lyrics with Duration & Keyword Scoring)
    // =========================================================================
    if (titleCandidates.length > 0) {
      // 1A. Try Direct Get with target duration when available
      for (const tCandidate of titleCandidates.slice(0, 3)) {
        for (const aCandidate of artistCandidates.length > 0 ? artistCandidates.slice(0, 2) : [""]) {
          try {
            let lrcUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(tCandidate)}`;
            if (aCandidate) {
              lrcUrl += `&artist_name=${encodeURIComponent(aCandidate)}`;
            }
            if (targetDuration > 0) {
              lrcUrl += `&duration=${Math.round(targetDuration)}`;
            }

            const lrcRes = await fetch(lrcUrl, {
              headers: { "User-Agent": "TrackFlow/3.5.0 (https://trackflow.app)" },
              cache: "no-store",
            });

            if (lrcRes.ok) {
              const lrcData = await lrcRes.json();
              if (lrcData.syncedLyrics) {
                const parsedLines = parseLrc(lrcData.syncedLyrics);
                if (parsedLines.length > 0) {
                  let suggestedOffset = 0;
                  if (targetDuration > 0 && lrcData.duration > 0) {
                    const diff = Math.round(targetDuration - lrcData.duration);
                    if (diff >= 3 && diff <= 30) {
                      suggestedOffset = diff;
                    }
                  }

                  return NextResponse.json({
                    hasLyrics: true,
                    isSynced: true,
                    source: "lrclib",
                    trackName: lrcData.trackName,
                    artistName: lrcData.artistName,
                    lines: parsedLines,
                    suggestedOffset,
                  });
                }
              }
            }
          } catch {
            // continue next candidate
          }
        }
      }

      // 1B. LRCLIB Search with Quality Candidate Scoring & Live/Concert Protection
      const searchQueries = [
        primaryArtist ? `${cleanTitle} ${primaryArtist}` : cleanTitle,
        ...titleCandidates.map((t) => (primaryArtist ? `${t} ${primaryArtist}` : t)),
        ...titleCandidates,
      ];
      const uniqueQueries = Array.from(new Set(searchQueries));

      const candidatePool: any[] = [];

      for (const query of uniqueQueries.slice(0, 3)) {
        try {
          const sRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`, {
            headers: { "User-Agent": "TrackFlow/3.5.0 (https://trackflow.app)" },
            cache: "no-store",
          });

          if (sRes.ok) {
            const results = await sRes.json();
            if (Array.isArray(results) && results.length > 0) {
              candidatePool.push(...results);
            }
          }
        } catch {
          // continue
        }
      }

      if (candidatePool.length > 0) {
        // Deduplicate candidates by id
        const seenCandidateIds = new Set<number | string>();
        const uniqueCandidates = candidatePool.filter((c) => {
          if (!c.id || seenCandidateIds.has(c.id)) return false;
          seenCandidateIds.add(c.id);
          return true;
        });

        // Rank candidates using Liner scoring engine
        const scoredCandidates = uniqueCandidates
          .map((c) => ({
            candidate: c,
            score: scoreCandidate(c, cleanTitle, primaryArtist, targetDuration, isOriginalLive, isOriginalRemix),
          }))
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score);

        if (scoredCandidates.length > 0) {
          const best = scoredCandidates[0].candidate;
          const rawLrc = best.syncedLyrics || best.plainLyrics;
          if (rawLrc) {
            const parsed = best.syncedLyrics ? parseLrc(best.syncedLyrics) : [];

            // Calculate suggested intro offset if duration differs moderately (video intro)
            let suggestedOffset = 0;
            if (targetDuration > 0 && best.duration > 0) {
              const diff = Math.round(targetDuration - best.duration);
              if (diff >= 3 && diff <= 30) {
                // Video is longer than studio audio: likely a video intro
                suggestedOffset = diff;
              }
            }

            return NextResponse.json({
              hasLyrics: true,
              isSynced: Boolean(best.syncedLyrics && parsed.length > 0),
              source: "lrclib",
              trackName: best.trackName,
              artistName: best.artistName,
              lines: parsed.length > 0 ? parsed : rawLrc.split("\n").map((text: string) => ({ start: 0, dur: 0, text })),
              suggestedOffset,
            });
          }
        }
      }
    }

    // =========================================================================
    // PRIORITY 2: Native YouTube Video Captions (Filtered & Validated)
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

      // Filter out YouTube auto-generated noise like "[âm nhạc]", "[music]", "[vỗ tay]"
      const validLines = (subtitles || [])
        .map((s) => ({
          start: Math.round((parseFloat(s.start) || 0) * 100) / 100,
          dur: Math.round((parseFloat(s.dur) || 0) * 100) / 100,
          text: decodeHtmlEntities(s.text).replace(/\n/g, " ").trim(),
        }))
        .filter((s) => {
          if (!s.text) return false;
          // Reject lines that are only bracketed audio sound tags
          if (/^\[(?:âm nhạc|nhạc|music|vỗ tay|applause|cheering|tiếng cười)\]$/i.test(s.text)) {
            return false;
          }
          if (s.text === "♪" || s.text === "🎵" || s.text === "🎶") {
            return false;
          }
          return true;
        });

      // Only accept YouTube captions if we have at least 6 real human lyric lines
      if (validLines.length >= 6) {
        validLines.sort((a, b) => a.start - b.start);
        return NextResponse.json({
          hasLyrics: true,
          isSynced: true,
          source: "youtube-captions",
          lines: validLines,
        });
      }
    }

    // =========================================================================
    // PRIORITY 3: LRCLIB Plain Unsynced Lyrics fallback
    // =========================================================================
    if (titleCandidates.length > 0) {
      try {
        const sRes = await fetch(
          `https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitle + (primaryArtist ? " " + primaryArtist : ""))}`,
          { headers: { "User-Agent": "TrackFlow/2.4.0 (https://trackflow.app)" } }
        );
        if (sRes.ok) {
          const results = await sRes.json();
          const target = results.find((r: any) => r.plainLyrics);
          if (target?.plainLyrics) {
            const plainLines = target.plainLyrics
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
              trackName: target.trackName,
              artistName: target.artistName,
              lines: plainLines,
            });
          }
        }
      } catch {
        // ignore
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
