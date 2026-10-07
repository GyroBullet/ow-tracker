import Database from 'better-sqlite3';
import path from 'path';

// Use a persistent absolute path for the sqlite db
const dbPath = path.resolve(process.cwd(), 'ow-tracker.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(dbPath, { verbose: console.log });
    // Optimize the SQL once on startup
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_player_match_stats ON PLAYER_MATCH_STATS (Player_ID);
      CREATE INDEX IF NOT EXISTS idx_match_hero_perf ON MATCH_HERO_PERFORMANCE (Player_ID, Hero_ID);
      CREATE INDEX IF NOT EXISTS idx_match_timestamp ON MATCH (Timestamp DESC);
    `);
  }
  return db;
}
