/**
 * Player Profile API — JDBC Integration
 * ========================================
 * GET  /api/player/[username]  — Fetch full player profile via JDBC
 * PUT  /api/player/[username]  — Update player profile fields via JDBC
 *
 * All database operations use the JDBC abstraction layer
 * (Connection → PreparedStatement → ResultSet pattern).
 */

import { NextResponse } from 'next/server';
import JDBCDriverManager from '@/lib/jdbc';

export async function GET(request, { params }) {
  const { username } = await params;

  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  const conn = JDBCDriverManager.getConnection();
  try {
    // ── Fetch player via JDBC PreparedStatement ──
    const playerStmt = conn.prepareStatement(
      'SELECT * FROM PLAYER WHERE Username = ? COLLATE NOCASE'
    );
    playerStmt.setString(1, username);
    const playerRs = playerStmt.executeQuery();

    if (!playerRs.next()) {
      playerRs.close();
      playerStmt.close();
      conn.close();
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const player = playerRs.getRow();
    const playerId = playerRs.getInt('Player_ID');
    playerRs.close();
    playerStmt.close();

    // ── Fetch Rank Data via JDBC ──
    const rankStmt = conn.prepareStatement(`
      SELECT p.*, r.Role_Name
      FROM PLAYER_SEASON_RANK p
      JOIN ROLE r ON p.Role_ID = r.Role_ID
      WHERE p.Player_ID = ?
      ORDER BY p.Season_ID DESC
    `);
    rankStmt.setInt(1, playerId);
    const rankRs = rankStmt.executeQuery();
    const rank = rankRs.next() ? rankRs.getRow() : null;
    rankRs.close();
    rankStmt.close();

    // ── Fetch Match History (latest 10) via JDBC ──
    const matchStmt = conn.prepareStatement(`
      SELECT m.*, pms.*
      FROM MATCH m
      JOIN PLAYER_MATCH_STATS pms ON m.Game_ID = pms.Game_ID
      WHERE pms.Player_ID = ?
      ORDER BY m.Timestamp DESC
      LIMIT 10
    `);
    matchStmt.setInt(1, playerId);
    const matchRs = matchStmt.executeQuery();
    const matches = matchRs.getAllRows();
    matchRs.close();
    matchStmt.close();

    // ── Aggregated Stats via JDBC ──
    const statsStmt = conn.prepareStatement(`
      SELECT
        COUNT(Game_ID) as TotalGames,
        SUM(CASE WHEN Result = 'WIN' THEN 1 ELSE 0 END) as Wins,
        SUM(CASE WHEN Result = 'LOSS' THEN 1 ELSE 0 END) as Losses,
        SUM(CASE WHEN Result = 'DRAW' THEN 1 ELSE 0 END) as Draws,
        AVG(Eliminations) as AvgElims,
        AVG(Deaths) as AvgDeaths,
        AVG(Damage_Dealt) as AvgDamage,
        IFNULL(SUM(Eliminations)*1.0 / NULLIF(SUM(Deaths), 0), SUM(Eliminations)) as KDA
      FROM PLAYER_MATCH_STATS
      WHERE Player_ID = ?
    `);
    statsStmt.setInt(1, playerId);
    const statsRs = statsStmt.executeQuery();
    const aggregatedStats = statsRs.next() ? statsRs.getRow() : {};
    statsRs.close();
    statsStmt.close();

    // ── Hero Performance via JDBC ──
    const heroStmt = conn.prepareStatement(`
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
    `);
    heroStmt.setInt(1, playerId);
    const heroRs = heroStmt.executeQuery();
    const heroStats = heroRs.getAllRows();
    heroRs.close();
    heroStmt.close();

    conn.close();

    return NextResponse.json({
      player,
      rank,
      aggregatedStats,
      matches,
      heroStats,
      _jdbc: true, // Flag indicating JDBC layer was used
    });
  } catch (err) {
    conn.close();
    console.error('GET /api/player/[username] JDBC error:', err);
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { username } = await params;
  const body = await request.json();

  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  const conn = JDBCDriverManager.getConnection();
  try {
    // ── Verify player exists via JDBC ──
    const checkStmt = conn.prepareStatement(
      'SELECT Player_ID FROM PLAYER WHERE Username = ? COLLATE NOCASE'
    );
    checkStmt.setString(1, username);
    const checkRs = checkStmt.executeQuery();

    if (!checkRs.next()) {
      checkRs.close();
      checkStmt.close();
      conn.close();
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const playerId = checkRs.getInt('Player_ID');
    checkRs.close();
    checkStmt.close();

    // ── Build dynamic UPDATE via JDBC PreparedStatement ──
    const fields = [];
    const params_list = [];

    if (body.username !== undefined) {
      fields.push('Username = ?');
      params_list.push({ type: 'string', value: body.username.trim() });
    }
    if (body.discriminator !== undefined) {
      fields.push('Discriminator = ?');
      params_list.push({ type: 'int', value: body.discriminator });
    }
    if (body.email !== undefined) {
      fields.push('Email_Address = ?');
      params_list.push({ type: 'string', value: body.email.trim() });
    }
    if (body.region !== undefined) {
      fields.push('Default_Region = ?');
      params_list.push({ type: 'string', value: body.region.trim() });
    }
    if (body.endorsementLevel !== undefined) {
      fields.push('Endorsement_Level = ?');
      params_list.push({ type: 'int', value: body.endorsementLevel });
    }
    if (body.accountCreationDate !== undefined) {
      fields.push('Account_Creation_Date = ?');
      params_list.push({ type: 'string', value: body.accountCreationDate });
    }
    if (body.isBanned !== undefined) {
      fields.push('Is_Banned = ?');
      params_list.push({ type: 'int', value: body.isBanned ? 1 : 0 });
    }

    if (fields.length === 0) {
      conn.close();
      return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 });
    }

    const sql = `UPDATE PLAYER SET ${fields.join(', ')} WHERE Player_ID = ?`;
    const updateStmt = conn.prepareStatement(sql);

    params_list.forEach((param, idx) => {
      const pos = idx + 1;
      if (param.type === 'int') updateStmt.setInt(pos, param.value);
      else updateStmt.setString(pos, param.value);
    });
    updateStmt.setInt(params_list.length + 1, playerId);

    const affected = updateStmt.executeUpdate();
    updateStmt.close();

    // ── Return updated player data ──
    const updatedStmt = conn.prepareStatement('SELECT * FROM PLAYER WHERE Player_ID = ?');
    updatedStmt.setInt(1, playerId);
    const updatedRs = updatedStmt.executeQuery();
    updatedRs.next();
    const updatedPlayer = updatedRs.getRow();
    updatedRs.close();
    updatedStmt.close();

    conn.close();

    return NextResponse.json({
      success: true,
      message: `Updated ${affected} row(s) via JDBC PreparedStatement`,
      player: updatedPlayer,
      _jdbc: true,
    });
  } catch (err) {
    conn.close();
    console.error('PUT /api/player/[username] JDBC error:', err);
    return NextResponse.json({ error: 'Failed to update profile', details: err.message }, { status: 500 });
  }
}
