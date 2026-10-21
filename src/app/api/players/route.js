import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();

    let players;
    if (search) {
      players = db.prepare(`
        SELECT * FROM PLAYER
        WHERE Username LIKE ? COLLATE NOCASE OR CAST(Player_ID AS TEXT) LIKE ?
        ORDER BY Player_ID ASC
      `).all(`%${search}%`, `%${search}%`);
    } else {
      players = db.prepare('SELECT * FROM PLAYER ORDER BY Player_ID ASC').all();
    }

    // Map to camelCase keys for the admin dashboard
    const mapped = players.map(p => ({
      playerID: p.Player_ID,
      username: p.Username,
      discriminator: p.Discriminator,
      region: p.Default_Region,
      settling: p.Email_Address,
      date: p.Account_Creation_Date,
      endorsementLevel: p.Endorsement_Level,
      isBanned: p.Is_Banned,
    }));

    return NextResponse.json({ players: mapped });
  } catch (error) {
    console.error('GET /api/players error:', error);
    return NextResponse.json({ error: 'Failed to query database', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const username = (body.username || '').trim();

    if (!username) {
      return NextResponse.json({ error: 'Username is required.' }, { status: 400 });
    }

    const info = db.prepare(`
      INSERT INTO PLAYER (Username, Discriminator, Email_Address, Account_Creation_Date, Default_Region, Endorsement_Level, Is_Banned)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      username,
      Number(body.discriminator || 0),
      body.settling || body.email || '',
      body.date || new Date().toISOString(),
      body.region || '',
      Number(body.endorsementLevel || 1),
      0
    );

    return NextResponse.json({ success: true, playerID: info.lastInsertRowid }, { status: 201 });
  } catch (error) {
    console.error('POST /api/players error:', error);
    return NextResponse.json({ error: 'Failed to create record', details: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const playerID = Number(body.playerID);

    db.prepare(`
      UPDATE PLAYER SET Username = ?, Discriminator = ?, Default_Region = ?, Email_Address = ?, Account_Creation_Date = ?
      WHERE Player_ID = ?
    `).run(
      body.username || undefined,
      body.discriminator !== undefined ? Number(body.discriminator) : undefined,
      body.region || undefined,
      body.settling || body.email || undefined,
      body.date || undefined,
      playerID
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/players error:', error);
    return NextResponse.json({ error: 'Failed to update record', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const playerID = searchParams.get('id');

    if (!playerID) return NextResponse.json({ error: 'Player ID is required.' }, { status: 400 });

    db.prepare('DELETE FROM PLAYER WHERE Player_ID = ?').run(Number(playerID));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/players error:', error);
    return NextResponse.json({ error: 'Failed to delete record', details: error.message }, { status: 500 });
  }
}
