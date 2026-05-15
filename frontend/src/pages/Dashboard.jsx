import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import DashboardOverview from "./DashboardOverview";
import DashboardLinks from "./DashboardLinks";
import DashboardAnalytics from "./DashboardAnalytics";
import DashboardSettings from "./DashboardSettings";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await apiFetch("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setUser(data.user);
        }
      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>🔗 link-leap</h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span className="icon">📊</span> Overview
          </button>
          <button
            className={`nav-item ${activeTab === "links" ? "active" : ""}`}
            onClick={() => setActiveTab("links")}
          >
            <span className="icon">🔗</span> Links
          </button>
          <button
            className={`nav-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <span className="icon">📈</span> Analytics
          </button>
          <button
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <span className="icon">⚙️</span> Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <div className="dashboard-topbar">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="topbar-right">
            <div className="user-profile">
              <div className="user-avatar">
                {(user?.name?.charAt(0) ?? '').toUpperCase()}
              </div>
              <div className="user-info">
                <p className="user-name">{user?.name ?? ''}</p>
                <p className="user-email">{user?.email ?? '—'}</p>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="dashboard-content">
          {activeTab === "overview" && <DashboardOverview user={user} setActiveTab={setActiveTab} />}
          {activeTab === "links" && <DashboardLinks user={user} />}
          {activeTab === "analytics" && <DashboardAnalytics user={user} />}
          {activeTab === "settings" && <DashboardSettings user={user} />}
        </div>
      </main>
    </div>
  );
}
