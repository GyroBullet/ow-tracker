import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const rows = await prisma.playerMatchStats.findMany({
    orderBy: { id: 'asc' },
    include: { player: true, match: true },
  });
  return NextResponse.json({ rows });
}

export async function POST(request) {
  const body = await request.json();
  const data = {
    playerID: body.playerID,
    gameID: body.gameID,
    kills: Number(body.kills || 0),
    deaths: Number(body.deaths || 0),
    healingDone: Number(body.healingDone || 0),
    dmgMitigated: Number(body.dmgMitigated || 0),
    jumpAttempts: Number(body.jumpAttempts || 0),
  };

  const row = await prisma.playerMatchStats.create({ data });
  return NextResponse.json({ row }, { status: 201 });
}

export async function PUT(request) {
  const body = await request.json();
  const id = body.id;

  const row = await prisma.playerMatchStats.update({
    where: { id },
    data: {
      playerID: body.playerID || undefined,
      gameID: body.gameID || undefined,
      kills: body.kills !== undefined ? Number(body.kills) : undefined,
      deaths: body.deaths !== undefined ? Number(body.deaths) : undefined,
      healingDone: body.healingDone !== undefined ? Number(body.healingDone) : undefined,
      dmgMitigated: body.dmgMitigated !== undefined ? Number(body.dmgMitigated) : undefined,
      jumpAttempts: body.jumpAttempts !== undefined ? Number(body.jumpAttempts) : undefined,
    },
  });

  return NextResponse.json({ row });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID is required.' }, { status: 400 });

  await prisma.playerMatchStats.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
