import Database from 'better-sqlite3';
import path from 'path';

let _db = null;

export function getDb() {
  if (!_db) {
    const dbPath = path.join(process.cwd(), 'ow-tracker.db');
    _db = new Database(dbPath);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
  }
  return _db;
}
