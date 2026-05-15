import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

export default function DashboardOverview({ setActiveTab }) {
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    activeLinks: 0,
    averageClicks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    try {
      setError(null);
      const res = await apiFetch("/api/user-links", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.urls) {
        const urls = data.urls;
        const totalLinks = urls.length;
        const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);
        const activeLinks = urls.filter(
          (url) =>
            !url.expiryDate ||
            new Date(url.expiryDate) > new Date()
        ).length;
        const averageClicks =
          totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0;

        setStats({
          totalLinks,
          totalClicks,
          activeLinks,
          averageClicks,
        });
        setLastRefresh(new Date());
      } else {
        setError("Failed to fetch stats");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching stats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="overview-loading">Loading overview...</div>;
  }

  return (
    <div className="overview-container">      {error && <div className="error-message">{error}</div>}
      <div className="refresh-info">
        <small>Last updated: {lastRefresh.toLocaleTimeString()}</small>
        <button className="btn-refresh" onClick={fetchStats}>🔄 Refresh Now</button>
      </div>      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔗</div>
          <div className="stat-content">
            <p className="stat-label">Total Links</p>
            <p className="stat-value">{stats.totalLinks}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-content">
            <p className="stat-label">Total Clicks</p>
            <p className="stat-value">{stats.totalClicks}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p className="stat-label">Active Links</p>
            <p className="stat-value">{stats.activeLinks}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <p className="stat-label">Avg Clicks/Link</p>
            <p className="stat-value">{stats.averageClicks}</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => setActiveTab("links")}>
            <span className="action-icon">➕</span>
            <span>Create New Link</span>
          </button>
          <button className="action-btn" onClick={() => setActiveTab("analytics")}>
            <span className="action-icon">📊</span>
            <span>View Analytics</span>
          </button>
          <button className="action-btn" onClick={() => setActiveTab("settings")}>
            <span className="action-icon">⚙️</span>
            <span>Manage Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
