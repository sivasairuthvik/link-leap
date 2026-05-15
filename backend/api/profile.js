import dbConnect from "../lib/dbConnect.js";
import User from "../models/User.js";
import { verifyToken } from "../lib/auth.js";

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowed = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(204).end();
  
  // Verify token
  verifyToken(req, res, async () => {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      await dbConnect();

      const user = await User.findById(req.userId).select("-password");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ user });
    } catch (err) {
      console.error(err);
      const msg = String(err.message || '');
      if (/Mongo|ECONN|ENOTFOUND|querySrv|connect/.test(msg) || (err.name && err.name.includes('Mongoose'))) {
        return res.status(503).json({ error: "Database connection failed" });
      }
      return res.status(500).json({ error: "Could not retrieve profile" });
    }
  });
}
