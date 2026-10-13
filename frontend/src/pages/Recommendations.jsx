import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function Recommendations() {
  const navigate = useNavigate();
  const [resumeId, setResumeId] = useState(sessionStorage.getItem("resumeId") || "");
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [fetched, setFetched]   = useState(false);

  const load = async () => {
    if (!resumeId.trim()) { setError("Enter a Resume ID first."); return; }
    setLoading(true); setError("");
    try {
      const res = await api.get(`/recommendations/${resumeId.trim()}?top=10`);
      setJobs(res.data || []);
      setFetched(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load recommendations.");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (resumeId) load(); }, []);

  const scoreColor = s => s >= 70 ? "var(--clr-success)" : s >= 40 ? "var(--clr-warning)" : "var(--clr-danger)";

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Workspace / Recommendations</p>
            <h1 className="page-title">Job Recommendations</h1>
          </div>
        </div>
        <div className="page-body">
          <div className="card" style={{ marginBottom: 24, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
              <label className="form-label">Resume ID</label>
              <input className="form-input" type="text" placeholder="e.g. 1"
                value={resumeId} onChange={e => setResumeId(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={load} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />&nbsp;Loading…</> : "⭐ Get Recommendations"}
            </button>
            <button className="btn btn-ghost" onClick={() => navigate("/resume-upload")}>Upload Resume</button>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
          {loading && <div className="loading-center"><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /><p>Ranking jobs for your resume…</p></div>}

          {fetched && !loading && jobs.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">💼</div>
              <h3>No jobs found</h3>
              <p>Ask your admin to add jobs to the platform, then try again.</p>
            </div>
          )}

          {!loading && jobs.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {jobs.map((job, idx) => (
                <div key={job.jobId} className="job-card">
                  <div className="job-card-header">
                    <div className="company-logo">
                      {(job.company || "C").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <p className="job-title">#{idx + 1} · {job.title}</p>
                          <p className="job-company">{job.company} · {job.location}</p>
                        </div>
                        <span style={{
                          fontSize: 20, fontWeight: 800,
                          color: scoreColor(job.matchScore),
                          background: "rgba(0,0,0,.04)",
                          padding: "4px 12px", borderRadius: 8,
                        }}>
                          {job.matchScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: job.matchScore + "%", background: `linear-gradient(90deg, ${scoreColor(job.matchScore)}, ${scoreColor(job.matchScore)}88)` }} />
                  </div>
                  <p style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>💡 {job.reason}</p>
                  {job.matchedSkills?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {job.matchedSkills.slice(0, 5).map(s => (
                        <span key={s} className="skill-pill matched">{s}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/job-details/${job.jobId}`)}>View Job →</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => {
                      sessionStorage.setItem("selectedJobId", String(job.jobId));
                      navigate("/skill-gap");
                    }}>Gap Analysis</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}