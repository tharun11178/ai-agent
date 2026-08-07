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
      title: 'AI College Admission & Scholarship Navigator',
      category: 'Education & Admissions',
      difficulty: 'Medium',
      description:
        'Design an intelligent AI-powered agent system that guides prospective students through higher education selection, admission eligibility evaluation, and financial scholarship discovery. The solution should personalize college recommendations based on academic profiles, analyze financial aid criteria, automate application tracking, and provide clear step-by-step guidance.',
      objectives: [
        'Evaluate student academic profiles, test scores, and career aspirations to recommend matching colleges and programs.',
        'Automatically identify relevant government and private scholarship opportunities based on eligibility criteria.',
        'Track application deadlines, document requirements, and provide step-by-step guidance for student admissions.',
      ],
      requirements: [
        'Multi-criteria college recommendation engine evaluating academic records, preferences, and budgets.',
        'Scholarship matching module with automated eligibility validation and deadline alerts.',
        'Interactive student dashboard for tracking application status and required documentation.',
      ],
      constraints: [
        'Recommendations must complete processing within sub-2-second latency.',
        'Maintain data privacy for student records and financial information.',
      ],
      deliverables: [
        'Functional AI College Admission & Scholarship Navigator Prototype',
        'Recommendation & Scholarship Matching Dashboard',
        'Source Code Repository & System Architecture Documentation',
      ],
      status: 'Draft',
      accessToken: 'QR-001',
      qrCode: '/ps/QR-001',
    },
    {
      id: '2',
      title: 'AI Autonomous Agriculture Commander',
      category: 'Agriculture & Smart Farming',
      difficulty: 'Medium',
      description:
        'Develop an autonomous AI command center for modern precision agriculture that processes real-time sensor streams, satellite imagery, soil telemetry, and weather forecasts to optimize crop yields, detect diseases, manage automated irrigation, and direct robotic farming machinery.',
      objectives: [
        'Process real-time sensor data, weather patterns, and satellite imagery to generate micro-climate crop advisories.',
        'Detect plant diseases and pest infestations early using computer vision models.',
        'Automate precision irrigation and fertilizer scheduling to maximize yield and conserve resources.',
      ],
      requirements: [
        'Real-time soil telemetry and satellite imagery analysis engine.',
        'Computer vision plant health and disease diagnostic module.',
        'Autonomous irrigation and equipment command dashboard.',
      ],
      constraints: [
        'Must process multi-spectral imagery and field sensor data with sub-2-second response.',
        'Intuitive visualization suitable for field operators and agricultural commanders.',
      ],
      deliverables: [
        'AI Autonomous Agriculture Commander System Prototype',
        'Crop Health & Resource Optimization Dashboard',
        'Source Code & Live Demonstration',
      ],
      status: 'Draft',
      accessToken: 'QR-002',
      qrCode: '/ps/QR-002',
    },
    {
      id: '3',
      title: 'AI Healthcare Intelligence Commander',
      category: 'Healthcare & Medical Intelligence',
      difficulty: 'Medium',
      description:
        'Build an enterprise AI healthcare intelligence platform that monitors patient vital streams, predicts hospital resource utilization, assists clinical decision-making, detects disease outbreak trends, and optimizes emergency room triage operations.',
      objectives: [
        'Monitor hospital network capacities and predict regional patient surge events and resource shortages.',
        'Analyze patient telemetry to flag critical deteriorations and assist medical staff in rapid triage.',
        'Optimize staff scheduling, ICU bed allocations, and medical equipment distribution.',
      ],
      requirements: [
        'Hospital telemetry and ICU capacity prediction dashboard.',
        'Clinical risk stratification and automated emergency triage module.',
        'Epidemiological trend analyzer for regional healthcare planning.',
      ],
      constraints: [
        'Strict compliance with medical data privacy and anonymization standards.',
        'High availability with sub-second alert latency for critical patient status warnings.',
      ],
      deliverables: [
        'AI Healthcare Intelligence Commander Prototype',
        'Clinical Triage & Hospital Capacity Operations Board',
        'Source Code Repository & System Documentation',
      ],
      status: 'Draft',
      accessToken: 'QR-003',
      qrCode: '/ps/QR-003',
    },
    {
      id: '4',
      title: 'AI City Operations Agent',
      category: 'Smart City & Urban Operations',
      difficulty: 'Medium',
      description:
        'Design an autonomous AI agent for smart city management that monitors urban infrastructure, traffic flow, waste management grids, public utilities, and emergency services to optimize municipal resource dispatching and urban livability.',
      objectives: [
        'Monitor urban traffic patterns, public transit, waste collection, and water grids in real time.',
        'Utilize predictive analytics to optimize municipal service routes and reduce municipal energy consumption.',
        'Automate incident triage and coordinate rapid multi-agency emergency response dispatches.',
      ],
      requirements: [
        'Real-time urban telemetry map and municipal operations command center dashboard.',
        'Traffic signal optimization and public service routing engine.',
        'Automated emergency incident detector and multi-agency dispatcher.',
      ],
      constraints: [
        'High system availability handling multi-domain city telemetry seamlessly.',
        'Clear priority tiers for public safety incidents.',
      ],
      deliverables: [
        'AI Smart City Operations Agent Prototype',
        'Predictive Municipal Operations & Emergency Dispatch Board',
        'Source Code & Live Demonstration',
      ],
      status: 'Draft',
      accessToken: 'QR-004',
      qrCode: '/ps/QR-004',
    },
    {
      id: '5',
      title: 'AI Disaster Response Commander',
      category: 'Disaster Management & Emergency Response',
      difficulty: 'Medium',
      description:
        'Create an AI disaster response command system that detects environmental hazards, predicts disaster impact zones, optimizes rescue team dispatches, routes emergency aid supplies, and provides real-time situational awareness during crisis events.',
      objectives: [
        'Ingest satellite feeds, drone telemetry, and weather data to predict disaster escalation paths.',
        'Dynamically route rescue teams and allocate emergency medical and shelter supplies.',
        'Provide real-time operational maps and situational awareness for first responders.',
      ],
      requirements: [
        'Real-time hazard detection map and casualty/damage prediction engine.',
        'Dynamic routing and rescue team dispatcher for disaster response logistics.',
        'Central situation room control dashboard with live incident telemetry feeds.',
      ],
      constraints: [
        'Sub-second notification for critical life-safety emergency updates.',
        'High resilience during simulated network bandwidth constraints.',
      ],
      deliverables: [
        'AI Disaster Response Commander Platform Prototype',
        'Rescue Dispatcher & Live Crisis Situational Awareness Dashboard',
        'Source Code & Live Demonstration',
      ],
      status: 'Draft',
      accessToken: 'QR-005',
      qrCode: '/ps/QR-005',
    },
    {
      id: '6',
      title: 'AI Logistics Intelligence Commander',
      category: 'Logistics & Supply Chain',
      difficulty: 'Medium',
      description:
        'Build an AI logistics command system that dynamically optimizes multi-modal freight routing, predicts supply chain bottlenecks, automates warehouse inventory dispatch, and monitors vehicle telemetry to lower operational costs and delivery times.',
      objectives: [
        'Dynamically optimize fleet routing and freight schedules using real-time weather and traffic telemetry.',
        'Predict supply chain disruptions, port delays, and warehouse bottlenecks before impact.',
        'Monitor vehicle telemetry to optimize fuel consumption and enable predictive vehicle maintenance.',
      ],
      requirements: [
        'Multi-modal route optimization engine with dynamic re-routing capabilities.',
        'Supply chain risk prediction and warehouse inventory flow dashboard.',
        'Telemetry monitoring module for driver safety and vehicle maintenance alerts.',
      ],
      constraints: [
        'Real-time route calculation with sub-2-second latency.',
        'Scalable architecture supporting large multi-vehicle logistics networks.',
      ],
      deliverables: [
        'AI Logistics Intelligence Commander Prototype',
        'Route Optimization & Predictive Supply Chain Dashboard',
        'Source Code & Live Demonstration',
      ],
      status: 'Draft',
      accessToken: 'QR-006',
      qrCode: '/ps/QR-006',
    },
    {
      id: '7',
      title: 'AI Cyber Defence Commander',
      category: 'Cybersecurity & Code Analysis',
      difficulty: 'Medium',
      description:
        'Develop an autonomous AI cyber defense agent that continuously monitors network traffic, detects zero-day threat patterns, automates incident response containment, and inspects software repositories for hidden vulnerabilities.',
      objectives: [
        'Continuously analyze network traffic and system log streams to detect zero-day cyber threats and intrusions.',
        'Automate threat isolation, firewall rule updates, and security incident mitigation.',
        'Perform automated code analysis to detect vulnerabilities in CI/CD software pipelines.',
      ],
      requirements: [
        'Threat detection engine with real-time log anomaly visualization.',
        'Automated incident playbook execution and network isolation module.',
        'Static and dynamic code security auditing agent.',
      ],
      constraints: [
        'Ultra-low latency anomaly detection to prevent breach progression.',
        'Zero false positives on critical business system operations.',
      ],
      deliverables: [
        'AI Cyber Defence Commander Platform Prototype',
        'Threat Detection & Vulnerability Analysis Control Board',
        'Source Code & Live Demonstration',
      ],
      status: 'Draft',
      accessToken: 'QR-007',
      qrCode: '/ps/QR-007',
    },
    {
      id: '8',
      title: 'AI Space Mission Control Agent',
      category: 'Space Technology & Autonomous Systems',
      difficulty: 'Medium',
      description:
        'Develop an AI-powered space mission control platform that continuously monitors spacecraft telemetry, detects orbital anomalies, optimizes mission trajectories, assists astronaut life support systems, and automates space operations.',
      objectives: [
        'Monitor spacecraft sensor streams to detect hardware anomalies and orbital deviations.',
        'Assist astronauts with intelligent automated diagnostics and voice/text decision support.',
        'Optimize mission trajectories, power consumption, and communication downlink schedules.',
      ],
      requirements: [
        'Real-time spacecraft telemetry and system health visualizer.',
        'Telemetry anomaly detection and orbital trajectory calculation engine.',
        'Crew decision support interface with mission planning schedule optimizer.',
      ],
      constraints: [
        'Mission-critical reliability with instant system failure alerts.',
        'Clean, high-contrast operational dashboard interface suitable for control rooms.',
      ],
      deliverables: [
        'AI Space Mission Control Agent Prototype',
        'Spacecraft Telemetry & Astronaut Decision Support Dashboard',
        'Source Code & Live Demonstration',
      ],
      status: 'Draft',
      accessToken: 'QR-008',
      qrCode: '/ps/QR-008',
    },
    {
      id: '9',
      title: 'AI Tourism & Travel Planner',
      category: 'Tourism & Smart Travel',
      difficulty: 'Medium',
      description:
        'Create an AI-driven personal travel and tourism concierge that generates dynamic hyper-personalized travel itineraries, monitors real-time transit and weather conditions, adjusts plans on-the-fly, and optimizes travel budgets for tourists.',
      objectives: [
        'Generate customized travel itineraries based on traveler preferences, budget, and time constraints.',
        'Dynamically re-route itineraries in real time based on weather, flight delays, and local event crowd density.',
        'Recommend local cultural experiences, dining options, and optimized transportation options.',
      ],
      requirements: [
        'Interactive multi-day travel itinerary generator with budget breakdown.',
        'Dynamic real-time adjustment engine reacting to flight updates and weather disruptions.',
        'Local experience recommendation and route map visualizer.',
      ],
      constraints: [
        'Fast response generation (under 2 seconds) for itinerary updates.',
        'User-friendly mobile interface for on-the-go travelers.',
      ],
      deliverables: [
        'AI Tourism & Travel Planner System Prototype',
        'Dynamic Itinerary Generator & Travel Companion Interface',
        'Source Code & Live Demonstration',
      ],
      status: 'Draft',
      accessToken: 'QR-009',
      qrCode: '/ps/QR-009',
    },
    {
      id: '10',
      title: 'AI Career Guidance Agent',
      category: 'Education & Career Guidance',
      difficulty: 'Medium',
      description:
        'Build an intelligent AI career navigation platform that analyzes job market skill demands, evaluates user skill profiles, generates personalized upskilling roadmaps, matches candidates with emerging opportunities, and conducts simulated interviews.',
      objectives: [
        'Analyze resume profiles, technical skills, and career goals to identify skill gaps.',
        'Generate step-by-step personalized learning roadmaps aligned with real-time job market trends.',
        'Provide interactive AI mock interview practice with instant actionable performance feedback.',
      ],
      requirements: [
        'Skill gap analysis engine comparing user profiles with live industry hiring metrics.',
        'Personalized learning path and career milestone tracker.',
        'Interactive mock interview module with real-time feedback scoring.',
      ],
      constraints: [
        'Accurate, data-backed skill gap insights.',
        'Intuitive user experience encouraging long-term career growth.',
      ],
      deliverables: [
        'AI Career Guidance Agent System Prototype',
        'Career Roadmap & Skill Analytics Dashboard',
        'Source Code & Live Demonstration',
      ],
      status: 'Draft',
      accessToken: 'QR-010',
      qrCode: '/ps/QR-010',
    },
    {
      id: '11',
      title: 'AI Smart Energy Grid Commander',
      category: 'Energy & Smart Grid',
      difficulty: 'Medium',
      description:
        'Develop an AI-powered smart energy grid commander that continuously monitors electricity generation and load demand, predicts equipment failures, integrates renewable power sources, and prevents regional blackout events.',
      objectives: [
        'Continuously monitor grid load, voltage, and frequency to balance energy supply and demand.',
        'Predict transformer and substation equipment failures before blackout risks occur.',
        'Dynamically balance renewable solar and wind energy inputs into the main distribution grid.',
      ],
      requirements: [
        'Real-time grid frequency, load, and voltage monitoring control board.',
        'Predictive maintenance engine for electrical power infrastructure.',
        'Renewable energy balancing simulator and automated blackout prevention trigger.',
      ],
      constraints: [
        'High precision energy calculation models.',
        'Instant notification on grid instability or overload detection.',
      ],
      deliverables: [
        'AI Smart Energy Grid Commander Prototype',
        'Energy Balancing & Grid Stability Control Center',
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
