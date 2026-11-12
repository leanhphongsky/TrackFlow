import { NextResponse } from "next/server";
import { getSubtitles } from "youtube-caption-extractor";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
    }

    let subtitles: any[] = [];

    // Try fetching Vietnamese captions first, then English
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
        text: s.text.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim(),
      }));

    if (validLines.length === 0) {
      return NextResponse.json({
        hasLyrics: false,
        message: "Hiện bài hát này chưa có lời",
        lines: [],
      });
    }

    return NextResponse.json({
      hasLyrics: true,
      lines: validLines,
    });
  } catch (error: any) {
    return NextResponse.json({
      hasLyrics: false,
      message: "Hiện bài hát này chưa có lời",
      lines: [],
    });
  }
}
