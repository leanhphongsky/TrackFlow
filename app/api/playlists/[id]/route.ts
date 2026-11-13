import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/playlists/[id]
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const playlistId = parseInt(params.id, 10);
    if (isNaN(playlistId)) {
      return NextResponse.json({ error: "Playlist ID không hợp lệ" }, { status: 400 });
    }

    const playlists = await sql`
      SELECT 
        p.id,
        p.user_id,
        p.name,
        p.description,
        p.image_url,
        p.created_at,
        p.updated_at,
        u.display_name AS owner_name,
        u.username AS owner_username,
        u.avatar_url AS owner_avatar
      FROM playlists p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ${playlistId}
      LIMIT 1
    `;

    if (playlists.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy danh sách phát" }, { status: 404 });
    }

    const playlist = playlists[0];

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

    // Calculate dynamic cover if playlist.image_url is null
    const coverImage = playlist.image_url || (songs.length > 0 ? songs[0].image_url : null);

    return NextResponse.json({
      playlist: {
        ...playlist,
        cover_image: coverImage,
        song_count: songs.length,
      },
      songs,
    });
  } catch (error: any) {
    console.error("Get playlist details error:", error);
    return NextResponse.json(
      { error: "Failed to load playlist", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/playlists/[id] (Update name, description, image)
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const playlistId = parseInt(params.id, 10);
    if (isNaN(playlistId)) {
      return NextResponse.json({ error: "Playlist ID không hợp lệ" }, { status: 400 });
    }

    // Verify ownership
    const existing = await sql`
      SELECT id, user_id FROM playlists WHERE id = ${playlistId} LIMIT 1
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy danh sách phát" }, { status: 404 });
    }
    if (existing[0].user_id !== user.id) {
      return NextResponse.json({ error: "Không có quyền chỉnh sửa playlist này" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, image_url } = body;

    const updated = await sql`
      UPDATE playlists
      SET 
        name = COALESCE(${name !== undefined ? name.trim() : null}, name),
        description = COALESCE(${description !== undefined ? description.trim() : null}, description),
        image_url = COALESCE(${image_url !== undefined ? image_url : null}, image_url),
        updated_at = NOW()
      WHERE id = ${playlistId}
      RETURNING id, user_id, name, description, image_url, updated_at
    `;

    return NextResponse.json({ success: true, playlist: updated[0] });
  } catch (error: any) {
    console.error("Update playlist error:", error);
    return NextResponse.json(
      { error: "Failed to update playlist", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/playlists/[id]
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const playlistId = parseInt(params.id, 10);
    if (isNaN(playlistId)) {
      return NextResponse.json({ error: "Playlist ID không hợp lệ" }, { status: 400 });
    }

    // Verify ownership
    const existing = await sql`
      SELECT id, user_id FROM playlists WHERE id = ${playlistId} LIMIT 1
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy danh sách phát" }, { status: 404 });
    }
    if (existing[0].user_id !== user.id) {
      return NextResponse.json({ error: "Không có quyền xoá playlist này" }, { status: 403 });
    }

    await sql`
      DELETE FROM playlists WHERE id = ${playlistId}
    `;

    return NextResponse.json({ success: true, message: "Đã xoá danh sách phát" });
  } catch (error: any) {
    console.error("Delete playlist error:", error);
    return NextResponse.json(
      { error: "Failed to delete playlist", details: error.message },
      { status: 500 }
    );
  }
}
