import { Router, Request, Response } from 'express';
import { dbAll, dbGet, dbRun } from '../db/database';

const router = Router();

const parseJsonArray = (str: string, fallback: string[] = []) => {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return str ? str.split('\n').filter(Boolean) : fallback;
  }
};

// GET /api/problem-statement/:id
// Public endpoint for participants scanning specific QR codes (e.g. /problem-statement/1)
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Try finding by exact ID, or normalized ID (e.g., '1' vs 'prob-01')
    let problem = await dbGet<any>(`SELECT * FROM problems WHERE id = ?`, [id]);
    if (!problem) {
      const paddedId = `prob-${id.padStart(2, '0')}`;
      problem = await dbGet<any>(`SELECT * FROM problems WHERE id = ?`, [paddedId]);
    }

    if (!problem) {
      res.status(404).json({
        success: false,
        released: false,
        message: 'Problem statement not found.',
      });
      return;
    }

    // Record Scan Analytics
    const now = new Date().toISOString();
    await dbRun(
      `UPDATE problems
       SET scanCount = COALESCE(scanCount, 0) + 1,
           lastScannedAt = ?,
           firstScannedAt = CASE WHEN firstScannedAt IS NULL OR firstScannedAt = '' THEN ? ELSE firstScannedAt END
       WHERE id = ?`,
      [now, now, problem.id]
    );

    // If NOT released, return locked response without revealing sensitive content
    if (problem.status !== 'Released') {
      res.json({
        success: true,
        released: false,
        id: problem.id,
        status: problem.status,
        message: 'This problem statement has not yet been released by the organizers. Please wait for the official announcement.',
      });
      return;
    }

    // If RELEASED, return complete problem details
    const formattedProblem = {
      id: problem.id,
      title: problem.title,
      description: problem.description,
      objectives: parseJsonArray(problem.objectives),
      requirements: parseJsonArray(problem.requirements),
      constraints: parseJsonArray(problem.constraints),
      deliverables: parseJsonArray(problem.deliverables),
      difficulty: problem.difficulty || 'Medium',
      category: problem.category || 'AI Agents',
      attachments: parseJsonArray(problem.attachments || '[]'),
      qrCode: problem.qrCode || `/problem-statement/${problem.id}`,
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
});

// GET /api/problem-statement
// Public endpoint for participants visiting /problem-statement
router.get('/', async (_req: Request, res: Response) => {
  try {
    const releasedProblems = await dbAll<any>(
      `SELECT * FROM problems WHERE status = 'Released' ORDER BY id ASC`
    );

    if (!releasedProblems || releasedProblems.length === 0) {
      res.json({
        success: true,
        released: false,
        count: 0,
        problems: [],
        message: 'No problem statements have been released by the event organizers yet. Please wait until the official announcement.',
      });
      return;
    }

    const formattedProblems = releasedProblems.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      objectives: parseJsonArray(p.objectives),
      requirements: parseJsonArray(p.requirements),
      constraints: parseJsonArray(p.constraints),
      deliverables: parseJsonArray(p.deliverables),
      difficulty: p.difficulty || 'Medium',
      category: p.category || 'AI Agents',
      attachments: parseJsonArray(p.attachments || '[]'),
      qrCode: p.qrCode || `/problem-statement/${p.id}`,
      updatedAt: p.updatedAt,
    }));

    res.json({
      success: true,
      released: true,
      count: formattedProblems.length,
      problems: formattedProblems,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      released: false,
      count: 0,
      problems: [],
      error: 'Failed to fetch released problem statements.',
    });
  }
});

export default router;
