import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function CareerComparison() {
  const [roles, setRoles]           = useState([]);
  const [selectedRoleIds, setSelected] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    api.get("/target-roles")
      .then(res => {
        const list = res.data || [];
        setRoles(list);
        if (list.length >= 2) {
          const initial = [String(list[0].id), String(list[1].id)];
          setSelected(initial);
          compare(initial);
        }
      })
      .catch(() => {});
  }, []);

  const compare = async (idsToCompare) => {
    const ids = idsToCompare || selectedRoleIds;
    if (ids.length < 2) {
      setError("Please select at least 2 roles to compare.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/target-roles/compare?ids=${ids.join(",")}`);
      setComparisons(res.data || []);
    } catch (err) {
      setError("Failed to load role comparison.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleIdStr) => {
    let updated;
    if (selectedRoleIds.includes(roleIdStr)) {
      if (selectedRoleIds.length <= 2) {
        alert("Please keep at least 2 roles selected to compare.");
        return;
      }
      updated = selectedRoleIds.filter(id => id !== roleIdStr);
    } else {
      if (selectedRoleIds.length >= 3) {
        alert("You can compare up to 3 roles at a time.");
        return;
      }
      updated = [...selectedRoleIds, roleIdStr];
    }
    setSelected(updated);
    compare(updated);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Career Development / Comparison</p>
            <h1 className="page-title">Career Track Comparison</h1>
          </div>
          <Link to="/skill-gap" className="btn btn-outline btn-sm">
            📈 Skill Gap Analysis
          </Link>
        </div>

        <div className="page-body">
          {/* Role selector bar */}
          <div className="card" style={{ marginBottom: 24 }}>
            <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>
              Select 2 to 3 Roles to Compare Side-by-Side:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {roles.map(r => {
                const isSelected = selectedRoleIds.includes(String(r.id));
                return (
                  <button
                    key={r.id}
                    onClick={() => handleRoleToggle(String(r.id))}
                    className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-ghost"}`}
                    style={{ borderRadius: 20, fontSize: 12 }}
                  >
                    {isSelected ? "✓ " : "+ "} {r.title}
                  </button>
                );
              })}
            </div>
            {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
          </div>

          {loading && (
            <div className="loading-center card" style={{ padding: 40 }}>
              <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
              <p>Analyzing role requirements and computing resume match…</p>
            </div>
          )}

          {/* Comparison Grid */}
          {!loading && comparisons.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${comparisons.length}, minmax(280px, 1fr))`,
              gap: 20
            }}>
              {comparisons.map((c, idx) => (
                <div key={c.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Header */}
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: 6 }}>
                      Option {idx + 1} • {c.category || "Engineering"}
                    </span>
                    <h2 style={{ fontSize: 20, fontWeight: 900 }}>{c.title}</h2>
                    <p style={{ fontSize: 13, color: "var(--clr-text-muted)", marginTop: 4 }}>
                      {c.description}
                    </p>
                  </div>

                  {/* Match Score */}
                  <div style={{
                    background: "var(--clr-surface-2)",
                    padding: 16,
                    borderRadius: 12,
                    textAlign: "center"
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--clr-text-muted)" }}>YOUR RESUME MATCH</p>
                    <div style={{
                      fontSize: 44, fontWeight: 900,
                      color: c.matchPercent >= 70 ? "var(--clr-success)" : c.matchPercent >= 40 ? "var(--clr-warning)" : "var(--clr-primary)"
                    }}>
                      {c.matchPercent !== null ? `${c.matchPercent}%` : "—"}
                    </div>
                    <div className="progress-bar" style={{ maxWidth: 160, margin: "6px auto" }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${c.matchPercent || 0}%`,
                          background: c.matchPercent >= 70 ? "var(--clr-success)" : c.matchPercent >= 40 ? "var(--clr-warning)" : "var(--clr-primary)"
                        }}
                      />
                    </div>
                  </div>

                  {/* Available Platform Jobs */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", background: "var(--clr-surface-2)", borderRadius: 8
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Active Jobs on Platform:</span>
                    <span className="badge badge-success" style={{ fontSize: 13 }}>
                      💼 {c.availableJobsCount}
                    </span>
                  </div>

                  {/* Required Skills */}
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: "var(--clr-text-muted)", textTransform: "uppercase", marginBottom: 8 }}>
                      Core Required Skills
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {c.requiredSkills ? c.requiredSkills.split(",").map(s => (
                        <span key={s} className="skill-pill" style={{ fontSize: 11 }}>
                          {s.trim()}
                        </span>
                      )) : <p style={{ fontSize: 12, color: "var(--clr-text-muted)" }}>Not specified</p>}
                    </div>
                  </div>

                  {/* Matched Skills vs Missing Skills */}
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: "var(--clr-success)", textTransform: "uppercase", marginBottom: 6 }}>
                      ✅ You Have ({c.matchedSkills?.length || 0})
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                      {c.matchedSkills?.length ? c.matchedSkills.map(s => (
                        <span key={s} className="skill-pill matched" style={{ fontSize: 11 }}>{s}</span>
                      )) : <p style={{ fontSize: 12, color: "var(--clr-text-muted)" }}>None</p>}
                    </div>

                    <p style={{ fontSize: 12, fontWeight: 800, color: "var(--clr-danger)", textTransform: "uppercase", marginBottom: 6 }}>
                      ❌ Missing ({c.missingSkills?.length || 0})
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {c.missingSkills?.length ? c.missingSkills.map(s => (
                        <span key={s} className="skill-pill missing" style={{ fontSize: 11 }}>{s}</span>
                      )) : <p style={{ fontSize: 12, color: "var(--clr-success)" }}>All matched!</p>}
                    </div>
                  </div>

                  {/* Action Link */}
                  <div style={{ marginTop: "auto", paddingTop: 10 }}>
                    <Link
                      to={`/roadmap?roleId=${c.id}`}
                      className="btn btn-primary btn-sm btn-full"
                      style={{ textAlign: "center" }}
                    >
                      Build Roadmap for This Role →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
