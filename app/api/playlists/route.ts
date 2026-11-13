import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/playlists?audio_url=...
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ playlists: [] });
    }

    const { searchParams } = new URL(req.url);
    const audioUrl = searchParams.get("audio_url");

    // Fetch user playlists with song count and latest/first cover art
    const playlists = await sql`
      SELECT 
        p.id,
        p.user_id,
        p.name,
        p.description,
        p.image_url,
        p.created_at,
        p.updated_at,
        COUNT(ps.id)::int AS song_count,
        COALESCE(
          p.image_url,
          (
            SELECT ps2.image_url 
            FROM playlist_songs ps2 
            WHERE ps2.playlist_id = p.id AND ps2.image_url IS NOT NULL 
            ORDER BY ps2.position ASC, ps2.added_at ASC 
            LIMIT 1
          )
        ) AS cover_image
      FROM playlists p
      LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
      WHERE p.user_id = ${user.id}
      GROUP BY p.id
      ORDER BY p.updated_at DESC, p.created_at DESC
    `;

    // If audioUrl is provided, check which playlists contain this song
    let songPlaylistIds: number[] = [];
    if (audioUrl) {
      const contains = await sql`
        SELECT playlist_id 
        FROM playlist_songs 
        WHERE playlist_id IN (SELECT id FROM playlists WHERE user_id = ${user.id})
          AND audio_url = ${audioUrl}
      `;
      songPlaylistIds = contains.map((c: any) => c.playlist_id);
    }

    const formatted = playlists.map((p: any) => ({
      ...p,
      hasSong: songPlaylistIds.includes(p.id),
    }));

    return NextResponse.json({ playlists: formatted });
  } catch (error: any) {
    console.error("Fetch playlists error:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlists", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/playlists
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để tạo playlist" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    let { name, description } = body;

    if (!name || !name.trim()) {
      const countRes = await sql`
        SELECT COUNT(*)::int AS count FROM playlists WHERE user_id = ${user.id}
      `;
      const nextNum = (countRes[0]?.count || 0) + 1;
      name = `Danh sách phát của tôi #${nextNum}`;
    } else {
      name = name.trim();
    }

    const result = await sql`
      INSERT INTO playlists (user_id, name, description, updated_at)
      VALUES (${user.id}, ${name}, ${description ? description.trim() : ""}, NOW())
      RETURNING id, user_id, name, description, image_url, created_at, updated_at
    `;

    const newPlaylist = result[0];

    return NextResponse.json({
      success: true,
      playlist: {
        ...newPlaylist,
        song_count: 0,
        cover_image: null,
      },
    });
  } catch (error: any) {
    console.error("Create playlist error:", error);
    return NextResponse.json(
      { error: "Failed to create playlist", details: error.message },
      { status: 500 }
    );
  }
}
