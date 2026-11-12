import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { username, password, display_name } = await req.json();

    if (!username || !password || !display_name) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ tên đăng nhập, mật khẩu và tên hiển thị" },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: "Tên đăng nhập phải có ít nhất 3 ký tự" },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 4 ký tự" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existing = await sql`
      SELECT id FROM users WHERE username = ${cleanUsername} LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Tên đăng nhập này đã được sử dụng" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await sql`
      INSERT INTO users (username, password_hash, display_name)
      VALUES (${cleanUsername}, ${passwordHash}, ${display_name.trim()})
      RETURNING id, username, display_name, avatar_url, created_at
    `;

    const newUser = result[0];
    const token = signToken({
      id: newUser.id,
      username: newUser.username,
      display_name: newUser.display_name,
      avatar_url: newUser.avatar_url,
    });

    const res = NextResponse.json({
      user: {
        id: newUser.id,
        username: newUser.username,
        display_name: newUser.display_name,
        avatar_url: newUser.avatar_url,
      },
    });

    // Set HTTP-only cookie
    res.cookies.set("tf_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: "lax",
    });

    return res;
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Lỗi đăng ký tài khoản", details: error.message },
      { status: 500 }
    );
  }
}
