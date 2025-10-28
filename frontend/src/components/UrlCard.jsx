export default function UrlCard({ url }) {
  return (
    <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 6, marginBottom: 8 }}>
      <div><strong>{url.shortUrl}</strong></div>
      <div style={{ fontSize: 12, color: '#444' }}>{url.originalUrl}</div>
      <div style={{ fontSize: 12, color: '#888' }}>Clicks: {url.clicks}</div>
    </div>
  );
}
