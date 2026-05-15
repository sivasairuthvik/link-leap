import dbConnect from "../lib/dbConnect.js";
import Url from "../models/Url.js";
import { verifyToken } from "../lib/auth.js";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  // CORS: only allow configured frontend origins (comma-separated)
  const origin = req.headers.origin;
  const allowed = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const { shortCode } = req.query;

  if (!shortCode) {
    return res.status(400).json({ error: "shortCode is required" });
  }

  // Require authentication for stats access
  verifyToken(req, res, async () => {
    try {
      await dbConnect();

      const url = await Url.findOne({ shortCode });
      if (!url) {
        return res.status(404).json({ error: "Link not found" });
      }

      // Ensure requester owns the link
      if (String(url.userId) !== String(req.userId)) {
        return res.status(403).json({ error: "Not authorized to view stats for this link" });
      }

    // Prepare click details with date grouping
    const clicksByDate = {};
    const deviceStats = { Mobile: 0, Desktop: 0, Tablet: 0, Other: 0 };
    const browserStats = {};
    const clicksByHour = {};
    
    url.clickDetails?.forEach(click => {
      // Group by date
      const date = new Date(click.timestamp).toLocaleDateString();
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;
      
      // Group by hour
      const hour = new Date(click.timestamp).getHours();
      const hourKey = `${hour}:00`;
      clicksByHour[hourKey] = (clicksByHour[hourKey] || 0) + 1;
      
      // Analyze device type
      if (click.userAgent) {
        const ua = click.userAgent.toLowerCase();
        // Device detection: prioritize mobile/tablet tokens
        if (ua.includes('mobile') || ua.includes('iphone') || (ua.includes('android') && ua.includes('mobile'))) {
          deviceStats.Mobile++;
        } else if (ua.includes('tablet') || ua.includes('ipad') || (ua.includes('android') && !ua.includes('mobile'))) {
          deviceStats.Tablet++;
        } else if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux') || ua.includes('chrome') || ua.includes('safari') || ua.includes('firefox')) {
          deviceStats.Desktop++;
        } else {
          deviceStats.Other++;
        }

        // Browser detection (simple heuristics)
        if (ua.includes('edg') || ua.includes('edge')) {
          browserStats.Edge = (browserStats.Edge || 0) + 1;
        } else if (ua.includes('chrome') && !ua.includes('edg')) {
          browserStats.Chrome = (browserStats.Chrome || 0) + 1;
        } else if (ua.includes('safari') && !ua.includes('chrome')) {
          browserStats.Safari = (browserStats.Safari || 0) + 1;
        } else if (ua.includes('firefox')) {
          browserStats.Firefox = (browserStats.Firefox || 0) + 1;
        } else {
          browserStats.Other = (browserStats.Other || 0) + 1;
        }
      }
    });

    // Calculate average clicks per day
    const daysActive = Object.keys(clicksByDate).length || 1;
    const avgClicksPerDay = Math.round(url.clicks / daysActive);

    // Get peak day
    let peakDay = null;
    let peakClicks = 0;
    Object.entries(clicksByDate).forEach(([date, clicks]) => {
      if (clicks > peakClicks) {
        peakClicks = clicks;
        peakDay = date;
      }
    });

      // Sanitize recent clicks to remove PII (no raw IPs)
      const recentClicks = (url.clickDetails?.slice(-20).reverse() || []).map(c => ({
        timestamp: c.timestamp,
        userAgent: c.userAgent,
        referer: c.referer
      }));

      return res.status(200).json({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      totalClicks: url.clicks,
      createdAt: url.createdAt,
      expiryDate: url.expiryDate,
      clicksByDate,
      clicksByHour,
      deviceStats,
      browserStats,
      avgClicksPerDay,
      peakDay,
      peakClicks,
      recentClicks,
    });
    } catch (err) {
      console.error(err);
      return res.status(503).json({ error: "Database connection failed" });
    }
  });
}
