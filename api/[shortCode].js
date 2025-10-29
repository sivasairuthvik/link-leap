// Redirect helper for frontend Vercel project.
// If a short URL was generated pointing to the frontend domain (e.g. https://shortner-link.vercel.app/api/abc)
// this function will redirect the request to the backend API where the redirect logic and DB live.

export default function handler(req, res) {
  const { shortCode } = req.query || {};
  if (!shortCode) {
    res.statusCode = 400;
    return res.end('shortCode required');
  }

  // Prefer explicit BACKEND_URL environment variable (set this in your frontend Vercel project).
  // Fallback to BASE_URL or a sensible default (update to your backend domain if different).
  const backend = process.env.BACKEND_URL || process.env.BASE_URL || 'https://api-shortner-link.vercel.app';
  const target = `${String(backend).replace(/\/$/, '')}/api/${encodeURIComponent(shortCode)}`;

  // Permanent or temporary redirect to the backend redirect endpoint which will return the final 302 -> originalUrl
  res.setHeader('Location', target);
  res.statusCode = 307; // temporary redirect preserves method
  return res.end();
}
