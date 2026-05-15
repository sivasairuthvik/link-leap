import dbConnect from "../lib/dbConnect.js";
import User from "../models/User.js";
import { generateToken } from "../lib/auth.js";

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowed = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    await dbConnect();

    const { email, password, name } = req.body || {};

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Create new user
    const user = new User({ email, password, name });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error(err);
    const msg = String(err.message || '');
    if (/Mongo|ECONN|ENOTFOUND|querySrv|connect/.test(msg) || (err.name && err.name.includes('Mongoose'))) {
      return res.status(503).json({ error: "Database connection failed" });
    }
    // Handle validation and duplicate key errors
    if (err.code === 11000) {
      return res.status(409).json({ error: "User already exists" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
