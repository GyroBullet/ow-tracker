import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_request, { params }) {
  const { playerId } = await params;

  const player = await prisma.player.findUnique({
    where: { playerID: playerId },
    include: {
      matchStats: true,
      seasonRanks: { include: { season: true } },
      modeStats: { include: { match: true } },
    },
  });

  if (!player) {
    return NextResponse.json({ error: 'Player not found.' }, { status: 404 });
  }

  return NextResponse.json({ player });
}
