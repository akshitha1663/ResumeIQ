import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function Skills() {
  const navigate = useNavigate();
  const [resumeId, setResumeId] = useState(sessionStorage.getItem("resumeId") || "");
  const [skills, setSkills]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [fetched, setFetched]   = useState(false);

  const load = async () => {
    if (!resumeId.trim()) { setError("Enter a Resume ID."); return; }
    setLoading(true); setError("");
    try {
      const res = await api.get(`/resumes/${resumeId.trim()}/analysis`);
      setSkills(res.data?.skills || []);
      setFetched(true);
    } catch (err) {
      setError("Could not load skills — check the Resume ID.");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (resumeId) load(); }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Workspace / Skills</p>
            <h1 className="page-title">Extracted Skills</h1>
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
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />&nbsp;Loading…</> : "Extract Skills"}
            </button>
            <button className="btn btn-ghost" onClick={() => navigate("/resume-analysis")}>Full Analysis</button>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
          {loading && <div className="loading-center"><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /><p>Extracting skills…</p></div>}

          {fetched && !loading && (
            <div className="card">
              <div className="section-header" style={{ marginBottom: 16 }}>
                <span className="section-title">🧠 Detected Skills</span>
                <span className="badge badge-primary">{skills.length} found</span>
              </div>
              {skills.length === 0
                ? <div className="empty-state" style={{ border: "none", padding: "20px 0" }}>
                    <div className="empty-icon" style={{ fontSize: 32 }}>🔍</div>
                    <p>No skills detected. Ensure your resume lists skills clearly with standard names (e.g. "Java", "Python", "React").</p>
                  </div>
                : <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {skills.map(s => (
                      <span key={s} className="skill-pill" style={{ fontSize: 14, padding: "7px 14px" }}>{s}</span>
                    ))}
                  </div>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}