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

app.listen(port, () => {
  console.log(`Backend API server listening on http://localhost:${port}`);
});
