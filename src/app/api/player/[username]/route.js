import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request, { params }) {
  const db = getDb();
  let username = params.username;
  
  // Extract username in case they pass something like 'farmerofaura01'
  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  try {
    const player = db.prepare('SELECT * FROM PLAYER WHERE Username = ? COLLATE NOCASE').get(username);
    
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const playerId = player.Player_ID;

    // Fetch Rank Data
    const rank = db.prepare(`
      SELECT p.*, r.Role_Name 
      FROM PLAYER_SEASON_RANK p
      JOIN ROLE r ON p.Role_ID = r.Role_ID
      WHERE Player_ID = ?
      ORDER BY Season_ID DESC
    `).get(playerId);

    // Fetch Match History (latest 10)
    const matches = db.prepare(`
      SELECT m.*, pms.* 
      FROM MATCH m
      JOIN PLAYER_MATCH_STATS pms ON m.Game_ID = pms.Game_ID
      WHERE pms.Player_ID = ?
      ORDER BY m.Timestamp DESC
      LIMIT 10
    `).all(playerId);

    // Fix parsing issue by computing aggregated stats
    const aggregatedStats = db.prepare(`
      SELECT 
        COUNT(Game_ID) as TotalGames,
        SUM(CASE WHEN Result = 'WIN' THEN 1 ELSE 0 END) as Wins,
        SUM(CASE WHEN Result = 'LOSS' THEN 1 ELSE 0 END) as Losses,
        SUM(CASE WHEN Result = 'DRAW' THEN 1 ELSE 0 END) as Draws,
        AVG(Eliminations) as AvgElims,
        AVG(Deaths) as AvgDeaths,
        AVG(Damage_Dealt) as AvgDamage,
        IFNULL(SUM(Eliminations)*1.0 / NULLIF(SUM(Deaths), 0), SUM(Eliminations)) as KDA
      FROM PLAYER_MATCH_STATS
      WHERE Player_ID = ?
    `).get(playerId);

    // Fetch Hero Performance
    const heroStats = db.prepare(`
      SELECT 
        h.Hero_Name,
        r.Role_Name,
        SUM(mhp.Time_Played_On_Hero) as TotalTime,
        SUM(mhp.Damage_Done_On_Hero) as TotalDamage,
        SUM(mhp.Ultimates_Earned) as TotalUltimates
      FROM MATCH_HERO_PERFORMANCE mhp
      JOIN HERO h ON mhp.Hero_ID = h.Hero_ID
      JOIN ROLE r ON h.Role_ID = r.Role_ID
      WHERE mhp.Player_ID = ?
      GROUP BY h.Hero_ID
      ORDER BY TotalTime DESC
    `).all(playerId);

    return NextResponse.json({
      player,
      rank,
      aggregatedStats,
      matches,
      heroStats
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
