import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";
import { showToast } from "../components/Toast";

export default function DashboardLinks() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [deleting, setDeleting] = useState(null);
  
  // Create link form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchLinks = async () => {
    const token = localStorage.getItem("token");
    try {
      setError(null);
      const res = await apiFetch("/api/user-links", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUrls(data.urls || []);
        setLastRefresh(new Date());
      } else {
        setError("Failed to load links");
      }
    } catch (err) {
      console.error(err);
      setError("Error loading links. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
    // Refresh links every 20 seconds
    const interval = setInterval(fetchLinks, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (shortCode) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    const token = localStorage.getItem("token");
    setDeleting(shortCode);
    try {
      const res = await apiFetch(`/api/user-links?shortCode=${shortCode}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setUrls(urls.filter((url) => url.shortCode !== shortCode));
        showToast("Link deleted successfully!", "success");
      } else {
        setError("Failed to delete link");
        showToast("Failed to delete link", "error");
      }
    } catch (err) {
      console.error(err);
      setError("Error deleting link");
      showToast("Error deleting link", "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      showToast("Link copied to clipboard!", "success");
    }).catch(() => {
      showToast("Failed to copy link", "error");
    });
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    if (!originalUrl) {
      showToast("Please enter a URL", "error");
      return;
    }

    const token = localStorage.getItem("token");
    setCreating(true);
    try {
      const body = { originalUrl };
      if (customAlias) body.customAlias = customAlias;
      if (expiryDate) body.expiryDate = expiryDate;

      const res = await apiFetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to create link" }));
        showToast(data.error || "Failed to create link", "error");
        return;
      }

      const data = await res.json();
      showToast("Link created successfully!", "success");
      setOriginalUrl("");
      setCustomAlias("");
      setExpiryDate("");
      setShowCreateForm(false);
      fetchLinks(); // Refresh the list
    } catch (err) {
      console.error(err);
      showToast("Error creating link. Please try again.", "error");
    } finally {
      setCreating(false);
    }
  };

  const filteredUrls = urls.filter(
    (url) =>
      url.shortCode.includes(search) ||
      url.originalUrl.includes(search) ||
      url.shortUrl.includes(search)
  );

  if (loading) {
    return <div className="dashboard-loading">Loading links...</div>;
  }

  return (
    <div className="links-container">
      {error && <div className="error-message">{error}</div>}
      
      {/* Create Link Button */}
      <div className="create-link-toggle">
        <button 
          className="btn-create-link" 
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "✖ Cancel" : "➕ Create New Link"}
        </button>
      </div>

      {/* Create Link Form */}
      {showCreateForm && (
        <div className="create-link-form">
          <h3>Create New Short Link</h3>
          <form onSubmit={handleCreateLink}>
            <div className="form-group">
              <label htmlFor="originalUrl">Destination URL *</label>
              <input
                type="url"
                id="originalUrl"
                placeholder="https://example.com/your-long-url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customAlias">Custom Alias (Optional)</label>
                <input
                  type="text"
                  id="customAlias"
                  placeholder="my-custom-link"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date (Optional)</label>
                <input
                  type="date"
                  id="expiryDate"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={creating}>
              {creating ? "Creating..." : "✓ Create Link"}
            </button>
          </form>
        </div>
      )}

      <div className="links-header">
        <div className="header-left">
          <input
            type="text"
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <p>{filteredUrls.length} links found</p>
        </div>
        <div className="header-right">
          <small>Last updated: {lastRefresh.toLocaleTimeString()}</small>
          <button className="btn-refresh" onClick={fetchLinks}>🔄 Refresh</button>
        </div>
      </div>

      {filteredUrls.length === 0 ? (
        <div className="no-data">
          <p>No links created yet. Create your first link!</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="links-table">
            <thead>
              <tr>
                <th>Short Link</th>
                <th>Destination</th>
                <th>Created</th>
                <th>Clicks</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUrls.map((url) => {
                const isExpired =
                  url.expiryDate &&
                  new Date(url.expiryDate) < new Date();
                const daysLeft =
                  url.expiryDate
                    ? Math.ceil(
                        (new Date(url.expiryDate) - new Date()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : null;

                return (
                  <tr key={url._id}>
                    <td>
                      <a href={url.shortUrl} target="_blank" rel="noreferrer">
                        {url.shortUrl}
                      </a>
                    </td>
                    <td title={url.originalUrl}>
                      {url.originalUrl.substring(0, 50)}...
                    </td>
                    <td>{new Date(url.createdAt).toLocaleDateString()}</td>
                    <td>{url.clicks}</td>
                    <td>
                      <span className={`status ${isExpired ? "expired" : "active"}`}>
                        {isExpired ? "Expired" : daysLeft ? `${daysLeft}d` : "Forever"}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-copy"
                        onClick={() => handleCopy(url.shortUrl)}
                        title="Copy link"
                        disabled={deleting === url.shortCode}
                      >
                        📋
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(url.shortCode)}
                        title="Delete link"
                        disabled={deleting === url.shortCode}
                      >
                        {deleting === url.shortCode ? "⏳" : "🗑️"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
