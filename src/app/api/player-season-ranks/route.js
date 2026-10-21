import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();

    let rows;
    if (search) {
      rows = db.prepare(`
        SELECT psr.*, p.Username, r.Role_Name, s.Season_Number
        FROM PLAYER_SEASON_RANK psr
        LEFT JOIN PLAYER p ON psr.Player_ID = p.Player_ID
        LEFT JOIN ROLE r ON psr.Role_ID = r.Role_ID
        LEFT JOIN SEASON s ON psr.Season_ID = s.Season_ID
        WHERE CAST(psr.Player_ID AS TEXT) LIKE ? OR psr.Skill_Tier LIKE ?
        ORDER BY psr.Season_ID DESC
      `).all(`%${search}%`, `%${search}%`);
    } else {
      rows = db.prepare(`
        SELECT psr.*, p.Username, r.Role_Name, s.Season_Number
        FROM PLAYER_SEASON_RANK psr
        LEFT JOIN PLAYER p ON psr.Player_ID = p.Player_ID
        LEFT JOIN ROLE r ON psr.Role_ID = r.Role_ID
        LEFT JOIN SEASON s ON psr.Season_ID = s.Season_ID
        ORDER BY psr.Season_ID DESC
      `).all();
    }

    return NextResponse.json({ rows });
  } catch (error) {
    console.error('GET /api/player-season-ranks error:', error);
    return NextResponse.json({ error: 'Failed to query database', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();

    db.prepare(`
      INSERT INTO PLAYER_SEASON_RANK (Player_ID, Season_ID, Role_ID, Skill_Tier, Division, Peak_Tier, Peak_Division)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      Number(body.playerID),
      Number(body.seasonID),
      Number(body.roleID || 1),
      body.rank || body.skillTier || '',
      body.division !== undefined ? Number(body.division) : 0,
      body.peakTier || body.rank || '',
      body.peakDivision !== undefined ? Number(body.peakDivision) : 0
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('POST /api/player-season-ranks error:', error);
    return NextResponse.json({ error: 'Failed to create record', details: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const db = getDb();
    const body = await request.json();

    db.prepare(`
      UPDATE PLAYER_SEASON_RANK SET Skill_Tier = ?, Division = ?, Peak_Tier = ?, Peak_Division = ?
      WHERE Player_ID = ? AND Season_ID = ? AND Role_ID = ?
    `).run(
      body.rank || body.skillTier || '',
      body.division !== undefined ? Number(body.division) : 0,
      body.peakTier || body.rank || '',
      body.peakDivision !== undefined ? Number(body.peakDivision) : 0,
      Number(body.playerID),
      Number(body.seasonID),
      Number(body.roleID || 1)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/player-season-ranks error:', error);
    return NextResponse.json({ error: 'Failed to update record', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const playerID = searchParams.get('playerID') || searchParams.get('id');
    const seasonID = searchParams.get('seasonID');

    if (!playerID) {
      return NextResponse.json({ error: 'playerID is required.' }, { status: 400 });
    }

    if (seasonID) {
      db.prepare('DELETE FROM PLAYER_SEASON_RANK WHERE Player_ID = ? AND Season_ID = ?')
        .run(Number(playerID), Number(seasonID));
    } else {
      db.prepare('DELETE FROM PLAYER_SEASON_RANK WHERE Player_ID = ?').run(Number(playerID));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/player-season-ranks error:', error);
    return NextResponse.json({ error: 'Failed to delete record', details: error.message }, { status: 500 });
  }
}
