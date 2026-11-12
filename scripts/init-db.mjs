import { neon } from "@neondatabase/serverless";

const databaseUrl = "postgresql://neondb_owner:npg_eytqPB4YoH1r@ep-spring-darkness-a1xeqq7b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(databaseUrl);

async function main() {
  console.log("Connecting to Neon and creating users & favorites tables...");
  
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log("Table 'users' ready!");

  await sql`
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      song_id INT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, song_id)
    );
  `;
  console.log("Table 'favorites' ready!");

  await sql`
    CREATE TABLE IF NOT EXISTS followed_artists (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      artist_name VARCHAR(150) NOT NULL,
      channel_id VARCHAR(100),
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, artist_name)
    );
  `;
  console.log("Table 'followed_artists' ready!");

  await sql`
    ALTER TABLE songs 
    ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE SET NULL;
  `;
  await sql`
    ALTER TABLE songs 
    ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'upload';
  `;
  console.log("Table 'songs' updated with user_id and source columns!");

  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public';`;
  console.log("Tables in database:", tables);
}

main().catch(err => {
  console.error("Error creating tables:", err);
  process.exit(1);
});
