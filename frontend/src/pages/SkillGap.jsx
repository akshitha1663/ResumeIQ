import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function SkillGap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [roles, setRoles]           = useState([]);
  const [jobs, setJobs]             = useState([]);
  const [targetType, setTargetType] = useState("role"); // "role" or "job"
  const [selectedRoleId, setSelectedRoleId] = useState(searchParams.get("roleId") || "");
  const [selectedJobId, setSelectedJobId]   = useState(searchParams.get("jobId") || "");
  const [roleSearch, setRoleSearch] = useState("");

  const [latestResume, setLatestResume] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(true);

  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    // Load active target roles
    api.get("/target-roles")
      .then(res => {
        setRoles(res.data || []);
        if (!selectedRoleId && res.data && res.data.length > 0) {
          setSelectedRoleId(String(res.data[0].id));
        }
      })
      .catch(() => {});

    // Load active jobs for alternate comparison
    api.get("/jobs")
      .then(res => setJobs(res.data || []))
      .catch(() => {});

    // Automatically load user's latest resume
    api.get("/resumes/latest")
      .then(res => setLatestResume(res.data))
      .catch(() => setLatestResume(null))
      .finally(() => setResumeLoading(false));
  }, []);

  const filteredRoles = roles.filter(r =>
    r.title.toLowerCase().includes(roleSearch.toLowerCase()) ||
    (r.category && r.category.toLowerCase().includes(roleSearch.toLowerCase()))
  );

  const analyze = async (roleIdOverride, jobIdOverride) => {
    const roleId = roleIdOverride !== undefined ? roleIdOverride : selectedRoleId;
    const jobId = jobIdOverride !== undefined ? jobIdOverride : selectedJobId;

    if (targetType === "role" && !roleId) {
      setError("Please select a target career role.");
      return;
    }
    if (targetType === "job" && !jobId) {
      setError("Please select a job listing.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const params = {};
      if (targetType === "role") params.roleId = roleId;
      else params.jobId = jobId;

      if (latestResume?.id) params.resumeId = latestResume.id;

      const res = await api.get("/skill-gap/analyze", { params });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze skill gap. Please ensure you have uploaded a resume.");
    } finally {
      setLoading(false);
    }
  };

  // Run automatically when target role or resume is ready
  useEffect(() => {
    if (selectedRoleId && roles.length > 0 && !result && !loading) {
      analyze(selectedRoleId, null);
    }
  }, [selectedRoleId, roles]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Career Development / Skill Gap</p>
            <h1 className="page-title">Skill Gap Analysis</h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {result && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigate(`/roadmap?roleId=${result.targetRoleId || selectedRoleId}`)}
              >
                🗺️ Create Learning Roadmap
              </button>
            )}
            <Link to="/career-comparison" className="btn btn-ghost btn-sm">
              ⚖️ Compare Roles
            </Link>
          </div>
        </div>

        <div className="page-body">
          {/* Resume status banner */}
          <div className="card" style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "var(--clr-primary-lt)", color: "var(--clr-primary)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
              }}>
                📄
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14 }}>
                  {resumeLoading ? "Checking resume..." : (latestResume ? latestResume.fileName : "No resume uploaded")}
                </p>
                <p style={{ fontSize: 12, color: "var(--clr-text-muted)" }}>
                  {latestResume
                    ? `Active resume analyzed (Uploaded ${latestResume.uploadedAt ? new Date(latestResume.uploadedAt).toLocaleDateString() : "recently"})`
                    : "Upload your resume to calculate your personalized skill gap."}
                </p>
              </div>
            </div>
            {!latestResume && !resumeLoading && (
              <Link to="/resume-upload" className="btn btn-primary btn-sm">
                Upload Resume First
              </Link>
            )}
          </div>

          {/* Target Role & Selection Controls */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <p style={{ fontWeight: 700, fontSize: 15 }}>Select Target Career Path</p>
              <div style={{ display: "flex", gap: 6, background: "var(--clr-surface-2)", padding: 4, borderRadius: 8 }}>
                <button
                  className={`btn btn-sm ${targetType === "role" ? "btn-primary" : "btn-ghost"}`}
                  style={{ padding: "4px 12px", border: "none" }}
                  onClick={() => { setTargetType("role"); setResult(null); }}
                >
                  🎯 Standard Industry Roles ({roles.length})
                </button>
                <button
                  className={`btn btn-sm ${targetType === "job" ? "btn-primary" : "btn-ghost"}`}
                  style={{ padding: "4px 12px", border: "none" }}
                  onClick={() => { setTargetType("job"); setResult(null); }}
                >
                  💼 Specific Job Postings ({jobs.length})
                </button>
              </div>
            </div>

            {targetType === "role" ? (
              <div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                  <div className="form-field" style={{ flex: 1, minWidth: 220 }}>
                    <label className="form-label">Search Roles</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="e.g. Java, Python, AI, QA, Cloud, DevOps..."
                      value={roleSearch}
                      onChange={e => setRoleSearch(e.target.value)}
                    />
                  </div>
                  <div className="form-field" style={{ flex: 2, minWidth: 260 }}>
                    <label className="form-label">Target Role</label>
                    <select
                      className="form-select"
                      value={selectedRoleId}
                      onChange={e => {
                        setSelectedRoleId(e.target.value);
                        analyze(e.target.value, null);
                      }}
                    >
                      <option value="">— Choose a Target Role —</option>
                      {filteredRoles.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.title} ({r.category || "Engineering"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Role Pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {roles.slice(0, 8).map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setSelectedRoleId(String(r.id));
                        analyze(r.id, null);
                      }}
                      className={`btn btn-sm ${String(selectedRoleId) === String(r.id) ? "btn-primary" : "btn-ghost"}`}
                      style={{ fontSize: 12, borderRadius: 20 }}
                    >
                      {r.title}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="form-field" style={{ marginBottom: 16 }}>
                <label className="form-label">Select Job Listing</label>
                <select
                  className="form-select"
                  value={selectedJobId}
                  onChange={e => {
                    setSelectedJobId(e.target.value);
                    analyze(null, e.target.value);
                  }}
                >
                  <option value="">— Select a Live Job Listing —</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title} @ {j.company} ({j.workMode || j.jobType})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-primary"
                onClick={() => analyze()}
                disabled={loading || (!selectedRoleId && !selectedJobId)}
              >
                {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />&nbsp;Analyzing Skills…</> : "⚡ Recalculate Gap"}
              </button>
              {result && (
                <button
                  className="btn btn-ghost"
                  onClick={() => navigate(`/roadmap?roleId=${result.targetRoleId || selectedRoleId}`)}
                >
                  🚀 Build 30-Day Learning Plan
                </button>
              )}
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="loading-center card" style={{ padding: 48 }}>
              <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
              <p style={{ marginTop: 14, fontWeight: 600 }}>Comparing your resume against {result?.targetTitle || "target role requirements"}…</p>
            </div>
          )}

          {/* Empty state when no analysis yet */}
          {!result && !loading && !error && (
            <div className="empty-state card" style={{ padding: 48 }}>
              <div className="empty-icon">📈</div>
              <h3>Ready to analyze your skill match</h3>
              <p>Select your desired career path above to view matched skills, missing requirements, and curated learning projects.</p>
            </div>
          )}

          {/* Results Display */}
          {result && !loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Match Card */}
              <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, alignItems: "center" }}>
                <div style={{ textAlign: "center", borderRight: "1px solid var(--clr-border)", paddingRight: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--clr-text-muted)", marginBottom: 6 }}>
                    TARGET ROLE MATCH
                  </p>
                  <div style={{
                    fontSize: 56, fontWeight: 900,
                    color: result.matchPercent >= 70 ? "var(--clr-success)" : result.matchPercent >= 40 ? "var(--clr-warning)" : "var(--clr-primary)"
                  }}>
                    {result.matchPercent}%
                  </div>
                  <div className="progress-bar" style={{ maxWidth: 220, margin: "10px auto" }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: result.matchPercent + "%",
                        background: result.matchPercent >= 70 ? "var(--clr-success)" : result.matchPercent >= 40 ? "var(--clr-warning)" : "var(--clr-primary)"
                      }}
                    />
                  </div>
                  <span className={`badge ${result.matchPercent >= 70 ? "badge-success" : result.matchPercent >= 40 ? "badge-warning" : "badge-primary"}`}>
                    {result.matchPercent >= 70 ? "Strong Match" : result.matchPercent >= 40 ? "Moderate Gap" : "High Skill Gap"}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{result.targetTitle}</h3>
                  <p style={{ fontSize: 13, color: "var(--clr-text-muted)", marginBottom: 12 }}>
                    Category: <strong>{result.targetCategory}</strong> • Evaluated on <strong>{result.totalRequiredSkills}</strong> core role requirements.
                  </p>
                  <div style={{ background: "var(--clr-surface-2)", padding: 14, borderRadius: 10, fontSize: 13, color: "var(--clr-text)", lineHeight: 1.5 }}>
                    💡 <strong>Calculation Breakdown:</strong> {result.calculationExplanation}
                  </div>
                </div>
              </div>

              {/* Three Skill Categories */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                {/* 1. Matched */}
                <div className="card" style={{ borderTop: "4px solid var(--clr-success)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <p style={{ fontWeight: 800, fontSize: 14, color: "var(--clr-success)" }}>
                      ✅ Matched Skills ({result.matchedSkills?.length || 0})
                    </p>
                    <span className="badge badge-success">Verified in Resume</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.matchedSkills?.length ? (
                      result.matchedSkills.map(s => (
                        <span key={s} className="skill-pill matched">✓ {s}</span>
                      ))
                    ) : (
                      <p style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>No core skills directly matched yet.</p>
                    )}
                  </div>
                </div>

                {/* 2. Needs Improvement */}
                <div className="card" style={{ borderTop: "4px solid var(--clr-warning)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <p style={{ fontWeight: 800, fontSize: 14, color: "var(--clr-warning)" }}>
                      ⚠️ Needs Improvement ({result.needsImprovementSkills?.length || 0})
                    </p>
                    <span className="badge badge-warning">Partial Evidence</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.needsImprovementSkills?.length ? (
                      result.needsImprovementSkills.map(s => (
                        <span key={s} className="skill-pill missing" style={{ background: "#fef3c7", color: "#b45309", borderColor: "#fde68a" }}>
                          ⚡ {s}
                        </span>
                      ))
                    ) : (
                      <p style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>No partial skills detected.</p>
                    )}
                  </div>
                </div>

                {/* 3. Missing Skills */}
                <div className="card" style={{ borderTop: "4px solid var(--clr-danger)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <p style={{ fontWeight: 800, fontSize: 14, color: "var(--clr-danger)" }}>
                      ❌ Missing Skills ({result.missingSkills?.length || 0})
                    </p>
                    <span className="badge badge-danger">High Priority</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.missingSkills?.length ? (
                      result.missingSkills.map(s => (
                        <span key={s} className="skill-pill missing">✕ {s}</span>
                      ))
                    ) : (
                      <p style={{ fontSize: 13, color: "var(--clr-success)", fontWeight: 600 }}>
                        All core required skills are present in your resume! 🎉
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Learning Resources & Project Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800 }}>📚 Recommended Learning Resources & Projects</h3>
                      <p style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>
                        Concrete study materials and practical portfolio projects to close your missing skill gaps.
                      </p>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/roadmap?roleId=${result.targetRoleId || selectedRoleId}`)}
                    >
                      Convert to 30-Day Plan →
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
                    {result.recommendations.map(r => (
                      <div
                        key={r.skill}
                        style={{
                          background: "var(--clr-surface-2)",
                          border: "1px solid var(--clr-border)",
                          borderRadius: 12,
                          padding: 16,
                          display: "flex",
                          flexDirection: "column",
                          gap: 8
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 800, fontSize: 14, color: "var(--clr-primary)" }}>
                            {r.skill}
                          </span>
                          <span className={`badge ${r.status === "Missing" ? "badge-danger" : "badge-warning"}`}>
                            {r.status}
                          </span>
                        </div>

                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--clr-text-muted)", textTransform: "uppercase" }}>
                            Curated Free Course / Documentation
                          </p>
                          <a
                            href={r.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 13, color: "var(--clr-primary)", fontWeight: 600, textDecoration: "underline" }}
                          >
                            🔗 {r.resource}
                          </a>
                        </div>

                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--clr-text-muted)", textTransform: "uppercase" }}>
                            Recommended Portfolio Project
                          </p>
                          <p style={{ fontSize: 13, color: "var(--clr-text)" }}>
                            🛠️ {r.project}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}