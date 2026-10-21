'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ShieldAlert, Save, ArrowLeft, User, Globe, Mail, Hash, Star, Shield, Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ProfileEditPage({ params }) {
  const [username, setUsernameParam] = useState(null);
  const [player, setPlayer] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [originalUsername, setOriginalUsername] = useState('');

  // Resolve async params
  useEffect(() => {
    (async () => {
      const resolved = await params;
      setUsernameParam(resolved.username);
    })();
  }, [params]);

  // Fetch player data
  const fetchPlayer = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/player/${encodeURIComponent(username)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      const p = data.player;
      setPlayer(p);
      setOriginalUsername(p.Username || p.username);
      setForm({
        username: p.Username || p.username || '',
        discriminator: p.Discriminator ?? p.discriminator ?? '',
        email: p.Email_Address || p.email || '',
        region: p.Default_Region || p.region || '',
        endorsementLevel: p.Endorsement_Level ?? p.endorsementLevel ?? 1,
        accountCreationDate: p.Account_Creation_Date || p.accountCreationDate || '',
        isBanned: p.Is_Banned ?? p.isBanned ?? false,
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchPlayer();
  }, [fetchPlayer]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/player/${encodeURIComponent(originalUsername)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          discriminator: Number(form.discriminator),
          email: form.email,
          region: form.region,
          endorsementLevel: Number(form.endorsementLevel),
          accountCreationDate: form.accountCreationDate,
          isBanned: form.isBanned,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      setMessage({ type: 'success', text: `Profile updated successfully via JDBC! ${data.message || ''}` });

      // If username was changed, update the original reference
      if (data.player) {
        const newUsername = data.player.Username || data.player.username;
        setOriginalUsername(newUsername);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!username || loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 16, color: '#8b8f98' }}>Loading player profile...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div style={styles.loadingContainer}>
        <XCircle size={48} color="#f03e3e" />
        <h2 style={{ marginTop: 16 }}>Player Not Found</h2>
        <Link href="/" style={styles.backLink}>← Back to Dashboard</Link>
      </div>
    );
  }

  const regions = ['NA', 'EU', 'ASIA', 'OCE', 'SA', 'ME'];

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <Link href="/" style={styles.logoLink}>
            <ShieldAlert size={28} color="#f99e1a" />
            <h2 style={styles.logoText}>OVERWATCH<span style={{ color: '#f99e1a' }}>TRACKER</span></h2>
          </Link>
        </div>
        <div style={styles.headerRight}>
          <Link href={`/profile/${encodeURIComponent(originalUsername)}`} style={styles.viewProfileBtn}>
            <ArrowLeft size={16} />
            View Profile
          </Link>
        </div>
      </header>

      {/* Profile Edit Card */}
      <div style={styles.editCard}>
        {/* Card Header */}
        <div style={styles.cardHeader}>
          <div style={styles.avatarContainer}>
            <div style={styles.avatar}>
              <span style={styles.avatarText}>
                {(form.username || 'P').substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 style={styles.cardTitle}>Edit Player Profile</h1>
              <p style={styles.cardSubtitle}>
                <span style={styles.jdbcBadge}>JDBC</span>
                Modifying via JDBC PreparedStatement
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            ...styles.messageBox,
            background: message.type === 'success' ? 'rgba(39, 193, 94, 0.1)' : 'rgba(240, 62, 62, 0.1)',
            borderColor: message.type === 'success' ? 'rgba(39, 193, 94, 0.3)' : 'rgba(240, 62, 62, 0.3)',
            color: message.type === 'success' ? '#27c15e' : '#f03e3e',
          }}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} style={styles.form}>
          {/* Row 1: Username + Discriminator */}
          <div style={styles.formRow}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                <User size={14} style={styles.labelIcon} />
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={e => handleChange('username', e.target.value)}
                style={styles.input}
                placeholder="Enter username"
                required
              />
            </div>
            <div style={styles.fieldGroupSmall}>
              <label style={styles.label}>
                <Hash size={14} style={styles.labelIcon} />
                Discriminator
              </label>
              <input
                type="number"
                value={form.discriminator}
                onChange={e => handleChange('discriminator', e.target.value)}
                style={styles.input}
                placeholder="1234"
              />
            </div>
          </div>

          {/* Row 2: Email + Region */}
          <div style={styles.formRow}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                <Mail size={14} style={styles.labelIcon} />
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                style={styles.input}
                placeholder="player@example.com"
              />
            </div>
            <div style={styles.fieldGroupSmall}>
              <label style={styles.label}>
                <Globe size={14} style={styles.labelIcon} />
                Region
              </label>
              <select
                value={form.region}
                onChange={e => handleChange('region', e.target.value)}
                style={styles.select}
              >
                <option value="">Select Region</option>
                {regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Endorsement + Account Date */}
          <div style={styles.formRow}>
            <div style={styles.fieldGroupSmall}>
              <label style={styles.label}>
                <Star size={14} style={styles.labelIcon} />
                Endorsement Level
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={form.endorsementLevel}
                onChange={e => handleChange('endorsementLevel', e.target.value)}
                style={styles.input}
              />
              <div style={styles.endorsementPreview}>
                {[1, 2, 3, 4, 5].map(level => (
                  <div
                    key={level}
                    style={{
                      ...styles.endorsementDot,
                      background: level <= Number(form.endorsementLevel)
                        ? '#f99e1a'
                        : 'rgba(255,255,255,0.1)',
                      boxShadow: level <= Number(form.endorsementLevel)
                        ? '0 0 8px rgba(249,158,26,0.4)'
                        : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                <Calendar size={14} style={styles.labelIcon} />
                Account Creation Date
              </label>
              <input
                type="date"
                value={form.accountCreationDate}
                onChange={e => handleChange('accountCreationDate', e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Row 4: Ban Status */}
          <div style={styles.formRow}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                <Shield size={14} style={styles.labelIcon} />
                Account Status
              </label>
              <div style={styles.toggleContainer}>
                <button
                  type="button"
                  onClick={() => handleChange('isBanned', false)}
                  style={{
                    ...styles.toggleBtn,
                    ...(form.isBanned === false ? styles.toggleActive : {}),
                    ...(form.isBanned === false ? { background: 'rgba(39, 193, 94, 0.15)', borderColor: '#27c15e', color: '#27c15e' } : {}),
                  }}
                >
                  <CheckCircle size={16} />
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('isBanned', true)}
                  style={{
                    ...styles.toggleBtn,
                    ...(form.isBanned === true ? styles.toggleActive : {}),
                    ...(form.isBanned === true ? { background: 'rgba(240, 62, 62, 0.15)', borderColor: '#f03e3e', color: '#f03e3e' } : {}),
                  }}
                >
                  <XCircle size={16} />
                  Banned
                </button>
              </div>
            </div>
          </div>

          {/* Player ID (read-only) */}
          <div style={styles.metaBar}>
            <span style={styles.metaItem}>
              Player ID: <span style={styles.metaValue}>{player.Player_ID || player.playerID}</span>
            </span>
            <span style={styles.metaItem}>
              Database: <span style={styles.metaValue}>SQLite (JDBC Layer)</span>
            </span>
          </div>

          {/* Actions */}
          <div style={styles.actionBar}>
            <Link href="/" style={styles.cancelBtn}>
              Cancel
            </Link>
            <button type="submit" disabled={saving} style={{
              ...styles.saveBtn,
              opacity: saving ? 0.7 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}>
              {saving ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  pageContainer: {
    maxWidth: 820,
    margin: '0 auto',
    padding: '2rem 1.5rem 4rem',
    color: '#f5f5f7',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    color: '#f5f5f7',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: 16,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerRight: { display: 'flex', gap: 10 },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
    color: '#f5f5f7',
  },
  logoText: {
    fontWeight: 800,
    fontSize: '1.4rem',
    letterSpacing: '-0.5px',
    margin: 0,
  },
  viewProfileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#1f1f23',
    color: '#f5f5f7',
    padding: '10px 18px',
    borderRadius: 10,
    fontWeight: 600,
    textDecoration: 'none',
    border: '1px solid rgba(255,255,255,0.08)',
    transition: 'all 0.2s',
    fontSize: '0.9rem',
  },
  backLink: {
    marginTop: 16,
    color: '#f99e1a',
    textDecoration: 'none',
    fontWeight: 600,
  },

  // Card
  editCard: {
    background: '#111317',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
  },
  cardHeader: {
    background: 'linear-gradient(135deg, rgba(249,158,26,0.08), rgba(249,158,26,0.02))',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '28px 32px',
  },
  avatarContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 14,
    background: 'linear-gradient(135deg, #1f1f23, #2a2a35)',
    border: '2px solid rgba(249,158,26,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'rgba(249,158,26,0.6)',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.6rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
  },
  cardSubtitle: {
    margin: '6px 0 0',
    color: '#8b8f98',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  jdbcBadge: {
    background: 'linear-gradient(135deg, #f99e1a, #e88b0d)',
    color: '#111',
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: '0.7rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },

  // Messages
  messageBox: {
    margin: '0 32px',
    marginTop: 20,
    padding: '14px 18px',
    borderRadius: 12,
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontWeight: 600,
    fontSize: '0.9rem',
  },

  // Form
  form: {
    padding: '28px 32px 32px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
    marginBottom: 24,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  fieldGroupSmall: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    color: '#c7cbd3',
    fontSize: '0.82rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  labelIcon: {
    opacity: 0.5,
  },
  input: {
    width: '100%',
    padding: '13px 16px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.08)',
    background: '#0d0f12',
    color: '#f5f5f7',
    fontSize: '0.95rem',
    fontWeight: 500,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '13px 16px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.08)',
    background: '#0d0f12',
    color: '#f5f5f7',
    fontSize: '0.95rem',
    fontWeight: 500,
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },

  // Endorsement
  endorsementPreview: {
    display: 'flex',
    gap: 8,
    marginTop: 6,
  },
  endorsementDot: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    transition: 'all 0.3s',
  },

  // Toggle
  toggleContainer: {
    display: 'flex',
    gap: 12,
    marginTop: 4,
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 20px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.08)',
    background: '#0d0f12',
    color: '#8b8f98',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.25s',
    fontSize: '0.9rem',
  },
  toggleActive: {
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // Meta bar
  metaBar: {
    display: 'flex',
    gap: 24,
    padding: '14px 18px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.04)',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  metaItem: {
    color: '#6b6f78',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  metaValue: {
    color: '#c7cbd3',
    fontFamily: "'Roboto Mono', monospace",
    fontWeight: 600,
  },

  // Actions
  actionBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 14,
    paddingTop: 8,
  },
  cancelBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '13px 24px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'transparent',
    color: '#8b8f98',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '13px 28px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #f99e1a, #e88b0d)',
    color: '#111',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
    boxShadow: '0 4px 16px rgba(249,158,26,0.3)',
  },
};
