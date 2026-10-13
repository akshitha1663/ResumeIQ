import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const studentLinks = [
  { to: "/dashboard",       icon: "⊞",  label: "Dashboard" },
  { to: "/ai-assistant",    icon: "🤖", label: "AI Assistant" },
  { to: "/resume-analysis", icon: "📊", label: "Resume Analyzer" },
  { to: "/jobs",            icon: "💼", label: "Jobs" },
  { to: "/recommendations", icon: "⭐", label: "Recommendations" },
  { to: "/skill-gap",       icon: "📈", label: "Skill Gap" },
  { to: "/resume-upload",   icon: "📄", label: "Upload Resume" },
];

const adminLinks = [
  { to: "/admin-dashboard", icon: "⊞",  label: "Dashboard" },
  { to: "/admin/users",     icon: "👤", label: "Manage Users" },
  { to: "/admin/jobs",      icon: "💼", label: "Manage Jobs" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const links = user?.role === "ADMIN" ? adminLinks : studentLinks;

  const filtered = links.filter(l =>
    l.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="sidebar">
      {/* Logo */}
      <Link to="/" className="sidebar-logo">
        <span className="logo-badge">R</span>
        <span>Resume<span style={{ color: "var(--clr-primary)" }}>IQ</span></span>
      </Link>

      {/* Search */}
      <div className="sidebar-search">
        <span style={{ fontSize: 14, color: "var(--clr-text-faint)" }}>🔍</span>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Nav links */}
      <div className="sidebar-section">
        <p className="sidebar-section-label">
          {user?.role === "ADMIN" ? "Admin Panel" : "Menu"}
        </p>
        {filtered.map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar-link${location.pathname === to ? " active" : ""}`}
          >
            <span className="link-icon">{icon}</span>
            {label}
          </Link>
        ))}
      </div>

      {/* Upgrade card */}
      {user?.role !== "ADMIN" && (
        <div className="sidebar-upgrade">
          <p>⚡ Interview + Job Reports</p>
          <small>Unlock AI-powered features</small>
          <button onClick={() => navigate("/ai-assistant")}>Try AI Assistant</button>
        </div>
      )}

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="sidebar-user-name">{user?.name || "User"}</p>
            <p className="sidebar-user-email">{user?.email || ""}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="btn btn-ghost btn-sm btn-full"
          style={{ marginTop: 10, justifyContent: "flex-start", gap: 8 }}
        >
          ↪ Sign out
        </button>
      </div>
    </aside>
  );
}
