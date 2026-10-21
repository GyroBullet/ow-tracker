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
        SELECT mhp.*, h.Hero_Name, m.Map_Name
        FROM MATCH_HERO_PERFORMANCE mhp
        LEFT JOIN HERO h ON mhp.Hero_ID = h.Hero_ID
        LEFT JOIN MATCH m ON mhp.Game_ID = m.Game_ID
        WHERE CAST(mhp.Player_ID AS TEXT) LIKE ? OR h.Hero_Name LIKE ?
        ORDER BY mhp.Game_ID DESC
      `).all(`%${search}%`, `%${search}%`);
    } else {
      rows = db.prepare(`
        SELECT mhp.*, h.Hero_Name, m.Map_Name
        FROM MATCH_HERO_PERFORMANCE mhp
        LEFT JOIN HERO h ON mhp.Hero_ID = h.Hero_ID
        LEFT JOIN MATCH m ON mhp.Game_ID = m.Game_ID
        ORDER BY mhp.Game_ID DESC
      `).all();
    }

    return NextResponse.json({ rows });
  } catch (error) {
    console.error('GET /api/match-hero-performance error:', error);
    return NextResponse.json({ error: 'Failed to query database', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();

    db.prepare(`
      INSERT INTO MATCH_HERO_PERFORMANCE (Player_ID, Game_ID, Hero_ID, Time_Played_On_Hero, Damage_Done_On_Hero, Ultimates_Earned, Hero_Specific_Stat_Value)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      Number(body.playerID),
      Number(body.gameID),
      Number(body.heroID),
      Number(body.timePlayedOnHero || 0),
      Number(body.dmgDoneOnHero || body.damageDoneOnHero || 0),
      Number(body.ultimateEarned || body.ultimatesEarned || 0),
      Number(body.heroSpecificStatValue || 0)
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('POST /api/match-hero-performance error:', error);
    return NextResponse.json({ error: 'Failed to create record', details: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const db = getDb();
    const body = await request.json();

    db.prepare(`
      UPDATE MATCH_HERO_PERFORMANCE
      SET Time_Played_On_Hero = ?, Damage_Done_On_Hero = ?, Ultimates_Earned = ?, Hero_Specific_Stat_Value = ?
      WHERE Player_ID = ? AND Game_ID = ? AND Hero_ID = ?
    `).run(
      Number(body.timePlayedOnHero || 0),
      Number(body.dmgDoneOnHero || body.damageDoneOnHero || 0),
      Number(body.ultimateEarned || body.ultimatesEarned || 0),
      Number(body.heroSpecificStatValue || 0),
      Number(body.playerID),
      Number(body.gameID),
      Number(body.heroID)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/match-hero-performance error:', error);
    return NextResponse.json({ error: 'Failed to update record', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const playerID = searchParams.get('playerID') || searchParams.get('id');
    const gameID = searchParams.get('gameID');
    const heroID = searchParams.get('heroID');

    if (!playerID) {
      return NextResponse.json({ error: 'playerID is required.' }, { status: 400 });
    }

    if (gameID && heroID) {
      db.prepare('DELETE FROM MATCH_HERO_PERFORMANCE WHERE Player_ID = ? AND Game_ID = ? AND Hero_ID = ?')
        .run(Number(playerID), Number(gameID), Number(heroID));
    } else {
      db.prepare('DELETE FROM MATCH_HERO_PERFORMANCE WHERE Player_ID = ?').run(Number(playerID));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/match-hero-performance error:', error);
    return NextResponse.json({ error: 'Failed to delete record', details: error.message }, { status: 500 });
  }
}
