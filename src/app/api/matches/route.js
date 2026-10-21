import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();

    let matches;
    if (search) {
      matches = db.prepare(`
        SELECT m.*, gm.Mode_Name
        FROM MATCH m
        LEFT JOIN GAME_MODE gm ON m.Mode_ID = gm.Mode_ID
        WHERE m.Map_Name LIKE ? OR CAST(m.Game_ID AS TEXT) LIKE ?
        ORDER BY m.Timestamp DESC
      `).all(`%${search}%`, `%${search}%`);
    } else {
      matches = db.prepare(`
        SELECT m.*, gm.Mode_Name
        FROM MATCH m
        LEFT JOIN GAME_MODE gm ON m.Mode_ID = gm.Mode_ID
        ORDER BY m.Timestamp DESC
      `).all();
    }

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('GET /api/matches error:', error);
    return NextResponse.json({ error: 'Failed to query database', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();

    const info = db.prepare(`
      INSERT INTO MATCH (Mode_ID, Map_Name, Server_Datacenter, Duration, Timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      Number(body.modeID || body.mapName ? 1 : 1),
      String(body.mapName || '').trim(),
      body.serverDatacenter || 'USE',
      Number(body.duration || 0),
      body.timestamp || new Date().toISOString()
    );

    return NextResponse.json({ success: true, gameID: info.lastInsertRowid }, { status: 201 });
  } catch (error) {
    console.error('POST /api/matches error:', error);
    return NextResponse.json({ error: 'Failed to create record', details: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const gameID = Number(body.gameID);

    db.prepare(`
      UPDATE MATCH SET Map_Name = ?, Duration = ?, Timestamp = ?
      WHERE Game_ID = ?
    `).run(
      body.mapName ? String(body.mapName).trim() : undefined,
      body.duration !== undefined ? Number(body.duration) : undefined,
      body.timestamp || undefined,
      gameID
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/matches error:', error);
    return NextResponse.json({ error: 'Failed to update record', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const gameID = searchParams.get('id');

    if (!gameID) return NextResponse.json({ error: 'Match ID is required.' }, { status: 400 });

    db.prepare('DELETE FROM MATCH WHERE Game_ID = ?').run(Number(gameID));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/matches error:', error);
    return NextResponse.json({ error: 'Failed to delete record', details: error.message }, { status: 500 });
  }
}
