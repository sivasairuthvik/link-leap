import dbConnect from "../lib/dbConnect.js";
import Url from "../models/Url.js";
import { verifyToken } from "../lib/auth.js";

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowed = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    // If credentials expected, set Access-Control-Allow-Credentials as needed
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(204).end();

  // Verify token
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  let userId;
  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }
    const jwt = await import("jsonwebtoken");
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  try {
    await dbConnect();

    if (req.method === "GET") {
      // Get all links for the user
      const urls = await Url.find({ userId }).sort({ createdAt: -1 });
      return res.status(200).json({ urls });
    } else if (req.method === "DELETE") {
      // Delete a link
      const { shortCode } = req.query;
      const url = await Url.findOneAndDelete({ shortCode, userId });
      if (!url) {
        return res.status(404).json({ error: "Link not found" });
      }
      return res.status(200).json({ message: "Link deleted successfully" });
    } else if (req.method === "PUT") {
      // Update a link
      const { shortCode } = req.query;
      const { expiryDate } = req.body;
      const url = await Url.findOneAndUpdate(
        { shortCode, userId },
        { expiryDate: expiryDate ? new Date(expiryDate) : null },
        { new: true }
      );
      if (!url) {
        return res.status(404).json({ error: "Link not found" });
      }
      return res.status(200).json({ url });
    }
    // If we reach here, method was not handled
    res.setHeader('Allow', 'GET, DELETE, PUT');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    const msg = String(err.message || '');
    if (/Mongo|ECONN|ENOTFOUND|querySrv|connect/.test(msg) || (err.name && err.name.includes('Mongoose'))) {
      return res.status(503).json({ error: "Database connection failed" });
    }
    return res.status(500).json({ error: "Failed to process request" });
  }
}
