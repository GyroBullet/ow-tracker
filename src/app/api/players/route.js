import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const search = (req.query.search || '').toString().trim();

    const players = await prisma.player.findMany({
      where: search
        ? {
            OR: [
              { username: { contains: search, mode: 'insensitive' } },
              { region: { contains: search, mode: 'insensitive' } },
              { settling: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { username: 'asc' },
    });

    return res.status(200).json({ players });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const username = (body.username || '').trim();
    const discriminator = (body.discriminator || '').trim() || null;
    const region = (body.region || '').trim() || null;
    const settling = (body.settling || '').trim() || null;
    const date = body.date ? new Date(body.date) : null;

    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }

    const player = await prisma.player.create({
      data: {
        username,
        discriminator,
        region,
        settling,
        date,
      },
    });

    return res.status(201).json({ player });
  }

  if (req.method === 'PUT') {
    const body = req.body || {};
    const playerID = body.playerID;

    if (!playerID) {
      return res.status(400).json({ error: 'Player ID is required.' });
    }

    const updated = await prisma.player.update({
      where: { playerID },
      data: {
        username: body.username ? body.username.trim() : undefined,
        discriminator: body.discriminator ? body.discriminator.trim() : null,
        region: body.region ? body.region.trim() : null,
        settling: body.settling ? body.settling.trim() : null,
        date: body.date ? new Date(body.date) : null,
      },
    });

    return res.status(200).json({ player: updated });
  }

  if (req.method === 'DELETE') {
    const playerID = req.query.id;

    if (!playerID) {
      return res.status(400).json({ error: 'Player ID is required.' });
    }

    await prisma.player.delete({ where: { playerID: String(playerID) } });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}
