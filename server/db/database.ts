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

// Fast SQLite performance settings for low latency & fast startup
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA cache_size = -64000;
  PRAGMA temp_store = MEMORY;
`);

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

  if (!existingProbCols.includes('objectives')) {
    await dbRun(`ALTER TABLE problems ADD COLUMN objectives TEXT NOT NULL DEFAULT '[]'`);
  }
  if (!existingProbCols.includes('constraints')) {
    await dbRun(`ALTER TABLE problems ADD COLUMN constraints TEXT NOT NULL DEFAULT '[]'`);
  }
  if (!existingProbCols.includes('deliverables')) {
    await dbRun(`ALTER TABLE problems ADD COLUMN deliverables TEXT NOT NULL DEFAULT '[]'`);
  }
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
  if (!existingProbCols.includes('accessToken')) {
    await dbRun(`ALTER TABLE problems ADD COLUMN accessToken TEXT`);
  }
  if (!existingProbCols.includes('createdAt')) {
    await dbRun(`ALTER TABLE problems ADD COLUMN createdAt TEXT`);
  }
  if (!existingProbCols.includes('updatedAt')) {
    await dbRun(`ALTER TABLE problems ADD COLUMN updatedAt TEXT`);
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

  // Seed/Update 11 Official AI Agent Challenge Problem Statements
  const now = new Date().toISOString();
  const officialProblems = [
    {
      id: '1',
      title: 'AI Smart Agriculture Planner',
      category: 'Agriculture',
      difficulty: 'Medium',
      description:
        'Develop an AI-powered system that helps farmers optimize crop planning by analyzing weather forecasts, soil conditions, satellite imagery, and historical agricultural data. The solution should recommend suitable crops, fertilizers, detect plant diseases, estimate crop yields, and improve overall farming productivity.',
      objectives: [
        'Recommend suitable crops and fertilizers based on weather forecasts, soil conditions, satellite imagery, and historical agricultural data.',
        'Detect plant diseases using multi-modal AI models or visual image analysis.',
        'Estimate crop yields and provide actionable recommendations to improve overall farming productivity.',
      ],
      requirements: [
        'Crop and fertilizer recommendation engine analyzing soil and weather inputs.',
        'Plant disease detection module with visual or sensor diagnostic capabilities.',
        'Yield estimation and productivity optimization dashboard for farmers.',
      ],
      constraints: [
        'Must process soil, weather, and image inputs within sub-2-second latency.',
        'Ensure intuitive user interface accessible for agricultural workers.',
      ],
      deliverables: [
        'Functional AI Smart Agriculture Planner Prototype',
        'Source Code Repository & System Architecture Documentation',
        'Live Demonstration & Test Dataset Analysis',
      ],
      status: 'Draft',
      accessToken: 'QR-001',
      qrCode: '/ps/QR-001',
    },
    {
      id: '2',
      title: 'AI Logistics Fleet Manager',
      category: 'Logistics',
      difficulty: 'Medium',
      description:
        'Build an AI-based fleet management platform that optimizes vehicle routing, predicts maintenance requirements, monitors driver behavior, minimizes fuel consumption, and improves delivery efficiency using real-time GPS and traffic data.',
      objectives: [
        'Optimize vehicle routing and minimize fuel consumption using real-time GPS and traffic data.',
        'Predict vehicle maintenance requirements before mechanical failures occur.',
        'Monitor driver behavior and improve delivery efficiency and fleet safety.',
      ],
      requirements: [
        'Real-time route optimization engine with traffic and GPS data integration.',
        'Predictive maintenance alert system based on vehicle telemetry.',
        'Driver behavior monitoring and fuel consumption optimization dashboard.',
      ],
      constraints: [
        'Real-time telemetry processing without routing delays.',
        'Scalable architecture supporting multi-vehicle fleet tracking.',
      ],
      deliverables: [
        'AI Logistics Fleet Management Platform Prototype',
        'Fleet Route & Predictive Maintenance Analytics Dashboard',
        'Source Code Repository & Live Demonstration',
      ],
      status: 'Draft',
      accessToken: 'QR-002',
      qrCode: '/ps/QR-002',
    },
    {
      id: '3',
      title: 'AI Retail Inventory Manager',
      category: 'Retail',
      difficulty: 'Medium',
      description:
        'Develop an AI-powered inventory management system capable of forecasting demand, preventing stock shortages and overstocking, automating product reordering, and providing business insights based on sales trends.',
      objectives: [
        'Forecast demand to prevent stock shortages and avoid overstocking.',
        'Automate product reordering based on historical sales trends and real-time stock levels.',
        'Provide business insights and trend analytics to optimize retail store operations.',
      ],
      requirements: [
        'Time-series sales demand forecasting model.',
        'Automated stock reorder threshold calculation and order generation.',
        'Interactive inventory intelligence dashboard with sales trend visualizers.',
      ],
      constraints: [
        'Accurate demand predictions across seasonal fluctuations.',
        'Responsive user interface for inventory managers.',
      ],
      deliverables: [
        'AI Retail Inventory Management System Prototype',
        'Demand Forecasting & Automated Reordering Analytics Suite',
        'Source Code & Live Demonstration',
      ],
      status: 'Draft',
      accessToken: 'QR-003',
      qrCode: '/ps/QR-003',
    },
    {
      id: '4',
      title: 'AI City Operations Agent',
      category: 'Smart City',
      difficulty: 'Medium',
      description:
        'Design an AI system that monitors traffic flow, waste collection, water distribution, public services, and emergency events to improve operational efficiency in smart cities through predictive analytics and intelligent automation.',
      objectives: [
        'Monitor municipal traffic flow, waste collection, and water distribution systems in real time.',
        'Utilize predictive analytics to optimize public service routing and municipal resource allocation.',
        'Automate responses to emergency events for improved smart city operational efficiency.',
      ],
      requirements: [
        'Smart city operations monitoring center dashboard.',
        'Predictive analytics pipeline for municipal service optimization.',
        'Automated incident triage and emergency event dispatcher.',
      ],
      constraints: [
        'High availability dashboard capable of handling multi-domain urban telemetry.',
        'Clear separation of operational priority tiers.',
      ],
      deliverables: [
        'AI Smart City Operations Center Prototype',
        'Predictive Municipal Analytics & Automation Control Board',
        'Source Code & Live Demo',
      ],
      status: 'Draft',
      accessToken: 'QR-004',
      qrCode: '/ps/QR-004',
    },
    {
      id: '5',
      title: 'AI Enterprise Operations Commander',
      category: 'Enterprise AI',
      difficulty: 'Medium',
      description:
        'Develop an AI-powered enterprise operations platform that monitors business departments, automates workflows, predicts operational risks, tracks KPIs, and assists management in making data-driven decisions.',
      objectives: [
        'Monitor key business departments and track corporate KPIs in real time.',
        'Automate enterprise workflows and predict operational risks before impact.',
        'Assist executive management with data-driven strategic decisions.',
      ],
      requirements: [
        'Multi-departmental KPI tracking and risk assessment engine.',
        'Automated workflow orchestration and anomaly detection pipeline.',
        'Decision support dashboard with real-time executive summaries.',
      ],
      constraints: [
        'Secure data isolation across enterprise departments.',
        'Fast execution of risk forecasting models.',
      ],
      deliverables: [
        'AI Enterprise Operations Command Platform Prototype',
        'KPI Tracking & Risk Prediction Dashboard',
        'Source Code & Live Demonstration',
      ],
      status: 'Draft',
      accessToken: 'QR-005',
      qrCode: '/ps/QR-005',
    },
    {
      id: '6',
      title: 'AI Disaster Response Commander',
      category: 'Disaster Management',
      difficulty: 'Medium',
      description:
        'Create an intelligent disaster response platform that detects emergencies, predicts disaster impact, allocates rescue resources, coordinates emergency teams, and provides real-time situational awareness during crisis situations.',
      objectives: [
        'Detect natural and man-made emergencies and predict potential disaster impact zones.',
        'Dynamically allocate rescue resources and coordinate emergency response teams.',
        'Provide real-time situational awareness during active crisis situations.',
      ],
      requirements: [
        'Emergency incident detection and impact map visualizer.',
        'Resource allocation and rescue team dispatch routing engine.',
        'Situation room control dashboard with real-time incident feeds.',
      ],
      constraints: [
        'Low-latency response during peak simulated disaster events.',
        'Clear priority queuing for life-critical emergencies.',
      ],
      deliverables: [
        'AI Disaster Response Command System Prototype',
        'Real-Time Emergency Dispatcher & Situational Awareness Dashboard',
        'Source Code & Live Demonstration',
      ],
      status: 'Draft',
      accessToken: 'QR-006',
      qrCode: '/ps/QR-006',
    },
    {
      id: '7',
      title: 'AI Electricity Grid Commander',
      category: 'Energy',
      difficulty: 'Medium',
      description:
        'Develop an AI system that continuously monitors electricity grid performance, predicts equipment failures, balances energy demand and supply, integrates renewable energy sources, and reduces power outages.',
      objectives: [
        'Continuously monitor electricity grid performance and predict equipment failures.',
        'Balance energy demand and supply dynamically in real time.',
        'Seamlessly integrate renewable energy sources to reduce power outages.',
      ],
      requirements: [
        'Real-time grid frequency, voltage, and load monitoring module.',
        'Predictive maintenance engine for transformer and substation equipment.',
        'Renewable energy balancing simulator and blackout prevention alert system.',
      ],
      constraints: [
        'High precision load balance calculations.',
        'Instant notification on predicted grid instability.',
      ],
      deliverables: [
        'AI Electricity Grid Commander Prototype',
        'Energy Balancing & Predictive Maintenance Control Center',
        'Source Code & Live Demonstration',
      ],
      status: 'Draft',
      accessToken: 'QR-007',
      qrCode: '/ps/QR-007',
    },
    {
      id: '8',
      title: 'AI National Healthcare Operations Agent',
      category: 'Healthcare',
      difficulty: 'Medium',
      description:
        'Build an AI-powered healthcare operations platform capable of monitoring hospitals, predicting disease outbreaks, managing hospital resources such as beds, medicines, and staff, while assisting public health authorities in making informed decisions.',
      objectives: [
        'Monitor hospital network capacities and predict regional disease outbreaks.',
        'Manage and allocate essential hospital resources including beds, medicines, and medical staff.',
        'Assist public health authorities with informed, data-driven operational decisions.',
      ],
      requirements: [
        'Regional healthcare monitoring and bed capacity visualizer.',
        'Epidemic and disease outbreak prediction algorithm.',
        'Resource allocation dispatcher for medical personnel and supplies.',
      ],
      constraints: [
        'Compliance with medical data privacy and anonymization standards.',
        'Clear visual indicators for hospital overload thresholds.',
      ],
      deliverables: [
        'AI Healthcare Operations Platform Prototype',
        'Outbreak Prediction & Hospital Resource Allocation Control Board',
        'Source Code & Live Demonstration',
      ],
      status: 'Draft',
      accessToken: 'QR-008',
      qrCode: '/ps/QR-008',
    },
    {
      id: '9',
      title: 'AI Smart Irrigation Manager',
      category: 'Agriculture',
      difficulty: 'Medium',
      description:
        'Develop an intelligent irrigation management system that uses soil moisture data, weather forecasts, and crop requirements to automate irrigation schedules, conserve water resources, and improve crop health.',
      objectives: [
        'Ingest real-time soil moisture sensor data and weather forecast inputs.',
        'Automate optimal irrigation schedules tailored to crop-specific water requirements.',
        'Conserve water resources while maximizing overall crop health and yield.',
      ],
      requirements: [
        'Soil moisture and weather API integration engine.',
        'Automated irrigation schedule optimizer with water conservation metrics.',
        'Field irrigation management dashboard with manual override capabilities.',
      ],
      constraints: [
        'Efficient water usage optimization algorithms.',
        'Simple, robust UI for agricultural field operators.',
      ],
      deliverables: [
        'AI Smart Irrigation Manager Prototype',
        'Water Conservation & Irrigation Schedule Dashboard',
        'Source Code & Live Demonstration',
      ],
      status: 'Draft',
      accessToken: 'QR-009',
      qrCode: '/ps/QR-009',
    },
    {
      id: '10',
      title: 'AI Autonomous Planet Dashboard',
      category: 'Environment',
      difficulty: 'Medium',
      description:
        'Create a global AI dashboard capable of monitoring climate conditions, biodiversity, environmental changes, natural disasters, and critical infrastructure while predicting large-scale cascading environmental events using multiple real-time data sources.',
      objectives: [
        'Ingest multi-modal real-time climate, satellite, and environmental sensor streams.',
        'Monitor global climate conditions, biodiversity trends, and infrastructure health.',
        'Predict large-scale cascading environmental events and natural disaster risks.',
      ],
      requirements: [
        'Global environmental sensor map and climate tracker dashboard.',
        'Cascading risk prediction engine for cascading environmental disasters.',
        'Interactive multi-layer visualization suite for global metrics.',
      ],
      constraints: [
        'Ability to process high-dimensional environmental telemetry smoothly.',
        'Clear risk level categorization (Normal, Watch, Warning, Emergency).',
      ],
      deliverables: [
        'AI Autonomous Planet Dashboard Prototype',
        'Cascading Risk Prediction & Environmental Analytics Suite',
        'Source Code & Live Demonstration',
      ],
      status: 'Draft',
      accessToken: 'QR-010',
      qrCode: '/ps/QR-010',
    },
    {
      id: '11',
      title: 'AI Space Mission Control Agent',
      category: 'Space Technology',
      difficulty: 'Medium',
      description:
        'Develop an AI-powered mission control platform that continuously monitors spacecraft systems, predicts mission risks, detects anomalies, assists astronauts, optimizes mission planning, and provides intelligent operational support for space missions.',
      objectives: [
        'Continuously monitor spacecraft systems and detect operational telemetry anomalies.',
        'Predict mission risks and provide intelligent operational assistance for astronauts.',
        'Optimize mission planning, resource consumption, and space operations schedules.',
      ],
      requirements: [
        'Real-time spacecraft telemetry and system health monitoring UI.',
        'Telemetry anomaly detection and risk prediction engine.',
        'Astronaut assistant interface and mission planning schedule optimizer.',
      ],
      constraints: [
        'Sub-second anomaly warning generation for spacecraft critical systems.',
        'Mission-critical reliability and intuitive telemetry layout.',
      ],
      deliverables: [
        'AI Space Mission Control Platform Prototype',
        'Spacecraft Telemetry & Astronaut Decision Support Dashboard',
        'Source Code & Live Demonstration',
      ],
      status: 'Draft',
      accessToken: 'QR-011',
      qrCode: '/ps/QR-011',
    },
  ];

  const hasTrack = existingProbCols.includes('track');

  for (const p of officialProblems) {
    const existing = await dbGet<any>(`SELECT id FROM problems WHERE id = ?`, [p.id]);

    if (!existing) {
      if (hasTrack) {
        await dbRun(
          `INSERT INTO problems (id, title, description, objectives, requirements, constraints, deliverables, difficulty, category, track, qrCode, scanCount, status, accessToken, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'Draft', ?, ?, ?)`,
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
            p.category,
            p.qrCode,
            p.accessToken,
            now,
            now,
          ]
        );
      } else {
        await dbRun(
          `INSERT INTO problems (id, title, description, objectives, requirements, constraints, deliverables, difficulty, category, qrCode, scanCount, status, accessToken, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'Draft', ?, ?, ?)`,
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
            p.qrCode,
            p.accessToken,
            now,
            now,
          ]
        );
      }
    } else {
      if (hasTrack) {
        await dbRun(
          `UPDATE problems
           SET title = ?, description = ?, objectives = ?, requirements = ?, constraints = ?, deliverables = ?,
               difficulty = ?, category = ?, track = ?, accessToken = ?, qrCode = ?, updatedAt = ?
           WHERE id = ?`,
          [
            p.title,
            p.description,
            JSON.stringify(p.objectives),
            JSON.stringify(p.requirements),
            JSON.stringify(p.constraints),
            JSON.stringify(p.deliverables),
            p.difficulty,
            p.category,
            p.category,
            p.accessToken,
            p.qrCode,
            now,
            p.id,
          ]
        );
      } else {
        await dbRun(
          `UPDATE problems
           SET title = ?, description = ?, objectives = ?, requirements = ?, constraints = ?, deliverables = ?,
               difficulty = ?, category = ?, accessToken = ?, qrCode = ?, updatedAt = ?
           WHERE id = ?`,
          [
            p.title,
            p.description,
            JSON.stringify(p.objectives),
            JSON.stringify(p.requirements),
            JSON.stringify(p.constraints),
            JSON.stringify(p.deliverables),
            p.difficulty,
            p.category,
            p.accessToken,
            p.qrCode,
            now,
            p.id,
          ]
        );
      }
    }
  }

  // Cleanup any old non-official problem IDs
  await dbRun(`DELETE FROM problems WHERE id NOT IN ('1','2','3','4','5','6','7','8','9','10','11')`);
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
