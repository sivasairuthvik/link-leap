// Redirect helper for frontend Vercel project.
// If a short URL was generated pointing to the frontend domain (e.g. https://shortner-link.vercel.app/api/abc)
// this function will redirect the request to the backend API where the redirect logic and DB live.

export default function handler(req, res) {
  (async () => {
    const { shortCode } = req.query || {};
    if (!shortCode) {
      res.statusCode = 400;
      return res.end('shortCode required');
    }

    // Prefer explicit BACKEND_URL environment variable (set this in your frontend Vercel project).
    // Fallback to BASE_URL or a sensible default (update to your backend domain if different).
    const backend = process.env.BACKEND_URL || process.env.BASE_URL || 'https://api-shortner-link.vercel.app';
    const target = `${String(backend).replace(/\/$/, '')}/api/${encodeURIComponent(shortCode)}`;

    try {
      // Fetch the backend redirect endpoint server-side so we can surface accurate errors
      const resp = await fetch(target, { method: 'GET', redirect: 'manual' });

      // If backend responds with a redirect (302/301/etc) forward that to the client
      if (resp.status >= 300 && resp.status < 400) {
        const location = resp.headers.get('location');
        if (location) {
          res.setHeader('Location', location);
          res.statusCode = resp.status;
          return res.end();
        }
      }

      // If backend returned 404 or 410 or another status, mirror it and show a small message
      const text = await resp.text();
      res.statusCode = resp.status || 502;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end(text || `Upstream returned status ${resp.status}`);
    } catch (err) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('Failed to reach backend: ' + String(err.message || err));
    }
  })();
}
