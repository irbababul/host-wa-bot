const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Bot Salas - Active</title>
        <style>
          body { font-family: Arial; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
          h1 { font-size: 3em; margin-bottom: 20px; }
          .status { background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; display: inline-block; }
        </style>
      </head>
      <body>
        <h1>🤖 Bot Salas</h1>
        <div class="status">
          <h2>✅ Bot is Active and Running!</h2>
          <p>Uptime: ${Math.floor(process.uptime())} seconds</p>
          <p>Status: Ready to serve</p>
        </div>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Keep-alive server running on port ${PORT}`);
  console.log(`🌐 Server is accessible at http://0.0.0.0:${PORT}`);
});

module.exports = app;
