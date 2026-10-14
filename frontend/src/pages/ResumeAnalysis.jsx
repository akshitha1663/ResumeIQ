import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function DonutRing({ score, size = 160, stroke = 14 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100);
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 75 ? "var(--clr-success)" : pct >= 50 ? "var(--clr-warning)" : "var(--clr-danger)";
  return (
    <div className="score-ring-wrap" style={{ width: size, height: size, position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg style={{ width: size, height: size, transform: "rotate(-90deg)" }} viewBox={`0 0 ${size} ${size}`}>
        <circle fill="none" stroke="var(--clr-surface-2)" strokeWidth={stroke} cx={size / 2} cy={size / 2} r={r} />
        <circle
          fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          cx={size / 2} cy={size / 2} r={r}
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset .8s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <span style={{ fontSize: 36, fontWeight: 900, color, display: "block", lineHeight: 1 }}>{pct}%</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--clr-text-muted)", textTransform: "uppercase" }}>ATS Score</span>
      </div>
    </div>
  );
}

function downloadReport(analysis) {
  if (!analysis) return;
  const bd = analysis.scoreBreakdown || {};
  const lines = [
    `ResumeIQ – Comprehensive ATS Resume Analysis Report`,
    `============================================================`,
    `File Name:      ${analysis.fileName}`,
    `Overall Score:  ${analysis.resumeScore}/100`,
    ``,
    `SCORE BREAKDOWN`,
    `  • Skills:                 ${bd.skillsScore || 0} / ${bd.skillsMax || 30} pts`,
    `  • Work Experience:        ${bd.experienceScore || 0} / ${bd.experienceMax || 25} pts`,
    `  • Practical Projects:     ${bd.projectsScore || 0} / ${bd.projectsMax || 15} pts`,
    `  • Education:              ${bd.educationScore || 0} / ${bd.educationMax || 15} pts`,
    `  • Summary & Contact:      ${bd.summaryContactScore || 0} / ${bd.summaryContactMax || 10} pts`,
    `  • Certifications:         ${bd.certificationsScore || 0} / ${bd.certificationsMax || 5} pts`,
    ``,
    `STRENGTHS DETECTED`,
    ...(analysis.strengths || []).map(s => `  ✓ ${s}`),
    ``,
    `RECOMMENDED IMPROVEMENTS`,
    ...(analysis.improvements || []).map(s => `  → ${s}`),
    ``,
    `IDENTIFIED SKILLS (${(analysis.skills || []).length})`,
    `  ${(analysis.skills || []).join(", ")}`,
    ``,
    `SECTION PRESENCE`,
    `  Experience     : ${analysis.hasExperience ? "Present" : "Missing"}`,
    `  Education      : ${analysis.hasEducation ? "Present" : "Missing"}`,
    `  Projects       : ${analysis.hasProjects ? "Present" : "Missing"}`,
    `  Certifications : ${analysis.hasCertifications ? "Present" : "Missing"}`,
    `  Summary        : ${analysis.hasSummary ? "Present" : "Missing"}`,
    `  Contact Info   : ${analysis.hasContact ? "Present" : "Missing"}`,
    ``,
    `SCORING RUBRIC NOTE:`,
    `${analysis.analysisNote}`,
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resumeiq-report-${analysis.resumeId || "summary"}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ResumeAnalysis() {
  const navigate = useNavigate();

  const [resumeId, setResumeId]     = useState("");
  const [latestResume, setResume]   = useState(null);
  const [analysis, setAnalysis]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  // Job Description Matcher State
  const [jdText, setJdText]         = useState("");
  const [jdResult, setJdResult]     = useState(null);
  const [jdLoading, setJdLoading]   = useState(false);

  // AI Bullet Point Rewriter State
  const [bulletText, setBullet]     = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [rewriteResult, setRewrite] = useState(null);
  const [rewriteLoading, setRewriting] = useState(false);

  const fetchAnalysis = async (idToAnalyze) => {
    const id = idToAnalyze || resumeId;
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/resumes/${id}/analysis`);
      setAnalysis(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze resume. Please verify the resume ID.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatically load user's latest uploaded resume
    api.get("/resumes/latest")
      .then(res => {
        if (res.data) {
          setResume(res.data);
          setResumeId(String(res.data.id));
          fetchAnalysis(res.data.id);
        }
      })
      .catch(() => {
        // Fallback to sessionStorage if available
        const savedId = sessionStorage.getItem("resumeId");
        if (savedId) {
          setResumeId(savedId);
          fetchAnalysis(savedId);
        }
      });
  }, []);

  const handleCompareJd = async (e) => {
    e.preventDefault();
    if (!jdText.trim() || !analysis?.resumeId) {
      alert("Please paste a job description first.");
      return;
    }
    setJdLoading(true);
    try {
      const res = await api.post(`/resumes/${analysis.resumeId}/compare-jd`, { jobDescription: jdText });
      setJdResult(res.data);
    } catch (err) {
      alert("Failed to compare job description.");
    } finally {
      setJdLoading(false);
    }
  };

  const handleRewriteBullet = async (e) => {
    e.preventDefault();
    if (!bulletText.trim()) return;
    setRewriting(true);
    setRewrite(null);
    try {
      const res = await api.post("/resumes/rewrite-bullet", {
        bulletPoint: bulletText,
        targetRole: targetRole
      });
      setRewrite(res.data);
    } catch (err) {
      alert("Failed to rewrite bullet point. Please verify AI assistant configuration.");
    } finally {
      setRewriting(false);
    }
  };

  const bd = analysis?.scoreBreakdown || {};

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Workspace / Resume Analyzer</p>
            <h1 className="page-title">ATS Resume Analyzer & Optimizer</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {analysis && (
              <button className="btn btn-outline btn-sm" onClick={() => downloadReport(analysis)}>
                📥 Download Full Report
              </button>
            )}
            <Link to="/resume-upload" className="btn btn-primary btn-sm">
              📄 Upload New Resume
            </Link>
          </div>
        </div>

        <div className="page-body">
          {/* Active resume banner */}
          <div className="card" style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: "var(--clr-primary-lt)", color: "var(--clr-primary)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
              }}>
                📄
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 14 }}>
                  {analysis?.fileName || latestResume?.fileName || "Resume"}
                </p>
                <p style={{ fontSize: 12, color: "var(--clr-text-muted)" }}>
                  Resume ID: <strong>{analysis?.resumeId || resumeId || "—"}</strong> • Status: {analysis?.status || "Ready"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                className="form-input"
                type="text"
                placeholder="Switch Resume ID"
                value={resumeId}
                onChange={e => setResumeId(e.target.value)}
                style={{ width: 140, padding: "6px 12px", fontSize: 13 }}
              />
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => fetchAnalysis(resumeId)}
                disabled={loading || !resumeId}
              >
                Analyze ID
              </button>
            </div>
          </div>

          {loading && (
            <div className="loading-center card" style={{ padding: 48 }}>
              <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
              <p style={{ marginTop: 14, fontWeight: 600 }}>Running comprehensive ATS text extraction and parsing…</p>
            </div>
          )}

          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          {!analysis && !loading && !error && (
            <div className="empty-state card" style={{ padding: 48 }}>
              <div className="empty-icon">📊</div>
              <h3>No Resume Loaded</h3>
              <p>Upload a resume in PDF or DOCX format to receive instant ATS scoring, keyword analysis, and bullet point rewrites.</p>
              <Link to="/resume-upload" className="btn btn-primary" style={{ marginTop: 14 }}>
                Upload Your Resume
              </Link>
            </div>
          )}

          {analysis && !loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Score & Breakdown Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
                {/* Donut Card */}
                <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 28 }}>
                  <DonutRing score={analysis.resumeScore} size={170} stroke={16} />
                  <p style={{ fontWeight: 800, fontSize: 18, marginTop: 16 }}>
                    {analysis.resumeScore >= 75 ? "Excellent ATS Score 🎉" : analysis.resumeScore >= 50 ? "Solid Foundation 📈" : "Needs Optimization ⚠️"}
                  </p>
                  <p style={{ fontSize: 12.5, color: "var(--clr-text-muted)", marginTop: 6, maxWidth: 280 }}>
                    Transparent scoring evaluated across 6 criteria according to real recruiter applicant tracking systems.
                  </p>
                </div>

                {/* Rubric Breakdown Progress Bars */}
                <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>📊 Transparent ATS Score Breakdown</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[
                        { label: "Technical & Soft Skills", score: bd.skillsScore || 0, max: 30, color: "var(--clr-primary)" },
                        { label: "Work Experience Section", score: bd.experienceScore || 0, max: 25, color: "#6366f1" },
                        { label: "Practical Projects & Portfolio", score: bd.projectsScore || 0, max: 15, color: "#06b6d4" },
                        { label: "Education & Degree Credentials", score: bd.educationScore || 0, max: 15, color: "#10b981" },
                        { label: "Summary & Contact Information", score: bd.summaryContactScore || 0, max: 10, color: "#f59e0b" },
                        { label: "Certifications & Specializations", score: bd.certificationsScore || 0, max: 5, color: "#8b5cf6" },
                      ].map((item, i) => (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 700, marginBottom: 3 }}>
                            <span>{item.label}</span>
                            <span>{item.score} / {item.max} pts</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${(item.score / item.max) * 100}%`, background: item.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--clr-text-muted)", marginTop: 12 }}>
                    💡 {analysis.analysisNote}
                  </p>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="card" style={{ borderLeft: "4px solid var(--clr-success)" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--clr-success)", marginBottom: 12 }}>
                    ✅ Detected Strengths ({analysis.strengths?.length || 0})
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {analysis.strengths?.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: 13 }}>
                        <span style={{ color: "var(--clr-success)" }}>✓</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ borderLeft: "4px solid var(--clr-warning)" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#d97706", marginBottom: 12 }}>
                    ⚡ Actionable Improvement Suggestions ({analysis.improvements?.length || 0})
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {analysis.improvements?.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: 13 }}>
                        <span style={{ color: "#d97706" }}>→</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Extracted Skills Cloud */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800 }}>
                    🏷️ Extracted Skills & Technologies ({analysis.skills?.length || 0})
                  </h3>
                  <Link to="/skill-gap" className="btn btn-ghost btn-sm">
                    View Missing Skills in Skill Gap →
                  </Link>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {analysis.skills?.map(s => (
                    <span key={s} className="skill-pill matched">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Job Description Keyword Comparison Feature */}
              <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
                  🎯 Target Job Description Matcher
                </h3>
                <p style={{ fontSize: 13, color: "var(--clr-text-muted)", marginBottom: 14 }}>
                  Paste a real job posting's description below to compare missing keywords against your active resume.
                </p>
                <form onSubmit={handleCompareJd}>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Paste full job description or requirements here..."
                    value={jdText}
                    onChange={e => setJdText(e.target.value)}
                    style={{ marginBottom: 12 }}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={jdLoading || !jdText.trim()}>
                    {jdLoading ? "Scanning JD Keywords…" : "🔍 Compare with Job Description"}
                  </button>
                </form>

                {jdResult && (
                  <div style={{ marginTop: 16, background: "var(--clr-surface-2)", padding: 16, borderRadius: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: 14 }}>
                        Keyword Alignment: {jdResult.matchPercent}%
                      </span>
                      <span className="badge badge-primary">{jdResult.matchPercent}% Match</span>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--clr-success)", marginBottom: 4 }}>
                        MATCHED KEYWORDS ({jdResult.matchedKeywords?.length}):
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {jdResult.matchedKeywords?.map(k => (
                          <span key={k} className="skill-pill matched" style={{ fontSize: 11 }}>{k}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--clr-danger)", marginBottom: 4 }}>
                        MISSING KEYWORDS ({jdResult.missingKeywords?.length}):
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {jdResult.missingKeywords?.map(k => (
                          <span key={k} className="skill-pill missing" style={{ fontSize: 11 }}>{k}</span>
                        ))}
                      </div>
                    </div>

                    <p style={{ fontSize: 12.5, color: "var(--clr-text-muted)" }}>
                      💡 {jdResult.recommendation}
                    </p>
                  </div>
                )}
              </div>

              {/* AI Bullet Point Optimizer Feature */}
              <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
                  ✍️ AI Bullet Point Impact Optimizer (XYZ Formula)
                </h3>
                <p style={{ fontSize: 13, color: "var(--clr-text-muted)", marginBottom: 14 }}>
                  Turn weak resume bullet points into measurable, action-oriented accomplishments without fabricating qualifications.
                </p>

                <form onSubmit={handleRewriteBullet}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                    <div className="form-field" style={{ flex: 3, minWidth: 260 }}>
                      <label className="form-label">Original Bullet Point</label>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="e.g. Worked on the backend APIs and helped fix database bugs."
                        value={bulletText}
                        onChange={e => setBullet(e.target.value)}
                      />
                    </div>
                    <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
                      <label className="form-label">Target Role</label>
                      <input
                        className="form-input"
                        type="text"
                        value={targetRole}
                        onChange={e => setTargetRole(e.target.value)}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={rewriteLoading || !bulletText.trim()}>
                    {rewriteLoading ? "Generating AI Optimization…" : "⚡ Rewrite for ATS Impact"}
                  </button>
                </form>

                {rewriteResult && (
                  <div style={{ marginTop: 16, background: "var(--clr-surface-2)", padding: 16, borderRadius: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--clr-text-muted)", textTransform: "uppercase" }}>
                      AI Recommended Bullet Point Variations:
                    </p>
                    <div style={{ whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.6, marginTop: 6, color: "var(--clr-text)" }}>
                      {rewriteResult.suggestion}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}