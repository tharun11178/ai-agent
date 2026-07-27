import { Router, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { dbGet, dbRun, dbAll } from '../db/database';
import { registerLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET Registration Status & Capacity Info
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const maxTeamsConfig = await dbGet<{ value: string }>(`SELECT value FROM event_config WHERE key = 'MAX_TEAMS'`);
    const regOpenConfig = await dbGet<{ value: string }>(`SELECT value FROM event_config WHERE key = 'registrationOpen'`);
    const countResult = await dbGet<{ count: number }>(`SELECT COUNT(*) as count FROM teams`);

    const maxTeams = parseInt(maxTeamsConfig?.value || '40', 10);
    const registrationOpen = regOpenConfig?.value === 'true';
    const registeredTeams = countResult?.count || 0;
    const availableSlots = Math.max(0, maxTeams - registeredTeams);
    const isFull = registeredTeams >= maxTeams;
    const isClosed = !registrationOpen || isFull;

    res.json({
      success: true,
      open: !isClosed,
      isFull,
      registrationOpen,
      maxTeams,
      registeredTeams,
      availableSlots,
      message: isClosed
        ? isFull
          ? 'Registration Closed. Maximum number of teams has been reached.'
          : 'Registration is currently closed by organizers.'
        : 'Registration is open.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch registration status.' });
  }
});

// Real-time Duplicate Check Endpoint
router.post('/check-duplicate', async (req: Request, res: Response) => {
  const { teamName, leaderEmail, phone } = req.body || {};

  try {
    let duplicateTeam = false;
    let duplicateEmail = false;
    let duplicatePhone = false;

    if (teamName && teamName.trim()) {
      const match = await dbGet(`SELECT id FROM teams WHERE LOWER(teamName) = LOWER(?)`, [teamName.trim()]);
      if (match) duplicateTeam = true;
    }

    if (leaderEmail && leaderEmail.trim()) {
      const match = await dbGet(`SELECT id FROM teams WHERE LOWER(leaderEmail) = LOWER(?)`, [leaderEmail.trim()]);
      if (match) duplicateEmail = true;
    }

    if (phone && phone.trim()) {
      const match = await dbGet(`SELECT id FROM teams WHERE phone = ?`, [phone.trim()]);
      if (match) duplicatePhone = true;
    }

    res.json({
      success: true,
      duplicateTeam,
      duplicateEmail,
      duplicatePhone,
      isDuplicate: duplicateTeam || duplicateEmail || duplicatePhone,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Duplicate check failed.' });
  }
});

// POST Register Team
router.post('/', registerLimiter, async (req: Request, res: Response) => {
  try {
    // 1. Check Capacity & Registration Status
    const maxTeamsConfig = await dbGet<{ value: string }>(`SELECT value FROM event_config WHERE key = 'MAX_TEAMS'`);
    const regOpenConfig = await dbGet<{ value: string }>(`SELECT value FROM event_config WHERE key = 'registrationOpen'`);
    const countResult = await dbGet<{ count: number }>(`SELECT COUNT(*) as count FROM teams`);

    const maxTeams = parseInt(maxTeamsConfig?.value || '40', 10);
    const registrationOpen = regOpenConfig?.value === 'true';
    const registeredTeams = countResult?.count || 0;

    if (!registrationOpen) {
      res.status(400).json({
        success: false,
        isClosed: true,
        error: 'Registration Closed. The organizers have closed registrations.',
      });
      return;
    }

    if (registeredTeams >= maxTeams) {
      res.status(400).json({
        success: false,
        isClosed: true,
        error: 'Registration Closed. Maximum number of teams has been reached.',
      });
      return;
    }

    // 2. Validate Fields
    const teamName = req.body.teamName?.trim();
    const leaderName = req.body.leaderName?.trim();
    const leaderEmail = req.body.leaderEmail?.trim();
    const phone = req.body.phone?.trim();
    const college = req.body.college?.trim();
    const department = req.body.department?.trim() || '';
    const year = req.body.year?.trim() || '';
    const member2 = req.body.member2?.trim() || '';

    if (!teamName || !leaderName || !leaderEmail || !phone || !college) {
      res.status(400).json({
        success: false,
        error: 'Please fill in all required fields (Team Name, Leader Name, Email, Phone, College).',
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leaderEmail)) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      });
      return;
    }

    // 3. Strict Duplicate Checks (Team Name, Email, Phone)
    const existingName = await dbGet(`SELECT id FROM teams WHERE LOWER(teamName) = LOWER(?)`, [teamName]);
    if (existingName) {
      res.status(400).json({
        success: false,
        field: 'teamName',
        error: 'Team Name is already taken. Please choose a different team name.',
      });
      return;
    }

    const existingEmail = await dbGet(`SELECT id FROM teams WHERE LOWER(leaderEmail) = LOWER(?)`, [leaderEmail]);
    if (existingEmail) {
      res.status(400).json({
        success: false,
        field: 'leaderEmail',
        error: 'A team with this leader email address is already registered.',
      });
      return;
    }

    const existingPhone = await dbGet(`SELECT id FROM teams WHERE phone = ?`, [phone]);
    if (existingPhone) {
      res.status(400).json({
        success: false,
        field: 'phone',
        error: 'A team with this phone number is already registered.',
      });
      return;
    }

    // 4. Save Registration to Database
    const id = `team-${nanoid(8)}`;
    const createdAt = new Date().toISOString();

    await dbRun(
      `INSERT INTO teams (id, teamName, leaderName, leaderEmail, phone, college, department, year, member2, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, teamName, leaderName, leaderEmail, phone, college, department, year, member2, createdAt]
    );

    const newTeam = await dbGet(`SELECT * FROM teams WHERE id = ?`, [id]);

    res.status(201).json({
      success: true,
      message: 'Team registered successfully!',
      registration: newTeam,
    });
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({
        success: false,
        error: 'Duplicate registration detected. Team name, email, or phone number already registered.',
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error during registration.',
      });
    }
  }
});

export default router;
