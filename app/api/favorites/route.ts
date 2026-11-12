import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ songs: [], favoriteSongIds: [], favoriteAudioUrls: [] });
    }

    const favorites = await sql`
      SELECT s.id, s.title, s.artist, s.audio_url, s.image_url, s.duration, s.created_at, f.created_at as favorited_at
      FROM favorites f
      JOIN songs s ON f.song_id = s.id
      WHERE f.user_id = ${user.id}
      ORDER BY f.created_at DESC
    `;

    const favoriteSongIds = favorites.map((f: any) => f.id);
    const favoriteAudioUrls = favorites.map((f: any) => f.audio_url);

    return NextResponse.json({
      songs: favorites,
      favoriteSongIds,
      favoriteAudioUrls,
    });
  } catch (error: any) {
    console.error("Fetch favorites error:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thêm vào danh sách yêu thích" },
        { status: 401 }
      );
    }

    const body = await req.json();
    let { songId, title, artist, audio_url, image_url, duration } = body;

    // If song is from YouTube or doesn't have a numeric DB id yet
    let targetSongId = typeof songId === "number" ? songId : null;

    if (!targetSongId && audio_url) {
      // Check if song already exists in songs table
      const existing = await sql`
        SELECT id FROM songs WHERE audio_url = ${audio_url} LIMIT 1
      `;

      if (existing.length > 0) {
        targetSongId = existing[0].id;
      } else {
        // Insert new song into songs table
        const insertRes = await sql`
          INSERT INTO songs (title, artist, audio_url, image_url, duration)
          VALUES (${title || "Bài hát"}, ${artist || "Nghệ sĩ"}, ${audio_url}, ${image_url || null}, ${duration || 0})
          RETURNING id
        `;
        targetSongId = insertRes[0].id;
      }
    }

    if (!targetSongId) {
      return NextResponse.json({ error: "Missing song information" }, { status: 400 });
    }

    // Insert into favorites
    await sql`
      INSERT INTO favorites (user_id, song_id)
      VALUES (${user.id}, ${targetSongId})
      ON CONFLICT (user_id, song_id) DO NOTHING
    `;

    return NextResponse.json({
      success: true,
      favorited: true,
      songId: targetSongId,
      audio_url,
    });
  } catch (error: any) {
    console.error("Add favorite error:", error);
    return NextResponse.json(
      { error: "Failed to add favorite", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const songId = searchParams.get("songId");
    const audio_url = searchParams.get("audio_url");

    if (songId && !isNaN(parseInt(songId))) {
      await sql`
        DELETE FROM favorites 
        WHERE user_id = ${user.id} AND song_id = ${parseInt(songId)}
      `;
    } else if (audio_url) {
      await sql`
        DELETE FROM favorites 
        WHERE user_id = ${user.id} 
          AND song_id IN (SELECT id FROM songs WHERE audio_url = ${audio_url})
      `;
    } else {
      return NextResponse.json({ error: "Missing songId or audio_url" }, { status: 400 });
    }

    return NextResponse.json({ success: true, favorited: false });
  } catch (error: any) {
    console.error("Delete favorite error:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite", details: error.message },
      { status: 500 }
    );
  }
}
