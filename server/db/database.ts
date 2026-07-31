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
  if (!existingProbCols.includes('qrCode')) {
    await dbRun(`ALTER TABLE problems ADD COLUMN qrCode TEXT`);
  }
  if (!existingProbCols.includes('scanCount')) {
    await dbRun(`ALTER TABLE problems ADD COLUMN scanCount INTEGER NOT NULL DEFAULT 0`);
  }
  if (!existingProbCols.includes('releasedAt')) {
    await dbRun(`ALTER TABLE problems ADD COLUMN releasedAt TEXT`);
  }
  if (!existingProbCols.includes('firstScannedAt')) {
    await dbRun(`ALTER TABLE problems ADD COLUMN firstScannedAt TEXT`);
  }
  if (!existingProbCols.includes('lastScannedAt')) {
    await dbRun(`ALTER TABLE problems ADD COLUMN lastScannedAt TEXT`);
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

  // Seed 11 initial Problem Statements if table count is < 11
  const problemCount = await dbGet<{ count: number }>(`SELECT COUNT(*) as count FROM problems`);
  if (problemCount && problemCount.count < 11) {
    const now = new Date().toISOString();
    const sampleProblems = [
      {
        id: '1',
        title: 'AI-Powered Smart Campus & Academic Assistant',
        category: 'AI Agents & Automation',
        difficulty: 'Medium',
        description: 'Design and develop an intelligent AI agent that assists students and faculty by answering queries related to academics, departments, campus facilities, event schedules, placements, and general college information.',
        objectives: [
          'Understand natural language queries from students and faculty.',
          'Provide instant, accurate, and context-aware responses.',
          'Maintain a clean, intuitive, and responsive conversational UI.',
          'Integrate domain knowledge for campus departments and guidelines.',
          'Demonstrate an end-to-end working prototype.',
        ],
        requirements: [
          'User-friendly web UI for campus queries.',
          'NLP or LLM integration for intent handling.',
          'Sub-2-second response latency.',
          'Structured campus domain knowledge representation.',
        ],
        constraints: [
          'Development strictly within hackathon window.',
          'Original code and permissible model frameworks.',
          'Privacy protection for student inquiries.',
        ],
        deliverables: [
          'Functional Campus AI Assistant Prototype',
          'Source Code Repository & Architecture Documentation',
          'Live Demo to Judges',
        ],
        status: 'Draft',
      },
      {
        id: '2',
        title: 'Real-Time Code Vulnerability Detection Agent',
        category: 'Cybersecurity & Code Analysis',
        difficulty: 'Hard',
        description: 'Build an autonomous code-review agent that scans pull requests and source code for security vulnerabilities, zero-day risks, and compliance violations before production deployment.',
        objectives: [
          'Analyze code for security flaws and injection risks.',
          'Generate automated security fix recommendations.',
          'Provide clear severity rankings for detected flaws.',
        ],
        requirements: [
          'AST parsing or LLM-assisted security review.',
          'Automated severity classification (Low, Medium, Critical).',
          'Exportable security audit report.',
        ],
        constraints: [
          'Must process repository files within reasonable time bounds.',
          'Original code implementation required.',
        ],
        deliverables: [
          'Vulnerability Scanning Tool Prototype',
          'Benchmark Vulnerability Scan Results',
          'Source Code & Live Demo',
        ],
        status: 'Draft',
      },
      {
        id: '3',
        title: 'Multi-Agent Healthcare Patient Triage System',
        category: 'Healthcare AI',
        difficulty: 'Hard',
        description: 'Develop a multi-agent AI system that evaluates incoming patient vitals, prioritizes emergency department triage queues, and alerts medical staff to critical cases.',
        objectives: [
          'Process patient symptom reports and vital signs in real time.',
          'Prioritize emergency queue based on clinical urgency.',
          'Provide transparent reasoning for triage decisions.',
        ],
        requirements: [
          'Multi-agent workflow orchestration.',
          'Real-time emergency priority queue visualization.',
          'Secure medical data formatting.',
        ],
        constraints: [
          'For demonstration and simulation purposes only.',
          'Original work created during event.',
        ],
        deliverables: [
          'Multi-Agent Patient Triage Simulator',
          'Architecture Diagram & Code Repository',
          'Live Demonstration',
        ],
        status: 'Draft',
      },
      {
        id: '4',
        title: 'Autonomous Financial Fraud Detection & Audit Agent',
        category: 'FinTech AI',
        difficulty: 'Medium',
        description: 'Create an intelligent financial monitoring agent that analyzes transaction streams, detects anomalous fraud patterns, and generates automated compliance audit reports.',
        objectives: [
          'Detect synthetic fraud and transaction anomaly patterns.',
          'Provide explainable risk scores for suspicious accounts.',
          'Generate automated regulatory audit logs.',
        ],
        requirements: [
          'Real-time transaction anomaly detection model.',
          'Interactive risk scoring dashboard.',
          'Automated audit alert generation.',
        ],
        constraints: [
          'Use simulated financial dataset streams.',
          'Compliance with privacy and security norms.',
        ],
        deliverables: [
          'Fraud Analytics Engine',
          'Audit Log Dashboard',
          'Source Code & Live Demo',
        ],
        status: 'Draft',
      },
      {
        id: '5',
        title: 'Smart Supply Chain Optimization & Demand Forecasting Engine',
        category: 'Enterprise AI',
        difficulty: 'Medium',
        description: 'Build an AI agent that predicts inventory demand, detects supply chain bottlenecks, and recommends optimized reorder routes for regional fulfillment hubs.',
        objectives: [
          'Forecast inventory demand based on historical trends.',
          'Optimize fulfillment routes and reorder points.',
          'Minimize stockouts and storage overhead.',
        ],
        requirements: [
          'Demand forecasting model integration.',
          'Inventory optimization algorithm.',
          'Fulfillment route map visualizer.',
        ],
        constraints: [
          'Original code and dataset processing.',
          'Fast execution time for route recommendations.',
        ],
        deliverables: [
          'Supply Chain Optimization Engine',
          'Fulfillment Analytics Dashboard',
          'Source Code & Live Demo',
        ],
        status: 'Draft',
      },
      {
        id: '6',
        title: 'Generative AI Legal Contract Analyzer & Compliance Agent',
        category: 'LegalTech & NLP',
        difficulty: 'Hard',
        description: 'Develop an AI legal assistant that parses non-disclosure agreements and commercial contracts, highlights risky indemnity clauses, and suggests compliant rewrites.',
        objectives: [
          'Extract key liability and termination terms from legal documents.',
          'Flag non-standard or risky contract clauses.',
          'Provide standardized clause replacement suggestions.',
        ],
        requirements: [
          'Long-document context processing.',
          'Clause risk highlighting interface.',
          'Exportable legal summary report.',
        ],
        constraints: [
          'Strict document data privacy.',
          'Must disclaim formal legal advice.',
        ],
        deliverables: [
          'Legal Contract Audit Tool',
          'Sample Contract Analysis Report',
          'Source Code & Live Demo',
        ],
        status: 'Draft',
      },
      {
        id: '7',
        title: 'Smart Disaster Response & Crisis Logistics Coordinator',
        category: 'Public Safety AI',
        difficulty: 'Hard',
        description: 'Design a crisis management agent that ingests emergency SOS distress signals, routes rescue teams efficiently, and coordinates resource distribution during natural disasters.',
        objectives: [
          'Map emergency distress calls and priority rescue zones.',
          'Optimize rescue vehicle dispatch routes.',
          'Coordinate shelter capacity and medical supply distribution.',
        ],
        requirements: [
          'Geospatial distress alert visualization.',
          'Real-time resource allocation engine.',
          'Low-latency status communication.',
        ],
        constraints: [
          'Simulation-based emergency scenarios.',
          'Original code submission.',
        ],
        deliverables: [
          'Disaster Response Coordination System',
          'Crisis Dispatch Dashboard',
          'Source Code & Live Demo',
        ],
        status: 'Draft',
      },
      {
        id: '8',
        title: 'Personalized Adaptive AI Learning & Tutoring Assistant',
        category: 'EdTech AI',
        difficulty: 'Easy',
        description: 'Build an interactive AI tutor that evaluates student quiz performance, identifies conceptual knowledge gaps, and creates personalized study plans.',
        objectives: [
          'Assess student comprehension across technical topics.',
          'Generate tailored explanations adapted to skill level.',
          'Track student progress over time.',
        ],
        requirements: [
          'Interactive Q&A and quiz assessment module.',
          'Dynamic study plan generator.',
          'Intuitive student dashboard UI.',
        ],
        constraints: [
          'Accessible to users with varying background knowledge.',
          'Fast response feedback loop.',
        ],
        deliverables: [
          'Adaptive AI Learning Assistant',
          'Student Dashboard Prototype',
          'Source Code & Live Demo',
        ],
        status: 'Draft',
      },
      {
        id: '9',
        title: 'Autonomous Customer Support Ticket Resolution Swarm',
        category: 'Customer Experience',
        difficulty: 'Medium',
        description: 'Develop a multi-agent customer support swarm that automatically triages incoming support tickets, answers common queries, and escalates complex issues to human agents.',
        objectives: [
          'Triage and classify support tickets by sentiment and topic.',
          'Auto-resolve routine billing and technical inquiries.',
          'Draft intelligent response context for tier-2 human escalation.',
        ],
        requirements: [
          'Multi-agent ticket classification pipeline.',
          'Automated response generator with confidence scoring.',
          'Agent handoff dashboard.',
        ],
        constraints: [
          'High resolution precision to prevent false answers.',
          'Original implementation.',
        ],
        deliverables: [
          'Customer Support Swarm Engine',
          'Triage & Escalation Dashboard',
          'Source Code & Live Demo',
        ],
        status: 'Draft',
      },
      {
        id: '10',
        title: 'Smart Energy Grid & Carbon Footprint Optimization Agent',
        category: 'ClimateTech AI',
        difficulty: 'Hard',
        description: 'Build an intelligent agent that balances renewable energy distribution across smart grids, predicts peak load demand, and minimizes carbon emissions.',
        objectives: [
          'Predict solar and wind energy generation patterns.',
          'Optimize grid battery storage charge/discharge cycles.',
          'Calculate real-time carbon reduction metrics.',
        ],
        requirements: [
          'Time-series load forecasting model.',
          'Energy dispatch optimization simulator.',
          'Carbon footprint analytics visualizer.',
        ],
        constraints: [
          'Realistic simulated grid data processing.',
          'Efficient optimization algorithm.',
        ],
        deliverables: [
          'Smart Grid Optimization Simulator',
          'Carbon Analytics Dashboard',
          'Source Code & Live Demo',
        ],
        status: 'Draft',
      },
      {
        id: '11',
        title: 'Multi-Modal Crop Disease Diagnosis & AgriTech Advisory Agent',
        category: 'AgriTech AI',
        difficulty: 'Medium',
        description: 'Develop an AI agricultural advisory agent that analyzes crop leaf images and field sensor metrics to diagnose plant diseases and recommend treatment steps.',
        objectives: [
          'Diagnose fungal and bacterial plant diseases from image inputs.',
          'Correlate soil moisture and temperature metrics with crop health.',
          'Provide actionable organic and chemical treatment advice.',
        ],
        requirements: [
          'Multi-modal image and sensor input handling.',
          'Disease classification confidence scoring.',
          'Mobile-friendly treatment guide UI.',
        ],
        constraints: [
          'Accessible interface for non-technical users.',
          'Original work created during event.',
        ],
        deliverables: [
          'AgriTech Diagnosis & Advisory App',
          'Sample Crop Health Reports',
          'Source Code & Live Demo',
        ],
        status: 'Draft',
      },
    ];

    for (const p of sampleProblems) {
      const qrUrl = `/problem-statement/${p.id}`;
      const existing = await dbGet(`SELECT id FROM problems WHERE id = ?`, [p.id]);

      if (!existing) {
        await dbRun(
          `INSERT INTO problems (id, title, description, objectives, requirements, constraints, deliverables, difficulty, category, qrCode, scanCount, status, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'Draft', ?, ?)`,
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
            qrUrl,
            now,
            now,
          ]
        );
      } else {
        await dbRun(
          `UPDATE problems SET qrCode = ? WHERE id = ? AND (qrCode IS NULL OR qrCode = '')`,
          [qrUrl, p.id]
        );
      }
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
