import express, { Express } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db/database';
import { setupSecurityMiddleware } from './middleware/security';
import authRoutes from './routes/auth';
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

  // Find valid static files directory across all possible deployment locations
  const possibleStaticPaths = [
    path.resolve(__dirname, 'public'),
    path.resolve(__dirname, '..', 'dist', 'public'),
    path.resolve(__dirname, '..', 'public'),
    path.resolve(__dirname, '..', 'client', 'public'),
    path.resolve(__dirname, '..', 'client'),
    path.resolve(__dirname, '..', '..', 'dist', 'public'),
    path.resolve(process.cwd(), 'dist', 'public'),
    path.resolve(process.cwd(), 'client', 'public'),
    path.resolve(process.cwd(), 'client'),
  ];

  const staticPath = possibleStaticPaths.find(p => fs.existsSync(path.resolve(p, 'index.html'))) || possibleStaticPaths[0];
  const indexHtmlPath = path.resolve(staticPath, 'index.html');

  // Serve static files with optimized HTTP caching headers
  app.use(
    express.static(staticPath, {
      maxAge: '1y',
      immutable: true,
      etag: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    })
  );

  // Fallback to index.html for client-side Wouter routing
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next();
    }
    if (fs.existsSync(indexHtmlPath)) {
      return res.sendFile(indexHtmlPath);
    }
    return res.status(404).send('404 Not Found');
  });

  return app;
}
