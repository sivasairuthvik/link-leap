import dbConnect from "../lib/dbConnect.js";
import Url from "../models/Url.js";

export default async function handler(req, res) {
  const { shortCode } = req.query || {};
  await dbConnect();

  const url = await Url.findOne({ shortCode });
  if (!url) return res.status(404).send("Link not found");

  if (url.expiryDate && url.expiryDate < new Date()) {
    return res.status(410).send("Link expired");
  }

  url.clicks = (url.clicks || 0) + 1;
  await url.save();

  // Redirect
  res.writeHead(302, { Location: url.originalUrl });
  res.end();
}
