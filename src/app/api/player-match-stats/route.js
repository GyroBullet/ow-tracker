import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = Number(searchParams.get('search') || 0);

  const seasons = await prisma.season.findMany({
    where: search ? { seasonNo: search } : undefined,
    orderBy: { startDate: 'asc' },
  });

  return NextResponse.json({ seasons });
}

export async function POST(request) {
  const body = await request.json();
  const seasonNo = Number(body.seasonNo || 0);

  if (!seasonNo) {
    return NextResponse.json({ error: 'Season number is required.' }, { status: 400 });
  }

  const season = await prisma.season.create({
    data: {
      seasonNo,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    },
  });

  return NextResponse.json({ season }, { status: 201 });
}

export async function PUT(request) {
  const body = await request.json();
  const seasonID = body.seasonID;

  const season = await prisma.season.update({
    where: { seasonID },
    data: {
      seasonNo: body.seasonNo !== undefined ? Number(body.seasonNo) : undefined,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    },
  });

  return NextResponse.json({ season });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const seasonID = searchParams.get('id');

  if (!seasonID) return NextResponse.json({ error: 'Season ID is required.' }, { status: 400 });

  await prisma.season.delete({ where: { seasonID } });
  return NextResponse.json({ success: true });
}
