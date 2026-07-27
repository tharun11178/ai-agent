import { Router, Request, Response } from 'express';
import { dbAll, dbGet } from '../db/database';
import { publicApiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public Problem Statement Endpoint with strict Backend Lock enforcement
router.get('/', publicApiLimiter, async (req: Request, res: Response) => {
  try {
    // Check global problem release status
    const releasedProblem = await dbGet<{ id: string; releasedAt: string }>(
      `SELECT id, releasedAt FROM problems WHERE released = 1 LIMIT 1`
    );

    if (!releasedProblem) {
      // Backend strictly enforces the lock. Zero problem content is sent to client!
      res.json({
        released: false,
        message: '🔒 Problem Statement Locked. Please wait for the organizers to release the problem statement.',
      });
      return;
    }

    // Problems are released. Fetch public problem statements.
    const problems = await dbAll(
      `SELECT id, title, track, description, fileUrl, fileType, released, releasedAt, createdAt FROM problems WHERE released = 1`
    );

    res.json({
      released: true,
      releasedAt: releasedProblem.releasedAt || new Date().toISOString(),
      problems,
    });
  } catch (err: any) {
    res.status(500).json({
      released: false,
      message: 'Failed to retrieve problem statement status.',
    });
  }
});

export default router;
