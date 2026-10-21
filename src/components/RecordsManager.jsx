import { NextResponse } from 'next/server';
import oracledb from 'oracledb';
import { ensureTrackerTable, getOracleConnection } from '@/lib/oracle';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim();

  let connection;
  try {
    connection = await getOracleConnection();
    await ensureTrackerTable(connection);

    let sql = `
      SELECT id, name, status, notes,
             TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
      FROM tracker_records
    `;

    const binds = {};

    if (search) {
      sql += `
        WHERE LOWER(name) LIKE LOWER(:search)
           OR LOWER(status) LIKE LOWER(:search)
           OR LOWER(notes) LIKE LOWER(:search)
      `;
      binds.search = `%${search}%`;
    }

    sql += ` ORDER BY id DESC`;

    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    return NextResponse.json({ records: result.rows || [] });
  } catch (error) {
    console.error('GET /api/records error:', error);
    return NextResponse.json(
      { error: 'Failed to load records', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function POST(request) {
  const body = await request.json();
  const name = (body.name || '').trim();
  const status = (body.status || '').trim();
  const notes = (body.notes || '').trim();

  if (!name || !status) {
    return NextResponse.json({ error: 'Name and status are required.' }, { status: 400 });
  }

  let connection;
  try {
    connection = await getOracleConnection();
    await ensureTrackerTable(connection);

    const result = await connection.execute(
      `
        INSERT INTO tracker_records (name, status, notes)
        VALUES (:name, :status, :notes)
        RETURNING id INTO :id
      `,
      {
        name,
        status,
        notes,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      }
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      id: result.outBinds.id[0],
    });
  } catch (error) {
    console.error('POST /api/records error:', error);
    return NextResponse.json(
      { error: 'Failed to create record', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function PUT(request) {
  const body = await request.json();
  const id = Number(body.id);
  const name = (body.name || '').trim();
  const status = (body.status || '').trim();
  const notes = (body.notes || '').trim();

  if (!id || !name || !status) {
    return NextResponse.json({ error: 'ID, name and status are required.' }, { status: 400 });
  }

  let connection;
  try {
    connection = await getOracleConnection();
    await ensureTrackerTable(connection);

    await connection.execute(
      `
        UPDATE tracker_records
        SET name = :name,
            status = :status,
            notes = :notes
        WHERE id = :id
      `,
      { id, name, status, notes }
    );

    await connection.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/records error:', error);
    return NextResponse.json(
      { error: 'Failed to update record', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id'));

  if (!id) {
    return NextResponse.json({ error: 'Record ID is required.' }, { status: 400 });
  }

  let connection;
  try {
    connection = await getOracleConnection();
    await ensureTrackerTable(connection);

    await connection.execute(`DELETE FROM tracker_records WHERE id = :id`, { id });
    await connection.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/records error:', error);
    return NextResponse.json(
      { error: 'Failed to delete record', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
