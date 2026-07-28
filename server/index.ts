import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createExpressApp } from './app';

export { createExpressApp };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = await createExpressApp();
  const server = createServer(app);

  const staticPath =
    process.env.NODE_ENV === 'production'
      ? path.resolve(__dirname, 'public')
      : path.resolve(__dirname, '..', 'dist', 'public');

  // Fallback to index.html for client-side Wouter routing
  app.get('*', (_req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });

  // Global Error Handler Middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled API Server Error:', err);
    res.status(500).json({
      success: false,
      error: '500 Internal Server Error. An unexpected error occurred on the server.',
    });
  });

  // Only listen if executed directly (e.g. node dist/index.js)
  if (process.env.CATALYST_ENV === undefined) {
    const port = Number(process.env.PORT) || 3000;
    server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Production-ready server running on port ${port}`);
    });
  }
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
