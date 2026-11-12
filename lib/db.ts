import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

export const sql = neon(process.env.DATABASE_URL);

export interface Song {
  id: number | string;
  title: string;
  artist: string;
  audio_url: string;
  image_url: string | null;
  duration: number;
  created_at?: string;
  videoId?: string;
}
