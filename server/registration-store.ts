import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { nanoid } from "nanoid";

export interface Registration {
  id: string;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  phone: string;
  college: string;
  department?: string;
  year?: string;
  member2?: string;
  createdAt: string;
}

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

function getDataFile(): string {
  const dataDir = getWritableDataDir();
  return path.join(dataDir, "registrations.json");
}

function ensureStoreExists(): void {
  const dataFile = getDataFile();
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([], null, 2), "utf-8");
  }
}

export function getRegistrations(): Registration[] {
  ensureStoreExists();
  try {
    const raw = fs.readFileSync(getDataFile(), "utf-8");
    return JSON.parse(raw) as Registration[];
  } catch {
    return [];
  }
}

export function addRegistration(
  data: Partial<Registration>
): { success: true; registration: Registration } | { success: false; error: string } {
  ensureStoreExists();

  const teamName = data.teamName?.trim();
  const leaderName = data.leaderName?.trim();
  const leaderEmail = data.leaderEmail?.trim();
  const phone = data.phone?.trim();
  const college = data.college?.trim();

  if (!teamName || !leaderName || !leaderEmail || !phone || !college) {
    return {
      success: false,
      error: "Missing required fields. Team name, leader name, email, phone, and college are required.",
    };
  }

  const registrations = getRegistrations();

  const duplicate = registrations.some(
    (reg) => reg.leaderEmail.toLowerCase() === leaderEmail.toLowerCase()
  );

  if (duplicate) {
    return {
      success: false,
      error: "A team with this leader email address is already registered.",
    };
  }

  const newRegistration: Registration = {
    id: nanoid(),
    teamName,
    leaderName,
    leaderEmail,
    phone,
    college,
    department: data.department?.trim() || "",
    year: data.year?.trim() || "",
    member2: data.member2?.trim() || "",
    createdAt: new Date().toISOString(),
  };

  registrations.push(newRegistration);
  fs.writeFileSync(getDataFile(), JSON.stringify(registrations, null, 2), "utf-8");

  return {
    success: true,
    registration: newRegistration,
  };
}
