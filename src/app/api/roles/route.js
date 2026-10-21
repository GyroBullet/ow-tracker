import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim();

  const heroes = await prisma.hero.findMany({
    where: search
      ? {
          OR: [{ heroName: { contains: search, mode: 'insensitive' } }],
        }
      : undefined,
    orderBy: { heroName: 'asc' },
    include: { role: true },
  });

  return NextResponse.json({ heroes });
}

export async function POST(request) {
  const body = await request.json();
  const heroName = (body.heroName || '').trim();

  if (!heroName) {
    return NextResponse.json({ error: 'Hero name is required.' }, { status: 400 });
  }

  const hero = await prisma.hero.create({
    data: {
      heroName,
      releaseDate: body.releaseDate ? new Date(body.releaseDate) : null,
      difficultyRating: body.difficultyRating !== undefined ? Number(body.difficultyRating) : null,
      roleID: body.roleID || null,
    },
  });

  return NextResponse.json({ hero }, { status: 201 });
}

export async function PUT(request) {
  const body = await request.json();
  const heroID = body.heroID;

  const hero = await prisma.hero.update({
    where: { heroID },
    data: {
      heroName: body.heroName ? String(body.heroName).trim() : undefined,
      releaseDate: body.releaseDate ? new Date(body.releaseDate) : undefined,
      difficultyRating: body.difficultyRating !== undefined ? Number(body.difficultyRating) : undefined,
      roleID: body.roleID || null,
    },
  });

  return NextResponse.json({ hero });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const heroID = searchParams.get('id');

  if (!heroID) return NextResponse.json({ error: 'Hero ID is required.' }, { status: 400 });

  await prisma.hero.delete({ where: { heroID } });
  return NextResponse.json({ success: true });
}
