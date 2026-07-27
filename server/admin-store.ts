import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { getRegistrations } from "./registration-store";

export interface ProblemStatement {
  id: string;
  title: string;
  track: string;
  description: string;
  released: boolean;
  assignedTeamId?: string;
  createdAt: string;
}

export interface AdminUser {
  username: string;
  email: string;
  role: "admin" | "judge";
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const SESSIONS_FILE = path.join(DATA_DIR, "admin-sessions.json");
const PROBLEMS_FILE = path.join(DATA_DIR, "problems.json");

// Default Admin Credentials
const ADMIN_CREDENTIALS = {
  username: "admin",
  email: "aitheronmlsymposium@gmail.com",
  password: "isagi1117", // Secure admin password
};

function ensureAdminDataExists(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
  if (!fs.existsSync(PROBLEMS_FILE)) {
    const defaultProblems: ProblemStatement[] = [
      {
        id: "prob-1",
        title: "Autonomous Logistics Routing Agent",
        track: "AI Agents & Autonomous Systems",
        description: "Design an intelligent agent that dynamically re-routes delivery fleets in real time during supply chain disruptions.",
        released: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "prob-2",
        title: "Real-Time Code Vulnerability Detection Agent",
        track: "Cybersecurity & Code Analysis",
        description: "Build an LLM-powered code review agent capable of catching zero-day vulnerabilities in pull requests before deployment.",
        released: false,
        createdAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(PROBLEMS_FILE, JSON.stringify(defaultProblems, null, 2), "utf-8");
  }
}

function getSessions(): string[] {
  ensureAdminDataExists();
  try {
    const raw = fs.readFileSync(SESSIONS_FILE, "utf-8");
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function saveSessions(sessions: string[]): void {
  ensureAdminDataExists();
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), "utf-8");
}

export function adminLogin(
  identifier: string,
  pass: string
): { success: true; token: string; user: AdminUser } | { success: false; error: string } {
  ensureAdminDataExists();

  const id = identifier.trim().toLowerCase();
  if (
    (id === ADMIN_CREDENTIALS.username || id === ADMIN_CREDENTIALS.email) &&
    pass === ADMIN_CREDENTIALS.password
  ) {
    const token = `admin-token-${nanoid(24)}`;
    const sessions = getSessions();
    sessions.push(token);
    saveSessions(sessions);
    return {
      success: true,
      token,
      user: {
        username: ADMIN_CREDENTIALS.username,
        email: ADMIN_CREDENTIALS.email,
        role: "admin",
      },
    };
  }

  return {
    success: false,
    error: "Invalid username/email or password.",
  };
}

export function verifyAdminToken(token?: string): boolean {
  if (!token) return false;
  const sessions = getSessions();
  return sessions.includes(token);
}

export function getProblemsStore(token?: string): ProblemStatement[] {
  if (!verifyAdminToken(token)) {
    throw new Error("403: Forbidden - Admin authentication required");
  }
  ensureAdminDataExists();
  try {
    const raw = fs.readFileSync(PROBLEMS_FILE, "utf-8");
    return JSON.parse(raw) as ProblemStatement[];
  } catch {
    return [];
  }
}

export function createProblemStore(
  token: string,
  problem: { title: string; track?: string; description: string }
): ProblemStatement {
  if (!verifyAdminToken(token)) {
    throw new Error("403: Forbidden - Admin authentication required");
  }
  ensureAdminDataExists();

  const problems = getProblemsStore(token);
  const newProblem: ProblemStatement = {
    id: `prob-${nanoid(6)}`,
    title: problem.title.trim(),
    track: problem.track?.trim() || "General AI",
    description: problem.description.trim(),
    released: false,
    createdAt: new Date().toISOString(),
  };

  problems.push(newProblem);
  fs.writeFileSync(PROBLEMS_FILE, JSON.stringify(problems, null, 2), "utf-8");
  return newProblem;
}

export function toggleReleaseProblemsStore(token: string, released: boolean): { released: boolean } {
  if (!verifyAdminToken(token)) {
    throw new Error("403: Forbidden - Admin authentication required");
  }
  ensureAdminDataExists();

  const problems = getProblemsStore(token);
  const updated = problems.map((p) => ({ ...p, released }));
  fs.writeFileSync(PROBLEMS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  return { released };
}

export function getAdminAnalyticsStore(token: string) {
  if (!verifyAdminToken(token)) {
    throw new Error("403: Forbidden - Admin authentication required");
  }

  const registrations = getRegistrations();
  const problems = getProblemsStore(token);

  const collegesCount = new Set(registrations.map((r) => r.college.toLowerCase())).size;
  const totalParticipants = registrations.reduce(
    (acc, reg) => acc + (reg.member2 ? 2 : 1),
    0
  );

  return {
    totalTeams: registrations.length,
    totalParticipants,
    collegesRepresented: collegesCount,
    totalProblems: problems.length,
    problemsReleased: problems.some((p) => p.released),
    lastRegistration: registrations.length > 0 ? registrations[registrations.length - 1].createdAt : null,
  };
}

export function getPublicProblemStatements(): { released: boolean; problems?: ProblemStatement[]; message?: string } {
  ensureAdminDataExists();
  try {
    const raw = fs.readFileSync(PROBLEMS_FILE, "utf-8");
    const problems = JSON.parse(raw) as ProblemStatement[];
    const isReleased = problems.some((p) => p.released);

    if (!isReleased) {
      return {
        released: false,
        message: "Problem statements are locked by event organizers until August 8, 2026 at 11:00 AM IST.",
      };
    }

    return {
      released: true,
      problems,
    };
  } catch {
    return {
      released: false,
      message: "Problem statements are locked.",
    };
  }
}
