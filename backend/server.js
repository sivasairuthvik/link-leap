import express from "express";
import cors from "cors";
import shortenHandler from "./api/shorten.js";
import linksHandler from "./api/links.js";
import redirectHandler from "./api/[shortCode].js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mount API routes
app.post('/api/shorten', (req, res) => shortenHandler(req, res));
app.get('/api/links', (req, res) => linksHandler(req, res));
app.get('/api/:shortCode', (req, res) => {
  // redirect handler expects req.query.shortCode in serverless form; adapt
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
        <li><a href="/api/status">/api/status</a></li>
      </ul>
    </body></html>
  `);
});

app.listen(port, () => {
  console.log(`Backend API server listening on http://localhost:${port}`);
});
