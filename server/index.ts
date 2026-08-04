process.env.NODE_ENV = process.env.NODE_ENV || 'production';

import { createServer } from 'http';
import express from 'express';
import { createExpressApp } from './app';

export { createExpressApp };

async function startServer() {
  const app = await createExpressApp();
  const server = createServer(app);

  // Enable HTTP Keep-Alive for fast subsequent connections (optimized for Render proxy)
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

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
      console.log(`🚀 Production server listening on port ${port}`);
    });
  }
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
