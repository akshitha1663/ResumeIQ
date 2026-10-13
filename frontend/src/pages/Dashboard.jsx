import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

/* Circular donut score component */
function DonutRing({ score, size = 140, stroke = 10 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100);
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 70 ? "#00b894" : pct >= 40 ? "#fdcb6e" : "#e17055";
  return (
    <div className="score-ring-wrap" style={{ width: size, height: size }}>
      <svg className="score-ring-svg" style={{ width: size, height: size }} viewBox={`0 0 ${size} ${size}`}>
        <circle className="score-ring-track" cx={size/2} cy={size/2} r={r} />
        <circle
          className="score-ring-fill"
          cx={size/2} cy={size/2} r={r}
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-ring-label">
        <span className="score-ring-value" style={{ color }}>{pct}</span>
        <span className="score-ring-sub">Resume Score</span>
      </div>
    </div>
  );
}

/* Mini heatmap (last 90 days, random activity for demo, real when API supports it) */
function ActivityHeatmap({ days = 90 }) {
  const cells = Array.from({ length: days }, (_, i) => {
    const seed = (i * 37 + 13) % 7;
    return seed === 0 ? 0 : seed <= 2 ? 1 : seed <= 4 ? 2 : seed <= 5 ? 3 : 4;
  });
  const lvClass = ["", "lv1", "lv2", "lv3", "lv4"];
  return (
    <div className="heatmap-grid">
      {cells.map((lv, i) => (
        <div key={i} className={`heatmap-cell ${lvClass[lv]}`} title={`Day ${i+1}`} />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resumeId = sessionStorage.getItem("resumeId");
    Promise.all([
      api.get("/resumes/my").catch(() => ({ data: [] })),
      api.get("/jobs").catch(() => ({ data: [] })),
      resumeId
        ? api.get(`/resumes/${resumeId}/analysis`).catch(() => ({ data: null }))
        : Promise.resolve({ data: null }),
      resumeId
        ? api.get(`/recommendations/${resumeId}?top=3`).catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] }),
    ]).then(([r, j, a, rec]) => {
      setResumes(r.data || []);
      setJobs(j.data || []);
      setAnalysis(a.data);
      setRecommendations(rec.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const score = analysis?.resumeScore ?? 0;
  const latestResume = resumes[0];

  const scoreLabel = score >= 70 ? "Great" : score >= 40 ? "Good" : "Needs Work";

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <h1 className="topbar-title">Dashboard</h1>
          <div className="topbar-right">
            <button className="topbar-icon-btn" title="Notifications">🔔</button>
            <button className="topbar-icon-btn" title="Settings">⚙️</button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="topbar-avatar">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="topbar-user-name">{user?.name || "User"}</p>
                <p className="topbar-user-role">{user?.role === "ADMIN" ? "Administrator" : "Student"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="page-body">
          {/* Action cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div className="card" style={{ background: "var(--grad-primary)", border: "none", color: "#fff", cursor: "pointer" }}
              onClick={() => navigate("/ai-assistant")}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🤖</div>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>AI Assistant</p>
              <p style={{ fontSize: 13, opacity: .85 }}>Get coding help, explanations, and project guidance.</p>
              <p style={{ marginTop: 14, fontSize: 13, fontWeight: 700, opacity: .9 }}>Open Chat →</p>
            </div>
            <div className="card" style={{ cursor: "pointer" }} onClick={() => navigate("/resume-analysis")}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📊</div>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Resume Analyze</p>
              <p style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>Unlock your resume to get detailed feedback.</p>
              <p style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: "var(--clr-primary)" }}>Analyze Now →</p>
            </div>
            <div className="card" style={{ cursor: "pointer" }} onClick={() => navigate("/jobs")}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>💼</div>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Find Jobs</p>
              <p style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>Browse {jobs.length} opportunities matched to you.</p>
              <p style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: "var(--clr-primary)" }}>Browse Jobs →</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Job Match for you */}
              <div className="card">
                <div className="section-header">
                  <span className="section-title">Job Match for you</span>
                  <Link to="/recommendations" style={{ fontSize: 13, color: "var(--clr-primary)", fontWeight: 600 }}>See All</Link>
                </div>
                {loading && <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 16 }}><span className="spinner" />Loading…</div>}
                {!loading && recommendations.length === 0 && (
                  <div style={{ padding: "20px 0", textAlign: "center" }}>
                    <p style={{ fontSize: 14, color: "var(--clr-text-muted)", marginBottom: 10 }}>
                      {latestResume ? "No recommendations yet. Try analyzing your resume." : "Upload and analyze a resume to get job matches."}
                    </p>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(latestResume ? "/resume-analysis" : "/resume-upload")}>
                      {latestResume ? "Analyze Resume" : "Upload Resume"}
                    </button>
                  </div>
                )}
                {recommendations.map((rec, i) => {
                  const pct = rec.matchScore ?? 0;
                  const clr = pct >= 70 ? "var(--clr-success)" : pct >= 40 ? "var(--clr-warning)" : "var(--clr-danger)";
                  return (
                    <div key={rec.jobId} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < recommendations.length - 1 ? "1px solid var(--clr-border)" : "none" }}>
                      <div className="company-logo" style={{ width: 36, height: 36, fontSize: 14, borderRadius: 10 }}>
                        {(rec.company || "C").charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{rec.title}</p>
                        <p style={{ fontSize: 12, color: "var(--clr-text-faint)" }}>{rec.company} · {rec.location}</p>
                        <div className="progress-bar" style={{ marginTop: 6, height: 5 }}>
                          <div className="progress-fill" style={{ width: pct + "%", background: `linear-gradient(90deg,${clr},${clr}99)` }} />
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: clr, minWidth: 42, textAlign: "right" }}>{pct}%</div>
                    </div>
                  );
                })}
              </div>

              {/* Activity Streak */}
              <div className="card">
                <div className="section-header">
                  <span className="section-title">Activity Streak</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link to="/skill-gap" style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>Skills</Link>
                    <Link to="/resume-upload" style={{ fontSize: 13, color: "var(--clr-primary)", fontWeight: 600 }}>New</Link>
                  </div>
                </div>
                <ActivityHeatmap days={90} />
                <p style={{ fontSize: 12, color: "var(--clr-text-faint)", marginTop: 10 }}>
                  {resumes.length} resume{resumes.length !== 1 ? "s" : ""} uploaded · {jobs.length} jobs available
                </p>
              </div>
            </div>

            {/* Right column — Growth Journey */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card" style={{ textAlign: "center" }}>
                <div className="section-header" style={{ marginBottom: 20 }}>
                  <span className="section-title">Your Growth Journey</span>
                  <span style={{ fontSize: 11, color: "var(--clr-text-faint)" }}>···</span>
                </div>
                {latestResume
                  ? <DonutRing score={score} />
                  : <div style={{ padding: "20px 0" }}>
                      <div style={{ fontSize: 48, marginBottom: 10 }}>📄</div>
                      <p style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>Upload and analyze a resume to see your score.</p>
                    </div>
                }
                <p style={{ marginTop: 12, fontWeight: 700, fontSize: 15 }}>
                  {latestResume ? `Current Level: ${scoreLabel}` : "No resume yet"}
                </p>
                {latestResume && (
                  <p style={{ fontSize: 12, color: "var(--clr-text-muted)", marginTop: 4 }}>
                    {latestResume.fileName}
                  </p>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                  <button className="btn btn-primary btn-sm btn-full" onClick={() => navigate("/resume-analysis")}>
                    📊 Analyze Resume
                  </button>
                  <button className="btn btn-ghost btn-sm btn-full" onClick={() => navigate("/resume-upload")}>
                    Upload New Resume
                  </button>
                </div>
              </div>

              {/* Quick stats */}
              <div className="card">
                <p className="section-title" style={{ marginBottom: 14 }}>Quick Stats</p>
                {[
                  { label: "Resumes",     value: resumes.length, icon: "📄" },
                  { label: "Jobs Open",   value: jobs.length,    icon: "💼" },
                  { label: "Top Match",   value: recommendations[0] ? `${recommendations[0].matchScore}%` : "—", icon: "🎯" },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--clr-border)" }}>
                    <span style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>{s.icon} {s.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--clr-primary)" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
