import { Router, Request, Response } from 'express';
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

// GET Admin Analytics & Overview
router.get('/analytics', async (_req: Request, res: Response) => {
  try {
    const maxTeamsConfig = await dbGet<{ value: string }>(`SELECT value FROM event_config WHERE key = 'MAX_TEAMS'`);
    const regOpenConfig = await dbGet<{ value: string }>(`SELECT value FROM event_config WHERE key = 'registrationOpen'`);
    const teams = await dbAll(`SELECT college, member2, createdAt FROM teams`);

    const maxTeams = parseInt(maxTeamsConfig?.value || '100', 10);
    const registrationOpen = regOpenConfig?.value === 'true';
    const totalTeams = teams.length;
    const availableSlots = Math.max(0, maxTeams - totalTeams);

    const collegesCount = new Set(teams.map((t) => t.college.trim().toLowerCase())).size;
    const totalParticipants = teams.reduce((acc, t) => acc + (t.member2 && t.member2.trim() ? 2 : 1), 0);

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
