import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DashboardAnalytics() {
  const [urls, setUrls] = useState([]);
  const [selectedLink, setSelectedLink] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [chartType, setChartType] = useState("line"); // line, bar, area

  // Colors for charts
  const COLORS = {
    primary: "#667eea",
    secondary: "#764ba2",
    success: "#48bb78",
    info: "#4299e1",
    warning: "#ed8936",
    mobile: "#f6ad55",
    desktop: "#667eea",
  };

  const PIE_COLORS = ["#667eea", "#764ba2", "#48bb78", "#4299e1", "#ed8936"];

  const fetchLinks = async () => {
    const token = localStorage.getItem("token");
    try {
      setError(null);
      const res = await apiFetch("/api/user-links", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.urls) {
        setUrls(data.urls);
        if (data.urls.length > 0 && !selectedLink) {
          loadStats(data.urls[0].shortCode);
          setSelectedLink(data.urls[0]);
        }
      } else {
        setError("Failed to load analytics");
      }
    } catch (err) {
      console.error(err);
      setError("Error loading analytics");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (shortCode) => {
    try {
      setError(null);
      const res = await apiFetch(`/api/link-stats?shortCode=${shortCode}`);
      const data = await res.json();
      if (res.ok) {
        setStats(data);
        setLastRefresh(new Date());
      } else {
        setError("Failed to load link statistics");
      }
    } catch (err) {
      console.error(err);
      setError("Error loading statistics");
    }
  };

  // Process data for charts
  const getChartData = () => {
    if (!stats?.clicksByDate) return [];
    return Object.entries(stats.clicksByDate)
      .map(([date, clicks]) => ({
        date: date,
        clicks: clicks,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Process device data
  const getDeviceData = () => {
    if (!stats?.deviceStats) return [];
    
    return Object.entries(stats.deviceStats)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  };

  // Process browser data
  const getBrowserData = () => {
    if (!stats?.browserStats) return [];
    
    return Object.entries(stats.browserStats)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  };

  // Process hourly data
  const getHourlyData = () => {
    if (!stats?.clicksByHour) return [];
    
    return Object.entries(stats.clicksByHour)
      .map(([hour, clicks]) => ({
        hour: hour,
        clicks: clicks,
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  };

  useEffect(() => {
    fetchLinks();
    // Refresh analytics every 25 seconds
    const interval = setInterval(() => {
      fetchLinks();
      if (selectedLink) {
        loadStats(selectedLink.shortCode);
      }
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading analytics...</div>;
  }

  if (urls.length === 0) {
    return (
      <div className="no-data">
        <p>No links to analyze yet. Create your first link!</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {error && <div className="error-message">{error}</div>}
      <div className="analytics-sidebar">
        <h3>Your Links</h3>
        <div className="refresh-info-small">
          <small>Updated: {lastRefresh.toLocaleTimeString()}</small>
          <button className="btn-refresh-small" onClick={() => loadStats(selectedLink.shortCode)}>🔄</button>
        </div>
        <div className="links-list">
          {urls.map((url) => (
            <button
              key={url._id}
              className={`link-item ${
                selectedLink?.shortCode === url.shortCode ? "active" : ""
              }`}
              onClick={() => {
                setSelectedLink(url);
                loadStats(url.shortCode);
              }}
            >
              <span className="link-code">{url.shortCode}</span>
              <span className="link-clicks">{url.clicks} clicks</span>
            </button>
          ))}
        </div>
      </div>

      <div className="analytics-content">
        {stats && (
          <>
            <div className="stats-cards">
              <div className="stats-card">
                <h4>Total Clicks</h4>
                <p className="big-number">{stats.totalClicks || 0}</p>
              </div>
              <div className="stats-card">
                <h4>Avg Clicks/Day</h4>
                <p className="big-number">{stats.avgClicksPerDay || 0}</p>
              </div>
              <div className="stats-card">
                <h4>Peak Day</h4>
                <p>{stats.peakDay || "N/A"}</p>
                <small>{stats.peakClicks ? `${stats.peakClicks} clicks` : ""}</small>
              </div>
              <div className="stats-card">
                <h4>Link Status</h4>
                <p className="status-badge">
                  {stats.expiryDate && new Date(stats.expiryDate) < new Date()
                    ? "🔴 Expired"
                    : "🟢 Active"}
                </p>
              </div>
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <h3>Clicks Over Time</h3>
                <div className="chart-controls">
                  <button
                    className={`chart-btn ${chartType === "line" ? "active" : ""}`}
                    onClick={() => setChartType("line")}
                  >
                    📈 Line
                  </button>
                  <button
                    className={`chart-btn ${chartType === "bar" ? "active" : ""}`}
                    onClick={() => setChartType("bar")}
                  >
                    📊 Bar
                  </button>
                  <button
                    className={`chart-btn ${chartType === "area" ? "active" : ""}`}
                    onClick={() => setChartType("area")}
                  >
                    📉 Area
                  </button>
                </div>
              </div>
              <div className="chart-container">
                {getChartData().length === 0 ? (
                  <p className="no-data">No clicks yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    {chartType === "line" ? (
                      <LineChart data={getChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#888"
                          style={{ fontSize: "0.85rem" }}
                        />
                        <YAxis 
                          stroke="#888"
                          style={{ fontSize: "0.85rem" }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="clicks"
                          stroke={COLORS.primary}
                          strokeWidth={3}
                          dot={{ fill: COLORS.primary, r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    ) : chartType === "bar" ? (
                      <BarChart data={getChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#888"
                          style={{ fontSize: "0.85rem" }}
                        />
                        <YAxis 
                          stroke="#888"
                          style={{ fontSize: "0.85rem" }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="clicks" 
                          fill={COLORS.primary}
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    ) : (
                      <AreaChart data={getChartData()}>
                        <defs>
                          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#888"
                          style={{ fontSize: "0.85rem" }}
                        />
                        <YAxis 
                          stroke="#888"
                          style={{ fontSize: "0.85rem" }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="clicks"
                          stroke={COLORS.primary}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorClicks)"
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Device Distribution Chart */}
            {getDeviceData().length > 0 && (
              <div className="chart-section">
                <h3>Device Distribution</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getDeviceData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getDeviceData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Browser Distribution Chart */}
            {getBrowserData().length > 0 && (
              <div className="chart-section">
                <h3>Browser Distribution</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getBrowserData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" stroke="#888" style={{ fontSize: "0.85rem" }} />
                      <YAxis type="category" dataKey="name" stroke="#888" style={{ fontSize: "0.85rem" }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                        }}
                      />
                      <Bar dataKey="value" fill={COLORS.secondary} radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Hourly Activity Chart */}
            {getHourlyData().length > 0 && (
              <div className="chart-section">
                <h3>Clicks by Hour</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getHourlyData()}>
                      <defs>
                        <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="hour" 
                        stroke="#888"
                        style={{ fontSize: "0.85rem" }}
                      />
                      <YAxis 
                        stroke="#888"
                        style={{ fontSize: "0.85rem" }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="clicks"
                        stroke={COLORS.success}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorHourly)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="recent-clicks">
              <h3>Recent Clicks</h3>
              {(stats.recentClicks || []).length === 0 ? (
                <p className="no-data">No clicks recorded yet</p>
              ) : (
                <div className="clicks-list">
                  {stats.recentClicks.map((click, idx) => (
                    <div key={idx} className="click-item">
                      <span className="click-time">
                        {new Date(click.timestamp).toLocaleString()}
                      </span>
                      {click.userAgent && (
                        <span className="click-device">
                          {click.userAgent.includes("Mobile")
                            ? "📱 Mobile"
                            : "💻 Desktop"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
