import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const songs = await sql`
      SELECT id, title, artist, audio_url, image_url, duration, created_at 
      FROM songs 
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
    const body = await req.json();
    const { title, artist, audio_url, image_url, duration } = body;

    if (!title || !artist || !audio_url) {
      return NextResponse.json(
        { error: "Missing required fields: title, artist, audio_url" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO songs (title, artist, audio_url, image_url, duration)
      VALUES (${title}, ${artist}, ${audio_url}, ${image_url || null}, ${duration || 0})
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
