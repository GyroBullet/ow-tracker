'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const resourceMeta = {
  players: {
    label: 'Players',
    endpoint: 'players',
    columns: ['username', 'discriminator', 'region', 'settling', 'date'],
    form: [
      { key: 'username', label: 'Username', type: 'text' },
      { key: 'discriminator', label: 'Discriminator', type: 'text' },
      { key: 'region', label: 'Region', type: 'text' },
      { key: 'settling', label: 'Settling', type: 'text' },
      { key: 'date', label: 'Date', type: 'date' },
    ],
    defaultValues: { username: '', discriminator: '', region: '', settling: '', date: '' },
    getRowKey: (row) => row.playerID,
    renderValue: (row, key) => {
      const value = row[key];
      if (key === 'date') return value ? new Date(value).toLocaleDateString() : '—';
      return value || '—';
    },
  },
  matches: {
    label: 'Matches',
    endpoint: 'matches',
    columns: ['mapName', 'duration', 'timestamp'],
    form: [
      { key: 'mapName', label: 'Map', type: 'text' },
      { key: 'duration', label: 'Duration', type: 'number' },
      { key: 'timestamp', label: 'Timestamp', type: 'datetime-local' },
    ],
    defaultValues: { mapName: '', duration: '', timestamp: '' },
    getRowKey: (row) => row.gameID,
    renderValue: (row, key) => key === 'timestamp' ? (row[key] ? new Date(row[key]).toLocaleString() : '—') : row[key] ?? '—',
  },
  heroes: {
    label: 'Heroes',
    endpoint: 'heroes',
    columns: ['heroName', 'difficultyRating', 'roleName'],
    form: [
      { key: 'heroName', label: 'Hero name', type: 'text' },
      { key: 'difficultyRating', label: 'Difficulty', type: 'number' },
      { key: 'roleID', label: 'Role ID', type: 'text' },
      { key: 'releaseDate', label: 'Release Date', type: 'date' },
    ],
    defaultValues: { heroName: '', difficultyRating: '', roleID: '', releaseDate: '' },
    getRowKey: (row) => row.heroID,
    renderValue: (row, key) => row[key] ?? '—',
  },
  roles: {
    label: 'Roles',
    endpoint: 'roles',
    columns: ['roleName'],
    form: [{ key: 'roleName', label: 'Role Name', type: 'text' }],
    defaultValues: { roleName: '' },
    getRowKey: (row) => row.roleID,
    renderValue: (row, key) => row[key] ?? '—',
  },
  seasons: {
    label: 'Seasons',
    endpoint: 'seasons',
    columns: ['seasonNo', 'startDate', 'endDate'],
    form: [
      { key: 'seasonNo', label: 'Season #', type: 'number' },
      { key: 'startDate', label: 'Start', type: 'date' },
      { key: 'endDate', label: 'End', type: 'date' },
    ],
    defaultValues: { seasonNo: '', startDate: '', endDate: '' },
    getRowKey: (row) => row.seasonID,
    renderValue: (row, key) => key.includes('Date') ? (row[key] ? new Date(row[key]).toLocaleDateString() : '—') : row[key] ?? '—',
  },
  playerMatchStats: {
    label: 'Player Match Stats',
    endpoint: 'player-match-stats',
    columns: ['playerID', 'gameID', 'kills', 'deaths', 'healingDone'],
    form: [
      { key: 'playerID', label: 'Player ID', type: 'text' },
      { key: 'gameID', label: 'Game ID', type: 'text' },
      { key: 'kills', label: 'Kills', type: 'number' },
      { key: 'deaths', label: 'Deaths', type: 'number' },
      { key: 'healingDone', label: 'Healing', type: 'number' },
      { key: 'dmgMitigated', label: 'Mitigated', type: 'number' },
      { key: 'jumpAttempts', label: 'Jump Attempts', type: 'number' },
    ],
    defaultValues: { playerID: '', gameID: '', kills: '', deaths: '', healingDone: '', dmgMitigated: '', jumpAttempts: '' },
    getRowKey: (row) => row.id,
    renderValue: (row, key) => row[key] ?? '—',
  },
  matchHeroPerformance: {
    label: 'Hero Performance',
    endpoint: 'match-hero-performance',
    columns: ['gameID', 'heroID', 'weaponAccuracyPercentage', 'dmgDoneOnHero', 'ultimateEarned'],
    form: [
      { key: 'gameID', label: 'Game ID', type: 'text' },
      { key: 'heroID', label: 'Hero ID', type: 'text' },
      { key: 'weaponAccuracyPercentage', label: 'Accuracy %', type: 'number' },
      { key: 'dmgDoneOnHero', label: 'Damage', type: 'number' },
      { key: 'ultimateEarned', label: 'Ultimates', type: 'number' },
      { key: 'heroSpecificStatValue', label: 'Hero Value', type: 'number' },
    ],
    defaultValues: { gameID: '', heroID: '', weaponAccuracyPercentage: '', dmgDoneOnHero: '', ultimateEarned: '', heroSpecificStatValue: '' },
    getRowKey: (row) => row.id,
    renderValue: (row, key) => row[key] ?? '—',
  },
  playerSeasonRanks: {
    label: 'Season Ranks',
    endpoint: 'player-season-ranks',
    columns: ['playerID', 'seasonID', 'rank', 'division', 'skillTier'],
    form: [
      { key: 'playerID', label: 'Player ID', type: 'text' },
      { key: 'seasonID', label: 'Season ID', type: 'text' },
      { key: 'rank', label: 'Rank', type: 'text' },
      { key: 'division', label: 'Division', type: 'text' },
      { key: 'skillTier', label: 'Skill Tier', type: 'number' },
    ],
    defaultValues: { playerID: '', seasonID: '', rank: '', division: '', skillTier: '' },
    getRowKey: (row) => row.id,
    renderValue: (row, key) => row[key] ?? '—',
  },
  playerModeStats: {
    label: 'Mode Stats',
    endpoint: 'player-mode-stats',
    columns: ['playerID', 'gameID', 'timePlayedHours'],
    form: [
      { key: 'playerID', label: 'Player ID', type: 'text' },
      { key: 'gameID', label: 'Game ID', type: 'text' },
      { key: 'timePlayedHours', label: 'Hours Played', type: 'number' },
    ],
    defaultValues: { playerID: '', gameID: '', timePlayedHours: '' },
    getRowKey: (row) => row.id,
    renderValue: (row, key) => row[key] ?? '—',
  },
};

const tabs = Object.keys(resourceMeta);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('players');
  const [records, setRecords] = useState({});
  const [forms, setForms] = useState({});
  const [searches, setSearches] = useState({});
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState({});

  const meta = resourceMeta[activeTab];

  const fetchList = async (resourceKey) => {
    const endpoint = resourceMeta[resourceKey].endpoint;
    setLoading((prev) => ({ ...prev, [resourceKey]: true }));

    try {
      const res = await fetch(`/api/${endpoint}?search=${encodeURIComponent(searches[resourceKey] || '')}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setRecords((prev) => ({ ...prev, [resourceKey]: data.rows || data.players || data.matches || data.heroes || data.roles || data.seasons || [] }));
    } catch (error) {
      setMessages((prev) => ({ ...prev, [resourceKey]: error.message }));
    } finally {
      setLoading((prev) => ({ ...prev, [resourceKey]: false }));
    }
  };

  useEffect(() => {
    for (const key of tabs) {
      setForms((prev) => ({ ...prev, [key]: { ...resourceMeta[key].defaultValues, ...(prev[key] || {}) } }));
      fetchList(key);
    }
  }, []);

  const stats = useMemo(() => {
    const totals = {};
    for (const key of tabs) {
      totals[key] = (records[key] || []).length;
    }
    return totals;
  }, [records]);

  const handleFormFieldChange = (resourceKey, key, value) => {
    setForms((prev) => ({
      ...prev,
      [resourceKey]: { ...((prev[resourceKey] || resourceMeta[resourceKey].defaultValues)), [key]: value },
    }));
  };

  const handleSubmit = async (resourceKey, event) => {
    event.preventDefault();
    const endpoint = resourceMeta[resourceKey].endpoint;
    const current = forms[resourceKey] || resourceMeta[resourceKey].defaultValues;
    const isEdit = Boolean(current.id || current.playerID || current.gameID || current.heroID || current.roleID || current.seasonID);

    const payload = { ...current };
    if (resourceKey === 'players' && !isEdit && !payload.username) {
      setMessages((prev) => ({ ...prev, [resourceKey]: 'Username is required.' }));
      return;
    }

    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessages((prev) => ({ ...prev, [resourceKey]: isEdit ? 'Updated successfully.' : 'Created successfully.' }));
      setForms((prev) => ({ ...prev, [resourceKey]: { ...resourceMeta[resourceKey].defaultValues } }));
      fetchList(resourceKey);
    } catch (error) {
      setMessages((prev) => ({ ...prev, [resourceKey]: error.message }));
    }
  };

  const handleDelete = async (resourceKey, id) => {
    const endpoint = resourceMeta[resourceKey].endpoint;
    try {
      const res = await fetch(`/api/${endpoint}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setMessages((prev) => ({ ...prev, [resourceKey]: 'Deleted successfully.' }));
      fetchList(resourceKey);
    } catch (error) {
      setMessages((prev) => ({ ...prev, [resourceKey]: error.message }));
    }
  };

  const handleEdit = (resourceKey, row) => {
    const current = resourceMeta[resourceKey].defaultValues;
    const next = { ...current };
    for (const key of Object.keys(current)) {
      next[key] = row[key] ?? '';
    }
    if (resourceKey === 'players') next.playerID = row.playerID;
    if (resourceKey === 'matches') next.gameID = row.gameID;
    if (resourceKey === 'heroes') next.heroID = row.heroID;
    if (resourceKey === 'roles') next.roleID = row.roleID;
    if (resourceKey === 'seasons') next.seasonID = row.seasonID;
    if (resourceKey === 'playerMatchStats' || resourceKey === 'matchHeroPerformance' || resourceKey === 'playerSeasonRanks' || resourceKey === 'playerModeStats') next.id = row.id;
    setForms((prev) => ({ ...prev, [resourceKey]: next }));
  };

  return (
    <main style={{ maxWidth: 1400, margin: '40px auto', padding: 20, color: '#f5f5f5' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <p style={{ color: '#f99e1a', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Admin Dashboard</p>
          <h1 style={{ margin: 0, fontSize: '2.4rem' }}>Overwatch Tracker</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {tabs.map((key) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              background: activeTab === key ? '#f99e1a' : '#171a1f',
              color: activeTab === key ? '#111' : '#f5f5f5',
              border: '1px solid #2a2d32',
              borderRadius: 10,
              padding: '10px 12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}>
              {resourceMeta[key].label}
            </button>
          ))}
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {tabs.map((key) => (
          <div key={key} style={{ background: '#111317', border: '1px solid #2a2d32', borderRadius: 16, padding: 18 }}>
            <div style={{ color: '#8b8f98', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>{resourceMeta[key].label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: 8 }}>{stats[key] || 0}</div>
          </div>
        ))}
      </section>

      <section style={{ background: '#111317', border: '1px solid #2a2d32', borderRadius: 18, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>{resourceMeta[activeTab].label}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={searches[activeTab] || ''}
              onChange={(event) => setSearches((prev) => ({ ...prev, [activeTab]: event.target.value }))}
              placeholder={`Search ${resourceMeta[activeTab].label.toLowerCase()}`}
              style={{ ...inputStyle, minWidth: 200 }}
            />
            <button onClick={() => fetchList(activeTab)} style={primaryButtonStyle}>Search</button>
          </div>
        </div>

        <form onSubmit={(event) => handleSubmit(activeTab, event)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 18 }}>
          {resourceMeta[activeTab].form.map((field) => (
            <label key={field.key} style={{ display: 'grid', gap: 6 }}>
              <span style={{ color: '#c7cbd3', fontSize: '0.8rem' }}>{field.label}</span>
              <input
                type={field.type}
                value={forms[activeTab]?.[field.key] ?? ''}
                onChange={(event) => handleFormFieldChange(activeTab, field.key, event.target.value)}
                style={inputStyle}
              />
            </label>
          ))}
          <div style={{ display: 'flex', gap: 10, alignItems: 'end' }}>
            <button type="submit" style={primaryButtonStyle}>
              {forms[activeTab]?.id || forms[activeTab]?.playerID || forms[activeTab]?.gameID || forms[activeTab]?.heroID || forms[activeTab]?.roleID || forms[activeTab]?.seasonID ? 'Update' : 'Add'}
            </button>
            {(forms[activeTab]?.id || forms[activeTab]?.playerID || forms[activeTab]?.gameID || forms[activeTab]?.heroID || forms[activeTab]?.roleID || forms[activeTab]?.seasonID) && (
              <button type="button" onClick={() => setForms((prev) => ({ ...prev, [activeTab]: { ...resourceMeta[activeTab].defaultValues } }))} style={secondaryButtonStyle}>Clear</button>
            )}
          </div>
        </form>

        {messages[activeTab] && <div style={{ marginBottom: 12, color: '#8ae7a9', fontWeight: 600 }}>{messages[activeTab]}</div>}

        <div style={{ overflowX: 'auto', border: '1px solid #2a2d32', borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#0d0f12' }}>
              <tr>
                {resourceMeta[activeTab].columns.map((column) => (
                  <th key={column} style={tableHeaderStyle}>{column}</th>
                ))}
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(records[activeTab] || []).length === 0 ? (
                <tr>
                  <td colSpan={resourceMeta[activeTab].columns.length + 1} style={{ padding: 20, textAlign: 'center', color: '#8b8f98' }}>
                    {loading[activeTab] ? 'Loading...' : 'No records found'}
                  </td>
                </tr>
              ) : (
                (records[activeTab] || []).map((row) => (
                  <tr key={resourceMeta[activeTab].getRowKey(row)} style={{ borderBottom: '1px solid #252a31' }}>
                    {resourceMeta[activeTab].columns.map((column) => (
                      <td key={column} style={tableCellStyle}>{resourceMeta[activeTab].renderValue(row, column)}</td>
                    ))}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {activeTab === 'players' ? (
                          <Link href={`/player/${row.playerID}`} style={linkButtonStyle}>View</Link>
                        ) : null}
                        <button onClick={() => handleEdit(activeTab, row)} style={editButtonStyle}>Edit</button>
                        <button onClick={() => handleDelete(activeTab, resourceMeta[activeTab].getRowKey(row))} style={deleteButtonStyle}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid #2c2f36',
  background: '#14171d',
  color: '#f5f5f5',
  outline: 'none',
};

const primaryButtonStyle = {
  padding: '12px 16px',
  borderRadius: 10,
  border: 'none',
  background: '#f99e1a',
  color: '#111',
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryButtonStyle = {
  padding: '12px 16px',
  borderRadius: 10,
  border: '1px solid #2c2f36',
  background: '#1a1d22',
  color: '#f5f5f5',
  cursor: 'pointer',
};

const editButtonStyle = {
  background: '#1f7ae0',
  color: '#fff',
  border: 'none',
  padding: '8px 10px',
  borderRadius: 8,
  cursor: 'pointer',
};

const deleteButtonStyle = {
  background: '#dc2626',
  color: '#fff',
  border: 'none',
  padding: '8px 10px',
  borderRadius: 8,
  cursor: 'pointer',
};

const linkButtonStyle = {
  background: '#2a8c5b',
  color: '#fff',
  border: 'none',
  padding: '8px 10px',
  borderRadius: 8,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
};

const tableHeaderStyle = {
  padding: '14px 16px',
  textAlign: 'left',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#8b8f98',
};

const tableCellStyle = {
  padding: '14px 16px',
  color: '#f5f5f5',
  borderBottom: '1px solid #252a31',
};
