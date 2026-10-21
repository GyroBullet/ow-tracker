import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const rows = await prisma.playerSeasonRank.findMany({
    orderBy: { id: 'asc' },
    include: { player: true, season: true },
  });
  return NextResponse.json({ rows });
}

export async function POST(request) {
  const body = await request.json();
  const row = await prisma.playerSeasonRank.create({
    data: {
      playerID: body.playerID,
      seasonID: body.seasonID,
      rank: body.rank || '',
      division: body.division || '',
      skillTier: Number(body.skillTier || 0),
    },
  });

  return NextResponse.json({ row }, { status: 201 });
}

export async function PUT(request) {
  const body = await request.json();
  const id = body.id;

  const row = await prisma.playerSeasonRank.update({
    where: { id },
    data: {
      playerID: body.playerID || undefined,
      seasonID: body.seasonID || undefined,
      rank: body.rank !== undefined ? String(body.rank) : undefined,
      division: body.division !== undefined ? String(body.division) : undefined,
      skillTier: body.skillTier !== undefined ? Number(body.skillTier) : undefined,
    },
  });

  return NextResponse.json({ row });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID is required.' }, { status: 400 });

  await prisma.playerSeasonRank.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
