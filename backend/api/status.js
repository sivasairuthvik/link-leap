export default function handler(req, res) {
  // Simple status page for the API
  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>API - link-leap</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:2rem;color:#111} a{color:#06f}</style>
      </head>
      <body>
        <h1>link-leap API</h1>
        <p>Status: <strong>Online</strong></p>
        <ul>
          <li><a href="/api/links">/api/links</a> — list stored links (GET)</li>
          <li><a href="/api/shorten">/api/shorten</a> — shorten a link (POST)</li>
          <li><a href="/api/status">/api/status</a> — this page</li>
        </ul>
        <p>If you see this page, the backend is deployed and responding.</p>
      </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  // Allow status to be fetched cross-origin too
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Vary', 'Origin');
  res.status(200).send(html);
}
