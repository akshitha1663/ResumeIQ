import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    api.get(`/jobs/${id}`)
      .then(r => setJob(r.data))
      .catch(() => setMessage({ type: "error", text: "Unable to load job details." }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    setApplying(true); setMessage({ type: "", text: "" });
    try {
      await api.post(`/jobs/${id}/apply`);
      setMessage({ type: "success", text: "Application submitted! 🎉" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Application failed. Please try again." });
    } finally { setApplying(false); }
  };

  const skills = job?.skills
    ? job.skills.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  const infoRows = job
    ? [
        { label: "Company",  value: job.company },
        { label: "Location", value: job.location },
        { label: "Job Type", value: job.jobType },
        { label: "Salary",   value: job.salary },
      ].filter(r => r.value)
    : [];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {loading && (
          <div className="loading-center" style={{ paddingTop: 80 }}>
            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
            <p>Loading job details…</p>
          </div>
        )}

        {!loading && !job && (
          <div className="page-body" style={{ paddingTop: 48 }}>
            <div className="empty-state">
              <div className="empty-icon">😕</div>
              <h3>Job Not Found</h3>
              <p>{message.text || "We couldn't find the job you're looking for."}</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/jobs")}>
                ← Back to Jobs
              </button>
            </div>
          </div>
        )}

        {!loading && job && (
          <>
            {/* Hero header */}
            <div style={{ background: "var(--grad-hero)", color: "#fff", padding: "32px" }}>
              <button
                onClick={() => navigate("/jobs")}
                style={{ background: "rgba(255,255,255,.12)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 20 }}>
                ← Back to Jobs
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <div style={{ width: 72, height: 72, borderRadius: 18, background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800 }}>
                  {(job.company || "C").charAt(0).toUpperCase()}
                </div>
                <div>
                  <span style={{ display: "inline-block", padding: "4px 10px", background: "rgba(255,255,255,.15)", borderRadius: 20, fontSize: 12, marginBottom: 8 }}>💼 Job Opportunity</span>
                  <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{job.title}</h1>
                  <p style={{ opacity: .85, fontSize: 15 }}>🏢 {job.company}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
                {job.location && <span style={{ background: "rgba(255,255,255,.14)", padding: "8px 14px", borderRadius: 10, fontSize: 14 }}>📍 {job.location}</span>}
                {job.jobType && <span style={{ background: "rgba(255,255,255,.14)", padding: "8px 14px", borderRadius: 10, fontSize: 14 }}>⏱ {job.jobType}</span>}
                {job.salary && <span style={{ background: "rgba(255,255,255,.14)", padding: "8px 14px", borderRadius: 10, fontSize: 14 }}>💰 {job.salary}</span>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, padding: "28px 32px", alignItems: "start" }}>
              {/* Left column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Description */}
                <div className="card">
                  <p className="section-title" style={{ marginBottom: 14 }}>📋 Job Description</p>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--clr-text-muted)", whiteSpace: "pre-wrap" }}>
                    {job.description || "No description provided."}
                  </p>
                </div>

                {/* Required skills */}
                {skills.length > 0 && (
                  <div className="card">
                    <p className="section-title" style={{ marginBottom: 14 }}>🧠 Required Skills</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {skills.map(s => <span key={s} className="skill-pill">✓ {s}</span>)}
                    </div>
                  </div>
                )}

                {/* Info table */}
                <div className="card">
                  <p className="section-title" style={{ marginBottom: 14 }}>ℹ️ Job Details</p>
                  {infoRows.map(r => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--clr-border)" }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{r.label}</span>
                      <span style={{ fontSize: 14, color: "var(--clr-text-muted)" }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right sticky panel */}
              <div style={{ position: "sticky", top: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Apply card */}
                <div className="card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
                  <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Ready to Apply?</p>
                  <p style={{ fontSize: 13, color: "var(--clr-text-muted)", marginBottom: 16 }}>Take the next step in your career.</p>
                  <button className="btn btn-primary btn-full" onClick={handleApply} disabled={applying}>
                    {applying ? "Submitting…" : "🚀 Apply Now"}
                  </button>
                  {message.text && (
                    <div className={`alert alert-${message.type === "error" ? "error" : "success"}`} style={{ marginTop: 12, textAlign: "left" }}>
                      {message.text}
                    </div>
                  )}
                </div>

                {/* AI matching card */}
                <div style={{ background: "var(--grad-primary)", borderRadius: "var(--radius-lg)", padding: 20, textAlign: "center", color: "#fff" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
                  <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Check Your Match</p>
                  <p style={{ fontSize: 13, opacity: .85, marginBottom: 16 }}>See how your resume stacks up against this role.</p>
                  <button
                    style={{ background: "#fff", color: "var(--clr-primary)", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer", width: "100%" }}
                    onClick={() => {
                      sessionStorage.setItem("selectedJobId", String(job.id));
                      navigate("/skill-gap");
                    }}>
                    Analyse Gap →
                  </button>
                </div>

                {/* Quick nav */}
                <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: "flex-start" }}
                    onClick={() => navigate("/jobs")}>🔍 Browse More Jobs</button>
                  <button className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: "flex-start" }}
                    onClick={() => navigate("/recommendations")}>⭐ AI Recommendations</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}