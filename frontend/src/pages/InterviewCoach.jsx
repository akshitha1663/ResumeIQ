import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function InterviewCoach() {
  const [roles, setRoles]           = useState([]);
  const [roleTitle, setRoleTitle]   = useState("Java Developer");
  const [category, setCategory]     = useState("Technical");
  const [difficulty, setDifficulty] = useState("Mid Level");

  const [questions, setQuestions]   = useState([]);
  const [currentIndex, setIndex]    = useState(0);
  const [answers, setAnswers]       = useState({});
  const [currentAnswer, setCurrAns] = useState("");

  const [loading, setLoading]       = useState(false);
  const [evaluating, setEval]       = useState(false);
  const [sessionResult, setResult]  = useState(null);
  const [pastSessions, setPast]     = useState([]);
  const [error, setError]           = useState("");

  useEffect(() => {
    api.get("/target-roles")
      .then(res => {
        setRoles(res.data || []);
        if (res.data?.length > 0) setRoleTitle(res.data[0].title);
      })
      .catch(() => {});

    loadPastSessions();
  }, []);

  const loadPastSessions = () => {
    api.get("/interview/my")
      .then(res => setPast(res.data || []))
      .catch(() => {});
  };

  const startInterview = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setAnswers({});
    setCurrAns("");
    setIndex(0);

    try {
      const res = await api.post("/interview/questions", { roleTitle, category, difficulty });
      setQuestions(res.data || []);
    } catch (err) {
      setError("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    const updated = { ...answers, [currentIndex]: currentAnswer };
    setAnswers(updated);
    if (currentIndex < questions.length - 1) {
      setIndex(prev => prev + 1);
      setCurrAns(updated[currentIndex + 1] || "");
    }
  };

  const handlePrevQuestion = () => {
    const updated = { ...answers, [currentIndex]: currentAnswer };
    setAnswers(updated);
    if (currentIndex > 0) {
      setIndex(prev => prev - 1);
      setCurrAns(updated[currentIndex - 1] || "");
    }
  };

  const submitInterview = async () => {
    const finalAnswers = { ...answers, [currentIndex]: currentAnswer };
    setAnswers(finalAnswers);

    const qaList = questions.map((q, idx) => ({
      question: q.question,
      answer: finalAnswers[idx] || "No answer provided.",
      focusArea: q.focusArea || "General"
    }));

    setEval(true);
    setError("");
    try {
      const res = await api.post("/interview/evaluate", {
        roleTitle, category, difficulty, qaList
      });
      setResult(res.data);
      loadPastSessions();
    } catch (err) {
      setError("Evaluation failed. Please try submitting again.");
    } finally {
      setEval(false);
    }
  };

  let feedbackItems = [];
  if (sessionResult && sessionResult.feedbackJson) {
    try {
      feedbackItems = JSON.parse(sessionResult.feedbackJson);
    } catch (e) {
      feedbackItems = [];
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Career Development / AI Interview Coach</p>
            <h1 className="page-title">AI Mock Interview Practice</h1>
          </div>
          <Link to="/ai-assistant" className="btn btn-outline btn-sm">
            🤖 Ask AI Assistant
          </Link>
        </div>

        <div className="page-body">
          {/* Interview Configuration */}
          {!questions.length && !sessionResult && (
            <div className="card" style={{ maxWidth: 700, margin: "0 auto", padding: 32 }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 44, marginBottom: 8 }}>🎙️</div>
                <h2 style={{ fontSize: 22, fontWeight: 900 }}>Simulate a Real Job Interview</h2>
                <p style={{ color: "var(--clr-text-muted)", fontSize: 14 }}>
                  Practice one-on-one with realistic role-tailored questions and receive actionable AI scoring, feedback, and model answers.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                <div className="form-field">
                  <label className="form-label">Target Role</label>
                  <select
                    className="form-select"
                    value={roleTitle}
                    onChange={e => setRoleTitle(e.target.value)}
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.title}>{r.title} ({r.category})</option>
                    ))}
                    <option value="Java Developer">Java Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-field">
                    <label className="form-label">Interview Type</label>
                    <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="Technical">Technical (Coding & Concepts)</option>
                      <option value="Behavioral">Behavioral (STAR Method)</option>
                      <option value="HR">HR & Cultural Fit</option>
                      <option value="Comprehensive">Comprehensive Mix</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Experience Level</label>
                    <select className="form-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                      <option value="Entry Level">Entry Level (0 - 2 yrs)</option>
                      <option value="Mid Level">Mid Level (2 - 5 yrs)</option>
                      <option value="Senior">Senior Level (5+ yrs)</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

              <button
                className="btn btn-primary btn-full"
                onClick={startInterview}
                disabled={loading}
                style={{ height: 46, fontSize: 15 }}
              >
                {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />&nbsp;Preparing Questions…</> : "🚀 Start Practice Session"}
              </button>

              {/* Notice that AI is guidance */}
              <p style={{ textAlign: "center", fontSize: 11, color: "var(--clr-text-muted)", marginTop: 14 }}>
                💡 Note: AI feedback is constructive coaching guidance designed to help you prepare, not an official hiring determination.
              </p>
            </div>
          )}

          {/* Practice Mode: One Question at a Time */}
          {questions.length > 0 && !sessionResult && (
            <div className="card" style={{ maxWidth: 760, margin: "0 auto", padding: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span className="badge badge-primary">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="badge badge-muted">
                  Focus: {questions[currentIndex]?.focusArea || "Technical"}
                </span>
              </div>

              <div className="progress-bar" style={{ marginBottom: 20 }}>
                <div
                  className="progress-fill"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, lineHeight: 1.4 }}>
                {questions[currentIndex]?.question}
              </h2>

              <div className="form-field" style={{ marginBottom: 20 }}>
                <label className="form-label">Your Response (Explain your thoughts, approach, and code architecture):</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  placeholder="Type your answer here... Be specific and mention relevant frameworks or past projects."
                  value={currentAnswer}
                  onChange={e => setCurrAns(e.target.value)}
                  style={{ fontSize: 14, lineHeight: 1.6 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  className="btn btn-ghost"
                  onClick={handlePrevQuestion}
                  disabled={currentIndex === 0}
                >
                  ← Previous
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button className="btn btn-primary" onClick={handleNextQuestion}>
                    Next Question →
                  </button>
                ) : (
                  <button
                    className="btn btn-success"
                    onClick={submitInterview}
                    disabled={evaluating}
                  >
                    {evaluating ? "Evaluating Answers…" : "🏁 Submit & View Evaluation"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Session Evaluation Results */}
          {sessionResult && (
            <div style={{ maxWidth: 840, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: 6 }}>{sessionResult.category} Practice Review</span>
                  <h2 style={{ fontSize: 22, fontWeight: 900 }}>{sessionResult.roleTitle} Interview Feedback</h2>
                  <p style={{ color: "var(--clr-text-muted)", fontSize: 13, marginTop: 4 }}>
                    Evaluated across {feedbackItems.length} questions • Difficulty: {sessionResult.difficulty}
                  </p>
                </div>

                <div style={{ textAlign: "center", minWidth: 140 }}>
                  <div style={{
                    fontSize: 44, fontWeight: 900,
                    color: sessionResult.score >= 75 ? "var(--clr-success)" : sessionResult.score >= 50 ? "var(--clr-warning)" : "var(--clr-primary)"
                  }}>
                    {sessionResult.score}/100
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--clr-text-muted)" }}>Overall Coaching Score</p>
                </div>
              </div>

              {/* Questions Feedback List */}
              {feedbackItems.map((f, i) => (
                <div key={i} className="card" style={{ borderLeft: "4px solid var(--clr-primary)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800 }}>Q{i + 1}: {f.question}</h3>
                    <span className="badge badge-primary">{f.score}/100</span>
                  </div>

                  <div style={{ background: "var(--clr-surface-2)", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--clr-text-muted)" }}>YOUR ANSWER:</p>
                    <p style={{ fontSize: 13.5, marginTop: 4, color: "var(--clr-text)" }}>{f.answer || "No answer provided."}</p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div style={{ background: "rgba(16,185,129,.08)", padding: 12, borderRadius: 8 }}>
                      <p style={{ fontSize: 12, fontWeight: 800, color: "var(--clr-success)" }}>✅ STRENGTHS</p>
                      <p style={{ fontSize: 13, marginTop: 4 }}>{f.strengths}</p>
                    </div>
                    <div style={{ background: "rgba(245,158,11,.08)", padding: 12, borderRadius: 8 }}>
                      <p style={{ fontSize: 12, fontWeight: 800, color: "#d97706" }}>⚡ IMPROVEMENT TIP</p>
                      <p style={{ fontSize: 13, marginTop: 4 }}>{f.improvement}</p>
                    </div>
                  </div>

                  <div style={{ background: "var(--clr-surface-2)", padding: 12, borderRadius: 8 }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: "var(--clr-primary)" }}>💡 MODEL ANSWER CONCEPT</p>
                    <p style={{ fontSize: 13, marginTop: 4, color: "var(--clr-text)" }}>{f.exampleAnswer}</p>
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 10 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => { setResult(null); setQuestions([]); }}
                >
                  Practice Another Session
                </button>
                <Link to="/roadmap" className="btn btn-ghost">
                  Build Learning Roadmap
                </Link>
              </div>
            </div>
          )}

          {/* Past Sessions History */}
          {pastSessions.length > 0 && !questions.length && !sessionResult && (
            <div className="card" style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>📜 Your Past Interview Sessions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pastSessions.map(s => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 16px", background: "var(--clr-surface-2)", borderRadius: 10
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{s.roleTitle} ({s.category})</p>
                      <p style={{ fontSize: 12, color: "var(--clr-text-muted)" }}>
                        {new Date(s.createdAt).toLocaleDateString()} • Difficulty: {s.difficulty}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className="badge badge-success" style={{ fontSize: 13, padding: "4px 10px" }}>
                        Score: {s.score}/100
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
