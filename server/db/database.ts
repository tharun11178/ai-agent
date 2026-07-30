import sqlite3 from 'sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

function getWritableDataDir(): string {
  try {
    const cwdData = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(cwdData)) {
      fs.mkdirSync(cwdData, { recursive: true });
    }
    const testFile = path.join(cwdData, '.write-test');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    return cwdData;
  } catch {
    const tmpData = path.join(os.tmpdir(), 'ai-agent-data');
    if (!fs.existsSync(tmpData)) {
      fs.mkdirSync(tmpData, { recursive: true });
    }
    return tmpData;
  }
}

const DATA_DIR = getWritableDataDir();
const DB_PATH = path.join(DATA_DIR, 'challenge.db');

// Enable verbose SQLite logging in non-production if needed
const sqlite = sqlite3.verbose();
export const db = new sqlite.Database(DB_PATH);

// Helper wrappers for Async/Await database operations
export function dbRun(sql: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function dbGet<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

export function dbAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve((rows as T[]) || []);
    });
  });
}

export async function initDatabase(): Promise<void> {
  // Create Teams Table with Indexes
  await dbRun(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      teamName TEXT UNIQUE NOT NULL,
      leaderName TEXT NOT NULL,
      leaderEmail TEXT UNIQUE NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      college TEXT NOT NULL,
      department TEXT,
      year TEXT,
      member2 TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  await dbRun(`CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_name ON teams(teamName);`);
  await dbRun(`CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_email ON teams(leaderEmail);`);
  await dbRun(`CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_phone ON teams(phone);`);

  // Create Problems Table for Admin Release Control
  await dbRun(`
    CREATE TABLE IF NOT EXISTS problems (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      objectives TEXT NOT NULL,
      constraints TEXT NOT NULL,
      deliverables TEXT NOT NULL,
      released INTEGER NOT NULL DEFAULT 0,
      releasedAt TEXT,
      updatedAt TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);

  // Create Activity Logs Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      adminUser TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);

  await dbRun(`CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(createdAt);`);

  // Create Event Config Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS event_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const initialMaxTeams = process.env.MAX_TEAMS || '100';
  await dbRun(`INSERT OR REPLACE INTO event_config (key, value) VALUES ('MAX_TEAMS', ?)`, [initialMaxTeams]);

  const regOpenConfig = await dbGet(`SELECT value FROM event_config WHERE key = 'registrationOpen'`);
  if (!regOpenConfig) {
    await dbRun(`INSERT INTO event_config (key, value) VALUES ('registrationOpen', 'true')`);
  }

  const adminPass = process.env.ADMIN_PASSWORD || 'isagi1117';
  const newHash = bcrypt.hashSync(adminPass, 10);
  await dbRun(`INSERT OR REPLACE INTO event_config (key, value) VALUES ('adminPasswordHash', ?)`, [newHash]);
  await dbRun(`INSERT OR REPLACE INTO event_config (key, value) VALUES ('adminUsername', 'admin')`);

  // Seed Default Official Problem Statement if table is empty
  const problemCount = await dbGet<{ count: number }>(`SELECT COUNT(*) as count FROM problems`);
  if (problemCount && problemCount.count === 0) {
    const now = new Date().toISOString();
    await dbRun(
      `INSERT INTO problems (id, title, description, objectives, constraints, deliverables, released, releasedAt, updatedAt, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, 0, NULL, ?, ?)`,
      [
        'prob-official-2026',
        'Build an AI-Powered Smart Campus Assistant',
        'Design and develop an intelligent AI-powered assistant that helps students and faculty by answering queries related to academics, departments, campus facilities, event schedules, placements, and general college information. Your solution should demonstrate the use of Artificial Intelligence to solve real-world problems while providing an intuitive and user-friendly experience.',
        JSON.stringify([
          'Understand user queries using Artificial Intelligence.',
          'Provide accurate, relevant, and meaningful responses.',
          'Maintain a clean, intuitive, and responsive user interface.',
          'Demonstrate practical and efficient AI integration.',
          'Present a working, end-to-end functional prototype.',
        ]),
        JSON.stringify([
          'Development must begin only after official commencement of the event.',
          'Participants may use any preferred AI framework, language, or model.',
          'All submitted solutions must be original work created during the competition window.',
        ]),
        JSON.stringify([
          'Functional Application Prototype',
          'Clean Source Code Repository',
          'AI Integration & Logic Implementation',
          'Live Judge Demonstration',
          'Brief Project Architecture Summary',
        ]),
        now,
        now,
      ]
    );
  }
}

// Log activity helper
export async function logAdminActivity(adminUser: string, action: string, details: string): Promise<void> {
  try {
    await dbRun(
      `INSERT INTO activity_logs (id, adminUser, action, details, createdAt) VALUES (?, ?, ?, ?, ?)`,
      [`log-${nanoid(10)}`, adminUser, action, details, new Date().toISOString()]
    );
  } catch (err) {
    console.error('Failed to log admin activity:', err);
  }
}
