/**
 * JDBC-style Database Integration Layer
 * ======================================
 * Provides a familiar JDBC API (Connection, PreparedStatement, ResultSet)
 * on top of the better-sqlite3 driver for the Overwatch Tracker.
 *
 * Usage mirrors standard JDBC patterns:
 *   const conn = JDBCDriverManager.getConnection();
 *   const stmt = conn.prepareStatement('SELECT * FROM PLAYER WHERE Player_ID = ?');
 *   stmt.setInt(1, playerId);
 *   const rs = stmt.executeQuery();
 *   while (rs.next()) { ... rs.getString('Username') ... }
 *   rs.close();
 *   stmt.close();
 *   conn.close();
 */

import Database from 'better-sqlite3';
import path from 'path';

// ─── ResultSet ─────────────────────────────────────────────────────────────────
class ResultSet {
  constructor(rows) {
    this._rows = rows || [];
    this._cursor = -1;
    this._closed = false;
  }

  /** Advance cursor to the next row. Returns false when exhausted. */
  next() {
    this._assertOpen();
    this._cursor++;
    return this._cursor < this._rows.length;
  }

  /** Return current row as a plain object */
  getRow() {
    this._assertOpen();
    return this._rows[this._cursor] || null;
  }

  getString(column)  { return this._val(column)?.toString() ?? null; }
  getInt(column)     { const v = this._val(column); return v != null ? Number(v) : 0; }
  getFloat(column)   { const v = this._val(column); return v != null ? parseFloat(v) : 0.0; }
  getBoolean(column) { return !!this._val(column); }
  getDate(column)    { const v = this._val(column); return v ? new Date(v) : null; }
  getObject(column)  { return this._val(column); }

  /** Total rows in result set */
  getRowCount() { return this._rows.length; }

  /** All rows as array of objects */
  getAllRows() { this._assertOpen(); return [...this._rows]; }

  close() { this._closed = true; }

  _val(column) {
    this._assertOpen();
    const row = this._rows[this._cursor];
    if (!row) return null;
    return row[column] ?? null;
  }

  _assertOpen() {
    if (this._closed) throw new Error('ResultSet is closed');
  }
}

// ─── PreparedStatement ─────────────────────────────────────────────────────────
class PreparedStatement {
  constructor(connection, sql) {
    this._connection = connection;
    this._sql = sql;
    this._params = {};
    this._closed = false;
  }

  setString(index, value)  { this._params[index] = value; return this; }
  setInt(index, value)     { this._params[index] = Number(value); return this; }
  setFloat(index, value)   { this._params[index] = parseFloat(value); return this; }
  setBoolean(index, value) { this._params[index] = value ? 1 : 0; return this; }
  setDate(index, value)    { this._params[index] = value instanceof Date ? value.toISOString() : value; return this; }
  setNull(index)           { this._params[index] = null; return this; }

  /** Execute a SELECT query — returns a ResultSet */
  executeQuery() {
    this._assertOpen();
    const db = this._connection._getDb();
    const stmt = db.prepare(this._sql);
    const binds = this._orderedParams();
    const rows = stmt.all(...binds);
    return new ResultSet(rows);
  }

  /** Execute INSERT / UPDATE / DELETE — returns number of rows affected */
  executeUpdate() {
    this._assertOpen();
    const db = this._connection._getDb();
    const stmt = db.prepare(this._sql);
    const binds = this._orderedParams();
    const info = stmt.run(...binds);
    return info.changes;
  }

  /** Execute and return the RunResult (includes lastInsertRowid) */
  execute() {
    this._assertOpen();
    const db = this._connection._getDb();
    const stmt = db.prepare(this._sql);
    const binds = this._orderedParams();
    return stmt.run(...binds);
  }

  close() { this._closed = true; }

  _orderedParams() {
    const indices = Object.keys(this._params).map(Number).sort((a, b) => a - b);
    return indices.map(i => this._params[i]);
  }

  _assertOpen() {
    if (this._closed) throw new Error('PreparedStatement is closed');
  }
}

// ─── Connection ────────────────────────────────────────────────────────────────
class Connection {
  constructor(db) {
    this._db = db;
    this._closed = false;
    this._autoCommit = true;
  }

  prepareStatement(sql) {
    this._assertOpen();
    return new PreparedStatement(this, sql);
  }

  /** Convenience: run a simple SQL string and get a ResultSet */
  createStatement(sql) {
    this._assertOpen();
    return this.prepareStatement(sql);
  }

  setAutoCommit(val) { this._autoCommit = val; }
  getAutoCommit()    { return this._autoCommit; }

  commit() {
    this._assertOpen();
    this._db.pragma('wal_checkpoint(FULL)');
  }

  rollback() {
    // SQLite auto-rolls back on error; noop for better-sqlite3 synchronous driver
  }

  close() { this._closed = true; }

  isClosed() { return this._closed; }

  /** @internal */
  _getDb() {
    this._assertOpen();
    return this._db;
  }

  _assertOpen() {
    if (this._closed) throw new Error('Connection is closed');
  }
}

// ─── DriverManager (Singleton) ─────────────────────────────────────────────────
let _sharedDb = null;

function _getSharedDb() {
  if (!_sharedDb) {
    const dbPath = path.join(process.cwd(), 'ow-tracker.db');
    _sharedDb = new Database(dbPath);
    _sharedDb.pragma('journal_mode = WAL');
    _sharedDb.pragma('foreign_keys = ON');
  }
  return _sharedDb;
}

const JDBCDriverManager = {
  /**
   * Obtain a JDBC-style Connection.
   * @returns {Connection}
   */
  getConnection() {
    return new Connection(_getSharedDb());
  },
};

export { JDBCDriverManager, Connection, PreparedStatement, ResultSet };
export default JDBCDriverManager;
