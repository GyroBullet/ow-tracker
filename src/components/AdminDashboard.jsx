'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const resourceMeta = {
  players: {
    label: 'Players',
    endpoint: 'players',
    columns: ['playerID', 'username', 'discriminator', 'region', 'date'],
    form: [
      { key: 'username', label: 'Username', type: 'text' },
      { key: 'discriminator', label: 'Discriminator', type: 'text' },
      { key: 'region', label: 'Region', type: 'text' },
      { key: 'settling', label: 'Email', type: 'text' },
      { key: 'date', label: 'Date', type: 'date' },
    ],
    defaultValues: { username: '', discriminator: '', region: '', settling: '', date: '' },
    getRowKey: (row) => row.playerID,
    renderValue: (row, key) => {
      const value = row[key];
      if (key === 'date') return value ? new Date(value).toLocaleDateString() : '—';
      return value ?? '—';
    },
  },
  matches: {
    label: 'Matches',
    endpoint: 'matches',
    columns: ['Game_ID', 'Map_Name', 'Duration', 'Timestamp'],
    dataKey: 'matches',
    form: [
      { key: 'mapName', label: 'Map', type: 'text' },
      { key: 'duration', label: 'Duration', type: 'number' },
      { key: 'timestamp', label: 'Timestamp', type: 'datetime-local' },
    ],
    defaultValues: { mapName: '', duration: '', timestamp: '' },
    getRowKey: (row) => row.Game_ID,
    renderValue: (row, key) => {
      if (key === 'Timestamp') return row[key] ? new Date(row[key]).toLocaleString() : '—';
      return row[key] ?? '—';
    },
  },
  heroes: {
    label: 'Heroes',
    endpoint: 'heroes',
    columns: ['Hero_ID', 'Hero_Name', 'Role_Name', 'Difficulty_Rating'],
    dataKey: 'heroes',
    form: [
      { key: 'heroName', label: 'Hero name', type: 'text' },
      { key: 'difficultyRating', label: 'Difficulty', type: 'number' },
      { key: 'roleID', label: 'Role ID', type: 'text' },
      { key: 'releaseDate', label: 'Release Date', type: 'date' },
    ],
    defaultValues: { heroName: '', difficultyRating: '', roleID: '', releaseDate: '' },
    getRowKey: (row) => row.Hero_ID,
    renderValue: (row, key) => row[key] ?? '—',
  },
  roles: {
    label: 'Roles',
    endpoint: 'roles',
    columns: ['Role_ID', 'Role_Name'],
    dataKey: 'roles',
    form: [{ key: 'roleName', label: 'Role Name', type: 'text' }],
    defaultValues: { roleName: '' },
    getRowKey: (row) => row.Role_ID,
    renderValue: (row, key) => row[key] ?? '—',
  },
  seasons: {
    label: 'Seasons',
    endpoint: 'seasons',
    columns: ['Season_ID', 'Season_Number', 'Theme_Name', 'Start_Date', 'End_Date'],
    dataKey: 'seasons',
    form: [
      { key: 'seasonNo', label: 'Season #', type: 'number' },
      { key: 'themeName', label: 'Theme', type: 'text' },
      { key: 'startDate', label: 'Start', type: 'date' },
      { key: 'endDate', label: 'End', type: 'date' },
    ],
    defaultValues: { seasonNo: '', themeName: '', startDate: '', endDate: '' },
    getRowKey: (row) => row.Season_ID,
    renderValue: (row, key) => {
      if (key.includes('Date')) return row[key] ? new Date(row[key]).toLocaleDateString() : '—';
      return row[key] ?? '—';
    },
  },
  playerMatchStats: {
    label: 'Player Match Stats',
    endpoint: 'player-match-stats',
    columns: ['Player_ID', 'Username', 'Game_ID', 'Result', 'Eliminations', 'Deaths'],
    form: [
      { key: 'playerID', label: 'Player ID', type: 'text' },
      { key: 'gameID', label: 'Game ID', type: 'text' },
      { key: 'result', label: 'Result', type: 'text' },
      { key: 'kills', label: 'Eliminations', type: 'number' },
      { key: 'deaths', label: 'Deaths', type: 'number' },
      { key: 'healingDone', label: 'Healing', type: 'number' },
      { key: 'dmgMitigated', label: 'Mitigated', type: 'number' },
    ],
    defaultValues: { playerID: '', gameID: '', result: '', kills: '', deaths: '', healingDone: '', dmgMitigated: '' },
    getRowKey: (row) => `${row.Player_ID}-${row.Game_ID}`,
    renderValue: (row, key) => row[key] ?? '—',
  },
  matchHeroPerformance: {
    label: 'Hero Performance',
    endpoint: 'match-hero-performance',
    columns: ['Player_ID', 'Game_ID', 'Hero_Name', 'Time_Played_On_Hero', 'Damage_Done_On_Hero', 'Ultimates_Earned'],
    form: [
      { key: 'playerID', label: 'Player ID', type: 'text' },
      { key: 'gameID', label: 'Game ID', type: 'text' },
      { key: 'heroID', label: 'Hero ID', type: 'text' },
      { key: 'timePlayedOnHero', label: 'Time Played', type: 'number' },
      { key: 'dmgDoneOnHero', label: 'Damage', type: 'number' },
      { key: 'ultimateEarned', label: 'Ultimates', type: 'number' },
      { key: 'heroSpecificStatValue', label: 'Hero Value', type: 'number' },
    ],
    defaultValues: { playerID: '', gameID: '', heroID: '', timePlayedOnHero: '', dmgDoneOnHero: '', ultimateEarned: '', heroSpecificStatValue: '' },
    getRowKey: (row) => `${row.Player_ID}-${row.Game_ID}-${row.Hero_ID}`,
    renderValue: (row, key) => row[key] ?? '—',
  },
  playerSeasonRanks: {
    label: 'Season Ranks',
    endpoint: 'player-season-ranks',
    columns: ['Player_ID', 'Username', 'Season_Number', 'Role_Name', 'Skill_Tier', 'Division'],
    form: [
      { key: 'playerID', label: 'Player ID', type: 'text' },
      { key: 'seasonID', label: 'Season ID', type: 'text' },
      { key: 'roleID', label: 'Role ID', type: 'text' },
      { key: 'rank', label: 'Skill Tier', type: 'text' },
      { key: 'division', label: 'Division', type: 'number' },
    ],
    defaultValues: { playerID: '', seasonID: '', roleID: '', rank: '', division: '' },
    getRowKey: (row) => `${row.Player_ID}-${row.Season_ID}-${row.Role_ID}`,
    renderValue: (row, key) => row[key] ?? '—',
  },
  playerModeStats: {
    label: 'Mode Stats',
    endpoint: 'player-mode-stats',
    columns: ['Player_ID', 'Username', 'Mode_ID', 'Mode_Name'],
    form: [
      { key: 'playerID', label: 'Player ID', type: 'text' },
      { key: 'modeID', label: 'Mode ID', type: 'text' },
    ],
    defaultValues: { playerID: '', modeID: '' },
    getRowKey: (row) => `${row.Player_ID}-${row.Mode_ID}`,
    renderValue: (row, key) => row[key] ?? '—',
  },
};

const tabs = Object.keys(resourceMeta);

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('players');
  const [records, setRecords] = useState({});
  const [forms, setForms] = useState({});
  const [searches, setSearches] = useState({});
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState({});
  const [editingRow, setEditingRow] = useState(null); // { resourceKey, rowKey, data }
  const [editForm, setEditForm] = useState({});

  const fetchList = async (resourceKey) => {
    const meta = resourceMeta[resourceKey];
    const endpoint = meta.endpoint;
    setLoading((prev) => ({ ...prev, [resourceKey]: true }));

    try {
      const res = await fetch(`/api/${endpoint}?search=${encodeURIComponent(searches[resourceKey] || '')}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      // Try various data keys the API might return
      const rows = data.rows || data.players || data.matches || data.heroes || data.roles || data.seasons || [];
      setRecords((prev) => ({ ...prev, [resourceKey]: rows }));
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

    const payload = { ...current };
    const method = 'POST';
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessages((prev) => ({ ...prev, [resourceKey]: 'Created successfully.' }));
      setForms((prev) => ({ ...prev, [resourceKey]: { ...resourceMeta[resourceKey].defaultValues } }));
      fetchList(resourceKey);
    } catch (error) {
      setMessages((prev) => ({ ...prev, [resourceKey]: error.message }));
    }
  };

  const handleDelete = async (resourceKey, row) => {
    const endpoint = resourceMeta[resourceKey].endpoint;
    const id = resourceMeta[resourceKey].getRowKey(row);
    let url = `/api/${endpoint}?id=${encodeURIComponent(id)}`;

    // Build proper delete params for composite-key tables
    if (resourceKey === 'playerMatchStats') {
      url = `/api/${endpoint}?playerID=${row.Player_ID}&gameID=${row.Game_ID}`;
    } else if (resourceKey === 'matchHeroPerformance') {
      url = `/api/${endpoint}?playerID=${row.Player_ID}&gameID=${row.Game_ID}&heroID=${row.Hero_ID}`;
    } else if (resourceKey === 'playerSeasonRanks') {
      url = `/api/${endpoint}?playerID=${row.Player_ID}&seasonID=${row.Season_ID}`;
    } else if (resourceKey === 'playerModeStats') {
      url = `/api/${endpoint}?playerID=${row.Player_ID}&modeID=${row.Mode_ID}`;
    }

    try {
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setMessages((prev) => ({ ...prev, [resourceKey]: 'Deleted successfully.' }));
      fetchList(resourceKey);
    } catch (error) {
      setMessages((prev) => ({ ...prev, [resourceKey]: error.message }));
    }
  };

  const startEditPlayer = (row) => {
    router.push(`/profile/${encodeURIComponent(row.username)}/edit`);
  };

  const startInlineEdit = (resourceKey, row) => {
    const rowKey = resourceMeta[resourceKey].getRowKey(row);
    const formData = {};
    resourceMeta[resourceKey].form.forEach(field => {
      // Map column data back to form keys
      const colValue = resourceMeta[resourceKey].columns.reduce((found, col) => {
        if (found !== null) return found;
        return row[col] ?? null;
      }, null);
      formData[field.key] = row[field.key] ?? '';
    });
    setEditingRow({ resourceKey, rowKey });
    setEditForm(formData);
  };

  const cancelInlineEdit = () => {
    setEditingRow(null);
    setEditForm({});
  };

  const handleInlineEditChange = (key, value) => {
    setEditForm(prev => ({ ...prev, [key]: value }));
  };

  const handleInlineEditSave = async (resourceKey, row) => {
    const endpoint = resourceMeta[resourceKey].endpoint;
    const id = resourceMeta[resourceKey].getRowKey(row);
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, playerID: id, id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setMessages(prev => ({ ...prev, [resourceKey]: 'Updated successfully.' }));
      cancelInlineEdit();
      fetchList(resourceKey);
    } catch (error) {
      setMessages(prev => ({ ...prev, [resourceKey]: error.message }));
    }
  };

  return (
    <main style={{ maxWidth: 1400, margin: '40px auto', padding: 20, color: '#f5f5f5' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <p style={{ color: '#f99e1a', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Admin Dashboard</p>
          <h1 style={{ margin: 0, fontSize: '2.4rem' }}>Overwatch Tracker</h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/profile/farmerofaura01" style={{ background: '#2a8c5b', color: '#fff', padding: '10px 16px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>
            View Profile
          </Link>
          <Link href="/heroes" style={{ background: '#1f7ae0', color: '#fff', padding: '10px 16px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>
            Heroes Directory
          </Link>
        </div>
      </header>

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {tabs.map((key) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            background: activeTab === key ? '#f99e1a' : '#171a1f',
            color: activeTab === key ? '#111' : '#f5f5f5',
            border: '1px solid #2a2d32',
            borderRadius: 10,
            padding: '10px 12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            {resourceMeta[key].label}
          </button>
        ))}
      </div>

      {/* Stats overview */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        {tabs.map((key) => (
          <div key={key} onClick={() => setActiveTab(key)} style={{
            background: activeTab === key ? 'rgba(249, 158, 26, 0.1)' : '#111317',
            border: `1px solid ${activeTab === key ? 'rgba(249, 158, 26, 0.3)' : '#2a2d32'}`,
            borderRadius: 16, padding: 18, cursor: 'pointer', transition: 'all 0.2s'
          }}>
            <div style={{ color: '#8b8f98', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>{resourceMeta[key].label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: 8 }}>{stats[key] || 0}</div>
          </div>
        ))}
      </section>

      {/* Active tab content */}
      <section style={{ background: '#111317', border: '1px solid #2a2d32', borderRadius: 18, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>{resourceMeta[activeTab].label}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={searches[activeTab] || ''}
              onChange={(event) => setSearches((prev) => ({ ...prev, [activeTab]: event.target.value }))}
              placeholder={`Search ${resourceMeta[activeTab].label.toLowerCase()}`}
              style={inputStyle}
            />
            <button onClick={() => fetchList(activeTab)} style={primaryButtonStyle}>Search</button>
          </div>
        </div>

        {/* Add form */}
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
            <button type="submit" style={primaryButtonStyle}>Add</button>
          </div>
        </form>

        {messages[activeTab] && (
          <div style={{ marginBottom: 12, color: messages[activeTab].includes('Failed') || messages[activeTab].includes('error') ? '#f03e3e' : '#8ae7a9', fontWeight: 600 }}>
            {messages[activeTab]}
          </div>
        )}

        {/* Data table */}
        <div style={{ overflowX: 'auto', border: '1px solid #2a2d32', borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#0d0f12' }}>
              <tr>
                {resourceMeta[activeTab].columns.map((column) => (
                  <th key={column} style={tableHeaderStyle}>{column.replace(/_/g, ' ')}</th>
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
                (records[activeTab] || []).map((row, idx) => (
                  <tr key={resourceMeta[activeTab].getRowKey(row) || idx} style={{ borderBottom: '1px solid #252a31' }}>
                    {resourceMeta[activeTab].columns.map((column) => (
                      <td key={column} style={tableCellStyle}>{resourceMeta[activeTab].renderValue(row, column)}</td>
                    ))}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {activeTab === 'players' ? (
                          <>
                            <Link href={`/profile/${row.username}`} style={linkButtonStyle}>View Profile</Link>
                            <button onClick={() => startEditPlayer(row)} style={editButtonStyle}>Edit</button>
                          </>
                        ) : null}
                        <button onClick={() => handleDelete(activeTab, row)} style={deleteButtonStyle}>Delete</button>
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

const deleteButtonStyle = {
  background: '#dc2626',
  color: '#fff',
  border: 'none',
  padding: '8px 10px',
  borderRadius: 8,
  cursor: 'pointer',
};

const editButtonStyle = {
  background: 'linear-gradient(135deg, #f99e1a, #e88b0d)',
  color: '#111',
  border: 'none',
  padding: '8px 14px',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '0.8rem',
  transition: 'all 0.2s',
  boxShadow: '0 2px 8px rgba(249,158,26,0.25)',
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