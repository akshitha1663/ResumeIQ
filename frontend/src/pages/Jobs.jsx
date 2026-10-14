import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const TYPE_COLORS = {
  "Full-time":  { bg: "rgba(99,102,241,.12)", color: "#6366f1" },
  "Part-time":  { bg: "rgba(6,182,212,.12)",  color: "#0891b2" },
  "Internship": { bg: "rgba(16,185,129,.12)", color: "#059669" },
  "Contract":   { bg: "rgba(245,158,11,.12)", color: "#d97706" },
  "Freelance":  { bg: "rgba(168,85,247,.12)", color: "#9333ea" },
  "Temporary":  { bg: "rgba(239,68,68,.12)",  color: "#dc2626" },
};

const MODE_COLORS = {
  "Remote":   { bg: "rgba(16,185,129,.15)", color: "#059669" },
  "Hybrid":   { bg: "rgba(99,102,241,.15)", color: "#4f46e5" },
  "On-site":  { bg: "rgba(100,116,139,.15)",color: "#475569" },
};

export default function Jobs() {
  const [jobs, setJobs]             = useState([]);
  const [savedJobIds, setSavedIds]  = useState([]);
  const [latestResume, setResume]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  const [search, setSearch]         = useState("");
  const [jobType, setJobType]       = useState("");
  const [workMode, setWorkMode]     = useState("");
  const [location, setLocation]     = useState("");

  const standardJobTypes = ["Full-time", "Part-time", "Internship", "Contract", "Freelance", "Temporary"];
  const standardWorkModes = ["Remote", "Hybrid", "On-site"];

  const fetchJobs = () => {
    setLoading(true);
    const params = {};
    if (search.trim()) params.keyword = search.trim();
    if (jobType) params.jobType = jobType;
    if (workMode) params.workMode = workMode;
    if (location.trim()) params.location = location.trim();

    api.get("/jobs", { params })
      .then(res => setJobs(res.data || []))
      .catch(() => setError("Unable to load jobs from the server."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();

    // Fetch user's saved job IDs
    api.get("/saved-jobs/ids")
      .then(res => setSavedIds(res.data || []))
      .catch(() => {});

    // Fetch latest resume to calculate match scores
    api.get("/resumes/latest")
      .then(res => setResume(res.data))
      .catch(() => {});
  }, []);

  const toggleSaveJob = async (jobId) => {
    const isSaved = savedJobIds.includes(jobId);
    try {
      if (isSaved) {
        await api.delete(`/saved-jobs/${jobId}`);
        setSavedIds(prev => prev.filter(id => id !== jobId));
      } else {
        await api.post(`/saved-jobs/${jobId}`);
        setSavedIds(prev => [...prev, jobId]);
      }
    } catch (err) {
      alert("Please log in to save jobs.");
    }
  };

  const calculateJobMatch = (jobSkillsStr) => {
    if (!latestResume || !latestResume.extractedText || !jobSkillsStr) return null;
    const resumeText = latestResume.extractedText.toLowerCase();
    const skills = jobSkillsStr.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    if (skills.length === 0) return null;

    const matched = skills.filter(s => resumeText.includes(s));
    return Math.round((matched.length * 100) / skills.length);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Workspace / Find Jobs</p>
            <h1 className="page-title">Browse Career Opportunities</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link to="/applications" className="btn btn-outline btn-sm">
              📋 My Applications & Saved
            </Link>
            <span className="badge badge-primary" style={{ fontSize: 13, padding: "6px 12px" }}>
              {jobs.length} Available {jobs.length === 1 ? "Listing" : "Listings"}
            </span>
          </div>
        </div>

        <div className="page-body">
          {/* Filters Bar */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, alignItems: "flex-end" }}>
              <div className="form-field">
                <label className="form-label">Search Keywords</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Title, company, skill..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && fetchJobs()}
                />
              </div>

              <div className="form-field">
                <label className="form-label">Job Type</label>
                <select className="form-select" value={jobType} onChange={e => setJobType(e.target.value)}>
                  <option value="">All Job Types</option>
                  {standardJobTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Work Mode</label>
                <select className="form-select" value={workMode} onChange={e => setWorkMode(e.target.value)}>
                  <option value="">All Work Modes</option>
                  {standardWorkModes.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Location</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Remote, Bengaluru..."
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && fetchJobs()}
                />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary btn-full" onClick={fetchJobs}>
                  Filter
                </button>
                {(search || jobType || workMode || location) && (
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setSearch("");
                      setJobType("");
                      setWorkMode("");
                      setLocation("");
                      setTimeout(fetchJobs, 0);
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Loading and Error */}
          {loading && (
            <div className="loading-center card" style={{ padding: 40 }}>
              <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
              <p>Searching verified job listings…</p>
            </div>
          )}

          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          {/* Empty State */}
          {!loading && jobs.length === 0 && !error && (
            <div className="empty-state card" style={{ padding: 48 }}>
              <div className="empty-icon">💼</div>
              <h3>No matching jobs found</h3>
              <p>Try widening your search terms or clearing your job-type / work-mode filters.</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: 14 }}
                onClick={() => {
                  setSearch("");
                  setJobType("");
                  setWorkMode("");
                  setLocation("");
                  fetchJobs();
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Job Cards Grid */}
          {!loading && jobs.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
              {jobs.map(job => {
                const isSaved = savedJobIds.includes(job.id);
                const matchScore = calculateJobMatch(job.skills);
                const typeStyle = TYPE_COLORS[job.jobType] || { bg: "var(--clr-surface-2)", color: "var(--clr-text)" };
                const modeStyle = MODE_COLORS[job.workMode] || { bg: "var(--clr-surface-2)", color: "var(--clr-text)" };

                return (
                  <div key={job.id} className="job-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      {/* Header with Title, Company & Bookmark */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <div className="company-logo">
                            {(job.company || "C").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--clr-text)", lineHeight: 1.3 }}>
                              {job.title}
                            </h3>
                            <p style={{ fontSize: 13, color: "var(--clr-text-muted)", marginTop: 2 }}>
                              {job.company} • 📍 {job.location || "Remote"}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleSaveJob(job.id)}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            fontSize: 20, color: isSaved ? "#f59e0b" : "var(--clr-border)"
                          }}
                          title={isSaved ? "Remove from saved" : "Bookmark job"}
                        >
                          {isSaved ? "★" : "☆"}
                        </button>
                      </div>

                      {/* Badges: Type, Mode, Match % */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                          background: typeStyle.bg, color: typeStyle.color
                        }}>
                          {job.jobType || "Full-time"}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                          background: modeStyle.bg, color: modeStyle.color
                        }}>
                          {job.workMode || "Remote"}
                        </span>
                        {job.experienceLevel && (
                          <span className="badge badge-muted" style={{ fontSize: 11 }}>
                            {job.experienceLevel}
                          </span>
                        )}
                        {matchScore !== null && (
                          <span className={`badge ${matchScore >= 70 ? "badge-success" : matchScore >= 40 ? "badge-warning" : "badge-muted"}`} style={{ fontSize: 11 }}>
                            🎯 {matchScore}% Resume Match
                          </span>
                        )}
                      </div>

                      {/* Salary */}
                      {job.salary && (
                        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--clr-success)", marginBottom: 10 }}>
                          💰 {job.salary}
                        </p>
                      )}

                      {/* Description snippet */}
                      <p style={{
                        fontSize: 13, color: "var(--clr-text-muted)", lineHeight: 1.5,
                        marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden"
                      }}>
                        {job.description}
                      </p>

                      {/* Skills Tags */}
                      {job.skills && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                          {job.skills.split(",").slice(0, 5).map(s => (
                            <span key={s} className="skill-pill" style={{ fontSize: 11, padding: "2px 8px" }}>
                              {s.trim()}
                            </span>
                          ))}
                          {job.skills.split(",").length > 5 && (
                            <span style={{ fontSize: 11, color: "var(--clr-text-muted)", alignSelf: "center" }}>
                              +{job.skills.split(",").length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: 10, borderTop: "1px solid var(--clr-border)", paddingTop: 14 }}>
                      <Link to={`/job-details/${job.id}`} className="btn btn-ghost btn-sm" style={{ flex: 1, textAlign: "center" }}>
                        View Details
                      </Link>
                      {job.applyLink ? (
                        <a
                          href={job.applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, textAlign: "center" }}
                        >
                          Apply Link ↗
                        </a>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => api.post(`/applications/job/${job.id}/apply`).then(() => alert("Application tracked in your pipeline!"))}
                        >
                          Quick Apply
                        </button>
                      )}
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