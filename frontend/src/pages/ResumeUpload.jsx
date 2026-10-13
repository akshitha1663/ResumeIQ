import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function ResumeUpload() {
  const navigate = useNavigate();
  const [file, setFile]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState(null); // {type,text}
  const [resumeId, setResumeId] = useState("");
  const [history, setHistory]   = useState([]);
  const [drag, setDrag]         = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    api.get("/resumes/my").then(r => setHistory(r.data || [])).catch(() => {});
  }, []);

  const handleDrop = e => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleUpload = async e => {
    e.preventDefault();
    if (!file) { setMessage({ type: "error", text: "Please select a file." }); return; }
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true); setMessage(null);
    try {
      const res = await api.post("/resumes/upload", formData);
      const id = res.data?.resumeId ?? res.data?.id;
      setResumeId(String(id));
      sessionStorage.setItem("resumeId", String(id));
      setMessage({ type: "success", text: "Resume uploaded successfully! Resume ID: " + id });
      setFile(null);
      // Refresh history
      api.get("/resumes/my").then(r => setHistory(r.data || [])).catch(() => {});
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Upload failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const selectAndAnalyze = (id, fileName) => {
    sessionStorage.setItem("resumeId", String(id));
    navigate("/resume-analysis");
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Workspace / Resume Upload</p>
            <h1 className="page-title">Upload Resume</h1>
          </div>
        </div>
        <div className="page-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

            {/* Upload card */}
            <div className="card">
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Upload New Resume</p>
              <p style={{ fontSize: 13, color: "var(--clr-text-muted)", marginBottom: 20 }}>
                PDF, DOC, or DOCX · Max 5 MB
              </p>

              {/* Drop zone */}
              <div
                className={`drop-zone${drag ? " drag-over" : ""}`}
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={handleDrop}
              >
                <div className="drop-icon">📄</div>
                {file
                  ? <><p style={{ fontWeight: 600 }}>{file.name}</p><p style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>{(file.size / 1024).toFixed(1)} KB</p></>
                  : <><p style={{ fontWeight: 600 }}>Drag & drop or click to select</p><p style={{ fontSize: 13, color: "var(--clr-text-muted)" }}>PDF, DOC, DOCX supported</p></>
                }
              </div>
              <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
                onChange={e => setFile(e.target.files?.[0] || null)} />

              {message && (
                <div className={`alert alert-${message.type === "error" ? "error" : "success"}`} style={{ marginTop: 14 }} role={message.type === "error" ? "alert" : "status"}>
                  {message.text}
                </div>
              )}

              <button className="btn btn-primary btn-full" style={{ marginTop: 16 }} onClick={handleUpload} disabled={loading || !file}>
                {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />&nbsp;Uploading…</> : "Upload Resume →"}
              </button>

              {resumeId && (
                <button className="btn btn-outline btn-full" style={{ marginTop: 10 }}
                  onClick={() => navigate("/resume-analysis")}>
                  ✨ Analyze this Resume
                </button>
              )}
            </div>

            {/* History card */}
            <div className="card">
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Upload History</p>
              {history.length === 0
                ? <div className="empty-state" style={{ padding: "30px 20px" }}>
                    <div className="empty-icon" style={{ fontSize: 32 }}>📂</div>
                    <p style={{ fontSize: 14 }}>No resumes uploaded yet.</p>
                  </div>
                : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {history.map(r => (
                      <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--clr-surface-2)", borderRadius: 10 }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>📄 {r.fileName}</p>
                          <p style={{ fontSize: 12, color: "var(--clr-text-muted)", marginTop: 2 }}>
                            {new Date(r.uploadedAt).toLocaleDateString()} · ID: {r.id}
                          </p>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => selectAndAnalyze(r.id, r.fileName)}>
                          Analyze
                        </button>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}