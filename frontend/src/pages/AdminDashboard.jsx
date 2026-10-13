import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    api.get("/admin/stats")
      .then(r => setStats(r.data))
      .catch(err => {
        if (err.response?.status === 403) setError("Access denied. Admin role required.");
        else setError("Unable to load dashboard stats.");
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { icon: "👤", label: "Total Students", value: stats.users,   color: "rgba(79,70,229,.1)" },
        { icon: "📄", label: "Resumes Uploaded", value: stats.resumes, color: "rgba(6,182,212,.1)" },
        { icon: "💼", label: "Jobs Available",  value: stats.jobs,    color: "rgba(16,185,129,.1)" },
      ]
    : [];

  const quickActions = [
    { icon: "👤", title: "Manage Users",  desc: "View and delete student accounts.", to: "/admin/users", color: "rgba(139,92,246,.1)" },
    { icon: "💼", title: "Manage Jobs",   desc: "Create, edit, and delete jobs.",   to: "/admin/jobs",  color: "rgba(6,182,212,.1)" },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <span style={{ display: "inline-block", padding: "4px 10px", background: "rgba(139,92,246,.12)", color: "var(--clr-secondary)", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
              ADMIN PANEL
            </span>
            <h1 className="page-title">Admin Dashboard</h1>
          </div>
        </div>
        <div className="page-body">
          {loading && <div className="loading-center"><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /><p>Loading stats…</p></div>}
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          {/* Stats */}
          {stats && (
            <div className="stats-grid" style={{ marginBottom: 28 }}>
              {statCards.map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-icon-wrap" style={{ background: s.color }}>{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div className="section-header"><span className="section-title">Quick Actions</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 16 }}>
            {quickActions.map(a => (
              <Link key={a.to} to={a.to} style={{ textDecoration: "none" }}>
                <div className="card" style={{ cursor: "pointer" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: a.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>
                    {a.icon}
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{a.title}</p>
                  <p style={{ fontSize: 13, color: "var(--clr-text-muted)", marginBottom: 14 }}>{a.desc}</p>
                  <span style={{ color: "var(--clr-primary)", fontWeight: 600, fontSize: 13 }}>Open →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}