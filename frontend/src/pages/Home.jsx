import { useState } from "react";
import { apiFetch } from "../lib/api";
import { showToast } from "../components/Toast";
import "../styles/Home.css";

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [shortUrl, setShortUrl] = useState(null);
  const [expiryInfo, setExpiryInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get today's date for minimum date constraint
  const today = new Date().toISOString().split('T')[0];

  const shorten = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // If expiryDate is provided, convert it to ISO string with time
      const expiryPayload = expiryDate ? new Date(expiryDate).toISOString() : undefined;

      const res = await apiFetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          originalUrl, 
          expiryDate: expiryPayload,
          customAlias: customAlias || undefined 
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to shorten');
        setShortUrl(null);
        setExpiryInfo(null);
      } else {
        setShortUrl(data.shortUrl || data.shortUrl);
        if (data.expiryDate) {
          const expDate = new Date(data.expiryDate);
          setExpiryInfo({
            date: expDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          });
        } else {
          setExpiryInfo(null);
        }
        setShortUrl(data.shortUrl);
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
    showToast("Link copied to clipboard!", "success");
  };

  return (
    <div className="shortener-container">
      <div className="shortener-header">
        <h2>Shorten a URL</h2>
      </div>
      
      <form onSubmit={shorten} className="shortener-form">
        <div className="form-field">
          <label>Enter your long URL</label>
          <input
            type="url"
            placeholder="https://example.com/very/long/link"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
          />
        </div>
        
        <div className="form-field">
          <label>Custom alias (optional)</label>
          <input
            type="text"
            placeholder="my-custom-link"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
          />
        </div>
        
        <div className="form-field">
          <label>Link expiry date (optional)</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            min={today}
          />
          {expiryDate && (
            <div className="expiry-preview">
              Link will expire on: <strong>{new Date(expiryDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            </div>
          )}
        </div>
        
        <button type="submit" disabled={loading} className="btn-shorten">
          {loading ? "Shortening..." : "Shorten URL"}
        </button>
      </form>

      {shortUrl && (
        <div className="result-container">
          <div className="result-field">
            <span className="result-label">Your Short URL:</span>
            <a href={shortUrl} target="_blank" rel="noreferrer" className="result-link">{shortUrl}</a>
          </div>
          {expiryInfo && (
            <div className="expiry-info">
              <strong>⏰ Link expires:</strong> {expiryInfo.date}
            </div>
          )}
          <button onClick={copy} className="btn-copy">📋 Copy Link</button>
        </div>
      )}
      
      {error && (
        <div className="error-box">{error}</div>
      )}
    </div>
  );
}
