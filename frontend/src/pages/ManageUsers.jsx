import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function ManageUsers() {
  const [users, setUsers]       = useState([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [confirm, setConfirm]   = useState(null); // id to delete
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/admin/users")
      .then(r => setUsers(r.data || []))
      .catch(e => setError(e.response?.data?.message || "Failed to load users."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const deleteUser = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${confirm}`);
      setUsers(prev => prev.filter(u => u.id !== confirm));
      setConfirm(null);
    } catch {
      setError("Delete failed.");
    } finally { setDeleting(false); }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Admin / Manage Users</p>
            <h1 className="page-title">Manage Users</h1>
          </div>
          <span className="badge badge-primary">{users.length} users</span>
        </div>
        <div className="page-body">
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {/* Search */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--clr-border)" }}>
              <input className="form-input" type="text" placeholder="🔍 Search by name or email…"
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ maxWidth: 340 }} />
            </div>

            {loading
              ? <div className="loading-center"><span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} /></div>
              : filtered.length === 0
                ? <div className="empty-state"><div className="empty-icon">👤</div><h3>No users found</h3></div>
                : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(u => (
                        <tr key={u.id}>
                          <td style={{ color: "var(--clr-text-muted)", fontSize: 13 }}>{u.id}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div className="user-avatar" style={{ width: 30, height: 30, fontSize: 13 }}>
                                {(u.name || "U").charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 500 }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ color: "var(--clr-text-muted)", fontSize: 14 }}>{u.email}</td>
                          <td>
                            <span className={`badge ${u.role === "ADMIN" ? "badge-primary" : "badge-accent"}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            {u.role !== "ADMIN" && (
                              <button className="btn btn-danger btn-sm"
                                onClick={() => setConfirm(u.id)}>
                                Delete
                              </button>
                            )}
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

      {/* Confirm delete modal */}
      {confirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ marginBottom: 12 }}>Confirm Delete</h2>
            <p style={{ color: "var(--clr-text-muted)", marginBottom: 24 }}>
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={deleteUser} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
