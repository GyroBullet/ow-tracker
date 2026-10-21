import { getDb } from '@/lib/db';
import { Trophy, Crosshair, HeartPulse, ShieldAlert, Swords, Activity, Clock } from 'lucide-react';
import Link from 'next/link';
import SyncButton from '@/components/SyncButton';

export default async function ProfilePage({ params, searchParams }) {
  // Await the params so they are properly resolved
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const username = resolvedParams.username;
  const currentTab = resolvedSearchParams.tab || 'overview';
  
  if (!username) return <div>Username required</div>;

  const db = getDb();
  
  const player = db.prepare('SELECT * FROM PLAYER WHERE Username = ? COLLATE NOCASE').get(username);
  if (!player) return <div className="container" style={{textAlign:'center', marginTop:'4rem'}}><h1 className="heading-1">Player Not Found</h1></div>;

  const playerId = player.Player_ID;

  const rank = db.prepare(`
    SELECT p.*, r.Role_Name 
    FROM PLAYER_SEASON_RANK p
    JOIN ROLE r ON p.Role_ID = r.Role_ID
    WHERE Player_ID = ?
    ORDER BY Season_ID DESC
  `).get(playerId);

  const matches = db.prepare(`
    SELECT m.*, pms.* 
    FROM MATCH m
    JOIN PLAYER_MATCH_STATS pms ON m.Game_ID = pms.Game_ID
    WHERE pms.Player_ID = ?
    ORDER BY m.Timestamp DESC
    LIMIT 10
  `).all(playerId);

  const stats = db.prepare(`
    SELECT 
      COUNT(Game_ID) as TotalGames,
      SUM(CASE WHEN Result = 'WIN' THEN 1 ELSE 0 END) as Wins,
      SUM(CASE WHEN Result = 'LOSS' THEN 1 ELSE 0 END) as Losses,
      SUM(CASE WHEN Result = 'DRAW' THEN 1 ELSE 0 END) as Draws,
      AVG(Eliminations) as AvgElims,
      AVG(Deaths) as AvgDeaths,
      AVG(Damage_Dealt) as AvgDamage,
      SUM(Eliminations)*1.0 / NULLIF(SUM(Deaths), 0) as KDA
    FROM PLAYER_MATCH_STATS
    WHERE Player_ID = ?
  `).get(playerId);

  const heroStats = db.prepare(`
    SELECT 
      h.Hero_Name,
      r.Role_Name,
      SUM(mhp.Time_Played_On_Hero) as TotalTime,
      SUM(mhp.Damage_Done_On_Hero) as TotalDamage,
      SUM(mhp.Ultimates_Earned) as TotalUltimates
    FROM MATCH_HERO_PERFORMANCE mhp
    JOIN HERO h ON mhp.Hero_ID = h.Hero_ID
    JOIN ROLE r ON h.Role_ID = r.Role_ID
    WHERE mhp.Player_ID = ?
    GROUP BY h.Hero_ID
    ORDER BY TotalTime DESC
  `).all(playerId);

  const winRate = stats.TotalGames > 0 ? (stats.Wins / stats.TotalGames * 100).toFixed(1) : 0;

  return (
    <div className="container">
      {/* Search Header */}
      <div className="flex justify-between items-center" style={{paddingBottom:'2rem'}}>
        <Link href="/">
          <div className="flex items-center gap-2">
            <ShieldAlert size={28} className="text-accent"/>
            <h2 style={{fontWeight:800, fontSize:'1.5rem', letterSpacing:'-1px'}}>OVERWATCH<span className="text-accent">TRACKER</span></h2>
          </div>
        </Link>
        <div className="glass" style={{padding:'0.5rem 1rem', borderRadius:'20px', display:'flex', gap:'10px', alignItems:'center'}}>
          <Activity size={16} className="text-muted" />
          <input type="text" placeholder="Search Player" style={{background:'transparent', border:'none', color:'white', outline:'none'}} />
        </div>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
          <Link href={`/profile/${player.Username}/edit`} style={{
            background: 'linear-gradient(135deg, #f99e1a, #e88b0d)',
            color: '#111',
            padding: '0.5rem 1.2rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 12px rgba(249,158,26,0.3)',
            transition: 'all 0.2s',
          }}>
            ✏️ Edit Profile
          </Link>
          <SyncButton username={player.Username} />
        </div>
      </div>

      {/* Profile Banner */}
      <div className="profile-banner">
        <div className="flex items-center">
          <div className="profile-avatar flex justify-center items-center">
            <span style={{fontSize:'2rem', fontWeight:800, color:'rgba(255,255,255,0.2)'}}>
              {player.Username.substring(0,2).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="heading-1">{player.Username}<span className="text-muted" style={{fontWeight:600}}>.{player.Discriminator}</span></h1>
            <div className="flex items-center gap-4 text-muted" style={{marginTop:'0.5rem', fontWeight:600}}>
              {rank && (
                <div className="flex items-center gap-2 glass" style={{padding:'0.25rem 0.75rem', borderRadius:'20px'}}>
                  <Trophy size={16} className="text-accent" />
                  <span style={{color:'white'}}>{rank.Skill_Tier} {rank.Division}</span>
                </div>
              )}
              <span>Level {player.Endorsement_Level * 12}</span>
              <span>{player.Default_Region}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="nav-tabs">
        <Link href={`/profile/${username}?tab=overview`}>
          <div className={`nav-tab ${currentTab === 'overview' ? 'active' : ''}`}>Overview</div>
        </Link>
        <Link href={`/profile/${username}?tab=heroes`}>
          <div className={`nav-tab ${currentTab === 'heroes' ? 'active' : ''}`}>Heroes</div>
        </Link>
        <Link href={`/profile/${username}?tab=matches`}>
          <div className={`nav-tab ${currentTab === 'matches' ? 'active' : ''}`}>Matches</div>
        </Link>
      </div>

      {currentTab === 'overview' && (
        <div className="dashboard-grid">
          {/* Left Column (Main Content) */}
          <div className="flex-col gap-6">
            
            {/* Stats Grid */}
          <div className="card">
            <h2 className="heading-2"><Activity className="inline-block" style={{marginRight:'8px', verticalAlign:'-3px'}} size={20}/> Competitive Overview</h2>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'2rem', marginTop:'1.5rem'}}>
              <div>
                <div className="stat-label">Win Rate</div>
                <div className="stat-value font-number" style={{color: winRate > 50 ? 'var(--win-color)' : 'var(--text-main)'}}>{winRate}%</div>
                <div className="text-muted font-number" style={{fontSize:'0.875rem'}}>{stats.Wins}W - {stats.Losses}L</div>
              </div>
              <div>
                <div className="stat-label">K/D Ratio</div>
                <div className="stat-value font-number">{(stats.KDA || 0).toFixed(2)}</div>
              </div>
              <div>
                <div className="stat-label">Damage / 10min</div>
                <div className="stat-value font-number">{((stats.AvgDamage || 0) / 10).toFixed(0)}</div>
              </div>
              <div>
                <div className="stat-label">Elims / Match</div>
                <div className="stat-value font-number">{(stats.AvgElims || 0).toFixed(1)}</div>
              </div>
            </div>
          </div>

          {/* Top Heroes */}
          <div className="card">
            <h2 className="heading-2"><Swords className="inline-block" style={{marginRight:'8px', verticalAlign:'-3px'}} size={20}/> Top Heroes</h2>
            <div className="flex-col gap-4">
              {heroStats.map(hero => (
                <div key={hero.Hero_Name} className="flex justify-between items-center glass card-hoverable" style={{padding:'1rem', borderRadius:'8px'}}>
                  <div className="flex items-center gap-4">
                    <div className="hero-portrait">
                      {hero.Hero_Name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{fontWeight:700, fontSize:'1.1rem'}}>{hero.Hero_Name}</h3>
                      <div className="text-muted" style={{fontSize:'0.85rem'}}>{hero.Role_Name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <div className="stat-label" style={{fontSize:'0.75rem'}}>Time Played</div>
                      <div className="font-number">{(hero.TotalTime / 60).toFixed(1)} hrs</div>
                    </div>
                    <div>
                      <div className="stat-label" style={{fontSize:'0.75rem'}}>Total Damage</div>
                      <div className="font-number">{hero.TotalDamage.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Sidebar) */}
        <div className="flex-col gap-6">
          <div className="card">
            <h2 className="heading-2"><Clock className="inline-block" style={{marginRight:'8px', verticalAlign:'-3px'}} size={20}/> Recent Matches</h2>
            <div className="flex-col">
              {matches.map(m => {
                const isWin = m.Result === 'WIN';
                const isLoss = m.Result === 'LOSS';
                const mmClass = isWin ? 'match-win' : (isLoss ? 'match-loss' : 'match-draw');
                const textClass = isWin ? 'match-win-text' : (isLoss ? 'match-loss-text' : 'match-draw-text');
                
                return (
                  <div key={m.Game_ID} className={`match-row ${mmClass}`}>
                    <div className="match-indicator"></div>
                    <div>
                      <div className={textClass} style={{fontSize:'0.9rem'}}>{m.Result}</div>
                      <div className="text-muted" style={{fontSize:'0.75rem'}}>{m.Map_Name}</div>
                    </div>
                    <div className="text-center font-number">
                      <div style={{fontSize:'0.9rem'}}>{m.Eliminations} / {m.Deaths} / {m.Assists}</div>
                      <div className="text-muted" style={{fontSize:'0.75rem'}}>K/D/A</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      )}

      {currentTab === 'heroes' && (
        <div className="card" style={{marginTop: '2rem'}}>
          <h2 className="heading-2"><Swords className="inline-block" style={{marginRight:'8px', verticalAlign:'-3px'}} size={20}/> All Played Heroes</h2>
          <div className="flex-col gap-4">
            {heroStats.map(hero => (
              <div key={hero.Hero_Name} className="flex justify-between items-center glass card-hoverable" style={{padding:'1rem 1.5rem', borderRadius:'8px'}}>
                <div className="flex items-center gap-4">
                  <div className="hero-portrait" style={{width: '60px', height: '60px', fontSize: '1.2rem'}}>
                    {hero.Hero_Name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{fontWeight:700, fontSize:'1.2rem'}}>{hero.Hero_Name}</h3>
                    <div className="text-muted">{hero.Role_Name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-8 text-right">
                  <div style={{minWidth: '120px'}}>
                    <div className="stat-label">Time Played</div>
                    <div className="font-number" style={{fontSize: '1.2rem'}}>{(hero.TotalTime / 60).toFixed(1)} hrs</div>
                  </div>
                  <div style={{minWidth: '130px'}}>
                    <div className="stat-label">Total Damage</div>
                    <div className="font-number" style={{fontSize: '1.2rem'}}>{hero.TotalDamage.toLocaleString()}</div>
                  </div>
                  <div style={{minWidth: '100px'}}>
                    <div className="stat-label">Ultimates</div>
                    <div className="font-number" style={{fontSize: '1.2rem'}}>{hero.TotalUltimates}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentTab === 'matches' && (
        <div className="card" style={{marginTop: '2rem'}}>
          <h2 className="heading-2"><Clock className="inline-block" style={{marginRight:'8px', verticalAlign:'-3px'}} size={20}/> Match History</h2>
          <div className="flex-col">
            {matches.map(m => {
              const isWin = m.Result === 'WIN';
              const isLoss = m.Result === 'LOSS';
              const mmClass = isWin ? 'match-win' : (isLoss ? 'match-loss' : 'match-draw');
              const textClass = isWin ? 'match-win-text' : (isLoss ? 'match-loss-text' : 'match-draw-text');
              
              return (
                <div key={m.Game_ID} className={`match-row ${mmClass}`} style={{padding: '1.2rem 1rem'}}>
                  <div className="match-indicator"></div>
                  <div>
                    <div className={textClass} style={{fontSize:'1.1rem'}}>{m.Result}</div>
                    <div className="text-muted">{m.Map_Name}</div>
                  </div>
                  <div className="text-center font-number">
                    <div style={{fontSize:'1.1rem'}}>{m.Eliminations} / {m.Deaths} / {m.Assists}</div>
                    <div className="text-muted">K/D/A</div>
                  </div>
                  <div className="text-right font-number">
                    <div style={{fontSize:'1.1rem'}}>{new Date(m.Timestamp).toLocaleDateString()}</div>
                    <div className="text-muted">{(m.Duration / 60).toFixed(0)} min Match</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
