import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";

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

import os from "node:os";

function getWritableDataDir(): string {
  try {
    const cwdData = path.resolve(process.cwd(), "data");
    if (!fs.existsSync(cwdData)) {
      fs.mkdirSync(cwdData, { recursive: true });
    }
    const testFile = path.join(cwdData, ".write-test");
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    return cwdData;
  } catch {
    const tmpData = path.join(os.tmpdir(), "ai-agent-data");
    if (!fs.existsSync(tmpData)) {
      fs.mkdirSync(tmpData, { recursive: true });
    }
    return tmpData;
  }
}

function getSessionsFile(): string {
  return path.join(getWritableDataDir(), "admin-sessions.json");
}

function getProblemsFile(): string {
  return path.join(getWritableDataDir(), "problems.json");
}

// Default Admin Credentials
const ADMIN_CREDENTIALS = {
  username: "admin",
  email: "aitheronmlsymposium@gmail.com",
  password: "isagi1117", // Secure admin password
};

function ensureAdminDataExists(): void {
  const sessionsFile = getSessionsFile();
  const problemsFile = getProblemsFile();

  if (!fs.existsSync(sessionsFile)) {
    fs.writeFileSync(sessionsFile, JSON.stringify([], null, 2), "utf-8");
  }
  if (!fs.existsSync(problemsFile)) {
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
    fs.writeFileSync(problemsFile, JSON.stringify(defaultProblems, null, 2), "utf-8");
  }
}

function getSessions(): string[] {
  ensureAdminDataExists();
  try {
    const raw = fs.readFileSync(getSessionsFile(), "utf-8");
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function saveSessions(sessions: string[]): void {
  ensureAdminDataExists();
  fs.writeFileSync(getSessionsFile(), JSON.stringify(sessions, null, 2), "utf-8");
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
    const raw = fs.readFileSync(getProblemsFile(), "utf-8");
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
  fs.writeFileSync(getProblemsFile(), JSON.stringify(problems, null, 2), "utf-8");
  return newProblem;
}

export function toggleReleaseProblemsStore(token: string, released: boolean): { released: boolean } {
  if (!verifyAdminToken(token)) {
    throw new Error("403: Forbidden - Admin authentication required");
  }
  ensureAdminDataExists();

  const problems = getProblemsStore(token);
  const updated = problems.map((p) => ({ ...p, released }));
  fs.writeFileSync(getProblemsFile(), JSON.stringify(updated, null, 2), "utf-8");
  return { released };
}

export function getAdminAnalyticsStore(token: string) {
  if (!verifyAdminToken(token)) {
    throw new Error("403: Forbidden - Admin authentication required");
  }

  const problems = getProblemsStore(token);

  return {
    totalTeams: 0,
    totalParticipants: 0,
    collegesRepresented: 0,
    totalProblems: problems.length,
    problemsReleased: problems.some((p) => p.released),
    lastRegistration: null,
  };
}

export function getPublicProblemStatements(): { released: boolean; problems?: ProblemStatement[]; message?: string } {
  ensureAdminDataExists();
  try {
    const raw = fs.readFileSync(getProblemsFile(), "utf-8");
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
