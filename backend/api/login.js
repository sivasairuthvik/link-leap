import dbConnect from "../lib/dbConnect.js";
import User from "../models/User.js";
import { generateToken } from "../lib/auth.js";

export default async function handler(req, res) {
  // Strict CORS: only allow configured frontend origin
  const origin = req.headers.origin;
  const allowed = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    await dbConnect();

    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id);

    return res.status(200).json({
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
    return res.status(500).json({ error: "Internal server error" });
  }
}
