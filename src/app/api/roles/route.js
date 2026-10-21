import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();

    let roles;
    if (search) {
      roles = db.prepare('SELECT * FROM ROLE WHERE Role_Name LIKE ? ORDER BY Role_Name ASC').all(`%${search}%`);
    } else {
      roles = db.prepare('SELECT * FROM ROLE ORDER BY Role_Name ASC').all();
    }

    return NextResponse.json({ roles });
  } catch (error) {
    console.error('GET /api/roles error:', error);
    return NextResponse.json({ error: 'Failed to query database', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const roleName = (body.roleName || '').trim();

    if (!roleName) {
      return NextResponse.json({ error: 'Role name is required.' }, { status: 400 });
    }

    const info = db.prepare('INSERT INTO ROLE (Role_Name) VALUES (?)').run(roleName);
    return NextResponse.json({ success: true, roleID: info.lastInsertRowid }, { status: 201 });
  } catch (error) {
    console.error('POST /api/roles error:', error);
    return NextResponse.json({ error: 'Failed to create record', details: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const roleID = Number(body.roleID);

    db.prepare('UPDATE ROLE SET Role_Name = ? WHERE Role_ID = ?').run(
      body.roleName ? String(body.roleName).trim() : undefined,
      roleID
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/roles error:', error);
    return NextResponse.json({ error: 'Failed to update record', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const roleID = searchParams.get('id');

    if (!roleID) return NextResponse.json({ error: 'Role ID is required.' }, { status: 400 });

    db.prepare('DELETE FROM ROLE WHERE Role_ID = ?').run(Number(roleID));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/roles error:', error);
    return NextResponse.json({ error: 'Failed to delete record', details: error.message }, { status: 500 });
  }
}
