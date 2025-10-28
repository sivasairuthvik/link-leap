import { useState } from "react";

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [shortUrl, setShortUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const shorten = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl, expiryDate, customAlias: customAlias || undefined })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to shorten');
        setShortUrl(null);
      } else {
        setShortUrl(data.shortUrl || data.shortUrl);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!shortUrl) return;
    await navigator.clipboard.writeText(shortUrl);
    alert("Copied!");
  };

  return (
    <div>
      <h2>Shorten a URL</h2>
      <form onSubmit={shorten} style={{ maxWidth: 720, margin: "1rem auto" }}>
        <div style={{ marginBottom: 8 }}>
          <input
            placeholder="https://example.com/very/long/link"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <input
            placeholder="Optional custom alias (letters, numbers, -, _)"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            style={{ width: 240, padding: 8 }}
          /> {
            /* optional expiry */
          }
        </div>
        <button type="submit" disabled={loading} style={{ padding: "8px 12px" }}>
          {loading ? "Shortening..." : "Shorten"}
        </button>
      </form>

      {shortUrl && (
        <div style={{ marginTop: 16 }}>
          <div>Short URL: <a href={shortUrl} target="_blank" rel="noreferrer">{shortUrl}</a></div>
          <button onClick={copy} style={{ marginTop: 8 }}>Copy</button>
        </div>
      )}
      {error && (
        <div style={{ marginTop: 12, color: 'crimson' }}>{error}</div>
      )}
    </div>
  );
}
