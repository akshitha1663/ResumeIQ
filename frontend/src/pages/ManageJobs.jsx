import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const emptyForm = {
  title: "",
  company: "",
  location: "",
  jobType: "Full-time",
  workMode: "Remote",
  experienceLevel: "Entry-level",
  salary: "",
  skills: "",
  applyLink: "",
  description: ""
};

const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract", "Freelance", "Temporary"];
const WORK_MODES = ["Remote", "Hybrid", "On-site"];
const EXP_LEVELS = ["Entry-level", "Mid-level", "Senior", "Lead", "Any"];

export default function ManageJobs() {
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState("");
  const [confirm, setConfirm]     = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/admin/jobs")
      .then(r => setJobs(r.data || []))
      .catch(() => setError("Failed to load jobs."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setFormError(""); setShowForm(true); };
  const openEdit   = (j) => {
    setForm({
      title: j.title || "",
      company: j.company || "",
      location: j.location || "",
      jobType: j.jobType || "Full-time",
      workMode: j.workMode || "Remote",
      experienceLevel: j.experienceLevel || "Entry-level",
      salary: j.salary || "",
      skills: j.skills || "",
      applyLink: j.applyLink || "",
      description: j.description || ""
    });
    setEditId(j.id);
    setFormError("");
    setShowForm(true);
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const saveJob = async () => {
    if (!form.title.trim()) { setFormError("Job title is required."); return; }
    if (!form.company.trim()) { setFormError("Company name is required."); return; }
    if (!form.location.trim()) { setFormError("Location is required."); return; }
    setSaving(true); setFormError("");
    try {
      if (editId) {
        await api.put(`/admin/jobs/${editId}`, form);
      } else {
        await api.post("/admin/jobs", form);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Save failed.");
    } finally { setSaving(false); }
  };

  const deleteJob = async () => {
    if (!confirm) return;
    try {
      await api.delete(`/admin/jobs/${confirm}`);
      setJobs(prev => prev.filter(j => j.id !== confirm));
      setConfirm(null);
    } catch { setError("Delete failed."); }
  };

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    return j.title?.toLowerCase().includes(q) ||
           j.company?.toLowerCase().includes(q) ||
           j.location?.toLowerCase().includes(q) ||
           j.skills?.toLowerCase().includes(q);
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Admin / Manage Jobs</p>
            <h1 className="page-title">Manage Jobs</h1>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Job</button>
        </div>
        <div className="page-body">
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--clr-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <input className="form-input" type="text" placeholder="🔍 Search by title, company, skills, or location…"
                value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 380 }} />
              <span style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>Total: {filtered.length} jobs</span>
            </div>
            {loading
              ? <div className="loading-center"><span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} /></div>
              : filtered.length === 0
                ? <div className="empty-state"><div className="empty-icon">💼</div><h3>No jobs found</h3><p>Create a job listing using the button above.</p></div>
                : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Title & Company</th>
                        <th>Location</th>
                        <th>Type & Mode</th>
                        <th>Experience</th>
                        <th>Salary</th>
                        <th>Apply Link</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(j => (
                        <tr key={j.id}>
                          <td style={{ color: "var(--clr-text-muted)", fontSize: 13 }}>#{j.id}</td>
                          <td>
                            <div style={{ fontWeight: 600, color: "var(--clr-text)" }}>{j.title}</div>
                            <div style={{ fontSize: 12, color: "var(--clr-text-muted)" }}>{j.company}</div>
                          </td>
                          <td style={{ color: "var(--clr-text-muted)", fontSize: 13 }}>{j.location}</td>
                          <td>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              <span className="badge badge-accent" style={{ fontSize: 11 }}>{j.jobType || "Full-time"}</span>
                              {j.workMode && <span className="badge badge-success" style={{ fontSize: 11 }}>{j.workMode}</span>}
                            </div>
                          </td>
                          <td style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>{j.experienceLevel || "—"}</td>
                          <td style={{ fontSize: 13, fontWeight: 600, color: "var(--clr-primary)" }}>{j.salary || "Not specified"}</td>
                          <td style={{ fontSize: 13 }}>
                            {j.applyLink ? (
                              <a href={j.applyLink} target="_blank" rel="noopener noreferrer" style={{ color: "var(--clr-primary)", fontWeight: 600, textDecoration: "none" }}>
                                External ↗
                              </a>
                            ) : (
                              <span style={{ color: "var(--clr-text-faint)" }}>Internal</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(j)}>Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={() => setConfirm(j.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
            }
          </div>
        </div>
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 640 }}>
            <h2 style={{ marginBottom: 20 }}>{editId ? "Edit Job Listing" : "Add New Job Listing"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-field">
                  <label className="form-label">Job Title *</label>
                  <input className="form-input" name="title" placeholder="e.g. Senior Java Engineer"
                    value={form.title} onChange={handleChange} />
                </div>
                <div className="form-field">
                  <label className="form-label">Company Name *</label>
                  <input className="form-input" name="company" placeholder="e.g. Razorpay"
                    value={form.company} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-field">
                  <label className="form-label">Location *</label>
                  <input className="form-input" name="location" placeholder="e.g. Bengaluru, India or Remote"
                    value={form.location} onChange={handleChange} />
                </div>
                <div className="form-field">
                  <label className="form-label">Salary Range</label>
                  <input className="form-input" name="salary" placeholder="e.g. ₹12–18 LPA or $90,000"
                    value={form.salary} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div className="form-field">
                  <label className="form-label">Job Type</label>
                  <select className="form-input" name="jobType" value={form.jobType} onChange={handleChange}>
                    {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Work Mode</label>
                  <select className="form-input" name="workMode" value={form.workMode} onChange={handleChange}>
                    {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Experience</label>
                  <select className="form-input" name="experienceLevel" value={form.experienceLevel} onChange={handleChange}>
                    {EXP_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Required Skills (Comma separated)</label>
                <input className="form-input" name="skills" placeholder="Java, Spring Boot, MySQL, REST APIs, Microservices"
                  value={form.skills} onChange={handleChange} />
              </div>

              <div className="form-field">
                <label className="form-label">External Apply URL (Optional)</label>
                <input className="form-input" name="applyLink" placeholder="https://company.com/careers/job-123"
                  value={form.applyLink} onChange={handleChange} />
              </div>

              <div className="form-field">
                <label className="form-label">Job Description</label>
                <textarea className="form-textarea" name="description" placeholder="Responsibilities, role overview, and qualifications…"
                  value={form.description} onChange={handleChange} rows={4} />
              </div>

              {formError && <div className="alert alert-error">{formError}</div>}
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveJob} disabled={saving}>
                  {saving ? "Saving…" : (editId ? "Save Changes" : "Create Job Listing")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ marginBottom: 12 }}>Delete Job?</h2>
            <p style={{ color: "var(--clr-text-muted)", marginBottom: 24 }}>This listing will be permanently removed from the platform.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={deleteJob}>Delete Job</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
