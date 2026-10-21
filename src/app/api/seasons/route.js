import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();

    let seasons;
    if (search) {
      seasons = db.prepare(`
        SELECT * FROM SEASON
        WHERE CAST(Season_Number AS TEXT) LIKE ? OR Theme_Name LIKE ?
        ORDER BY Season_Number ASC
      `).all(`%${search}%`, `%${search}%`);
    } else {
      seasons = db.prepare('SELECT * FROM SEASON ORDER BY Season_Number ASC').all();
    }

    return NextResponse.json({ seasons });
  } catch (error) {
    console.error('GET /api/seasons error:', error);
    return NextResponse.json({ error: 'Failed to query database', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const seasonNo = Number(body.seasonNo || 0);

    if (!seasonNo) {
      return NextResponse.json({ error: 'Season number is required.' }, { status: 400 });
    }

    const info = db.prepare(`
      INSERT INTO SEASON (Season_Number, Theme_Name, Base_Patch_Version, Start_Date, End_Date)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      seasonNo,
      body.themeName || '',
      body.basePatchVersion || '',
      body.startDate || '',
      body.endDate || ''
    );

    return NextResponse.json({ success: true, seasonID: info.lastInsertRowid }, { status: 201 });
  } catch (error) {
    console.error('POST /api/seasons error:', error);
    return NextResponse.json({ error: 'Failed to create record', details: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const seasonID = Number(body.seasonID);

    db.prepare(`
      UPDATE SEASON SET Season_Number = ?, Theme_Name = ?, Start_Date = ?, End_Date = ?
      WHERE Season_ID = ?
    `).run(
      body.seasonNo !== undefined ? Number(body.seasonNo) : undefined,
      body.themeName || undefined,
      body.startDate || undefined,
      body.endDate || undefined,
      seasonID
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/seasons error:', error);
    return NextResponse.json({ error: 'Failed to update record', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const seasonID = searchParams.get('id');

    if (!seasonID) return NextResponse.json({ error: 'Season ID is required.' }, { status: 400 });

    db.prepare('DELETE FROM SEASON WHERE Season_ID = ?').run(Number(seasonID));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/seasons error:', error);
    return NextResponse.json({ error: 'Failed to delete record', details: error.message }, { status: 500 });
  }
}
