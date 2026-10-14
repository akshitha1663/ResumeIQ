import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function ManageRoles() {
  const [roles, setRoles]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId]   = useState(null);

  const [title, setTitle]           = useState("");
  const [category, setCategory]     = useState("Software Engineering");
  const [description, setDesc]      = useState("");
  const [requiredSkills, setReq]    = useState("");
  const [optionalSkills, setOpt]    = useState("");
  const [experienceLevel, setExp]   = useState("Entry Level / Mid Level");
  const [active, setActive]         = useState(true);

  const loadRoles = () => {
    setLoading(true);
    api.get("/admin/target-roles")
      .then(res => setRoles(res.data || []))
      .catch(() => setError("Failed to load target roles."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle("");
    setCategory("Software Engineering");
    setDesc("");
    setReq("");
    setOpt("");
    setExp("Entry Level / Mid Level");
    setActive(true);
    setModalOpen(true);
  };

  const openEditModal = (role) => {
    setEditingId(role.id);
    setTitle(role.title);
    setCategory(role.category || "Software Engineering");
    setDesc(role.description || "");
    setReq(role.requiredSkills || "");
    setOpt(role.optionalSkills || "");
    setExp(role.experienceLevel || "Mid Level");
    setActive(role.active !== false);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !requiredSkills.trim()) {
      alert("Title and Required Skills are mandatory.");
      return;
    }

    const payload = {
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      requiredSkills: requiredSkills.trim(),
      optionalSkills: optionalSkills.trim(),
      experienceLevel: experienceLevel.trim(),
      active
    };

    try {
      if (editingId) {
        await api.put(`/admin/target-roles/${editingId}`, payload);
      } else {
        await api.post("/admin/target-roles", payload);
      }
      setModalOpen(false);
      loadRoles();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save target role.");
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this target role? It will be hidden from student analyses.")) return;
    try {
      await api.delete(`/admin/target-roles/${id}`);
      loadRoles();
    } catch (err) {
      alert("Failed to deactivate target role.");
    }
  };

  const filtered = roles.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.category && r.category.toLowerCase().includes(search.toLowerCase())) ||
    (r.requiredSkills && r.requiredSkills.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Admin Panel / Target Roles</p>
            <h1 className="page-title">Manage Target Career Roles</h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/admin/jobs" className="btn btn-outline btn-sm">
              Manage Jobs
            </Link>
            <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
              + Add Target Role
            </button>
          </div>
        </div>

        <div className="page-body">
          {/* Search bar */}
          <div className="card" style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <input
              className="form-input"
              type="text"
              placeholder="Search target roles or skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 360 }}
            />
            <span className="badge badge-primary">{filtered.length} Configured Roles</span>
          </div>

          {loading && (
            <div className="loading-center card" style={{ padding: 40 }}>
              <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
              <p>Loading target roles…</p>
            </div>
          )}

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          {!loading && filtered.length > 0 && (
            <div className="card" style={{ padding: 0, overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Role Title</th>
                    <th>Category</th>
                    <th>Required Skills</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 700 }}>{r.title}</td>
                      <td>{r.category || "General"}</td>
                      <td style={{ maxWidth: 380, fontSize: 12.5 }}>
                        {r.requiredSkills}
                      </td>
                      <td>
                        <span className={`badge ${r.active !== false ? "badge-success" : "badge-danger"}`}>
                          {r.active !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(r)}>
                            Edit
                          </button>
                          {r.active !== false && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(r.id)}>
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal Form */}
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal" style={{ maxWidth: 600 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800 }}>
                    {editingId ? "Edit Target Role" : "Create Target Role"}
                  </h2>
                  <button onClick={() => setModalOpen(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
                </div>

                <form onSubmit={handleSave}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
                    <div className="form-field">
                      <label className="form-label">Role Title *</label>
                      <input className="form-input" type="text" placeholder="e.g. Java Developer" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div className="form-field">
                        <label className="form-label">Category</label>
                        <input className="form-input" type="text" value={category} onChange={e => setCategory(e.target.value)} />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Experience Level</label>
                        <input className="form-input" type="text" value={experienceLevel} onChange={e => setExp(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-field">
                      <label className="form-label">Required Skills (Comma-separated) *</label>
                      <input className="form-input" type="text" placeholder="Java, Spring Boot, MySQL, REST API, Git..." value={requiredSkills} onChange={e => setReq(e.target.value)} required />
                    </div>

                    <div className="form-field">
                      <label className="form-label">Optional / Bonus Skills</label>
                      <input className="form-input" type="text" placeholder="Docker, AWS, Redis..." value={optionalSkills} onChange={e => setOpt(e.target.value)} />
                    </div>

                    <div className="form-field">
                      <label className="form-label">Description</label>
                      <textarea className="form-textarea" rows={3} value={description} onChange={e => setDesc(e.target.value)} />
                    </div>

                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                      <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
                      Active (Visible to users)
                    </label>
                  </div>

                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Role</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
