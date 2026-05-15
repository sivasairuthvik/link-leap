import dbConnect from "../lib/dbConnect.js";
import Url from "../models/Url.js";
import crypto from "node:crypto";

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');
};

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { shortCode } = req.query || {};

  // Validate DB connection and handle errors
  try {

// IP salt handling: prefer configured salt; if IP collection enabled and no salt provided,
// generate a runtime salt and warn (runtime salt won't persist across restarts).
const ENABLE_IP_COLLECTION = (process.env.ENABLE_IP_COLLECTION || 'false') === 'true';
let ipSalt = process.env.IP_SALT && process.env.IP_SALT.trim() ? process.env.IP_SALT : null;
if (ENABLE_IP_COLLECTION && !ipSalt) {
  try {
    ipSalt = crypto.randomBytes(32).toString('hex');
    console.warn('[click-tracking] ENABLE_IP_COLLECTION=true but IP_SALT not set — using runtime-generated salt. This salt will not persist across restarts. Set IP_SALT in env to ensure stable pseudonyms.');
  } catch (err) {
    console.error('[click-tracking] Failed to generate runtime IP salt:', err);
    ipSalt = null;
  }
  }

    await dbConnect();
  } catch (err) {
    console.error("DB connect failed:", err);
    return res.status(503).json({ error: "Database connection failed" });
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // Validate frontend URL for use in HTML templates to avoid XSS via malformed origin
  let safeFrontendUrl = '/';
  try {
    const u = new URL(frontendUrl);
    // Only allow origin (scheme + host + optional port)
    safeFrontendUrl = u.origin;
  } catch (err) {
    // fallback to root
    safeFrontendUrl = '/';
  }

  const url = await Url.findOne({ shortCode });
  if (!url) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - Page Not Found</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            overflow: hidden;
            position: relative;
          }
          
          /* Animated background elements */
          .background-blob {
            position: absolute;
            border-radius: 50%;
            opacity: 0.1;
            animation: float 6s ease-in-out infinite;
          }
          
          .blob1 {
            width: 300px;
            height: 300px;
            background: white;
            top: 10%;
            right: 5%;
            animation-delay: 0s;
          }
          
          .blob2 {
            width: 200px;
            height: 200px;
            background: white;
            bottom: 10%;
            left: 5%;
            animation-delay: 2s;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(20px); }
          }
          
          .container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 80px 60px;
            text-align: center;
            max-width: 600px;
            box-shadow: 0 30px 100px rgba(0, 0, 0, 0.3);
            position: relative;
            z-index: 1;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .error-code {
            font-size: 120px;
            font-weight: 900;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 20px;
            animation: bounce 2s ease-in-out infinite;
            line-height: 1;
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          .icon {
            font-size: 100px;
            margin-bottom: 20px;
            animation: spin 3s linear infinite;
            display: inline-block;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          h1 {
            color: #1a1a1a;
            font-size: 36px;
            font-weight: 700;
            margin: 20px 0 15px 0;
            letter-spacing: -0.5px;
          }
          
          .subtitle {
            color: #555;
            font-size: 18px;
            margin-bottom: 10px;
            font-weight: 500;
          }
          
          p {
            color: #777;
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 40px;
            max-width: 450px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .button-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
          }
          
          .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 32px;
            border: none;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          
          .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
          }
          
          .btn-primary:active {
            transform: translateY(-1px);
          }
          
          .btn-secondary {
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
          }
          
          .btn-secondary:hover {
            background: #f8f8ff;
            transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba(102, 126, 234, 0.2);
          }
          
          .btn-secondary:active {
            transform: translateY(-1px);
          }
          
          .help-text {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #eee;
            color: #999;
            font-size: 14px;
          }
          
          .help-text strong {
            color: #667eea;
          }
          
          @media (max-width: 600px) {
            .container {
              padding: 50px 30px;
            }
            
            .error-code {
              font-size: 80px;
            }
            
            .icon {
              font-size: 70px;
            }
            
            h1 {
              font-size: 28px;
            }
            
            p {
              font-size: 15px;
            }
            
            .button-group {
              flex-direction: column;
              gap: 10px;
            }
            
            .btn {
              width: 100%;
              justify-content: center;
            }
          }
        </style>
      </head>
      <body>
        <div class="background-blob blob1"></div>
        <div class="background-blob blob2"></div>
        
        <div class="container">
          <div class="error-code">404</div>
          <div class="icon">🔗</div>
          
          <h1>Link Not Found</h1>
          <p class="subtitle">Oops! This link doesn't exist</p>
          
          <p>The link you're trying to access doesn't exist in our database or may have been removed. But don't worry, you can create your own link right now!</p>
          
          <div class="button-group">
            <a href="${encodeURI(safeFrontendUrl)}" class="btn btn-primary">
              🏠 Go Home
            </a>
            <a href="${encodeURI(safeFrontendUrl)}" class="btn btn-secondary">
              ➕ Create New Link
            </a>
          </div>
          
          <div class="help-text">
            <strong>Need help?</strong> Make sure the link is correct and try again.
          </div>
        </div>
      </body>
      </html>
    `);
  }

  if (url.expiryDate && url.expiryDate < new Date()) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(410).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Link Expired</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 16px;
            padding: 60px 40px;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
          .icon {
            font-size: 80px;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          h1 {
            color: #d32f2f;
            font-size: 28px;
            margin-bottom: 12px;
          }
          p {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 10px;
          }
          .expiry-info {
            background: #fff3cd;
            border-left: 4px solid #f5576c;
            padding: 12px;
            border-radius: 4px;
            margin: 20px 0;
            text-align: left;
            font-size: 14px;
            color: #333;
          }
          a {
            display: inline-block;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 12px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: transform 0.2s;
            margin-top: 20px;
          }
          a:hover {
            transform: scale(1.05);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">⏰</div>
          <h1>Link Expired</h1>
          <p>This link was set to expire on:</p>
          <div class="expiry-info">
            <strong>${new Date(url.expiryDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</strong>
          </div>
          <p>The link is no longer accessible. Create a new one to continue!</p>
          <a href="${encodeURI(safeFrontendUrl)}">← Go Home</a>
        </div>
      </body>
      </html>
    `);
  }

  // Track click details (anonymize IPs; only store when enabled via env)
  const ipRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const enableIp = (process.env.ENABLE_IP_COLLECTION || 'false') === 'true';

  const clickDetail = {
    timestamp: new Date(),
    userAgent: req.headers['user-agent'] || 'Unknown',
    referer: req.headers.referer || req.headers.referrer || ''
  };

  if (enableIp && ipRaw) {
    const salt = process.env.IP_SALT || '';
    // HMAC to pseudonymize IPs; store truncated hex
    try {
      const h = crypto.createHmac('sha256', salt).update(ipRaw).digest('hex').substring(0, 32);
      clickDetail.ipHash = h;
    } catch (err) {
      console.error('Failed to hash IP:', err);
    }
  }

  // Persist click using atomic update with capped array to avoid unbounded growth
  try {
    await Url.updateOne(
      { _id: url._id },
      {
        $inc: { clicks: 1 },
        $push: { clickDetails: { $each: [clickDetail], $slice: -100 } },
      }
    );
  } catch (err) {
    // Non-fatal: log error but do not block the redirect
    console.error('Failed to record click detail (non-fatal):', err);
  }

  // Redirect to the original URL (do not wait on DB beyond the update above)
  try {
    return res.redirect(302, url.originalUrl);
  } catch (err) {
    console.error('Redirect failed:', err);
    return res.status(500).json({ error: 'Failed to redirect' });
  }
  
