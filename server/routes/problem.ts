import { Router, Request, Response } from 'express';
import { dbGet, dbRun } from '../db/database';

const router = Router();

const parseJsonArray = (str: string, fallback: string[] = []) => {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return str ? str.split('\n').filter(Boolean) : fallback;
  }
};

// GET /api/problem-statement/access/:token OR /api/problem-statement/:token
// Secure isolated endpoint for participants scanning a specific QR code token (e.g. /ps/a91kD82LmX)
const getProblemByToken = async (req: Request, res: Response) => {
  const token = req.params.token || req.params.id;

  if (!token) {
    res.status(400).json({
      success: false,
      released: false,
      message: 'Access key is required.',
    });
    return;
  }

  try {
    // Search by accessToken first, or fallback to exact ID
    let problem = await dbGet<any>(
      `SELECT * FROM problems WHERE accessToken = ? OR id = ?`,
      [token, token]
    );

    if (!problem) {
      const paddedId = `prob-${token.padStart(2, '0')}`;
      problem = await dbGet<any>(`SELECT * FROM problems WHERE id = ?`, [paddedId]);
    }

    if (!problem) {
      res.status(404).json({
        success: false,
        released: false,
        message: 'Invalid access key or problem statement not found.',
      });
      return;
    }

    // Record Scan Analytics silently
    const now = new Date().toISOString();
    await dbRun(
      `UPDATE problems
       SET scanCount = COALESCE(scanCount, 0) + 1,
           lastScannedAt = ?,
           firstScannedAt = CASE WHEN firstScannedAt IS NULL OR firstScannedAt = '' THEN ? ELSE firstScannedAt END
       WHERE id = ?`,
      [now, now, problem.id]
    );

    // If NOT released, return locked response without revealing content or existence of other problems
    if (problem.status !== 'Released') {
      res.json({
        success: true,
        released: false,
        message: 'This problem statement has not yet been released by the organizers. Please wait for the official announcement.',
      });
      return;
    }

    // If RELEASED, return ONLY that specific problem statement (omitting sequence numbers or total counts)
    const formattedProblem = {
      title: problem.title,
      description: problem.description,
      objectives: parseJsonArray(problem.objectives),
      requirements: parseJsonArray(problem.requirements),
      constraints: parseJsonArray(problem.constraints),
      deliverables: parseJsonArray(problem.deliverables),
      difficulty: problem.difficulty || 'Medium',
      category: problem.category || 'AI Agents',
      attachments: parseJsonArray(problem.attachments || '[]'),
      updatedAt: problem.updatedAt,
    };

    res.json({
      success: true,
      released: true,
      problem: formattedProblem,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      released: false,
      error: 'Failed to process problem statement request.',
    });
  }
};

router.get('/access/:token', getProblemByToken);
router.get('/:token', getProblemByToken);

// GET /api/problem-statement
// Lock down public listing of all problem statements to enforce 1-to-1 QR isolation
router.get('/', (_req: Request, res: Response) => {
  res.status(403).json({
    success: false,
    released: false,
    message: 'Direct browsing of problem statements is restricted. Please scan your assigned QR code to access your problem statement.',
  });
});

export default router;
