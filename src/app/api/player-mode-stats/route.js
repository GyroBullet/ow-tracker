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
        SELECT pms.*, p.Username, gm.Mode_Name
        FROM PLAYER_MODE_STATS pms
        LEFT JOIN PLAYER p ON pms.Player_ID = p.Player_ID
        LEFT JOIN GAME_MODE gm ON pms.Mode_ID = gm.Mode_ID
        WHERE CAST(pms.Player_ID AS TEXT) LIKE ? OR CAST(pms.Mode_ID AS TEXT) LIKE ?
        ORDER BY pms.Player_ID ASC
      `).all(`%${search}%`, `%${search}%`);
    } else {
      rows = db.prepare(`
        SELECT pms.*, p.Username, gm.Mode_Name
        FROM PLAYER_MODE_STATS pms
        LEFT JOIN PLAYER p ON pms.Player_ID = p.Player_ID
        LEFT JOIN GAME_MODE gm ON pms.Mode_ID = gm.Mode_ID
        ORDER BY pms.Player_ID ASC
      `).all();
    }

    return NextResponse.json({ rows });
  } catch (error) {
    console.error('GET /api/player-mode-stats error:', error);
    return NextResponse.json({ error: 'Failed to query database', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();

    db.prepare('INSERT INTO PLAYER_MODE_STATS (Player_ID, Mode_ID) VALUES (?, ?)').run(
      Number(body.playerID),
      Number(body.modeID || body.gameID)
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('POST /api/player-mode-stats error:', error);
    return NextResponse.json({ error: 'Failed to create record', details: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const db = getDb();
    const body = await request.json();

    db.prepare('UPDATE PLAYER_MODE_STATS SET Mode_ID = ? WHERE Player_ID = ? AND Mode_ID = ?').run(
      Number(body.newModeID || body.modeID),
      Number(body.playerID),
      Number(body.oldModeID || body.modeID)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/player-mode-stats error:', error);
    return NextResponse.json({ error: 'Failed to update record', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const playerID = searchParams.get('playerID') || searchParams.get('id');
    const modeID = searchParams.get('modeID');

    if (!playerID) {
      return NextResponse.json({ error: 'playerID is required.' }, { status: 400 });
    }

    if (modeID) {
      db.prepare('DELETE FROM PLAYER_MODE_STATS WHERE Player_ID = ? AND Mode_ID = ?').run(Number(playerID), Number(modeID));
    } else {
      db.prepare('DELETE FROM PLAYER_MODE_STATS WHERE Player_ID = ?').run(Number(playerID));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/player-mode-stats error:', error);
    return NextResponse.json({ error: 'Failed to delete record', details: error.message }, { status: 500 });
  }
}