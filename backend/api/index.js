// Provide a simple index that forwards to the status page
export default function handler(req, res) {
  // For serverless functions, redirect to /api/status
  res.writeHead(302, { Location: '/api/status' });
  res.end();
}
