import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("tf_token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
