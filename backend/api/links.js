import dbConnect from "../lib/dbConnect.js";
import Url from "../models/Url.js";
import { verifyToken } from "../lib/auth.js";

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');
};

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  // Require authentication — only return urls for the authenticated user
  verifyToken(req, res, async () => {
    if (req.method !== "GET") {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await dbConnect();

      // Robust parsing for pagination parameters
      const parsedPage = parseInt(req.query.page, 10);
      const parsedLimit = parseInt(req.query.limit, 10);
      const pageFallback = Number.isNaN(parsedPage) ? 1 : parsedPage;
      const limitFallback = Number.isNaN(parsedLimit) ? 20 : parsedLimit;
      const page = Math.max(1, pageFallback);
      const limit = Math.min(100, Math.max(1, limitFallback));
      const skip = (page - 1) * limit;

      const [urls, total] = await Promise.all([
        Url.find({ userId: req.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Url.countDocuments({ userId: req.userId })
      ]);

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({ urls, meta: { total, page, limit, totalPages } });
    } catch (error) {
      console.error("Error in links handler:", error);
      return res.status(503).json({ error: "Database connection failed" });
    }
  });
}
