/**
 * Server-side YouTube Music InnerTube API client.
 *
 * Uses the same WEB_REMIX endpoint that the YouTube Music web app hits,
 * so it needs no API key and has no quota.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const INNERTUBE_BASE = "https://music.youtube.com/youtubei/v1";

const INNERTUBE_CONTEXT = {
  client: {
    clientName: "WEB_REMIX",
    clientVersion: "1.20260911.08.00",
    hl: "en",
    gl: "US",
  },
};

const INNERTUBE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://music.youtube.com/",
  Origin: "https://music.youtube.com",
};

/** Pre-encoded protobuf `params` values for search filters. */
const SEARCH_FILTERS = {
  track: "EgWKAQIIAWoKEAkQBRAKEAMQBA%3D%3D",
  video: "EgWKAQIQAWoKEAkQBRAKEAMQBA%3D%3D",
} as const;

const TIMEOUT_MS = 12_000;

// ─── Low-level transport ─────────────────────────────────────────────────────

async function postInnertube(endpoint: string, body: object): Promise<any> {
  const url = `${INNERTUBE_BASE}/${endpoint}?prettyPrint=false`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: INNERTUBE_HEADERS,
      body: JSON.stringify({
        ...body,
        context: INNERTUBE_CONTEXT,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`InnerTube ${endpoint} returned ${res.status}`);
    }

    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract plain text from an InnerTube text object ({runs} or {simpleText}). */
function getText(obj: any): string {
  if (!obj) return "";
  if (obj.simpleText) return obj.simpleText as string;
  if (Array.isArray(obj.runs)) {
    return obj.runs.map((r: any) => r.text ?? "").join("");
  }
  return "";
}

/** Return the `runs` array from an InnerTube text object (or []). */
function getRuns(obj: any): any[] {
  if (!obj) return [];
  return Array.isArray(obj.runs) ? obj.runs : [];
}

/**
 * Join artist name runs, skipping separator tokens like ' • ' and ' & '.
 * Keeps the *first* segment (before the first ' • ') as the artist string –
 * later segments are usually album / duration.
 */
function runsToArtists(runs: any[]): string {
  if (!runs || runs.length === 0) return "";

  const parts: string[] = [];
  for (const run of runs) {
    const text: string = run.text ?? "";
    // Stop at the first bullet separator – everything after is album/duration
    if (text === " • " || text === " · ") break;
    // Skip standalone separators like ' & ', ' x ', ' feat. '
    if (/^\s*[&x,]\s*$/i.test(text)) {
      parts.push(text);
      continue;
    }
    parts.push(text);
  }
  return parts.join("").trim();
}

/**
 * Pick the best thumbnail URL from an array of `{url, width, height}`.
 * Prefers sizes ≥ 226 px; falls back to the largest available.
 */
function coverFromThumbnail(thumbnails: any[]): string {
  if (!thumbnails || thumbnails.length === 0) return "";

  // Sort descending by area
  const sorted = [...thumbnails].sort(
    (a, b) => (b.width ?? 0) * (b.height ?? 0) - (a.width ?? 0) * (a.height ?? 0)
  );

  // Prefer 226×226+
  const preferred = sorted.find(
    (t) => (t.width ?? 0) >= 226 && (t.height ?? 0) >= 226
  );

  const best = preferred ?? sorted[0];
  let url: string = best?.url ?? "";

  // InnerTube sometimes returns protocol-relative URLs
  if (url.startsWith("//")) url = "https:" + url;

  return url;
}

/**
 * Parse a duration string like "3:45" or "1:02:30" into total seconds.
 */
function parseDurationString(raw: string): number {
  const parts = raw.split(":").map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

// ─── Result types ────────────────────────────────────────────────────────────

export interface InnertubeResult {
  videoId: string;
  title: string;
  artist: string;
  duration: number;
  image_url: string;
  views: string;
}

// ─── Result extraction ───────────────────────────────────────────────────────

/**
 * Extract a usable result from a `musicResponsiveListItemRenderer` node.
 */
function parseListItem(renderer: any): InnertubeResult | null {
  if (!renderer) return null;

  // ── Video ID ──
  const videoId: string =
    renderer.playlistItemData?.videoId ??
    renderer.overlay?.musicItemThumbnailOverlayRenderer?.content
      ?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint
      ?.videoId ??
    "";
  if (!videoId) return null;

  // ── Title (flexColumns[0]) ──
  const titleCol =
    renderer.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text;
  const title = getText(titleCol);
  if (!title) return null;

  // ── Artist / Duration (flexColumns[1]) ──
  const metaCol =
    renderer.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text;
  const metaRuns = getRuns(metaCol);
  const artist = runsToArtists(metaRuns);

  // Duration: last run matching MM:SS or H:MM:SS
  let duration = 0;
  for (let i = metaRuns.length - 1; i >= 0; i--) {
    const t: string = metaRuns[i].text ?? "";
    if (/^\d+:\d{2}$/.test(t) || /^\d+:\d{2}:\d{2}$/.test(t)) {
      duration = parseDurationString(t);
      break;
    }
  }

  // ── Thumbnail ──
  const thumbnails =
    renderer.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ?? [];
  const image_url = coverFromThumbnail(thumbnails);

  return { videoId, title, artist, duration, image_url, views: "" };
}

/**
 * Extract a usable result from a `musicCardShelfRenderer` (top-result card).
 */
function parseCardShelf(renderer: any): InnertubeResult | null {
  if (!renderer) return null;

  const videoId: string =
    renderer.onTap?.watchEndpoint?.videoId ??
    renderer.buttons?.[0]?.buttonRenderer?.navigationEndpoint?.watchEndpoint
      ?.videoId ??
    "";
  if (!videoId) return null;

  const title = getText(renderer.title);
  if (!title) return null;

  const subtitleRuns = getRuns(renderer.subtitle);
  const artist = runsToArtists(subtitleRuns);

  let duration = 0;
  for (let i = subtitleRuns.length - 1; i >= 0; i--) {
    const t: string = subtitleRuns[i].text ?? "";
    if (/^\d+:\d{2}$/.test(t) || /^\d+:\d{2}:\d{2}$/.test(t)) {
      duration = parseDurationString(t);
      break;
    }
  }

  const thumbnails =
    renderer.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ?? [];
  const image_url = coverFromThumbnail(thumbnails);

  return { videoId, title, artist, duration, image_url, views: "" };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Search YouTube Music via InnerTube and return parsed results.
 *
 * @param query  - Search query string.
 * @param filter - Optional filter: 'track' (songs) or 'video'.
 */
export async function searchInnertube(
  query: string,
  filter?: "track" | "video"
): Promise<InnertubeResult[]> {
  const body: Record<string, any> = { query };

  if (filter && SEARCH_FILTERS[filter]) {
    body.params = SEARCH_FILTERS[filter];
  }

  const data = await postInnertube("search", body);

  // Navigate into the response tree
  const tabs =
    data?.contents?.tabbedSearchResultsRenderer?.tabs ?? [];
  const tab0Content = tabs[0]?.tabRenderer?.content;
  const sections =
    tab0Content?.sectionListRenderer?.contents ?? [];

  const results: InnertubeResult[] = [];
  const seenIds = new Set<string>();

  for (const section of sections) {
    // ── musicShelfRenderer (normal result list) ──
    const shelfItems = section.musicShelfRenderer?.contents;
    if (Array.isArray(shelfItems)) {
      for (const item of shelfItems) {
        const parsed = parseListItem(item.musicResponsiveListItemRenderer);
        if (parsed && !seenIds.has(parsed.videoId)) {
          seenIds.add(parsed.videoId);
          results.push(parsed);
        }
      }
    }

    // ── musicCardShelfRenderer (top-result card) ──
    const card = section.musicCardShelfRenderer;
    if (card) {
      const parsed = parseCardShelf(card);
      if (parsed && !seenIds.has(parsed.videoId)) {
        seenIds.add(parsed.videoId);
        // Insert top result at the beginning
        results.unshift(parsed);
      }

      // The card can also contain a nested shelf of related items
      const nested = card.contents;
      if (Array.isArray(nested)) {
        for (const item of nested) {
          const p = parseListItem(item.musicResponsiveListItemRenderer);
          if (p && !seenIds.has(p.videoId)) {
            seenIds.add(p.videoId);
            results.push(p);
          }
        }
      }
    }
  }

  return results;
}

/**
 * Convenience wrapper: returns only the first / best InnerTube result, or null.
 * Useful for the import route where we just need a single match.
 */
export async function searchInnertubeFirst(
  query: string
): Promise<{
  videoId: string;
  title: string;
  artist: string;
  duration: number;
  image_url: string;
} | null> {
  const results = await searchInnertube(query, "track");
  return results.length > 0
    ? {
        videoId: results[0].videoId,
        title: results[0].title,
        artist: results[0].artist,
        duration: results[0].duration,
        image_url: results[0].image_url,
      }
    : null;
}
