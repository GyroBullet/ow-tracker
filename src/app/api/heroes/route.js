import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim();

  const matches = await prisma.match.findMany({
    where: search
      ? {
          OR: [{ mapName: { contains: search, mode: 'insensitive' } }],
        }
      : undefined,
    orderBy: { timestamp: 'desc' },
  });

  return NextResponse.json({ matches });
}

export async function POST(request) {
  const body = await request.json();

  const match = await prisma.match.create({
    data: {
      mapName: String(body.mapName || '').trim(),
      duration: Number(body.duration || 0),
      timestamp: new Date(body.timestamp || Date.now()),
    },
  });

  return NextResponse.json({ match }, { status: 201 });
}

export async function PUT(request) {
  const body = await request.json();
  const gameID = body.gameID;

  const match = await prisma.match.update({
    where: { gameID },
    data: {
      mapName: body.mapName ? String(body.mapName).trim() : undefined,
      duration: body.duration !== undefined ? Number(body.duration) : undefined,
      timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
    },
  });

  return NextResponse.json({ match });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const gameID = searchParams.get('id');

  if (!gameID) return NextResponse.json({ error: 'Match ID is required.' }, { status: 400 });

  await prisma.match.delete({ where: { gameID } });
  return NextResponse.json({ success: true });
}
