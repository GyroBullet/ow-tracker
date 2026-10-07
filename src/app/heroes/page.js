import { getDb } from '@/lib/db';
import { ShieldAlert, Users } from 'lucide-react';
import Link from 'next/link';
import SyncButton from '@/components/SyncButton';

export default async function GlobalHeroesPage() {
  const db = getDb();
  
  const allHeroes = db.prepare(`
    SELECT h.*, r.Role_Name
    FROM HERO h
    JOIN ROLE r ON h.Role_ID = r.Role_ID
    ORDER BY h.Hero_Name ASC
  `).all();

  return (
    <div className="container" style={{maxWidth: '1400px', width: '95%', margin: '0 auto', padding: '2rem 1rem'}}>
      {/* Search Header */}
      <div className="flex justify-between items-center" style={{paddingBottom:'2rem', borderBottom: '1px solid var(--glass-border)'}}>
        <Link href="/">
          <div className="flex items-center gap-2">
            <ShieldAlert size={28} className="text-accent"/>
            <h2 style={{fontWeight:800, fontSize:'1.5rem', letterSpacing:'-1px'}}>OVERWATCH<span className="text-accent">TRACKER</span></h2>
          </div>
        </Link>
        <div style={{display:'flex', gap: '2rem'}}>
          <Link href="/"><div className="text-muted card-hoverable" style={{cursor:'pointer', fontWeight: 600}}>Profile</div></Link>
          <div className="text-accent" style={{fontWeight: 600}}>Heroes Directory</div>
        </div>
      </div>

      <div style={{marginTop: '2rem'}}>
        <h1 className="heading-1"><Users className="inline-block" style={{marginRight:'10px', verticalAlign:'-5px'}} size={32}/> Global Hero Roster</h1>
        <p className="text-muted" style={{marginTop: '0.5rem', fontSize: '1.1rem'}}>Complete directory of all active agents in Overwatch.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        {allHeroes.map(hero => (
          <div key={hero.Hero_ID} className="glass card-hoverable" style={{padding: '1.5rem', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'center'}}>
            <div className="hero-portrait" style={{width: '70px', height: '70px', fontSize: '1.5rem', flexShrink: 0}}>
              {hero.Hero_Name.substring(0,2).toUpperCase()}
            </div>
            <div>
              <h3 style={{fontWeight: 800, fontSize: '1.4rem'}}>{hero.Hero_Name}</h3>
              <div className="text-muted" style={{fontWeight: 600, fontSize: '0.9rem'}}>{hero.Role_Name}</div>
              <div style={{display: 'flex', gap: '10px', marginTop: '8px'}}>
                <span style={{fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '20px', border: '1px solid var(--glass-border)'}}>
                  Diff: {hero.Difficulty_Rating} / 3
                </span>
                <span style={{fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '20px', border: '1px solid var(--glass-border)'}}>
                  {hero.Base_Health} HP
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
