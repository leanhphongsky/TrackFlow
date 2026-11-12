import { neon } from "@neondatabase/serverless";

const databaseUrl = "postgresql://neondb_owner:npg_eytqPB4YoH1r@ep-spring-darkness-a1xeqq7b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(databaseUrl);

async function main() {
  console.log("Connecting to Neon database and ensuring table 'songs' exists...");
  await sql`
    CREATE TABLE IF NOT EXISTS songs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      artist VARCHAR(255) NOT NULL,
      audio_url TEXT NOT NULL,
      image_url TEXT,
      duration INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log("Table 'songs' created or already exists successfully!");
  
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public';`;
  console.log("Tables in database:", tables);
}

main().catch(err => {
  console.error("Error initializing database:", err);
  process.exit(1);
});
