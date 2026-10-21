import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const rows = await prisma.playerModeStats.findMany({
    orderBy: { id: 'asc' },
    include: { player: true, match: true },
  });
  return NextResponse.json({ rows });
}

export async function POST(request) {
  const body = await request.json();
  const row = await prisma.playerModeStats.create({
    data: {
      playerID: body.playerID,
      gameID: body.gameID,
      timePlayedHours: Number(body.timePlayedHours || 0),
    },
  });

  return NextResponse.json({ row }, { status: 201 });
}

export async function PUT(request) {
  const body = await request.json();
  const id = body.id;

  const row = await prisma.playerModeStats.update({
    where: { id },
    data: {
      playerID: body.playerID || undefined,
      gameID: body.gameID || undefined,
      timePlayedHours: body.timePlayedHours !== undefined ? Number(body.timePlayedHours) : undefined,
    },
  });

  return NextResponse.json({ row });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID is required.' }, { status: 400 });

  await prisma.playerModeStats.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
