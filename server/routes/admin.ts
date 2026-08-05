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

// GET Problems (All Draft, Released, and Hidden problems for Admin Management)
router.get('/problems', async (_req: Request, res: Response) => {
  try {
    const problems = await dbAll(`SELECT * FROM problems ORDER BY CAST(id AS INTEGER) ASC, id ASC`);

    const parseJsonArray = (str: string) => {
      try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return str ? str.split('\n').filter(Boolean) : [];
      }
    };

    const formatted = problems.map((p) => ({
      ...p,
      objectives: parseJsonArray(p.objectives),
      requirements: parseJsonArray(p.requirements || '[]'),
      constraints: parseJsonArray(p.constraints),
      deliverables: parseJsonArray(p.deliverables),
      attachments: parseJsonArray(p.attachments || '[]'),
      assignedTeamIds: parseJsonArray(p.assignedTeamIds || '[]'),
      accessToken: p.accessToken || p.id,
      qrCode: p.qrCode || `/ps/${p.accessToken || p.id}`,
      scanCount: p.scanCount || 0,
      firstScannedAt: p.firstScannedAt || null,
      lastScannedAt: p.lastScannedAt || null,
      releasedAt: p.releasedAt || null,
    }));

    res.json({ success: true, problems: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch problem statements.' });
  }
});

// POST Create or Update Problem Statement
router.post('/problems', async (req: Request, res: Response) => {
  const adminUser = (req as any).adminUser?.username || 'admin';
  const {
    id,
    title,
    description,
    objectives,
    requirements,
    constraints,
    deliverables,
    difficulty,
    category,
    attachments,
    status,
  } = req.body || {};

  if (!title || !description) {
    res.status(400).json({ success: false, error: 'Title and description are required.' });
    return;
  }

  const formatList = (val: any) => {
    if (Array.isArray(val)) return JSON.stringify(val);
    if (typeof val === 'string') return JSON.stringify(val.split('\n').map((s) => s.trim()).filter(Boolean));
    return JSON.stringify([]);
  };

  const now = new Date().toISOString();
  const objStr = formatList(objectives);
  const reqStr = formatList(requirements);
  const conStr = formatList(constraints);
  const delStr = formatList(deliverables);
  const attStr = formatList(attachments);
  const validDifficulty = ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium';
  const validCategory = category?.trim() || 'AI Agents';
  const validStatus = ['Draft', 'Released', 'Hidden'].includes(status) ? status : 'Draft';

  try {
    if (id) {
      // Update existing problem statement (preserving QR code & accessToken)
      await dbRun(
        `UPDATE problems
         SET title = ?, description = ?, objectives = ?, requirements = ?, constraints = ?, deliverables = ?,
             difficulty = ?, category = ?, attachments = ?, status = ?, updatedAt = ?,
             releasedAt = CASE WHEN ? = 'Released' AND (releasedAt IS NULL OR releasedAt = '') THEN ? ELSE releasedAt END
         WHERE id = ?`,
        [title.trim(), description.trim(), objStr, reqStr, conStr, delStr, validDifficulty, validCategory, attStr, validStatus, now, validStatus, now, id]
      );
      await logAdminActivity(adminUser, 'PROBLEM_UPDATED', `Updated problem statement '${title.trim()}' (${validStatus})`);
      res.json({ success: true, message: 'Problem statement updated successfully.' });
    } else {
      // Create new problem statement draft with secure access token
      const problemCount = await dbGet<{ count: number }>(`SELECT COUNT(*) as count FROM problems`);
      const newNum = (problemCount?.count || 0) + 1;
      const newId = String(newNum);
      const token = nanoid(10);
      const qrUrl = `/ps/${token}`;

      await dbRun(
        `INSERT INTO problems (id, title, description, objectives, requirements, constraints, deliverables, difficulty, category, attachments, status, accessToken, qrCode, scanCount, createdAt, updatedAt, releasedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
        [newId, title.trim(), description.trim(), objStr, reqStr, conStr, delStr, validDifficulty, validCategory, attStr, validStatus, token, qrUrl, now, now, validStatus === 'Released' ? now : null]
      );
      await logAdminActivity(adminUser, 'PROBLEM_CREATED', `Created problem statement '${title.trim()}' (${validStatus})`);
      res.status(201).json({ success: true, id: newId, message: 'Problem statement created successfully.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to save problem statement.' });
  }
});

// POST Update Status for Specific Problem Statement (Draft / Released / Hidden)
router.post('/problems/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminUser = (req as any).adminUser?.username || 'admin';
  const { status } = req.body || {};

  if (!['Draft', 'Released', 'Hidden'].includes(status)) {
    res.status(400).json({ success: false, error: "Status must be 'Draft', 'Released', or 'Hidden'." });
    return;
  }

  const now = new Date().toISOString();

  try {
    const prob = await dbGet<{ title: string }>(`SELECT title FROM problems WHERE id = ?`, [id]);
    if (!prob) {
      res.status(404).json({ success: false, error: 'Problem statement not found.' });
      return;
    }

    await dbRun(
      `UPDATE problems
       SET status = ?,
           updatedAt = ?,
           releasedAt = CASE WHEN ? = 'Released' AND (releasedAt IS NULL OR releasedAt = '') THEN ? ELSE releasedAt END
       WHERE id = ?`,
      [status, now, status, now, id]
    );
    await logAdminActivity(adminUser, 'PROBLEM_STATUS_CHANGED', `Changed status for '${prob.title}' to '${status}'`);

    res.json({
      success: true,
      status,
      message: `Problem statement status updated to ${status}.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update problem status.' });
  }
});

// POST Batch Status Update (Release All, Release Selected, Hide All, Hide Selected)
router.post('/problems/batch-status', async (req: Request, res: Response) => {
  const adminUser = (req as any).adminUser?.username || 'admin';
  const { ids, status } = req.body || {};

  if (!['Draft', 'Released', 'Hidden'].includes(status)) {
    res.status(400).json({ success: false, error: "Status must be 'Draft', 'Released', or 'Hidden'." });
    return;
  }

  const now = new Date().toISOString();

  try {
    if (ids === 'all' || !Array.isArray(ids)) {
      await dbRun(
        `UPDATE problems
         SET status = ?,
             updatedAt = ?,
             releasedAt = CASE WHEN ? = 'Released' THEN ? ELSE releasedAt END`,
        [status, now, status, now]
      );
      await logAdminActivity(adminUser, 'BATCH_PROBLEM_STATUS', `Updated ALL problem statements to status '${status}'`);
      res.json({ success: true, message: `All problem statements set to ${status}.` });
    } else {
      if (ids.length === 0) {
        res.status(400).json({ success: false, error: 'No problem IDs provided for bulk status update.' });
        return;
      }
      const placeholders = ids.map(() => '?').join(',');
      await dbRun(
        `UPDATE problems
         SET status = ?,
             updatedAt = ?,
             releasedAt = CASE WHEN ? = 'Released' THEN ? ELSE releasedAt END
         WHERE id IN (${placeholders})`,
        [status, now, status, now, ...ids]
      );
      await logAdminActivity(adminUser, 'BATCH_PROBLEM_STATUS', `Updated ${ids.length} problem statement(s) to status '${status}'`);
      res.json({ success: true, message: `${ids.length} problem statement(s) updated to ${status}.` });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to execute batch status update.' });
  }
});

// POST Regenerate Token for Problem Statement
router.post('/problems/:id/regenerate-token', async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminUser = (req as any).adminUser?.username || 'admin';

  try {
    const prob = await dbGet<any>(`SELECT id, title FROM problems WHERE id = ?`, [id]);
    if (!prob) {
      res.status(404).json({ success: false, error: 'Problem statement not found.' });
      return;
    }

    const newToken = nanoid(10);
    const newQrUrl = `/ps/${newToken}`;
    const now = new Date().toISOString();

    await dbRun(
      `UPDATE problems SET accessToken = ?, qrCode = ?, updatedAt = ? WHERE id = ?`,
      [newToken, newQrUrl, now, id]
    );

    await logAdminActivity(adminUser, 'PROBLEM_TOKEN_REGENERATED', `Regenerated secure QR token for '${prob.title}'`);

    res.json({
      success: true,
      accessToken: newToken,
      qrCode: newQrUrl,
      message: `Regenerated secure QR code token for '${prob.title}'.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to regenerate token.' });
  }
});

// POST Duplicate Problem Statement
router.post('/problems/:id/duplicate', async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminUser = (req as any).adminUser?.username || 'admin';

  try {
    const original = await dbGet<any>(`SELECT * FROM problems WHERE id = ?`, [id]);
    if (!original) {
      res.status(404).json({ success: false, error: 'Problem statement not found.' });
      return;
    }

    const newId = `prob-${nanoid(8)}`;
    const now = new Date().toISOString();
    const dupTitle = `${original.title} (Copy)`;

    await dbRun(
      `INSERT INTO problems (id, title, description, objectives, requirements, constraints, deliverables, difficulty, category, attachments, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', ?, ?)`,
      [
        newId,
        dupTitle,
        original.description,
        original.objectives,
        original.requirements,
        original.constraints,
        original.deliverables,
        original.difficulty,
        original.category,
        original.attachments,
        now,
        now,
      ]
    );

    await logAdminActivity(adminUser, 'PROBLEM_DUPLICATED', `Duplicated problem '${original.title}' as '${dupTitle}'`);

    res.status(201).json({
      success: true,
      id: newId,
      message: `Problem statement duplicated as '${dupTitle}'.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to duplicate problem statement.' });
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

// GET Admin Analytics & Overview
router.get('/analytics', async (_req: Request, res: Response) => {
  try {
    const maxTeamsConfig = await dbGet<{ value: string }>(`SELECT value FROM event_config WHERE key = 'MAX_TEAMS'`);
    const regOpenConfig = await dbGet<{ value: string }>(`SELECT value FROM event_config WHERE key = 'registrationOpen'`);
    const teams = await dbAll(`SELECT college, member2, createdAt FROM teams`);
    const problems = await dbAll(`SELECT status FROM problems`);

    const maxTeams = parseInt(maxTeamsConfig?.value || '100', 10);
    const registrationOpen = regOpenConfig?.value === 'true';
    const totalTeams = teams.length;
    const availableSlots = Math.max(0, maxTeams - totalTeams);

    const collegesCount = new Set(teams.map((t) => t.college.trim().toLowerCase())).size;
    const totalParticipants = teams.reduce((acc, t) => acc + (t.member2 && t.member2.trim() ? 2 : 1), 0);

    const releasedCount = problems.filter((p) => p.status === 'Released').length;
    const draftCount = problems.filter((p) => p.status === 'Draft').length;
    const hiddenCount = problems.filter((p) => p.status === 'Hidden').length;

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
        releasedCount,
        draftCount,
        hiddenCount,
        problemsReleased: releasedCount > 0,
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
