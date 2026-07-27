import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbGet, logAdminActivity } from '../db/database';
import { generateAdminJwt } from '../middleware/auth';
import { adminLoginLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', adminLoginLimiter, async (req: Request, res: Response) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    res.status(400).json({ success: false, error: 'Username and password are required.' });
    return;
  }

  try {
    const dbAdminUsername = await dbGet<{ value: string }>(`SELECT value FROM event_config WHERE key = 'adminUsername'`);
    const dbAdminHash = await dbGet<{ value: string }>(`SELECT value FROM event_config WHERE key = 'adminPasswordHash'`);

    const validUsername = dbAdminUsername?.value || 'admin';
    const validHash = dbAdminHash?.value;

    const inputUser = username.trim().toLowerCase();
    const isUserValid = inputUser === validUsername.toLowerCase() || inputUser === 'aitheronmlsymposium@gmail.com';

    let isPassValid = false;
    if (validHash) {
      isPassValid = bcrypt.compareSync(password, validHash);
    } else {
      isPassValid = password === 'isagi1117';
    }

    if (isUserValid && isPassValid) {
      const token = generateAdminJwt(validUsername);
      await logAdminActivity(validUsername, 'ADMIN_LOGIN', `Admin user '${validUsername}' logged in successfully`);

      res.json({
        success: true,
        token,
        user: {
          username: validUsername,
          role: 'admin',
        },
      });
      return;
    }

    await logAdminActivity('SYSTEM', 'LOGIN_FAILED', `Failed login attempt for user '${username}'`);
    res.status(401).json({ success: false, error: 'Invalid username/email or password.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Server error during authentication.' });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
