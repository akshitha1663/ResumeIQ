import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const STAGES = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

const STAGE_COLORS = {
  "Saved":     { bg: "rgba(100,116,139,.12)", color: "#475569" },
  "Applied":   { bg: "rgba(99,102,241,.12)",  color: "#6366f1" },
  "Interview": { bg: "rgba(245,158,11,.12)",  color: "#d97706" },
  "Offer":     { bg: "rgba(16,185,129,.15)", color: "#059669" },
  "Rejected":  { bg: "rgba(239,68,68,.12)",   color: "#dc2626" },
};

export default function Applications() {
  const [activeTab, setTab]           = useState("applications"); // "applications" | "saved"
  const [applications, setApps]       = useState([]);
  const [savedJobs, setSaved]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  const [editingId, setEditingId]     = useState(null);
  const [editNotes, setEditNotes]     = useState("");
  const [editStatus, setEditStatus]   = useState("");

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get("/applications/my"),
      api.get("/saved-jobs")
    ])
      .then(([appsRes, savedRes]) => {
        setApps(appsRes.data || []);
        setSaved(savedRes.data || []);
      })
      .catch(() => setError("Failed to load applications."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateApplication = async (appId) => {
    try {
      await api.put(`/applications/${appId}`, {
        status: editStatus,
        notes: editNotes
      });
      setEditingId(null);
      loadData();
    } catch (err) {
      alert("Failed to update application.");
    }
  };

  const deleteApplication = async (appId) => {
    if (!window.confirm("Remove this application from your tracker?")) return;
    try {
      await api.delete(`/applications/${appId}`);
      setApps(prev => prev.filter(a => a.id !== appId));
    } catch (err) {
      alert("Failed to delete application.");
    }
  };

  const unsaveJob = async (jobId) => {
    try {
      await api.delete(`/saved-jobs/${jobId}`);
      setSaved(prev => prev.filter(j => j.id !== jobId));
    } catch (err) {
      alert("Failed to remove saved job.");
    }
  };

  // Metric counts
  const totalApplied   = applications.filter(a => a.status === "Applied").length;
  const totalInterview = applications.filter(a => a.status === "Interview").length;
  const totalOffers    = applications.filter(a => a.status === "Offer").length;
  const totalSaved     = savedJobs.length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Workspace / Applications</p>
            <h1 className="page-title">Application Pipeline & Saved Jobs</h1>
          </div>
          <Link to="/jobs" className="btn btn-primary btn-sm">
            💼 Browse More Jobs
          </Link>
        </div>

        <div className="page-body">
          {/* Summary Metric Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div className="card" style={{ textAlign: "center", padding: "18px 14px" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--clr-text-muted)" }}>SAVED JOBS</p>
              <div style={{ fontSize: 32, fontWeight: 900, color: "var(--clr-primary)", marginTop: 4 }}>
                {totalSaved}
              </div>
            </div>

            <div className="card" style={{ textAlign: "center", padding: "18px 14px" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--clr-text-muted)" }}>APPLICATIONS SENT</p>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#6366f1", marginTop: 4 }}>
                {totalApplied}
              </div>
            </div>

            <div className="card" style={{ textAlign: "center", padding: "18px 14px" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--clr-text-muted)" }}>IN INTERVIEW</p>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#d97706", marginTop: 4 }}>
                {totalInterview}
              </div>
            </div>

            <div className="card" style={{ textAlign: "center", padding: "18px 14px" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--clr-text-muted)" }}>OFFERS RECEIVED</p>
              <div style={{ fontSize: 32, fontWeight: 900, color: "var(--clr-success)", marginTop: 4 }}>
                {totalOffers}
              </div>
            </div>
          </div>

          {/* Tab Selector */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <button
              className={`btn ${activeTab === "applications" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setTab("applications")}
            >
              📋 Tracked Applications ({applications.length})
            </button>
            <button
              className={`btn ${activeTab === "saved" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setTab("saved")}
            >
              ⭐ Bookmarked Jobs ({savedJobs.length})
            </button>
          </div>

          {loading && (
            <div className="loading-center card" style={{ padding: 40 }}>
              <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
              <p>Loading your career pipeline…</p>
            </div>
          )}

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          {/* Applications View */}
          {activeTab === "applications" && !loading && (
            <div>
              {applications.length === 0 ? (
                <div className="empty-state card" style={{ padding: 48 }}>
                  <div className="empty-icon">📂</div>
                  <h3>No job applications tracked yet</h3>
                  <p>When you apply for jobs on ResumeIQ or bookmark external postings, track them here to organize interviews and offers.</p>
                  <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 14 }}>
                    Find Jobs to Apply
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {applications.map(app => {
                    const isEditing = editingId === app.id;
                    const stageColor = STAGE_COLORS[app.status] || { bg: "var(--clr-surface-2)", color: "var(--clr-text)" };

                    return (
                      <div key={app.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800 }}>{app.jobTitle}</h3>
                            <p style={{ fontSize: 13, color: "var(--clr-text-muted)", marginTop: 2 }}>
                              {app.company} • 📍 {app.location || "Remote"} • Applied: {app.appliedDate || "Recently"}
                            </p>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{
                              fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 20,
                              background: stageColor.bg, color: stageColor.color
                            }}>
                              {app.status}
                            </span>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                setEditingId(app.id);
                                setEditStatus(app.status);
                                setEditNotes(app.notes || "");
                              }}
                            >
                              ✏️ Update Stage
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => deleteApplication(app.id)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Inline Edit Form */}
                        {isEditing && (
                          <div style={{ background: "var(--clr-surface-2)", padding: 14, borderRadius: 10, marginTop: 6 }}>
                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                              <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
                                <label className="form-label">Application Stage</label>
                                <select
                                  className="form-select"
                                  value={editStatus}
                                  onChange={e => setEditStatus(e.target.value)}
                                >
                                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                              <div className="form-field" style={{ flex: 2, minWidth: 240 }}>
                                <label className="form-label">Interview Notes / Recruiter Contact</label>
                                <input
                                  className="form-input"
                                  type="text"
                                  placeholder="e.g. Next round on Friday with Engineering Manager..."
                                  value={editNotes}
                                  onChange={e => setEditNotes(e.target.value)}
                                />
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button className="btn btn-primary btn-sm" onClick={() => updateApplication(app.id)}>
                                Save Changes
                              </button>
                              <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {app.notes && !isEditing && (
                          <div style={{ fontSize: 13, color: "var(--clr-text)", background: "var(--clr-surface-2)", padding: "8px 12px", borderRadius: 6 }}>
                            📝 <strong>Notes:</strong> {app.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Saved Jobs View */}
          {activeTab === "saved" && !loading && (
            <div>
              {savedJobs.length === 0 ? (
                <div className="empty-state card" style={{ padding: 48 }}>
                  <div className="empty-icon">⭐</div>
                  <h3>No saved jobs yet</h3>
                  <p>Browse open job listings and click the star icon to bookmark them for later review.</p>
                  <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 14 }}>
                    Explore Jobs
                  </Link>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
                  {savedJobs.map(job => (
                    <div key={job.id} className="job-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                          <div>
                            <h3 style={{ fontSize: 15, fontWeight: 800 }}>{job.title}</h3>
                            <p style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>{job.company} • {job.location}</p>
                          </div>
                          <button
                            onClick={() => unsaveJob(job.id)}
                            style={{ background: "none", border: "none", fontSize: 18, color: "#f59e0b", cursor: "pointer" }}
                            title="Remove from saved"
                          >
                            ★
                          </button>
                        </div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--clr-primary)", marginBottom: 8 }}>
                          {job.jobType} • {job.workMode || "Remote"}
                        </p>
                        {job.salary && (
                          <p style={{ fontSize: 13, color: "var(--clr-success)", fontWeight: 700, marginBottom: 8 }}>
                            💰 {job.salary}
                          </p>
                        )}
                        <p style={{ fontSize: 12.5, color: "var(--clr-text-muted)", lineHeight: 1.4, marginBottom: 12 }}>
                          {job.description?.slice(0, 140)}...
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--clr-border)", paddingTop: 10 }}>
                        <Link to={`/job-details/${job.id}`} className="btn btn-ghost btn-sm" style={{ flex: 1, textAlign: "center" }}>
                          Details
                        </Link>
                        {job.applyLink ? (
                          <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: "center" }}>
                            Apply Now ↗
                          </a>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ flex: 1 }}
                            onClick={() => api.post(`/applications/job/${job.id}/apply`).then(() => { alert("Added to applications!"); loadData(); })}
                          >
                            Track Apply
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}