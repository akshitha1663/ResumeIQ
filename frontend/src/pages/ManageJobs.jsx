import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const emptyForm = { title: "", company: "", location: "", jobType: "", salary: "", skills: "", description: "" };

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
    api.get("/admin/jobs").then(r => setJobs(r.data || [])).catch(() => setError("Failed to load jobs.")).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setFormError(""); setShowForm(true); };
  const openEdit   = (j) => { setForm({ ...j }); setEditId(j.id); setFormError(""); setShowForm(true); };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const saveJob = async () => {
    if (!form.title.trim()) { setFormError("Job title is required."); return; }
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
    return j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q);
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
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--clr-border)" }}>
              <input className="form-input" type="text" placeholder="🔍 Search jobs…"
                value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 340 }} />
            </div>
            {loading
              ? <div className="loading-center"><span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} /></div>
              : filtered.length === 0
                ? <div className="empty-state"><div className="empty-icon">💼</div><h3>No jobs yet</h3><p>Add the first job using the button above.</p></div>
                : (
                  <table className="data-table">
                    <thead><tr><th>ID</th><th>Title</th><th>Company</th><th>Location</th><th>Type</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filtered.map(j => (
                        <tr key={j.id}>
                          <td style={{ color: "var(--clr-text-muted)", fontSize: 13 }}>{j.id}</td>
                          <td style={{ fontWeight: 600 }}>{j.title}</td>
                          <td>{j.company}</td>
                          <td style={{ color: "var(--clr-text-muted)" }}>{j.location}</td>
                          <td><span className="badge badge-accent">{j.jobType}</span></td>
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
          <div className="modal" style={{ maxWidth: 560 }}>
            <h2 style={{ marginBottom: 20 }}>{editId ? "Edit Job" : "Add New Job"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { name: "title",       label: "Job Title *",    placeholder: "e.g. Software Engineer" },
                { name: "company",     label: "Company",        placeholder: "e.g. TechCorp" },
                { name: "location",    label: "Location",       placeholder: "e.g. Remote, Bangalore" },
                { name: "jobType",     label: "Job Type",       placeholder: "e.g. Full-time, Internship" },
                { name: "salary",      label: "Salary",         placeholder: "e.g. ₹8–12 LPA" },
                { name: "skills",      label: "Skills (CSV)",   placeholder: "Java, Spring Boot, MySQL" },
              ].map(f => (
                <div key={f.name} className="form-field">
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" name={f.name} placeholder={f.placeholder}
                    value={form[f.name] || ""} onChange={handleChange} />
                </div>
              ))}
              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" name="description" placeholder="Job description…"
                  value={form.description || ""} onChange={handleChange} rows={3} />
              </div>
              {formError && <div className="alert alert-error">{formError}</div>}
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveJob} disabled={saving}>
                  {saving ? "Saving…" : (editId ? "Save Changes" : "Create Job")}
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
            <p style={{ color: "var(--clr-text-muted)", marginBottom: 24 }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={deleteJob}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
