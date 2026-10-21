const Database = require('better-sqlite3');
const db = new Database('./ow-tracker.db');
const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name").all();
tables.forEach(t => {
  console.log(t.sql + ';\n');
});

// Show sample player data
const players = db.prepare('SELECT * FROM PLAYER LIMIT 3').all();
console.log('\n--- Sample Players ---');
console.log(JSON.stringify(players, null, 2));
