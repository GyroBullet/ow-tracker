import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request, { params }) {
  const db = getDb();
  const resolvedParams = await params;
  const username = resolvedParams.username;

  if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

  const player = db.prepare('SELECT Player_ID FROM PLAYER WHERE Username = ? COLLATE NOCASE').get(username);
  if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });

  // Simulate an update by generating 1 new match
  const maps = ["King's Row", "Route 66", "Ilios", "Oasis", "Lijiang Tower", "Dorado", "Esperanca", "Midtown"];
  const results = ["WIN", "LOSS", "WIN", "WIN"]; // higher chance of win
  
  const mapIndex = Math.floor(Math.random() * maps.length);
  const result = results[Math.floor(Math.random() * results.length)];
  const duration = 600 + Math.floor(Math.random() * 600);
  const kills = 18 + Math.floor(Math.random() * 30);
  const deaths = 1 + Math.floor(Math.random() * 8);

  const insertMatch = db.prepare("INSERT INTO MATCH (Mode_ID, Map_Name, Server_Datacenter, Duration, Timestamp) VALUES (?, ?, ?, ?, ?)");
  const info = insertMatch.run(2, maps[mapIndex], "USE", duration, new Date().toISOString());
  const matchId = info.lastInsertRowid;

  const insertPlayerStats = db.prepare("INSERT INTO PLAYER_MATCH_STATS (Player_ID, Game_ID, Result, Damage_Dealt, Healing_Done, Eliminations, Deaths, Assists, Objective_Time_Seconds, Damage_Mitigated, Ping_Average_MS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  insertPlayerStats.run(player.Player_ID, matchId, result, kills * 420, 0, kills, deaths, 10, 110, 0, 40);

  // They played a random hero from the entire agent roster
  const randomHero = db.prepare("SELECT Hero_ID FROM HERO ORDER BY RANDOM() LIMIT 1").get();
  const heroId = randomHero.Hero_ID; 
  const insertHeroPerf = db.prepare("INSERT INTO MATCH_HERO_PERFORMANCE (Player_ID, Game_ID, Hero_ID, Time_Played_On_Hero, Damage_Done_On_Hero, Ultimates_Earned, Hero_Specific_Stat_Value) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insertHeroPerf.run(player.Player_ID, matchId, heroId, duration, kills * 420, 6, 15);

  return NextResponse.json({ success: true, matchId });
}
