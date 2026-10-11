import { useState } from "react";
import api from "../services/api";
import "./ResumeUpload.css";

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [resumeId, setResumeId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a resume file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage("");
    setResumeId("");

    try {
      const response = await api.post("/resumes/upload", formData);

      console.log("Backend response:", response.data);

      const id = response.data?.resumeId ?? response.data?.id;

      if (id !== undefined && id !== null) {
        setResumeId(String(id));
        setMessage("Resume uploaded successfully!");
      } else {
        setMessage("Upload completed, but Resume ID was not returned.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(
        error.response?.data?.message ||
          "Resume upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-card">
        <div className="upload-icon">📄</div>

        <h1>Upload Your Resume</h1>

        <p>Upload your resume for AI analysis and job matching.</p>

        <form onSubmit={handleUpload}>
          <label htmlFor="resumeFile">Select Resume</label>

          <input
            id="resumeFile"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />

          {file && <p>Selected file: {file.name}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload Resume"}
          </button>
        </form>

        {message && <p role="status">{message}</p>}

        {resumeId && (
          <div className="resume-id-box">
            <h3>Resume Uploaded Successfully!</h3>
            <p>
              <strong>Resume ID:</strong> {resumeId}
            </p>
            <p>Keep this ID for future reference.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeUpload;