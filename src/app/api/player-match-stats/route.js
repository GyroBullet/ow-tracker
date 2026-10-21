import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let rows;
    if (search) {
      rows = db.prepare(`
        SELECT pms.*, p.Username, m.Map_Name
        FROM PLAYER_MATCH_STATS pms
        LEFT JOIN PLAYER p ON pms.Player_ID = p.Player_ID
        LEFT JOIN MATCH m ON pms.Game_ID = m.Game_ID
        WHERE CAST(pms.Player_ID AS TEXT) LIKE ? OR CAST(pms.Game_ID AS TEXT) LIKE ?
        ORDER BY pms.Game_ID DESC
      `).all(`%${search}%`, `%${search}%`);
    } else {
      rows = db.prepare(`
        SELECT pms.*, p.Username, m.Map_Name
        FROM PLAYER_MATCH_STATS pms
        LEFT JOIN PLAYER p ON pms.Player_ID = p.Player_ID
        LEFT JOIN MATCH m ON pms.Game_ID = m.Game_ID
        ORDER BY pms.Game_ID DESC
      `).all();
    }

    return NextResponse.json({ rows });
  } catch (error) {
    console.error('GET /api/player-match-stats error:', error);
    return NextResponse.json({ error: 'Failed to query database', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();

    const stmt = db.prepare(`
      INSERT INTO PLAYER_MATCH_STATS (Player_ID, Game_ID, Result, Damage_Dealt, Healing_Done, Eliminations, Deaths, Assists, Objective_Time_Seconds, Damage_Mitigated, Ping_Average_MS)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      Number(body.playerID),
      Number(body.gameID),
      body.result || 'DRAW',
      Number(body.damageDealt || 0),
      Number(body.healingDone || 0),
      Number(body.kills || body.eliminations || 0),
      Number(body.deaths || 0),
      Number(body.assists || 0),
      Number(body.objectiveTimeSeconds || 0),
      Number(body.dmgMitigated || body.damageMitigated || 0),
      Number(body.pingAverageMs || 0)
    );

    return NextResponse.json({ success: true, changes: info.changes }, { status: 201 });
  } catch (error) {
    console.error('POST /api/player-match-stats error:', error);
    return NextResponse.json({ error: 'Failed to create record', details: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const db = getDb();
    const body = await request.json();

    const stmt = db.prepare(`
      UPDATE PLAYER_MATCH_STATS
      SET Result = ?, Damage_Dealt = ?, Healing_Done = ?, Eliminations = ?, Deaths = ?, Assists = ?, Objective_Time_Seconds = ?, Damage_Mitigated = ?, Ping_Average_MS = ?
      WHERE Player_ID = ? AND Game_ID = ?
    `);

    stmt.run(
      body.result || 'DRAW',
      Number(body.damageDealt || 0),
      Number(body.healingDone || 0),
      Number(body.kills || body.eliminations || 0),
      Number(body.deaths || 0),
      Number(body.assists || 0),
      Number(body.objectiveTimeSeconds || 0),
      Number(body.dmgMitigated || body.damageMitigated || 0),
      Number(body.pingAverageMs || 0),
      Number(body.playerID),
      Number(body.gameID)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/player-match-stats error:', error);
    return NextResponse.json({ error: 'Failed to update record', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const playerID = searchParams.get('playerID');
    const gameID = searchParams.get('gameID') || searchParams.get('id');

    if (!playerID || !gameID) {
      return NextResponse.json({ error: 'playerID and gameID are required.' }, { status: 400 });
    }

    db.prepare('DELETE FROM PLAYER_MATCH_STATS WHERE Player_ID = ? AND Game_ID = ?').run(Number(playerID), Number(gameID));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/player-match-stats error:', error);
    return NextResponse.json({ error: 'Failed to delete record', details: error.message }, { status: 500 });
  }
}
