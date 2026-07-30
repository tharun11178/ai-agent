import { Router, Request, Response } from 'express';
import { dbGet, dbRun, logAdminActivity } from '../db/database';
import { publicApiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Helper to extract clean token from URL or raw string
function extractToken(rawInput: string): string {
  if (!rawInput) return '';
  let cleaned = rawInput.trim();
  
  // If full URL passed (e.g. https://domain.com/problem-statement?token=qr-xxx)
  if (cleaned.includes('token=')) {
    try {
      const url = new URL(cleaned);
      const paramToken = url.searchParams.get('token');
      if (paramToken) return paramToken.trim();
    } catch {
      const match = cleaned.match(/token=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) return match[1].trim();
    }
  }

  // If JSON payload string passed
  if (cleaned.startsWith('{')) {
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed.token) return String(parsed.token).trim();
      if (parsed.qrToken) return String(parsed.qrToken).trim();
    } catch {}
  }

  return cleaned;
}

// 1. Validate Scanned QR Code Token (Step 1 of Scanner)
router.post('/validate-qr', publicApiLimiter, async (req: Request, res: Response) => {
  const { qrData } = req.body || {};
  const token = extractToken(qrData);

  if (!token) {
    res.status(400).json({
      valid: false,
      error: 'Invalid QR Code. Please scan a valid team problem statement QR code.',
    });
    return;
  }

  try {
    const team = await dbGet<{
      id: string;
      teamName: string;
      assignedProblemId: string | null;
      qrAccessEnabled: number;
      problemReleased: number;
    }>(
      `SELECT id, teamName, assignedProblemId, qrAccessEnabled, problemReleased FROM teams WHERE qrToken = ?`,
      [token]
    );

    if (!team) {
      res.status(404).json({
        valid: false,
        error: 'QR Code not recognized or expired. Please check with event organizers.',
      });
      return;
    }

    if (team.qrAccessEnabled !== 1) {
      res.status(403).json({
        valid: false,
        error: '🔒 QR Code access for this team is currently disabled by organizers.',
      });
      return;
    }

    // Check if global release or individual release is active
    const globalReleased = await dbGet<{ id: string }>(`SELECT id FROM problems WHERE released = 1 LIMIT 1`);
    const isReleased = Boolean(globalReleased) || team.problemReleased === 1;

    if (!isReleased) {
      res.status(403).json({
        valid: false,
        error: '🔒 Problem Statements are currently locked. Please wait for the organizers to release problem statements.',
      });
      return;
    }

    if (!team.assignedProblemId) {
      res.status(400).json({
        valid: false,
        error: 'No problem statement has been assigned to your team yet. Please contact event organizers.',
      });
      return;
    }

    res.json({
      valid: true,
      token,
      teamIdHint: team.id,
      teamName: team.teamName,
      message: `QR code verified for Team "${team.teamName}". Please verify your team credentials to view your assigned problem statement.`,
    });
  } catch (err: any) {
    res.status(500).json({
      valid: false,
      error: 'Server error while validating QR code.',
    });
  }
});

// 2. Verify Team Identity & Access Problem Statement (Step 2 of Scanner)
router.post('/verify-access', publicApiLimiter, async (req: Request, res: Response) => {
  const { qrToken, teamIdentifier, secretCode } = req.body || {};
  const token = extractToken(qrToken);

  if (!token || (!teamIdentifier && !secretCode)) {
    res.status(400).json({
      success: false,
      error: 'Both QR token and team authentication credentials (Team ID/Name or Secret Code) are required.',
    });
    return;
  }

  try {
    const team = await dbGet<{
      id: string;
      teamName: string;
      leaderName: string;
      leaderEmail: string;
      phone: string;
      college: string;
      member2: string | null;
      assignedProblemId: string | null;
      secretCode: string | null;
      qrAccessEnabled: number;
      problemReleased: number;
      scannedAt: string | null;
      scanCount: number;
    }>(
      `SELECT * FROM teams WHERE qrToken = ?`,
      [token]
    );

    if (!team) {
      res.status(404).json({
        success: false,
        error: 'Invalid or expired QR code token.',
      });
      return;
    }

    // Verify Team Authentication: matches Team ID OR Team Name OR Registration ID OR Secret Code
    const inputId = (teamIdentifier || '').trim().toLowerCase();
    const inputSecret = (secretCode || '').trim().toUpperCase();

    const matchesTeamId = inputId && (team.id.toLowerCase() === inputId || team.id.toLowerCase().endsWith(inputId));
    const matchesTeamName = inputId && team.teamName.toLowerCase() === inputId;
    const matchesSecretCode = inputSecret && (team.secretCode?.toUpperCase() === inputSecret || team.phone.slice(-4) === inputSecret);

    if (!matchesTeamId && !matchesTeamName && !matchesSecretCode) {
      res.status(401).json({
        success: false,
        error: 'Team authentication failed. Mismatched Team ID, Team Name, or Secret Code.',
      });
      return;
    }

    if (team.qrAccessEnabled !== 1) {
      res.status(403).json({
        success: false,
        error: '🔒 QR Code access for this team is currently disabled by organizers.',
      });
      return;
    }

    // Check release status
    const globalReleased = await dbGet<{ id: string }>(`SELECT id FROM problems WHERE released = 1 LIMIT 1`);
    const isReleased = Boolean(globalReleased) || team.problemReleased === 1;

    if (!isReleased) {
      res.status(403).json({
        success: false,
        error: '🔒 Problem statements are locked by organizers.',
      });
      return;
    }

    if (!team.assignedProblemId) {
      res.status(404).json({
        success: false,
        error: 'No problem statement is assigned to your team yet.',
      });
      return;
    }

    // Fetch assigned problem statement
    const problem = await dbGet<{
      id: string;
      title: string;
      track: string;
      description: string;
      fileUrl: string | null;
      fileType: string | null;
    }>(
      `SELECT id, title, track, description, fileUrl, fileType FROM problems WHERE id = ?`,
      [team.assignedProblemId]
    );

    if (!problem) {
      res.status(404).json({
        success: false,
        error: 'Assigned problem statement not found.',
      });
      return;
    }

    // Record scan timestamp and increment scan count
    const scannedAt = new Date().toISOString();
    const newScanCount = (team.scanCount || 0) + 1;

    await dbRun(
      `UPDATE teams SET scannedAt = ?, scanCount = ? WHERE id = ?`,
      [scannedAt, newScanCount, team.id]
    );

    await logAdminActivity(
      'SYSTEM',
      'PROBLEM_QR_SCANNED',
      `Team '${team.teamName}' (ID: ${team.id}) scanned QR code and accessed problem '${problem.title}' (Scan #${newScanCount})`
    );

    res.json({
      success: true,
      scannedAt,
      scanCount: newScanCount,
      team: {
        id: team.id,
        teamName: team.teamName,
        leaderName: team.leaderName,
        college: team.college,
        member2: team.member2,
      },
      problem,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to process QR code problem access.',
    });
  }
});

// Legacy / Direct endpoint for global problem check fallback
router.get('/', publicApiLimiter, async (req: Request, res: Response) => {
  try {
    const releasedProblem = await dbGet<{ id: string; releasedAt: string }>(
      `SELECT id, releasedAt FROM problems WHERE released = 1 LIMIT 1`
    );

    res.json({
      released: Boolean(releasedProblem),
      message: releasedProblem
        ? 'Problem statements released.'
        : '🔒 Problem statements require QR Code scanning for access.',
    });
  } catch {
    res.status(500).json({ released: false, error: 'Status check failed.' });
  }
});

export default router;
