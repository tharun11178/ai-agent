import { Router, Request, Response } from 'express';
import { dbAll } from '../db/database';

const router = Router();

// GET /api/problem-statement
// Public endpoint for participants scanning the QR code or visiting /problem-statement
router.get('/', async (_req: Request, res: Response) => {
  try {
    const releasedProblems = await dbAll<{
      id: string;
      title: string;
      description: string;
      objectives: string;
      requirements: string;
      constraints: string;
      deliverables: string;
      difficulty: string;
      category: string;
      attachments: string | null;
      status: string;
      createdAt: string;
      updatedAt: string;
    }>(`SELECT * FROM problems WHERE status = 'Released' ORDER BY createdAt DESC`);

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

    const parseJsonArray = (str: string, fallback: string[] = []) => {
      try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : fallback;
      } catch {
        return str ? str.split('\n').filter(Boolean) : fallback;
      }
    };

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
