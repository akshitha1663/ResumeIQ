import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function JobMatching() {
  const navigate = useNavigate();
  const [jobs, setJobs]         = useState([]);
  const [resumeId, setResumeId] = useState(sessionStorage.getItem("resumeId") || "");
  const [jobId, setJobId]       = useState(sessionStorage.getItem("selectedJobId") || "");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    api.get("/jobs").then(r => setJobs(r.data || [])).catch(() => {});
  }, []);

  const calculate = async () => {
    if (!resumeId.trim() || !jobId) { setError("Please set a Resume ID and select a job."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await api.get(`/matching/${resumeId.trim()}/${jobId}`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Match calculation failed.");
    } finally { setLoading(false); }
  };

  const pct = result?.matchScore ?? 0;
  const color = pct >= 70 ? "var(--clr-success)" : pct >= 40 ? "var(--clr-warning)" : "var(--clr-danger)";

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Workspace / Job Matching</p>
            <h1 className="page-title">Job Match Calculator</h1>
          </div>
        </div>
        <div className="page-body">
          <div className="card" style={{ marginBottom: 24 }}>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Select Resume & Job</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
              <div className="form-field" style={{ flex: 1, minWidth: 140 }}>
                <label className="form-label">Resume ID</label>
                <input className="form-input" type="text" placeholder="e.g. 1"
                  value={resumeId} onChange={e => setResumeId(e.target.value)} />
              </div>
              <div className="form-field" style={{ flex: 2, minWidth: 200 }}>
                <label className="form-label">Job</label>
                <select className="form-select" value={jobId} onChange={e => setJobId(e.target.value)}>
                  <option value="">— Select a job —</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.title} @ {j.company}</option>)}
                </select>
              </div>
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={calculate} disabled={loading}>
                {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />&nbsp;Calculating…</> : "Calculate Match"}
              </button>
              <button className="btn btn-ghost" onClick={() => navigate("/resume-upload")}>Upload Resume</button>
            </div>
          </div>

          {loading && <div className="loading-center"><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /><p>Calculating match…</p></div>}

          {result && !loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="card" style={{ textAlign: "center", padding: "28px 20px" }}>
                <p style={{ color: "var(--clr-text-muted)", fontSize: 14, marginBottom: 8 }}>
                  {result.jobTitle} @ {result.company}
                </p>
                <div style={{ fontSize: 52, fontWeight: 800, color }}>{pct}%</div>
                <p style={{ color: "var(--clr-text-muted)", fontSize: 14 }}>Match Score</p>
                <div className="progress-bar" style={{ maxWidth: 280, margin: "14px auto 0" }}>
                  <div className="progress-fill" style={{ width: pct + "%", background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="card">
                  <p className="section-title" style={{ color: "var(--clr-success)", marginBottom: 12 }}>
                    ✅ Matched Skills ({result.matchedSkills?.length})
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.matchedSkills?.length
                      ? result.matchedSkills.map(s => <span key={s} className="skill-pill matched">{s}</span>)
                      : <p style={{ fontSize: 14, color: "var(--clr-text-muted)" }}>None yet.</p>}
                  </div>
                </div>
                <div className="card">
                  <p className="section-title" style={{ color: "var(--clr-warning)", marginBottom: 12 }}>
                    📌 Missing Skills ({result.missingSkills?.length})
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.missingSkills?.length
                      ? result.missingSkills.map(s => <span key={s} className="skill-pill missing">{s}</span>)
                      : <p style={{ fontSize: 14, color: "var(--clr-success)" }}>You have all required skills! 🎉</p>}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary btn-sm" onClick={() => navigate("/skill-gap")}>Full Gap Analysis →</button>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("/recommendations")}>View Recommendations</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}