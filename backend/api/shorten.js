import dbConnect from "../lib/dbConnect.js";
import Url from "../models/Url.js";

const generateCode = () => Math.random().toString(36).substring(2, 8);

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req, res) {
  // CORS preflight
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== "POST") return res.status(405).end();
  await dbConnect();

  const { originalUrl, expiryDate, customAlias } = req.body || {};
  if (!originalUrl) return res.status(400).json({ error: "originalUrl is required" });

  // If user provided a custom alias, validate and ensure it's unique
  let shortCode;
  if (customAlias) {
    const alias = String(customAlias).trim();
    // Only allow letters, numbers, dash and underscore; length 3-64
    const valid = /^[A-Za-z0-9_-]{3,64}$/.test(alias);
    if (!valid) return res.status(400).json({ error: "customAlias invalid. Use 3-64 chars: letters, numbers, - or _" });

    const existsAlias = await Url.findOne({ shortCode: alias });
    if (existsAlias) return res.status(409).json({ error: "customAlias already in use" });

    shortCode = alias;
  } else {
    // Ensure uniqueness for generated code
    shortCode = generateCode();
    let exists = await Url.findOne({ shortCode });
    let tries = 0;
    while (exists && tries < 10) {
      shortCode = generateCode();
      exists = await Url.findOne({ shortCode });
      tries += 1;
    }
    if (exists) return res.status(500).json({ error: "Failed to generate unique short code, try again" });
  }

  const base = process.env.BASE_URL || (req.headers && `${req.headers.origin}`) || "";
  // generate shortUrl that points to the API redirect route (/api/:shortCode)
  const shortUrl = base ? `${base.replace(/\/$/, "")}/api/${shortCode}` : `/api/${shortCode}`;

  const newUrl = await Url.create({
    shortCode,
    originalUrl,
    shortUrl,
    expiryDate: expiryDate ? new Date(expiryDate) : null
  });

  res.status(201).json(newUrl);
}
