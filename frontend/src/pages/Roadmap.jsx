import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function Roadmap() {
  const [searchParams] = useSearchParams();
  const [roles, setRoles]               = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(searchParams.get("roleId") || "");
  const [durationDays, setDurationDays] = useState(30);

  const [roadmaps, setRoadmaps]         = useState([]);
  const [activeRoadmap, setActive]      = useState(null);
  const [loading, setLoading]           = useState(false);
  const [generating, setGenerating]     = useState(false);
  const [error, setError]               = useState("");

  const loadRoadmaps = () => {
    setLoading(true);
    api.get("/roadmaps")
      .then(res => {
        setRoadmaps(res.data || []);
        if (res.data && res.data.length > 0) {
          // If roleId in query param matches one, select that, otherwise select latest
          const queryId = searchParams.get("roleId");
          const found = queryId ? res.data.find(r => String(r.targetRoleId) === String(queryId)) : null;
          setActive(found || res.data[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get("/target-roles")
      .then(res => {
        setRoles(res.data || []);
        if (!selectedRoleId && res.data && res.data.length > 0) {
          setSelectedRoleId(String(res.data[0].id));
        }
      })
      .catch(() => {});

    loadRoadmaps();
  }, []);

  const generate = async () => {
    if (!selectedRoleId) {
      setError("Please select a target role.");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const res = await api.post("/roadmaps/generate", {
        targetRoleId: Number(selectedRoleId),
        durationDays: Number(durationDays)
      });
      setActive(res.data);
      loadRoadmaps();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate roadmap.");
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (taskId) => {
    if (!activeRoadmap) return;
    try {
      const res = await api.put(`/roadmaps/${activeRoadmap.id}/tasks/${taskId}/toggle`);
      setActive(res.data);
      setRoadmaps(prev => prev.map(r => r.id === res.data.id ? res.data : r));
    } catch (err) {
      alert("Unable to save task progress.");
    }
  };

  let weeks = [];
  if (activeRoadmap && activeRoadmap.roadmapJson) {
    try {
      weeks = JSON.parse(activeRoadmap.roadmapJson);
    } catch (e) {
      weeks = [];
    }
  }

  const completedSet = new Set(
    (activeRoadmap?.completedTaskIds || "").split(",").filter(Boolean)
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Career Development / Roadmap</p>
            <h1 className="page-title">Personalized Learning Roadmap</h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/skill-gap" className="btn btn-outline btn-sm">
              📈 Skill Gap Analysis
            </Link>
            <Link to="/interview-coach" className="btn btn-ghost btn-sm">
              🎙️ Practice Interviews
            </Link>
          </div>
        </div>

        <div className="page-body">
          {/* Generation Control Card */}
          <div className="card" style={{ marginBottom: 24 }}>
            <p style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>
              🎯 Generate Structured Career Roadmap
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div className="form-field" style={{ flex: 2, minWidth: 240 }}>
                <label className="form-label">Target Role</label>
                <select
                  className="form-select"
                  value={selectedRoleId}
                  onChange={e => setSelectedRoleId(e.target.value)}
                >
                  <option value="">— Select Target Role —</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.title} ({r.category})</option>
                  ))}
                </select>
              </div>

              <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
                <label className="form-label">Duration Plan</label>
                <select
                  className="form-select"
                  value={durationDays}
                  onChange={e => setDurationDays(Number(e.target.value))}
                >
                  <option value={30}>30-Day Intensive (4 Weeks)</option>
                  <option value={60}>60-Day Comprehensive (8 Weeks)</option>
                </select>
              </div>

              <button
                className="btn btn-primary"
                onClick={generate}
                disabled={generating || !selectedRoleId}
                style={{ height: 42 }}
              >
                {generating ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />&nbsp;Creating Plan…</> : "⚡ Generate Roadmap"}
              </button>
            </div>

            {error && <div className="alert alert-error" style={{ marginTop: 14 }}>{error}</div>}

            {/* Existing Saved Roadmaps Tabs */}
            {roadmaps.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginTop: 16, overflowX: "auto", paddingTop: 10, borderTop: "1px solid var(--clr-border)" }}>
                {roadmaps.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setActive(r)}
                    className={`btn btn-sm ${activeRoadmap?.id === r.id ? "btn-primary" : "btn-ghost"}`}
                    style={{ borderRadius: 20, fontSize: 12, whiteSpace: "nowrap" }}
                  >
                    {r.roleTitle} ({r.progressPercent}%)
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Roadmap Display */}
          {activeRoadmap ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Progress Summary Card */}
              <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 900 }}>{activeRoadmap.roleTitle} Roadmap</h2>
                  <p style={{ fontSize: 13, color: "var(--clr-text-muted)", marginTop: 2 }}>
                    {activeRoadmap.durationDays}-Day Goal Plan • {completedSet.size} of {weeks.reduce((acc, w) => acc + (w.tasks?.length || 0), 0)} tasks completed
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 240 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                      <span>Progress</span>
                      <span>{activeRoadmap.progressPercent}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${activeRoadmap.progressPercent}%`,
                          background: activeRoadmap.progressPercent === 100 ? "var(--clr-success)" : "var(--clr-primary)"
                        }}
                      />
                    </div>
                  </div>
                  <div style={{
                    fontSize: 22, fontWeight: 900,
                    color: activeRoadmap.progressPercent === 100 ? "var(--clr-success)" : "var(--clr-primary)"
                  }}>
                    {activeRoadmap.progressPercent}%
                  </div>
                </div>
              </div>

              {/* Weekly Modules */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {weeks.map(w => {
                  const weekTasks = w.tasks || [];
                  const weekCompleted = weekTasks.filter(t => completedSet.has(t.id)).length;
                  const isWeekDone = weekTasks.length > 0 && weekCompleted === weekTasks.length;

                  return (
                    <div
                      key={w.weekNumber}
                      className="card"
                      style={{
                        borderLeft: `5px solid ${isWeekDone ? "var(--clr-success)" : "var(--clr-primary)"}`,
                        transition: "all .2s"
                      }}
                    >
                      {/* Week Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className={`badge ${isWeekDone ? "badge-success" : "badge-primary"}`}>
                              Week {w.weekNumber}
                            </span>
                            <h3 style={{ fontSize: 16, fontWeight: 800 }}>{w.theme}</h3>
                          </div>
                          <p style={{ fontSize: 13, color: "var(--clr-text-muted)", marginTop: 4 }}>
                            🎯 <strong>Goal:</strong> {w.goal}
                          </p>
                        </div>

                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--clr-text-muted)" }}>
                          {weekCompleted}/{weekTasks.length} Done
                        </span>
                      </div>

                      {/* Tasks List with interactive checkboxes */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                        {weekTasks.map(t => {
                          const isDone = completedSet.has(t.id);
                          return (
                            <label
                              key={t.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "10px 14px",
                                background: isDone ? "var(--clr-success-lt)" : "var(--clr-surface-2)",
                                borderRadius: 8,
                                cursor: "pointer",
                                transition: "all .15s"
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => toggleTask(t.id)}
                                style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--clr-primary)" }}
                              />
                              <div style={{ flex: 1 }}>
                                <span style={{
                                  fontSize: 13.5,
                                  fontWeight: 600,
                                  color: isDone ? "var(--clr-text-muted)" : "var(--clr-text)",
                                  textDecoration: isDone ? "line-through" : "none"
                                }}>
                                  {t.title}
                                </span>
                              </div>
                              <span className="badge badge-muted" style={{ fontSize: 11 }}>
                                {t.estimatedHours || "3 hrs"}
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      {/* Mini-Project & Documentation Link */}
                      <div style={{
                        background: "var(--clr-surface)",
                        border: "1px dashed var(--clr-border)",
                        borderRadius: 8,
                        padding: "10px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 10
                      }}>
                        <span style={{ fontSize: 13 }}>
                          🛠️ <strong>Portfolio Task:</strong> {w.miniProject}
                        </span>
                        {w.freeResource && (
                          <a
                            href={w.freeResource}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 12, color: "var(--clr-primary)", fontWeight: 700 }}
                          >
                            Free Documentation Guide ↗
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            !loading && (
              <div className="empty-state card" style={{ padding: 48 }}>
                <div className="empty-icon">🗺️</div>
                <h3>No learning roadmap created yet</h3>
                <p>Select your target role above and click <strong>Generate Roadmap</strong> to create an interactive 30-day or 60-day milestone plan.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
