import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ai-challenge-jwt-secret-key-2026-secure';

export interface AdminPayload {
  username: string;
  role: 'admin';
  iat?: number;
  exp?: number;
}

export function generateAdminJwt(username: string): string {
  const payload: AdminPayload = {
    username,
    role: 'admin',
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyAdminJwtMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = req.headers['x-admin-token'] as string;
  }

  if (!token) {
    res.status(403).json({
      success: false,
      error: '403 Forbidden: Admin authentication required',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload;
    (req as any).adminUser = decoded;
    next();
  } catch (err) {
    res.status(403).json({
      success: false,
      error: '403 Forbidden: Invalid or expired admin token',
    });
  }
}
