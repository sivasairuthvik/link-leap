import { useEffect, useState } from "react";

function formatDate(d) {
  if (!d) return "-";
  try { return new Date(d).toLocaleString(); } catch { return d; }
}

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/links")
      .then((r) => r.json())
      .then(setUrls)
      .catch((e) => console.error(e));
  }, []);

  const filtered = urls.filter(u => {
    if (!q) return true;
    return (u.originalUrl || "").includes(q) || (u.shortCode || "").includes(q) || (u.shortUrl || "").includes(q);
  });

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ marginBottom: 12 }}>
        <input placeholder="Search" value={q} onChange={e => setQ(e.target.value)} style={{ padding:8 }} />
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Created At</th>
              <th>Short Link</th>
              <th>Destination</th>
              <th>Visitors</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u._id} style={{ borderTop: '1px solid #ddd' }}>
                <td style={{ padding: 8 }}>{formatDate(u.createdAt)}</td>
                <td style={{ padding: 8 }}><a href={u.shortUrl} target="_blank" rel="noreferrer">{u.shortUrl}</a></td>
                <td style={{ padding: 8 }}>{u.originalUrl}</td>
                <td style={{ padding: 8 }}>{u.clicks}</td>
                <td style={{ padding: 8 }}>{u.expiryDate ? formatDate(u.expiryDate) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
