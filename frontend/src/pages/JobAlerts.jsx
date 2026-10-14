import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function JobAlerts() {
  const [alerts, setAlerts]       = useState([]);
  const [matches, setMatches]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [creating, setCreating]   = useState(false);
  const [error, setError]         = useState("");

  const [roleTitle, setRoleTitle] = useState("");
  const [location, setLocation]   = useState("");
  const [jobType, setJobType]     = useState("");
  const [workMode, setWorkMode]   = useState("");

  const loadAlerts = () => {
    setLoading(true);
    Promise.all([
      api.get("/alerts"),
      api.get("/alerts/matches")
    ])
      .then(([alertsRes, matchesRes]) => {
        setAlerts(alertsRes.data || []);
        setMatches(matchesRes.data || []);
      })
      .catch(() => setError("Unable to load job alerts."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!roleTitle.trim() && !location.trim()) {
      setError("Please specify a target role or location.");
      return;
    }

    setCreating(true);
    setError("");
    try {
      await api.post("/alerts", {
        roleTitle: roleTitle.trim(),
        location: location.trim(),
        jobType: jobType || null,
        workMode: workMode || null
      });
      setRoleTitle("");
      setLocation("");
      setJobType("");
      setWorkMode("");
      loadAlerts();
    } catch (err) {
      setError("Failed to create alert.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await api.delete(`/alerts/${id}`);
      setAlerts(prev => prev.filter(a => a.id !== id));
      loadAlerts();
    } catch (err) {
      alert("Failed to delete alert.");
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Workspace / Alerts</p>
            <h1 className="page-title">Personalized Job Alerts</h1>
          </div>
          <Link to="/jobs" className="btn btn-primary btn-sm">
            💼 View All Jobs
          </Link>
        </div>

        <div className="page-body">
          {/* Configure New Alert */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>
              🔔 Create New Job Matching Alert
            </h2>
            <form onSubmit={handleCreateAlert}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
                <div className="form-field">
                  <label className="form-label">Target Role Title</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. Java Developer, React Engineer..."
                    value={roleTitle}
                    onChange={e => setRoleTitle(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Preferred Location</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. Remote, Bengaluru, Hyderabad..."
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Job Type</label>
                  <select className="form-select" value={jobType} onChange={e => setJobType(e.target.value)}>
                    <option value="">Any Job Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Work Mode</label>
                  <select className="form-select" value={workMode} onChange={e => setWorkMode(e.target.value)}>
                    <option value="">Any Work Mode</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? "Saving Alert…" : "+ Create Job Alert"}
              </button>
            </form>
          </div>

          {/* Active Alerts List */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>
              📌 Your Active Alerts ({alerts.length})
            </h2>

            {alerts.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>
                No job alerts configured yet. Add an alert above to get notified of newly posted opportunities.
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                {alerts.map(a => (
                  <div
                    key={a.id}
                    style={{
                      background: "var(--clr-surface-2)", border: "1px solid var(--clr-border)",
                      borderRadius: 10, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 14 }}>{a.roleTitle || "Any Role"}</p>
                      <p style={{ fontSize: 12, color: "var(--clr-text-muted)", marginTop: 2 }}>
                        📍 {a.location || "Any location"} • {a.workMode || a.jobType || "Any mode"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAlert(a.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: "var(--clr-danger)" }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real Matched Job Opportunities */}
          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>
              🎯 Live Job Matches for Your Alerts ({matches.length})
            </h2>

            {matches.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>
                No active job listings currently match your alert filters. As new jobs are posted, they will automatically appear here.
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
                {matches.map(({ alertRole, job }, idx) => (
                  <div key={idx} className="job-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <span className="badge badge-primary" style={{ marginBottom: 6, fontSize: 11 }}>
                        Matched Alert: {alertRole}
                      </span>
                      <h3 style={{ fontSize: 15, fontWeight: 800, marginTop: 4 }}>{job.title}</h3>
                      <p style={{ fontSize: 12.5, color: "var(--clr-text-muted)" }}>
                        {job.company} • 📍 {job.location} ({job.workMode || "Remote"})
                      </p>
                      {job.salary && (
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--clr-success)", marginTop: 4 }}>
                          💰 {job.salary}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--clr-border)" }}>
                      <Link to={`/job-details/${job.id}`} className="btn btn-ghost btn-sm" style={{ flex: 1, textAlign: "center" }}>
                        View
                      </Link>
                      {job.applyLink && (
                        <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: "center" }}>
                          Apply ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
