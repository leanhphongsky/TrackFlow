import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/playlists/[id]/songs
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const playlistId = parseInt(params.id, 10);
    if (isNaN(playlistId)) {
      return NextResponse.json({ error: "Playlist ID không hợp lệ" }, { status: 400 });
    }

    const songs = await sql`
      SELECT 
        id,
        playlist_id,
        song_id,
        title,
        artist,
        audio_url,
        image_url,
        duration,
        views,
        position,
        added_at
      FROM playlist_songs
      WHERE playlist_id = ${playlistId}
      ORDER BY position ASC, added_at ASC
    `;

    return NextResponse.json({ songs });
  } catch (error: any) {
    console.error("Get playlist songs error:", error);
    return NextResponse.json(
      { error: "Failed to load songs", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/playlists/[id]/songs (Add song to playlist)
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const playlistId = parseInt(params.id, 10);
    if (isNaN(playlistId)) {
      return NextResponse.json({ error: "Playlist ID không hợp lệ" }, { status: 400 });
    }

    // Verify playlist ownership
    const playlist = await sql`
      SELECT id, user_id FROM playlists WHERE id = ${playlistId} LIMIT 1
    `;
    if (playlist.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy danh sách phát" }, { status: 404 });
    }
    if (playlist[0].user_id !== user.id) {
      return NextResponse.json({ error: "Không có quyền thêm bài hát vào danh sách phát này" }, { status: 403 });
    }

    const body = await req.json();
    const { songId, title, artist, audio_url, image_url, duration, views } = body;

    if (!audio_url || !title) {
      return NextResponse.json({ error: "Thông tin bài hát không đầy đủ" }, { status: 400 });
    }

    // Check if song already in this playlist
    const existingSong = await sql`
      SELECT id FROM playlist_songs 
      WHERE playlist_id = ${playlistId} AND audio_url = ${audio_url}
      LIMIT 1
    `;

    if (existingSong.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: "Bài hát đã có trong playlist", 
        alreadyExists: true,
        song: existingSong[0]
      });
    }

    // Optional link to songs table if songId is numeric
    const validNumericSongId = typeof songId === "number" ? songId : null;

    // Get max position
    const posRes = await sql`
      SELECT COALESCE(MAX(position), -1) AS max_pos FROM playlist_songs WHERE playlist_id = ${playlistId}
    `;
    const nextPos = (posRes[0]?.max_pos ?? -1) + 1;

    const inserted = await sql`
      INSERT INTO playlist_songs (
        playlist_id,
        song_id,
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
        ${playlistId},
        ${validNumericSongId},
        ${title},
        ${artist || "Nghệ sĩ chưa rõ"},
        ${audio_url},
        ${image_url || null},
        ${duration || 0},
        ${views ? String(views) : null},
        ${nextPos},
        NOW()
      )
      RETURNING *
    `;

    // Touch playlist updated_at
    await sql`UPDATE playlists SET updated_at = NOW() WHERE id = ${playlistId}`;

    return NextResponse.json({
      success: true,
      message: "Đã thêm bài hát vào danh sách phát",
      song: inserted[0],
    });
  } catch (error: any) {
    console.error("Add song to playlist error:", error);
    return NextResponse.json(
      { error: "Failed to add song to playlist", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/playlists/[id]/songs (Remove song from playlist)
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const playlistId = parseInt(params.id, 10);
    if (isNaN(playlistId)) {
      return NextResponse.json({ error: "Playlist ID không hợp lệ" }, { status: 400 });
    }

    // Verify ownership
    const playlist = await sql`
      SELECT id, user_id FROM playlists WHERE id = ${playlistId} LIMIT 1
    `;
    if (playlist.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy danh sách phát" }, { status: 404 });
    }
    if (playlist[0].user_id !== user.id) {
      return NextResponse.json({ error: "Không có quyền sửa playlist này" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const audioUrl = searchParams.get("audio_url");
    const songEntryId = searchParams.get("song_entry_id");

    if (songEntryId) {
      await sql`
        DELETE FROM playlist_songs 
        WHERE playlist_id = ${playlistId} AND id = ${parseInt(songEntryId, 10)}
      `;
    } else if (audioUrl) {
      await sql`
        DELETE FROM playlist_songs 
        WHERE playlist_id = ${playlistId} AND audio_url = ${audioUrl}
      `;
    } else {
      return NextResponse.json({ error: "Thiếu audio_url hoặc song_entry_id" }, { status: 400 });
    }

    await sql`UPDATE playlists SET updated_at = NOW() WHERE id = ${playlistId}`;

    return NextResponse.json({ success: true, message: "Đã xoá bài hát khỏi danh sách phát" });
  } catch (error: any) {
    console.error("Remove song from playlist error:", error);
    return NextResponse.json(
      { error: "Failed to remove song from playlist", details: error.message },
      { status: 500 }
    );
  }
}
