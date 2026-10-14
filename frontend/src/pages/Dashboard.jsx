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

/* Activity heatmap */
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
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [resMy, jobsRes, appsRes, savedRes, roadmapsRes] = await Promise.all([
          api.get("/resumes/my").catch(() => ({ data: [] })),
          api.get("/jobs").catch(() => ({ data: [] })),
          api.get("/applications/my").catch(() => ({ data: [] })),
          api.get("/saved-jobs").catch(() => ({ data: [] })),
          api.get("/roadmaps").catch(() => ({ data: [] })),
        ]);

        const myResumes = resMy.data || [];
        setResumes(myResumes);
        setJobs(jobsRes.data || []);
        setApplications(appsRes.data || []);
        setSavedJobs(savedRes.data || []);
        setRoadmaps(roadmapsRes.data || []);

        let targetResumeId = sessionStorage.getItem("resumeId");
        if (!targetResumeId && myResumes.length > 0) {
          targetResumeId = myResumes[0].id;
          sessionStorage.setItem("resumeId", targetResumeId);
        }

        if (targetResumeId) {
          const [anaRes, recRes] = await Promise.all([
            api.get(`/resumes/${targetResumeId}/analysis`).catch(() => ({ data: null })),
            api.get(`/recommendations/${targetResumeId}?top=3`).catch(() => ({ data: [] })),
          ]);
          setAnalysis(anaRes.data);
          setRecommendations(recRes.data || []);
        }
      } catch (err) {
        console.error("Dashboard data load error", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
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
          <div>
            <h1 className="topbar-title">Career Hub Dashboard</h1>
            <p style={{ fontSize: 13, color: "var(--clr-text-muted)", marginTop: 2 }}>
              Welcome back, {user?.name || "User"} 👋
            </p>
          </div>
          <div className="topbar-right">
            <button className="topbar-icon-btn" title="Job Alerts" onClick={() => navigate("/job-alerts")}>🔔</button>
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
          {/* Main 3 Hero Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 20 }}>
            <div className="card" style={{ background: "var(--grad-primary)", border: "none", color: "#fff", cursor: "pointer" }}
              onClick={() => navigate("/ai-assistant")}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🤖</div>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>AI Project Assistant</p>
              <p style={{ fontSize: 13, opacity: .88, lineHeight: 1.4 }}>Java, Spring Boot, React, SQL, and Python career & coding mentor.</p>
              <p style={{ marginTop: 14, fontSize: 13, fontWeight: 700, opacity: .95 }}>Open Assistant →</p>
            </div>

            <div className="card" style={{ cursor: "pointer" }} onClick={() => navigate("/skill-gap")}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📈</div>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Skill Gap Analysis</p>
              <p style={{ fontSize: 13, color: "var(--clr-text-muted)", lineHeight: 1.4 }}>Compare latest resume against industry target roles.</p>
              <p style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: "var(--clr-primary)" }}>Run Skill Gap →</p>
            </div>

            <div className="card" style={{ cursor: "pointer" }} onClick={() => navigate("/jobs")}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>💼</div>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Explore Real Jobs</p>
              <p style={{ fontSize: 13, color: "var(--clr-text-muted)", lineHeight: 1.4 }}>Browse {jobs.length} verified listings with dynamic filters.</p>
              <p style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: "var(--clr-primary)" }}>Browse Jobs →</p>
            </div>
          </div>

          {/* Quick Tools Grid */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <div className="card" style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all .15s" }}
                   onClick={() => navigate("/roadmap")}>
                <span style={{ fontSize: 24, padding: 8, background: "rgba(139,92,246,0.12)", borderRadius: 10 }}>🗺️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Roadmap</div>
                  <div style={{ fontSize: 12, color: "var(--clr-text-muted)" }}>{roadmaps.length} active plans</div>
                </div>
              </div>

              <div className="card" style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all .15s" }}
                   onClick={() => navigate("/interview-coach")}>
                <span style={{ fontSize: 24, padding: 8, background: "rgba(16,185,129,0.12)", borderRadius: 10 }}>🎯</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Interview Coach</div>
                  <div style={{ fontSize: 12, color: "var(--clr-text-muted)" }}>Practice & AI feedback</div>
                </div>
              </div>

              <div className="card" style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all .15s" }}
                   onClick={() => navigate("/career-comparison")}>
                <span style={{ fontSize: 24, padding: 8, background: "rgba(6,182,212,0.12)", borderRadius: 10 }}>⚖️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Compare Roles</div>
                  <div style={{ fontSize: 12, color: "var(--clr-text-muted)" }}>Side-by-side analysis</div>
                </div>
              </div>

              <div className="card" style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all .15s" }}
                   onClick={() => navigate("/applications")}>
                <span style={{ fontSize: 24, padding: 8, background: "rgba(245,158,11,0.12)", borderRadius: 10 }}>📑</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Tracker</div>
                  <div style={{ fontSize: 12, color: "var(--clr-text-muted)" }}>{applications.length} applied · {savedJobs.length} saved</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Job Match for you */}
              <div className="card">
                <div className="section-header">
                  <span className="section-title">Recommended Matches for Your Resume</span>
                  <Link to="/recommendations" style={{ fontSize: 13, color: "var(--clr-primary)", fontWeight: 600 }}>See All</Link>
                </div>
                {loading && <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 16 }}><span className="spinner" />Loading…</div>}
                {!loading && recommendations.length === 0 && (
                  <div style={{ padding: "20px 0", textAlign: "center" }}>
                    <p style={{ fontSize: 14, color: "var(--clr-text-muted)", marginBottom: 10 }}>
                      {latestResume ? "No job recommendations yet. Try analyzing your resume." : "Upload and analyze a resume to get job matches."}
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
                      <div className="company-logo" style={{ width: 38, height: 38, fontSize: 15, borderRadius: 10, background: "var(--grad-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
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
                  <span className="section-title">Platform Activity Streak</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link to="/skill-gap" style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>Skill Gap</Link>
                    <Link to="/resume-upload" style={{ fontSize: 13, color: "var(--clr-primary)", fontWeight: 600 }}>+ Upload Resume</Link>
                  </div>
                </div>
                <ActivityHeatmap days={90} />
                <p style={{ fontSize: 12, color: "var(--clr-text-faint)", marginTop: 10 }}>
                  {resumes.length} resume{resumes.length !== 1 ? "s" : ""} on record · {jobs.length} jobs indexed
                </p>
              </div>
            </div>

            {/* Right column — Growth Journey & Quick Stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card" style={{ textAlign: "center" }}>
                <div className="section-header" style={{ marginBottom: 20 }}>
                  <span className="section-title">Resume Score</span>
                  <span style={{ fontSize: 11, color: "var(--clr-text-faint)" }}>Transparent</span>
                </div>
                {latestResume
                  ? <DonutRing score={score} />
                  : <div style={{ padding: "20px 0" }}>
                      <div style={{ fontSize: 48, marginBottom: 10 }}>📄</div>
                      <p style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>Upload your resume to see your verified score.</p>
                    </div>
                }
                <p style={{ marginTop: 12, fontWeight: 700, fontSize: 15 }}>
                  {latestResume ? `Rating: ${scoreLabel} (${score}/100)` : "No resume yet"}
                </p>
                {latestResume && (
                  <p style={{ fontSize: 12, color: "var(--clr-text-muted)", marginTop: 4 }}>
                    {latestResume.fileName}
                  </p>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                  <button className="btn btn-primary btn-sm btn-full" onClick={() => navigate("/resume-analysis")}>
                    📊 View Score Rubric
                  </button>
                  <button className="btn btn-ghost btn-sm btn-full" onClick={() => navigate("/resume-upload")}>
                    Upload New Resume
                  </button>
                </div>
              </div>

              {/* Quick stats */}
              <div className="card">
                <p className="section-title" style={{ marginBottom: 14 }}>Real Platform Stats</p>
                {[
                  { label: "Uploaded Resumes",   value: resumes.length,      icon: "📄" },
                  { label: "Active Jobs",         value: jobs.length,         icon: "💼" },
                  { label: "Tracked Applications", value: applications.length, icon: "📑" },
                  { label: "Saved Jobs",          value: savedJobs.length,    icon: "⭐" },
                  { label: "Active Roadmaps",     value: roadmaps.length,     icon: "🗺️" },
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
