import { Router, Request, Response } from 'express';
import { dbGet } from '../db/database';

const router = Router();

// GET /api/problem-statement
// Public endpoint for participants scanning the QR code or visiting /problem-statement
router.get('/', async (_req: Request, res: Response) => {
  try {
    const problem = await dbGet<{
      id: string;
      title: string;
      description: string;
      objectives: string;
      constraints: string;
      deliverables: string;
      released: number;
      releasedAt: string | null;
      updatedAt: string;
    }>(`SELECT * FROM problems ORDER BY createdAt DESC LIMIT 1`);

    if (!problem || Boolean(problem.released) === false) {
      res.json({
        success: true,
        released: false,
        releasedAt: null,
        problem: null,
        message: 'The problem statement has not been released by the event organizers. Please wait until the official announcement.',
      });
      return;
    }

    // Safely parse JSON arrays for objectives, constraints, and deliverables
    const parseJsonArray = (str: string, fallback: string[]) => {
      try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : fallback;
      } catch {
        return str ? str.split('\n').filter(Boolean) : fallback;
      }
    };

    res.json({
      success: true,
      released: true,
      releasedAt: problem.releasedAt,
      problem: {
        id: problem.id,
        title: problem.title,
        description: problem.description,
        objectives: parseJsonArray(problem.objectives, []),
        constraints: parseJsonArray(problem.constraints, []),
        deliverables: parseJsonArray(problem.deliverables, []),
        updatedAt: problem.updatedAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      released: false,
      problem: null,
      error: 'Failed to fetch problem statement release status.',
    });
  }
});

export default router;
