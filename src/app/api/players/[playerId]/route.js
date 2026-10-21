import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim();

  const players = await prisma.player.findMany({
    where: search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' } },
            { region: { contains: search, mode: 'insensitive' } },
            { settling: { contains: search, mode: 'insensitive' } },
            { discriminator: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { username: 'asc' },
  });

  return NextResponse.json({ players });
}

export async function POST(request) {
  const body = await request.json();
  const username = (body.username || '').trim();

  if (!username) {
    return NextResponse.json({ error: 'Username is required.' }, { status: 400 });
  }

  const player = await prisma.player.create({
    data: {
      username,
      discriminator: body.discriminator || null,
      region: body.region || null,
      settling: body.settling || null,
      date: body.date ? new Date(body.date) : null,
    },
  });

  return NextResponse.json({ player }, { status: 201 });
}

export async function PUT(request) {
  const body = await request.json();
  const playerID = body.playerID;

  if (!playerID) {
    return NextResponse.json({ error: 'Player ID is required.' }, { status: 400 });
  }

  const player = await prisma.player.update({
    where: { playerID },
    data: {
      username: body.username ? body.username.trim() : undefined,
      discriminator: body.discriminator ? body.discriminator.trim() : null,
      region: body.region ? body.region.trim() : null,
      settling: body.settling ? body.settling.trim() : null,
      date: body.date ? new Date(body.date) : null,
    },
  });

  return NextResponse.json({ player });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const playerID = searchParams.get('id');

  if (!playerID) {
    return NextResponse.json({ error: 'Player ID is required.' }, { status: 400 });
  }

  await prisma.player.delete({ where: { playerID } });
  return NextResponse.json({ success: true });
}
