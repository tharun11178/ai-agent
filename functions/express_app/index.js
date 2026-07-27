const path = require('path');
const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);
    req.catalystApp = catalystApp;

    // Load compiled Express application
    const distPath = path.resolve(__dirname, '../../dist/index.js');
    const { createExpressApp } = await import('file://' + distPath.replace(/\\/g, '/'));
    const expressApp = await createExpressApp();

    return expressApp(req, res);
  } catch (err) {
    console.error('Catalyst Advanced I/O Express Error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: '500 Internal Server Error: Catalyst Advanced I/O Execution Failed'
    }));
  }
};
