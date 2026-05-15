import "./lib/loadEnv.js";
import express from "express";
import cors from "cors";
import shortenHandler from "./api/shorten.js";
import linksHandler from "./api/links.js";
import redirectHandler from "./api/[shortCode].js";
import registerHandler from "./api/register.js";
import loginHandler from "./api/login.js";
import profileHandler from "./api/profile.js";
import userLinksHandler from "./api/user-links.js";
import linkStatsHandler from "./api/link-stats.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Authentication routes
app.post('/api/auth/register', (req, res) => registerHandler(req, res));
app.post('/api/auth/login', (req, res) => loginHandler(req, res));
app.get('/api/auth/profile', (req, res) => profileHandler(req, res));

// Link routes
app.post('/api/shorten', (req, res) => shortenHandler(req, res));
app.get('/api/links', (req, res) => linksHandler(req, res));
app.get('/api/user-links', (req, res) => userLinksHandler(req, res));
app.delete('/api/user-links', (req, res) => userLinksHandler(req, res));
app.put('/api/user-links', (req, res) => userLinksHandler(req, res));

// Stats route
app.get('/api/link-stats', (req, res) => linkStatsHandler(req, res));

// Redirect handler for short links (shorter URL format: /:shortCode)
app.get('/:shortCode', (req, res) => {
  // Skip if it's a known API endpoint or special path
  if (['api', 'admin', '.well-known'].includes(req.params.shortCode)) {
    return res.status(404).send("Not found");
  }
  
  req.query = req.query || {};
  req.query.shortCode = req.params.shortCode;
  return redirectHandler(req, res);
});

// Keep old API format for backward compatibility
app.get('/api/:shortCode', (req, res) => {
  req.query = req.query || {};
  req.query.shortCode = req.params.shortCode;
  return redirectHandler(req, res);
});

// Status root for local dev
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <html><head><meta charset="utf-8"><title>link-leap API</title></head>
    <body style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:2rem">
      <h1>link-leap API (local)</h1>
      <p>Status: <strong>Online</strong></p>
      <ul>
        <li><a href="/api/links">/api/links</a></li>
        <li><a href="/api/auth/profile">/api/auth/profile</a></li>
      </ul>
    </body></html>
  `);
});

app.listen(port, () => {
  console.log(`Backend API server listening on http://localhost:${port}`);
});
