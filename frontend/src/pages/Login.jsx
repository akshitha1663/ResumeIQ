import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const TABS = ["Student", "Admin"];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [tab, setTab]         = useState(0); // 0=Student, 1=Admin
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });
      const data = res.data;
      login(data, password);
      if (data.role === "ADMIN") {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (err.response?.status === 403) {
        setError("Access denied. Check your account permissions.");
      } else {
        setError(err.response?.data?.message || "Unable to connect. Please check the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      {/* Left panel */}
      <aside style={S.panel}>
        <Link to="/" style={S.brand}>
          <span style={S.brandBadge}>R</span>
          Resume<span style={{ color: "#67e8f9" }}>IQ</span>
        </Link>
        <div style={S.panelContent}>
          <p style={S.eyebrow}>AI CAREER PLATFORM</p>
          <h1 style={S.panelHeading}>Your career,<br />reimagined.</h1>
          <p style={S.panelSub}>Resume analysis, job matching, skill gap insights — all in one place.</p>
        </div>
        <div style={S.panelFeatures}>
          {["AI Resume Analysis", "Smart Job Matching", "Skill Gap Insights"].map(f => (
            <div key={f} style={S.featureRow}>
              <span style={S.checkCircle}>✓</span>
              <span style={{ color: "#dbeafe", fontSize: 14 }}>{f}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Right form */}
      <main style={S.formSide}>
        <div style={S.card}>
          {/* Tab toggle */}
          <div style={S.tabRow}>
            {TABS.map((t, i) => (
              <button
                key={t}
                style={{ ...S.tab, ...(tab === i ? S.tabActive : {}) }}
                onClick={() => { setTab(i); setError(""); }}
                type="button"
              >
                {t === "Student" ? "🎓 Student" : "🛡️ Admin"} Login
              </button>
            ))}
          </div>

          <div style={S.formHeader}>
            <h2 style={S.formTitle}>Welcome back!</h2>
            <p style={S.formSub}>
              Sign in as a {TABS[tab]} to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-field">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email" type="email" className="form-input"
                placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email" required
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password" type="password" className="form-input"
                placeholder="Enter your password" value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password" required
              />
            </div>

            {error && <div className="alert alert-error" role="alert">{error}</div>}

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />&nbsp;Signing in...</> : "Sign In →"}
            </button>
          </form>

          <p style={S.footerText}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--clr-primary)", fontWeight: 600 }}>Register</Link>
          </p>
          <Link to="/" style={S.backLink}>← Back to Home</Link>
        </div>
      </main>
    </div>
  );
}

const S = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "var(--font)" },
  panel: {
    width: 420, background: "var(--grad-hero)", color: "#fff",
    display: "flex", flexDirection: "column", padding: "40px 44px",
    flexShrink: 0,
  },
  brand: {
    display: "flex", alignItems: "center", gap: 12, fontSize: 24, fontWeight: 800,
    color: "#fff", textDecoration: "none", marginBottom: 60,
  },
  brandBadge: {
    width: 40, height: 40, borderRadius: 10,
    background: "linear-gradient(135deg,#8b5cf6,#06b6d4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, fontWeight: 900,
  },
  panelContent: { flex: 1 },
  eyebrow: { fontSize: 11, letterSpacing: 1.5, color: "#a5f3fc", marginBottom: 14, fontWeight: 700 },
  panelHeading: { fontSize: "clamp(28px,3vw,36px)", fontWeight: 800, lineHeight: 1.25, marginBottom: 18 },
  panelSub: { color: "#dbeafe", fontSize: 15, lineHeight: 1.6 },
  panelFeatures: { marginTop: 40, display: "flex", flexDirection: "column", gap: 12 },
  featureRow: { display: "flex", alignItems: "center", gap: 10 },
  checkCircle: {
    width: 22, height: 22, borderRadius: "50%",
    background: "rgba(16,185,129,.25)", color: "#6ee7b7",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0,
  },
  formSide: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    background: "var(--clr-bg)", padding: "40px 24px",
  },
  card: {
    width: "100%", maxWidth: 440, background: "#fff",
    borderRadius: 24, padding: "40px 36px", boxShadow: "var(--shadow-lg)",
  },
  tabRow: { display: "flex", background: "var(--clr-surface-2)", borderRadius: 12, padding: 4, marginBottom: 28, gap: 4 },
  tab: {
    flex: 1, padding: "10px 8px", border: "none", borderRadius: 10,
    background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600,
    color: "var(--clr-text-muted)", transition: "all .2s",
  },
  tabActive: { background: "#fff", color: "var(--clr-primary)", boxShadow: "0 2px 8px rgba(0,0,0,.1)" },
  formHeader: { marginBottom: 24 },
  formTitle: { fontSize: 26, fontWeight: 800, color: "var(--clr-text)", marginBottom: 6 },
  formSub: { color: "var(--clr-text-muted)", fontSize: 14 },
  footerText: { textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--clr-text-muted)" },
  backLink: { display: "block", textAlign: "center", color: "var(--clr-text-faint)", fontSize: 13, marginTop: 12 },
};