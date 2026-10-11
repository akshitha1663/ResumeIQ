import { useState } from "react";
import api from "../services/api";
import "./ResumeAnalysis.css";

function ResumeAnalysis() {
  const [resumeId, setResumeId] = useState(
    sessionStorage.getItem("resumeId") || ""
  );

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!resumeId.trim()) {
      setError("Please upload a resume first or enter a Resume ID.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await api.get(
        `/resumes/${encodeURIComponent(resumeId.trim())}/analysis`
      );

      setAnalysis(response.data);
    } catch (err) {
      console.error("Resume analysis error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to analyze the resume. Check the Resume ID and backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderValue = (value) => {
    if (value === null || value === undefined) {
      return "Not available";
    }

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  };

  const formatLabel = (key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/^./, (char) => char.toUpperCase());

  return (
    <div className="analysis-page">
      <div className="analysis-container">
        <header className="analysis-header">
          <span className="analysis-tag">RESUMEIQ • AI TOOLS</span>
          <h1>Resume Analysis</h1>
          <p>
            Analyze your resume to review the results provided by
            your ResumeIQ backend.
          </p>
        </header>

        <section className="analysis-form-card">
          <h2>Analyze Your Resume</h2>

          <form onSubmit={handleAnalyze}>
            <label htmlFor="resumeId">Resume ID</label>

            <input
              id="resumeId"
              type="text"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              placeholder="Enter your Resume ID"
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Analyzing Resume..." : "Analyze Resume"}
            </button>
          </form>

          {loading && (
            <div className="analysis-loading" role="status">
              <div className="loading-spinner" />
              <p>Analyzing your resume. Please wait...</p>
            </div>
          )}

          {error && (
            <div className="analysis-error" role="alert">
              {error}
            </div>
          )}
        </section>

        {analysis && (
          <section className="analysis-results">
            <div className="results-heading">
              <div>
                <span className="analysis-tag">ANALYSIS COMPLETE</span>
                <h2>Your Analysis Results</h2>
              </div>

              <span className="result-id">
                Resume ID: {resumeId}
              </span>
            </div>

            {typeof analysis === "object" &&
            !Array.isArray(analysis) ? (
              <div className="results-grid">
                {Object.entries(analysis).map(([key, value]) => (
                  <article className="result-card" key={key}>
                    <h3>{formatLabel(key)}</h3>

                    {Array.isArray(value) ? (
                      <ul>
                        {value.map((item, index) => (
                          <li key={index}>
                            {typeof item === "object"
                              ? JSON.stringify(item)
                              : String(item)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <pre>{renderValue(value)}</pre>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="result-card">
                <pre>{renderValue(analysis)}</pre>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default ResumeAnalysis;