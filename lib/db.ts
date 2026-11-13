import { neon } from "@neondatabase/serverless";

export interface Song {
  id: number | string;
  title: string;
  artist: string;
  audio_url: string;
  image_url: string | null;
  duration: number;
  created_at?: string;
  videoId?: string;
  user_id?: number | null;
  source?: string;
  views?: number | string;
  viewsFormatted?: string;
}

// Lazy Neon SQL client so it doesn't crash during build time if env is pending
export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn("DATABASE_URL is missing. Please configure it in your environment variables.");
    return Promise.resolve([] as any);
  }
  const client = neon(databaseUrl);
  return client(strings, ...values);
};
