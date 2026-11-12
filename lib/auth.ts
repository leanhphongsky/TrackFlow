import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "trackflow_secret_key_jwt_super_safe_2026";

export interface AuthUser {
  id: number;
  username: string;
  display_name: string;
  avatar_url?: string | null;
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url || null,
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("tf_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
