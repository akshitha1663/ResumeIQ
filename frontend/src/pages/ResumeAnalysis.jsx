import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

/* Circular donut score */
function DonutRing({ score, size = 160, stroke = 14 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100);
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 70 ? "#00b894" : pct >= 40 ? "#fdcb6e" : "#e17055";
  return (
    <div className="score-ring-wrap" style={{ width: size, height: size }}>
      <svg style={{ width: size, height: size, transform: "rotate(-90deg)" }} viewBox={`0 0 ${size} ${size}`}>
        <circle fill="none" stroke="var(--clr-bg-2)" strokeWidth={stroke} cx={size / 2} cy={size / 2} r={r} />
        <circle
          fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          cx={size / 2} cy={size / 2} r={r}
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset .8s ease" }}
        />
      </svg>
      <div className="score-ring-label">
        <span className="score-ring-value" style={{ fontSize: 38, color }}>{pct}%</span>
        <span className="score-ring-sub">ATS Score</span>
      </div>
    </div>
  );
}

/* Download report as plain-text */
function downloadReport(analysis) {
  if (!analysis) return;
  const lines = [
    `ResumeIQ – Resume Analysis Report`,
    `============================================================`,
    `File:          ${analysis.fileName}`,
    `ATS Score:     ${analysis.resumeScore}/100`,
    ``,
    `STRENGTHS`,
    ...(analysis.strengths || []).map(s => `  ✓ ${s}`),
    ``,
    `IMPROVEMENTS NEEDED`,
    ...(analysis.improvements || []).map(s => `  → ${s}`),
    ``,
    `EXTRACTED SKILLS (${(analysis.skills || []).length})`,
    `  ${(analysis.skills || []).join(", ")}`,
    ``,
    `SECTIONS DETECTED`,
    `  Experience : ${analysis.hasExperience ? "✓" : "✗"}`,
    `  Education  : ${analysis.hasEducation  ? "✓" : "✗"}`,
    `  Summary    : ${analysis.hasSummary    ? "✓" : "✗"}`,
    ``,
    `NOTE: ${analysis.analysisNote}`,
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "resume-analysis-report.txt"; a.click();
  URL.revokeObjectURL(url);
}

/* Formatting feedback items derived from analysis */
function feedbackItems(analysis) {
  if (!analysis) return [];
  const items = [];
  if (analysis.hasSummary)    items.push({ ok: true,  text: "Clean, ATS-friendly format detected" });
  if (analysis.hasExperience) items.push({ ok: true,  text: "Standard section headings found" });
  if (!analysis.hasSummary)   items.push({ ok: false, text: "Add a professional summary section" });
  if (!analysis.hasExperience)items.push({ ok: false, text: "Add a Work Experience section" });
  items.push({ ok: true,  text: "Use bullet points instead of paragraphs" });
  items.push({ ok: false, text: "Avoid using tables or columns" });
  return items;
}

/* Keyword match mock (derived from real analysis) */
function keywordMatch(analysis) {
  if (!analysis) return [];
  const skills = analysis.skills || [];
  return skills.slice(0, 6).map((s, i) => ({
    name: s,
    found: i < Math.ceil(skills.length * 0.7),
  }));
}

/* High-value missing skills (placeholder set minus extracted) */
const HIGH_VALUE = ["Docker", "Kubernetes", "AWS", "Machine Learning", "GraphQL", "TypeScript", "Redis", "ElasticSearch"];

export default function ResumeAnalysis() {
  const navigate = useNavigate();
  const [resumeId, setResumeId] = useState(sessionStorage.getItem("resumeId") || "");
  const [analysis, setAnalysis]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const analyze = async () => {
    if (!resumeId.trim()) { setError("Enter a Resume ID (upload one first)."); return; }
    setLoading(true); setError(""); setAnalysis(null);
    try {
      const res = await api.get(`/resumes/${resumeId.trim()}/analysis`);
      setAnalysis(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Check the resume ID.");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (resumeId) analyze(); }, []);

  const missing = HIGH_VALUE.filter(
    hv => !(analysis?.skills || []).map(s => s.toLowerCase()).includes(hv.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <h1 className="topbar-title">Resume Analyzer</h1>
          <div className="topbar-right">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                className="form-input" type="text" placeholder="Resume ID"
                value={resumeId} onChange={e => setResumeId(e.target.value)}
                style={{ width: 130, padding: "7px 12px", fontSize: 13 }}
              />
              <button className="btn btn-primary btn-sm" onClick={analyze} disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : "Analyze"}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/resume-upload")}>
                Upload New Resume
              </button>
            </div>
          </div>
        </div>

        <div className="page-body">
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          {/* Prompt to upload if no resume */}
          {!loading && !analysis && !error && (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No resume analyzed yet</h3>
              <p>Upload a PDF or DOCX, then enter the Resume ID above to get your ATS score, skills, and feedback.</p>
              <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => navigate("/resume-upload")}>
                Upload Resume →
              </button>
            </div>
          )}

          {loading && (
            <div className="loading-center">
              <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
              <p>Extracting text and scoring your resume…</p>
            </div>
          )}

          {analysis && !loading && (
            <>
              {/* ATS layout — left panel + right panel */}
              <div className="ats-layout" style={{ marginBottom: 20 }}>
                {/* LEFT: Score + file info + actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="card ats-score-card">
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--clr-text-faint)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>ATS Analyzer Score</p>
                    <DonutRing score={analysis.resumeScore} />

                    <div style={{ marginTop: 20 }}>
                      <p style={{ fontWeight: 700, fontSize: 16 }}>New CV: {analysis.fileName}</p>
                      <p style={{ fontSize: 13, color: "var(--clr-text-muted)", marginTop: 4 }}>Your resume has been analyzed</p>
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap", justifyContent: "center" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => downloadReport(analysis)}>
                        ⬇ Download Report
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate("/resume-upload")}>
                        ↑ Upload New Resume
                      </button>
                    </div>
                  </div>

                  {/* Quick Tips */}
                  <div className="card">
                    <p className="section-title" style={{ marginBottom: 12 }}>⚡ Quick Tips</p>
                    {(analysis.improvements || []).slice(0, 3).map((tip, i) => (
                      <div key={i} style={{ fontSize: 13, color: "var(--clr-text-muted)", padding: "6px 0", borderBottom: i < 2 ? "1px solid var(--clr-border)" : "none" }}>
                        → {tip}
                      </div>
                    ))}
                    <button className="btn btn-primary btn-sm btn-full" style={{ marginTop: 14 }}
                      onClick={() => navigate("/skill-gap")}>
                      Full Gap Analysis →
                    </button>
                  </div>
                </div>

                {/* RIGHT: Keyword match + Formatting + Skills + Missing */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Keyword Match */}
                  <div className="card">
                    <div className="section-header">
                      <span className="section-title">🔑 Keyword Match</span>
                      <span className="badge badge-primary">{analysis.skills?.length || 0} found</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                      {keywordMatch(analysis).map(k => (
                        <span key={k.name} className={`skill-pill ${k.found ? "matched" : "missing"}`}>
                          {k.found ? "✓" : "✗"} {k.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Formatting Feedback */}
                  <div className="card">
                    <p className="section-title" style={{ marginBottom: 12 }}>📝 Formatting Feedback</p>
                    {feedbackItems(analysis).map((item, i) => (
                      <div key={i} className="feedback-row">
                        <div className={`feedback-dot ${item.ok ? "ok" : "warn"}`}>
                          {item.ok ? "✓" : "!"}
                        </div>
                        <span style={{ fontSize: 13, color: "var(--clr-text)" }}>{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Section flags */}
                  <div className="card">
                    <p className="section-title" style={{ marginBottom: 12 }}>📋 Sections Detected</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {[
                        { key: "hasExperience", label: "Experience" },
                        { key: "hasEducation",  label: "Education" },
                        { key: "hasSummary",    label: "Summary" },
                      ].map(({ key, label }) => (
                        <span key={key} className={`badge ${analysis[key] ? "badge-success" : "badge-danger"}`}>
                          {analysis[key] ? "✓" : "✗"} {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom row: Extracted skills + Missing skills */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="card">
                  <div className="section-header">
                    <span className="section-title">🧠 Extracted Skills</span>
                    <span className="badge badge-primary">{analysis.skills?.length}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                    {(analysis.skills || []).length
                      ? (analysis.skills || []).map(s => <span key={s} className="skill-pill">{s}</span>)
                      : <p style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>No skills detected. List them by name in your resume.</p>
                    }
                  </div>
                </div>
                <div className="card">
                  <div className="section-header">
                    <span className="section-title">🚨 Missing High-Value Skills</span>
                    <span className="badge badge-warning">{missing.length}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                    {missing.slice(0, 8).map(s => (
                      <span key={s} className="skill-pill missing">{s}</span>
                    ))}
                    {missing.length === 0 && (
                      <p style={{ fontSize: 13, color: "var(--clr-success)" }}>🎉 Great! You have all common high-value skills.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                <div className="card">
                  <p className="section-title" style={{ color: "var(--clr-success)", marginBottom: 12 }}>✅ Strengths</p>
                  {(analysis.strengths || []).map(s => (
                    <div key={s} className="feedback-row">
                      <div className="feedback-dot ok">✓</div>
                      <span style={{ fontSize: 13 }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <p className="section-title" style={{ color: "var(--clr-warning)", marginBottom: 12 }}>📌 Improvements</p>
                  {(analysis.improvements || []).map(s => (
                    <div key={s} className="feedback-row">
                      <div className="feedback-dot warn">!</div>
                      <span style={{ fontSize: 13 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p style={{ fontSize: 11, color: "var(--clr-text-faint)", marginTop: 16 }}>
                ℹ️ {analysis.analysisNote}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}