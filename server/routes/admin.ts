import { Router, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { dbAll, dbGet, dbRun, logAdminActivity } from '../db/database';
import { verifyAdminJwtMiddleware } from '../middleware/auth';

const router = Router();

// Apply JWT Authentication Middleware to ALL Admin routes!
router.use(verifyAdminJwtMiddleware);

// GET Registrations
router.get('/registrations', async (_req: Request, res: Response) => {
  try {
    const registrations = await dbAll(`SELECT * FROM teams ORDER BY createdAt DESC`);
    res.json({ success: true, registrations });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch registrations.' });
  }
});

// DELETE Registration
router.delete('/registrations/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminUser = (req as any).adminUser?.username || 'admin';

  try {
    const team = await dbGet<{ teamName: string }>(`SELECT teamName FROM teams WHERE id = ?`, [id]);
    if (!team) {
      res.status(404).json({ success: false, error: 'Registration not found.' });
      return;
    }

    await dbRun(`DELETE FROM teams WHERE id = ?`, [id]);
    await logAdminActivity(adminUser, 'REGISTRATION_DELETED', `Deleted team registration '${team.teamName}' (ID: ${id})`);

    res.json({ success: true, message: `Team registration '${team.teamName}' deleted successfully.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to delete registration.' });
  }
});

// GET Problems (All)
router.get('/problems', async (_req: Request, res: Response) => {
  try {
    const problems = await dbAll(`SELECT * FROM problems ORDER BY createdAt DESC`);
    const formatted = problems.map((p) => ({ ...p, released: Boolean(p.released) }));
    res.json({ success: true, problems: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch problem statements.' });
  }
});

// POST Upload / Create Problem Statement
router.post('/problems/upload', async (req: Request, res: Response) => {
  const adminUser = (req as any).adminUser?.username || 'admin';
  const { title, track, description, fileUrl, fileType } = req.body || {};

  if (!title || !description) {
    res.status(400).json({ success: false, error: 'Title and description are required.' });
    return;
  }

  try {
    const id = `prob-${nanoid(8)}`;
    const createdAt = new Date().toISOString();
    const cleanTrack = track?.trim() || 'General AI';

    await dbRun(
      `INSERT INTO problems (id, title, track, description, fileUrl, fileType, released, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      [id, title.trim(), cleanTrack, description.trim(), fileUrl || null, fileType || null, createdAt]
    );

    const newProblem = await dbGet(`SELECT * FROM problems WHERE id = ?`, [id]);
    await logAdminActivity(adminUser, 'PROBLEM_UPLOADED', `Uploaded new problem statement '${title.trim()}' (${cleanTrack})`);

    res.status(201).json({
      success: true,
      problem: { ...newProblem, released: false },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to upload problem statement.' });
  }
});

// DELETE Problem Statement
router.delete('/problems/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminUser = (req as any).adminUser?.username || 'admin';

  try {
    const prob = await dbGet<{ title: string }>(`SELECT title FROM problems WHERE id = ?`, [id]);
    if (!prob) {
      res.status(404).json({ success: false, error: 'Problem statement not found.' });
      return;
    }

    await dbRun(`DELETE FROM problems WHERE id = ?`, [id]);
    await logAdminActivity(adminUser, 'PROBLEM_DELETED', `Deleted problem statement '${prob.title}' (ID: ${id})`);

    res.json({ success: true, message: 'Problem statement deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to delete problem statement.' });
  }
});

// POST Release / Lock Problem Statements (One-click)
router.post('/problems/release', async (req: Request, res: Response) => {
  const adminUser = (req as any).adminUser?.username || 'admin';
  const { released } = req.body || {};
  const isReleased = Boolean(released);
  const releasedAt = isReleased ? new Date().toISOString() : null;

  try {
    await dbRun(`UPDATE problems SET released = ?, releasedAt = ?`, [isReleased ? 1 : 0, releasedAt]);

    const action = isReleased ? 'PROBLEMS_RELEASED' : 'PROBLEMS_LOCKED';
    const detail = isReleased
      ? 'Released all problem statements to participants'
      : 'Locked all problem statements';

    await logAdminActivity(adminUser, action, detail);

    res.json({
      success: true,
      released: isReleased,
      releasedAt,
      message: isReleased ? 'All problem statements are now live and released!' : 'Problem statements locked.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update problem release status.' });
  }
});

// POST Assign Problem to Team
router.post('/problems/assign', async (req: Request, res: Response) => {
  const adminUser = (req as any).adminUser?.username || 'admin';
  const { teamId, problemId } = req.body || {};

  if (!teamId || !problemId) {
    res.status(400).json({ success: false, error: 'Team ID and Problem ID are required.' });
    return;
  }

  try {
    await dbRun(`UPDATE teams SET assignedProblemId = ? WHERE id = ?`, [problemId, teamId]);
    await logAdminActivity(adminUser, 'PROBLEM_ASSIGNED', `Assigned problem '${problemId}' to team '${teamId}'`);

    res.json({ success: true, message: 'Problem assigned to team successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to assign problem to team.' });
  }
});

// GET Admin Analytics & Overview
router.get('/analytics', async (_req: Request, res: Response) => {
  try {
    const maxTeamsConfig = await dbGet<{ value: string }>(`SELECT value FROM event_config WHERE key = 'MAX_TEAMS'`);
    const regOpenConfig = await dbGet<{ value: string }>(`SELECT value FROM event_config WHERE key = 'registrationOpen'`);
    const teams = await dbAll(`SELECT college, member2, createdAt FROM teams`);
    const problems = await dbAll(`SELECT released FROM problems`);

    const maxTeams = parseInt(maxTeamsConfig?.value || '40', 10);
    const registrationOpen = regOpenConfig?.value === 'true';
    const totalTeams = teams.length;
    const availableSlots = Math.max(0, maxTeams - totalTeams);

    const collegesCount = new Set(teams.map((t) => t.college.trim().toLowerCase())).size;
    const totalParticipants = teams.reduce((acc, t) => acc + (t.member2 && t.member2.trim() ? 2 : 1), 0);

    const problemsReleased = problems.some((p) => p.released === 1);
    const lockedProblems = problems.filter((p) => p.released === 0).length;
    const releasedProblemsCount = problems.filter((p) => p.released === 1).length;

    res.json({
      success: true,
      analytics: {
        totalTeams,
        registeredTeams: totalTeams,
        maxTeams,
        availableSlots,
        registrationOpen,
        totalParticipants,
        collegesRepresented: collegesCount,
        totalProblems: problems.length,
        releasedProblemsCount,
        lockedProblems,
        problemsReleased,
        lastRegistration: teams.length > 0 ? teams[0].createdAt : null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch analytics.' });
  }
});

// GET Activity Logs
router.get('/logs', async (_req: Request, res: Response) => {
  try {
    const logs = await dbAll(`SELECT * FROM activity_logs ORDER BY createdAt DESC LIMIT 100`);
    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch activity logs.' });
  }
});

// POST Update Config (Open/Close Registration, Max Teams capacity)
router.post('/config', async (req: Request, res: Response) => {
  const adminUser = (req as any).adminUser?.username || 'admin';
  const { MAX_TEAMS, registrationOpen } = req.body || {};

  try {
    if (MAX_TEAMS !== undefined) {
      const maxVal = parseInt(String(MAX_TEAMS), 10);
      if (isNaN(maxVal) || maxVal < 1) {
        res.status(400).json({ success: false, error: 'MAX_TEAMS must be a positive integer.' });
        return;
      }
      await dbRun(`INSERT OR REPLACE INTO event_config (key, value) VALUES ('MAX_TEAMS', ?)`, [String(maxVal)]);
      await logAdminActivity(adminUser, 'CONFIG_UPDATED', `Updated MAX_TEAMS capacity to ${maxVal}`);
    }

    if (registrationOpen !== undefined) {
      const openVal = Boolean(registrationOpen) ? 'true' : 'false';
      await dbRun(`INSERT OR REPLACE INTO event_config (key, value) VALUES ('registrationOpen', ?)`, [openVal]);
      const action = openVal === 'true' ? 'REGISTRATION_OPENED' : 'REGISTRATION_CLOSED';
      await logAdminActivity(adminUser, action, `Set registration status to ${openVal}`);
    }

    res.json({ success: true, message: 'Event configuration updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update configuration.' });
  }
});

export default router;
