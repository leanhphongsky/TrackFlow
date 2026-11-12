import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ artists: [] });
    }

    const artists = await sql`
      SELECT id, artist_name, channel_id, avatar_url, created_at
      FROM followed_artists
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ artists });
  } catch (error: any) {
    console.error("Fetch followed artists error:", error);
    return NextResponse.json(
      { error: "Failed to fetch followed artists", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để theo dõi nghệ sĩ" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { artist_name, channel_id, avatar_url } = body;

    if (!artist_name) {
      return NextResponse.json(
        { error: "Missing artist_name" },
        { status: 400 }
      );
    }

    const cleanName = artist_name.trim();

    const result = await sql`
      INSERT INTO followed_artists (user_id, artist_name, channel_id, avatar_url)
      VALUES (${user.id}, ${cleanName}, ${channel_id || null}, ${avatar_url || null})
      ON CONFLICT (user_id, artist_name) 
      DO UPDATE SET 
        avatar_url = COALESCE(EXCLUDED.avatar_url, followed_artists.avatar_url),
        channel_id = COALESCE(EXCLUDED.channel_id, followed_artists.channel_id)
      RETURNING id, artist_name, channel_id, avatar_url, created_at
    `;

    return NextResponse.json({ success: true, artist: result[0] });
  } catch (error: any) {
    console.error("Follow artist error:", error);
    return NextResponse.json(
      { error: "Failed to follow artist", details: error.message },
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
    const artistName = searchParams.get("artistName");
    const channelId = searchParams.get("channelId");

    if (artistName) {
      await sql`
        DELETE FROM followed_artists
        WHERE user_id = ${user.id} AND LOWER(artist_name) = LOWER(${artistName.trim()})
      `;
    } else if (channelId) {
      await sql`
        DELETE FROM followed_artists
        WHERE user_id = ${user.id} AND channel_id = ${channelId.trim()}
      `;
    } else {
      return NextResponse.json(
        { error: "Missing artistName or channelId" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Unfollow artist error:", error);
    return NextResponse.json(
      { error: "Failed to unfollow artist", details: error.message },
      { status: 500 }
    );
  }
}
