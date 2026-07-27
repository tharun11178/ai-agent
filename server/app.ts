import express, { Express } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db/database';
import { setupSecurityMiddleware } from './middleware/security';
import authRoutes from './routes/auth';
import registerRoutes from './routes/register';
import problemRoutes from './routes/problem';
import adminRoutes from './routes/admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createExpressApp(): Promise<Express> {
  // Initialize SQLite Database schema & indexes
  await initDatabase();

  const app = express();

  // Configure Helmet, CORS, Compression, and Payload limits
  setupSecurityMiddleware(app);

  // Mount API Routers
  app.use('/api/auth', authRoutes);
  app.use('/api/register', registerRoutes);
  app.use('/api/problem-statement', problemRoutes);
  app.use('/api/admin', adminRoutes);

  // Backward compatibility alias for /api/admin/login
  app.post('/api/admin/login', (req, res, next) => {
    req.url = '/login';
    authRoutes(req, res, next);
  });

  // Backward compatibility alias for /api/registrations
  app.get('/api/registrations', (req, res, next) => {
    req.url = '/registrations';
    adminRoutes(req, res, next);
  });

  // Serve static files in production
  const staticPath =
    process.env.NODE_ENV === 'production'
      ? path.resolve(__dirname, 'public')
      : path.resolve(__dirname, '..', 'dist', 'public');

  app.use(express.static(staticPath, { maxAge: '1d' }));

  // Fallback to index.html for client-side Wouter routing
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next();
    }
    const indexPath = path.resolve(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    const rootIndexPath = path.resolve(__dirname, '..', 'dist', 'public', 'index.html');
    if (fs.existsSync(rootIndexPath)) {
      return res.sendFile(rootIndexPath);
    }
    return res.status(404).send('404 Not Found');
  });

  return app;
}
