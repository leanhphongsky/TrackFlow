import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ songs: [] });
    }

    // Only return uploaded songs belonging to the current user
    const songs = await sql`
      SELECT id, title, artist, audio_url, image_url, duration, created_at 
      FROM songs 
      WHERE user_id = ${user.id} AND (source = 'upload' OR source IS NULL)
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ songs });
  } catch (error: any) {
    console.error("Failed to fetch songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để đăng bài hát" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, artist, audio_url, image_url, duration } = body;

    if (!title || !artist || !audio_url) {
      return NextResponse.json(
        { error: "Missing required fields: title, artist, audio_url" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO songs (title, artist, audio_url, image_url, duration, user_id, source)
      VALUES (${title}, ${artist}, ${audio_url}, ${image_url || null}, ${duration || 0}, ${user.id}, 'upload')
      RETURNING id, title, artist, audio_url, image_url, duration, created_at
    `;

    return NextResponse.json({ song: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to add song:", error);
    return NextResponse.json(
      { error: "Failed to add song", details: error.message },
      { status: 500 }
    );
  }
}
