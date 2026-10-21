import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const rows = await prisma.matchHeroPerformance.findMany({
    orderBy: { id: 'asc' },
    include: { match: true, hero: true },
  });
  return NextResponse.json({ rows });
}

export async function POST(request) {
  const body = await request.json();
  const row = await prisma.matchHeroPerformance.create({
    data: {
      gameID: body.gameID,
      heroID: body.heroID,
      weaponAccuracyPercentage: Number(body.weaponAccuracyPercentage || 0),
      dmgDoneOnHero: Number(body.dmgDoneOnHero || 0),
      ultimateEarned: Number(body.ultimateEarned || 0),
      heroSpecificStatValue: Number(body.heroSpecificStatValue || 0),
    },
  });
  return NextResponse.json({ row }, { status: 201 });
}

export async function PUT(request) {
  const body = await request.json();
  const id = body.id;

  const row = await prisma.matchHeroPerformance.update({
    where: { id },
    data: {
      gameID: body.gameID || undefined,
      heroID: body.heroID || undefined,
      weaponAccuracyPercentage: body.weaponAccuracyPercentage !== undefined ? Number(body.weaponAccuracyPercentage) : undefined,
      dmgDoneOnHero: body.dmgDoneOnHero !== undefined ? Number(body.dmgDoneOnHero) : undefined,
      ultimateEarned: body.ultimateEarned !== undefined ? Number(body.ultimateEarned) : undefined,
      heroSpecificStatValue: body.heroSpecificStatValue !== undefined ? Number(body.heroSpecificStatValue) : undefined,
    },
  });

  return NextResponse.json({ row });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID is required.' }, { status: 400 });

  await prisma.matchHeroPerformance.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
