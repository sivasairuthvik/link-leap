import dbConnect from "../lib/dbConnect.js";
import Url from "../models/Url.js";

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { shortCode } = req.query || {};
  await dbConnect();

  const url = await Url.findOne({ shortCode });
  if (!url) return res.status(404).send("Link not found");

  if (url.expiryDate && url.expiryDate < new Date()) {
    return res.status(410).send("Link expired");
  }

  url.clicks = (url.clicks || 0) + 1;
  await url.save();

  // Redirect using Vercel-friendly API
  return res.redirect(url.originalUrl);
}
