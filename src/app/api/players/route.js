import Link from 'next/link';
import prisma from '@/lib/prisma';

export default async function PlayerDetailPage({ params }) {
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
    return (
      <main style={{ maxWidth: 960, margin: '40px auto', padding: 20 }}>
        <h1>Player not found</h1>
        <Link href="/">Back to dashboard</Link>
      </main>
    );
  }

  const totalMatches = player.matchStats.length;
  const totalKills = player.matchStats.reduce((sum, item) => sum + (item.kills || 0), 0);
  const totalDeaths = player.matchStats.reduce((sum, item) => sum + (item.deaths || 0), 0);
  const totalHours = player.modeStats.reduce((sum, item) => sum + (item.timePlayedHours || 0), 0);

  return (
    <main style={{ maxWidth: 1200, margin: '40px auto', padding: 20, color: '#f5f5f5' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ color: '#f99e1a', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, fontWeight: 700 }}>Player Profile</p>
          <h1 style={{ margin: 0, fontSize: '2.4rem' }}>{player.username}</h1>
        </div>
        <Link href="/" style={{ color: '#f99e1a', fontWeight: 700 }}>← Back to dashboard</Link>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Region" value={player.region || '—'} />
        <StatCard label="Settling" value={player.settling || '—'} />
        <StatCard label="Matches" value={String(totalMatches)} />
        <StatCard label="Kills" value={String(totalKills)} />
        <StatCard label="Deaths" value={String(totalDeaths)} />
        <StatCard label="Hours Played" value={String(totalHours.toFixed(1))} />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        <Panel title="Basic Info">
          <InfoRow label="Username" value={player.username} />
          <InfoRow label="Discriminator" value={player.discriminator || '—'} />
          <InfoRow label="Region" value={player.region || '—'} />
          <InfoRow label="Settling" value={player.settling || '—'} />
          <InfoRow label="Joined" value={player.date ? new Date(player.date).toLocaleDateString() : '—'} />
        </Panel>

        <Panel title="Season Rankings">
          {player.seasonRanks.length === 0 ? (
            <p style={{ color: '#8b8f98' }}>No season ranks yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {player.seasonRanks.map((rank) => (
                <div key={rank.id} style={{ padding: 12, borderRadius: 10, background: '#171a1f', border: '1px solid #2a2d32' }}>
                  <strong>{rank.season?.seasonNo ?? 'Season'} </strong>
                  <div style={{ color: '#c7cbd3' }}>{rank.rank} / {rank.division} / Skill Tier {rank.skillTier}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Match Stats">
          {player.matchStats.length === 0 ? (
            <p style={{ color: '#8b8f98' }}>No match stats yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {player.matchStats.map((stat) => (
                <div key={stat.id} style={{ padding: 12, borderRadius: 10, background: '#171a1f', border: '1px solid #2a2d32' }}>
                  <div style={{ fontWeight: 700 }}>Game {stat.gameID}</div>
                  <div style={{ color: '#c7cbd3' }}>Kills: {stat.kills} | Deaths: {stat.deaths} | Healing: {stat.healingDone}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: '#111317', border: '1px solid #2a2d32', borderRadius: 16, padding: 18 }}>
      <div style={{ color: '#8b8f98', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: '1.8rem', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section style={{ background: '#111317', border: '1px solid #2a2d32', borderRadius: 16, padding: 18 }}>
      <h2 style={{ marginTop: 0, marginBottom: 12 }}>{title}</h2>
      {children}
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid #272b31' }}>
      <span style={{ color: '#8b8f98' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
