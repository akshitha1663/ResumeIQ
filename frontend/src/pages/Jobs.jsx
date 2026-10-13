import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const TYPE_COLORS = {
  "Full-time":   { bg: "rgba(79,70,229,.1)",  color: "var(--clr-primary)" },
  "Part-time":   { bg: "rgba(6,182,212,.1)",  color: "var(--clr-accent-dark)" },
  "Internship":  { bg: "rgba(16,185,129,.1)", color: "#059669" },
  "Remote":      { bg: "rgba(139,92,246,.1)", color: "var(--clr-secondary)" },
  "Contract":    { bg: "rgba(245,158,11,.1)", color: "#d97706" },
};

const typeStyle = (t) => TYPE_COLORS[t] || { bg: "rgba(100,116,139,.1)", color: "var(--clr-text-muted)" };

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const [search, setSearch]   = useState("");
  const [filterType, setType] = useState("");

  useEffect(() => {
    api.get("/jobs")
      .then(r => setJobs(r.data || []))
      .catch(() => setError("Unable to load jobs. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const jobTypes = [...new Set(jobs.map(j => j.jobType).filter(Boolean))];

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchText = !q || j.title?.toLowerCase().includes(q)
      || j.company?.toLowerCase().includes(q)
      || j.location?.toLowerCase().includes(q)
      || j.skills?.toLowerCase().includes(q);
    const matchType = !filterType || j.jobType === filterType;
    return matchText && matchType;
  });

  const skills = (job) =>
    job.skills ? job.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Workspace / Find Jobs</p>
            <h1 className="page-title">Browse Jobs</h1>
          </div>
          <span className="badge badge-primary" style={{ fontSize: 14, padding: "8px 14px" }}>
            {filtered.length} {filtered.length === 1 ? "job" : "jobs"}
          </span>
        </div>

        <div className="page-body">
          {/* Filters */}
          <div className="card" style={{ marginBottom: 24, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div className="form-field" style={{ flex: 2, minWidth: 200 }}>
              <label className="form-label">Search</label>
              <input className="form-input" type="text"
                placeholder="Role, company, location, skill…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="form-field" style={{ flex: 1, minWidth: 140 }}>
              <label className="form-label">Job Type</label>
              <select className="form-select" value={filterType} onChange={e => setType(e.target.value)}>
                <option value="">All types</option>
                {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {(search || filterType) && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setType(""); }}>
                Clear ✕
              </button>
            )}
          </div>

          {/* States */}
          {loading && <div className="loading-center"><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /><p>Loading jobs…</p></div>}
          {error && <div className="alert alert-error">{error}</div>}

          {!loading && filtered.length === 0 && !error && (
            <div className="empty-state">
              <div className="empty-icon">💼</div>
              <h3>{jobs.length === 0 ? "No jobs added yet" : "No jobs match your search"}</h3>
              <p>{jobs.length === 0
                ? "An admin needs to add jobs to the platform first."
                : "Try a different search term or clear the filters."}</p>
              {(search || filterType) && (
                <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => { setSearch(""); setType(""); }}>Clear Filters</button>
              )}
            </div>
          )}

          {/* Job Grid */}
          {!loading && filtered.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {filtered.map(job => {
                const { bg, color } = typeStyle(job.jobType);
                return (
                  <div key={job.id} className="job-card" style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/job-details/${job.id}`)}>
                    <div className="job-card-header">
                      <div className="company-logo">
                        {(job.company || "C").charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="job-title">{job.title}</p>
                        <p className="job-company">🏢 {job.company}</p>
                      </div>
                    </div>

                    <div className="job-meta">
                      {job.location && <span className="badge" style={{ background: "var(--clr-surface-2)", color: "var(--clr-text-muted)" }}>📍 {job.location}</span>}
                      {job.jobType && <span className="badge" style={{ background: bg, color }}>{job.jobType}</span>}
                      {job.salary && <span className="badge badge-success">💰 {job.salary}</span>}
                    </div>

                    {job.description && (
                      <p className="job-description" style={{ WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {job.description}
                      </p>
                    )}

                    {skills(job).length > 0 && (
                      <div className="job-skills-row">
                        {skills(job).slice(0, 4).map(s => (
                          <span key={s} className="skill-pill" style={{ fontSize: 12 }}>{s}</span>
                        ))}
                        {skills(job).length > 4 && (
                          <span className="badge" style={{ background: "var(--clr-surface-2)", color: "var(--clr-text-muted)" }}>+{skills(job).length - 4}</span>
                        )}
                      </div>
                    )}

                    <div style={{ borderTop: "1px solid var(--clr-border)", paddingTop: 12, display: "flex", gap: 8 }}>
                      <button className="btn btn-primary btn-sm"
                        onClick={e => { e.stopPropagation(); navigate(`/job-details/${job.id}`); }}>
                        View Details →
                      </button>
                      <button className="btn btn-ghost btn-sm"
                        onClick={e => {
                          e.stopPropagation();
                          sessionStorage.setItem("selectedJobId", String(job.id));
                          navigate("/skill-gap");
                        }}>
                        Gap Analysis
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}