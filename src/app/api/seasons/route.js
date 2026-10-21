import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim();

  const roles = await prisma.role.findMany({
    where: search ? { roleName: { contains: search, mode: 'insensitive' } } : undefined,
    orderBy: { roleName: 'asc' },
  });

  return NextResponse.json({ roles });
}

export async function POST(request) {
  const body = await request.json();
  const roleName = (body.roleName || '').trim();

  if (!roleName) {
    return NextResponse.json({ error: 'Role name is required.' }, { status: 400 });
  }

  const role = await prisma.role.create({ data: { roleName } });
  return NextResponse.json({ role }, { status: 201 });
}

export async function PUT(request) {
  const body = await request.json();
  const roleID = body.roleID;

  const role = await prisma.role.update({
    where: { roleID },
    data: { roleName: body.roleName ? String(body.roleName).trim() : undefined },
  });

  return NextResponse.json({ role });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const roleID = searchParams.get('id');

  if (!roleID) return NextResponse.json({ error: 'Role ID is required.' }, { status: 400 });

  await prisma.role.delete({ where: { roleID } });
  return NextResponse.json({ success: true });
}
