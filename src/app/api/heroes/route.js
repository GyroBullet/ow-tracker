import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();

    let heroes;
    if (search) {
      heroes = db.prepare(`
        SELECT h.*, r.Role_Name
        FROM HERO h
        LEFT JOIN ROLE r ON h.Role_ID = r.Role_ID
        WHERE h.Hero_Name LIKE ?
        ORDER BY h.Hero_Name ASC
      `).all(`%${search}%`);
    } else {
      heroes = db.prepare(`
        SELECT h.*, r.Role_Name
        FROM HERO h
        LEFT JOIN ROLE r ON h.Role_ID = r.Role_ID
        ORDER BY h.Hero_Name ASC
      `).all();
    }

    return NextResponse.json({ heroes });
  } catch (error) {
    console.error('GET /api/heroes error:', error);
    return NextResponse.json({ error: 'Failed to query database', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const heroName = (body.heroName || '').trim();

    if (!heroName) {
      return NextResponse.json({ error: 'Hero name is required.' }, { status: 400 });
    }

    const info = db.prepare(`
      INSERT INTO HERO (Role_ID, Hero_Name, Release_Date, Difficulty_Rating, Base_Health)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      body.roleID ? Number(body.roleID) : null,
      heroName,
      body.releaseDate || null,
      body.difficultyRating !== undefined ? Number(body.difficultyRating) : null,
      body.baseHealth !== undefined ? Number(body.baseHealth) : 200
    );

    return NextResponse.json({ success: true, heroID: info.lastInsertRowid }, { status: 201 });
  } catch (error) {
    console.error('POST /api/heroes error:', error);
    return NextResponse.json({ error: 'Failed to create record', details: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const heroID = Number(body.heroID);

    db.prepare(`
      UPDATE HERO SET Hero_Name = ?, Role_ID = ?, Difficulty_Rating = ?
      WHERE Hero_ID = ?
    `).run(
      body.heroName ? String(body.heroName).trim() : undefined,
      body.roleID ? Number(body.roleID) : undefined,
      body.difficultyRating !== undefined ? Number(body.difficultyRating) : undefined,
      heroID
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/heroes error:', error);
    return NextResponse.json({ error: 'Failed to update record', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const heroID = searchParams.get('id');

    if (!heroID) return NextResponse.json({ error: 'Hero ID is required.' }, { status: 400 });

    db.prepare('DELETE FROM HERO WHERE Hero_ID = ?').run(Number(heroID));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/heroes error:', error);
    return NextResponse.json({ error: 'Failed to delete record', details: error.message }, { status: 500 });
  }
}
