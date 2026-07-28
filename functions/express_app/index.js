const path = require('path');
const catalyst = require('zcatalyst-sdk-node');

let cachedApp = null;

module.exports = async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);
    req.catalystApp = catalystApp;

    if (!cachedApp) {
      const fs = require('fs');
      let distPath = path.resolve(__dirname, './dist/index.js');
      if (!fs.existsSync(distPath)) {
        distPath = path.resolve(__dirname, '../../dist/index.js');
      }
      const { createExpressApp } = await import('file://' + distPath.replace(/\\/g, '/'));
      cachedApp = await createExpressApp();
    }

    // Normalize URL path for Express routing in Catalyst Advanced I/O
    if (req.url) {
      req.url = req.url.replace(/^\/server\/express_app/, '').replace(/^\/baas\/v1\/[^\/]+\/function\/express_app/, '') || '/';
      if (!req.url.startsWith('/')) {
        req.url = '/' + req.url;
      }
    }

    return cachedApp(req, res);
  } catch (err) {
    console.error('Catalyst Advanced I/O Express Error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: '500 Internal Server Error: Catalyst Advanced I/O Execution Failed'
    }));
  }
};
