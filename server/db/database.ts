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
  // Create Teams Table
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

  // Create Problems Table for Multi-Problem Management System
  await dbRun(`
    CREATE TABLE IF NOT EXISTS problems (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      objectives TEXT NOT NULL,
      requirements TEXT NOT NULL DEFAULT '[]',
      constraints TEXT NOT NULL,
      deliverables TEXT NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'Medium',
      category TEXT NOT NULL DEFAULT 'AI Agents',
      attachments TEXT,
      status TEXT NOT NULL DEFAULT 'Draft',
      assignedTeamIds TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // Check and add missing columns if upgrading existing table
  const problemTableInfo = await dbAll(`PRAGMA table_info(problems)`);
  const existingProbCols = problemTableInfo.map((c: any) => c.name);

  if (!existingProbCols.includes('requirements')) {
    await dbRun(`ALTER TABLE problems ADD COLUMN requirements TEXT NOT NULL DEFAULT '[]'`);
  }
  if (!existingProbCols.includes('difficulty')) {
    await dbRun(`ALTER TABLE problems ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'Medium'`);
  }
  if (!existingProbCols.includes('category')) {
    await dbRun(`ALTER TABLE problems ADD COLUMN category TEXT NOT NULL DEFAULT 'AI Agents'`);
  }
  if (!existingProbCols.includes('attachments')) {
    await dbRun(`ALTER TABLE problems ADD COLUMN attachments TEXT`);
  }
  if (!existingProbCols.includes('status')) {
    await dbRun(`ALTER TABLE problems ADD COLUMN status TEXT NOT NULL DEFAULT 'Draft'`);
  }
  if (!existingProbCols.includes('assignedTeamIds')) {
    await dbRun(`ALTER TABLE problems ADD COLUMN assignedTeamIds TEXT`);
  }

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

  const adminHashConfig = await dbGet(`SELECT value FROM event_config WHERE key = 'adminPasswordHash'`);
  if (!adminHashConfig) {
    const adminPass = process.env.ADMIN_PASSWORD || 'isagi1117';
    const newHash = bcrypt.hashSync(adminPass, 10);
    await dbRun(`INSERT INTO event_config (key, value) VALUES ('adminPasswordHash', ?)`, [newHash]);
  }

  const adminUserConfig = await dbGet(`SELECT value FROM event_config WHERE key = 'adminUsername'`);
  if (!adminUserConfig) {
    await dbRun(`INSERT INTO event_config (key, value) VALUES ('adminUsername', 'admin')`);
  }

  // Seed sample Problem Statements if table is empty
  const problemCount = await dbGet<{ count: number }>(`SELECT COUNT(*) as count FROM problems`);
  if (problemCount && problemCount.count === 0) {
    const now = new Date().toISOString();
    const sampleProblems = [
      {
        id: 'prob-smart-campus',
        title: 'Build an AI-Powered Smart Campus Assistant',
        category: 'AI Agents & Automation',
        difficulty: 'Medium',
        description: 'Design and develop an intelligent AI-powered assistant that helps students and faculty by answering queries related to academics, departments, campus facilities, event schedules, placements, and general college information.',
        objectives: [
          'Understand user queries using Artificial Intelligence.',
          'Provide accurate, relevant, and meaningful responses.',
          'Maintain a clean, intuitive, and responsive user interface.',
          'Demonstrate practical and efficient AI integration.',
          'Present a working, end-to-end functional prototype.',
        ],
        requirements: [
          'User-friendly UI/UX interface for students and faculty.',
          'NLP or LLM integration for intent handling.',
          'Fast response times under 2 seconds.',
          'Support for common campus domain knowledge.',
        ],
        constraints: [
          'Development must occur strictly within the event timeframe.',
          'Participants may use any preferred AI framework or language.',
          'All submitted solution code must be original.',
        ],
        deliverables: [
          'Functional Application Prototype',
          'Clean Source Code Repository',
          'AI Integration & Logic Implementation',
          'Live Judge Demonstration',
        ],
        status: 'Draft',
      },
      {
        id: 'prob-vulnerability-scanner',
        title: 'Real-Time Code Vulnerability Detection Agent',
        category: 'Cybersecurity & Code Analysis',
        difficulty: 'Hard',
        description: 'Build an autonomous code-review agent that scans pull requests and source code for security vulnerabilities, zero-day risks, and compliance violations before deployment.',
        objectives: [
          'Analyze source code for security flaws and injection vulnerabilities.',
          'Generate automated security fix recommendations.',
          'Provide severity rankings for detected security issues.',
        ],
        requirements: [
          'Static code analysis parsing or LLM code understanding.',
          'Automated severity classification (Low, Medium, Critical).',
          'Exportable security report.',
        ],
        constraints: [
          'Must complete code scans within reasonable time bounds.',
          'Original code implementation required.',
        ],
        deliverables: [
          'Vulnerability Scanning Tool Prototype',
          'Sample Vulnerability Benchmark Results',
          'Source Code & Live Demo',
        ],
        status: 'Draft',
      },
      {
        id: 'prob-healthcare-triage',
        title: 'Multi-Agent Healthcare Patient Triage System',
        category: 'Healthcare AI',
        difficulty: 'Hard',
        description: 'Develop a multi-agent AI system that evaluates incoming patient vitals, prioritizes emergency department triage queues, and alerts medical personnel to high-risk cases.',
        objectives: [
          'Process patient symptom reports and vital signs in real time.',
          'Prioritize emergency queue based on medical risk level.',
          'Provide transparent reasoning for triage decisions.',
        ],
        requirements: [
          'Multi-agent workflow orchestration.',
          'Real-time priority queue visualization.',
        ],
        constraints: [
          'For demonstration and simulation purposes only.',
          'Original implementation created during competition.',
        ],
        deliverables: [
          'Multi-Agent Triage Simulator',
          'Architecture Diagram & Code Repository',
          'Live Demonstration',
        ],
        status: 'Draft',
      },
    ];

    for (const p of sampleProblems) {
      await dbRun(
        `INSERT INTO problems (id, title, description, objectives, requirements, constraints, deliverables, difficulty, category, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.title,
          p.description,
          JSON.stringify(p.objectives),
          JSON.stringify(p.requirements),
          JSON.stringify(p.constraints),
          JSON.stringify(p.deliverables),
          p.difficulty,
          p.category,
          p.status,
          now,
          now,
        ]
      );
    }
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
