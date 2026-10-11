import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import Skills from "./pages/Skills";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import JobMatching from "./pages/JobMatching";
import SkillGap from "./pages/SkillGap";
import Recommendations from "./pages/Recommendations";
import Applications from "./pages/Applications";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "18px",
          alignItems: "center",
          padding: "16px 24px",
          background: "#312e81",
        }}
      >
        <Link to="/" style={{ color: "white", fontWeight: "bold" }}>
          ResumeIQ
        </Link>

        <Link to="/dashboard" style={{ color: "white" }}>
          Dashboard
        </Link>

        <Link to="/resume-upload" style={{ color: "white" }}>
          Upload Resume
        </Link>

        <Link to="/resume-analysis" style={{ color: "white" }}>
          Resume Analysis
        </Link>

        <Link to="/skills" style={{ color: "white" }}>
          Skills
        </Link>

        <Link to="/jobs" style={{ color: "white" }}>
          Jobs
        </Link>

        <Link to="/job-matching" style={{ color: "white" }}>
          Job Matching
        </Link>

        <Link to="/skill-gap" style={{ color: "white" }}>
          Skill Gap
        </Link>

        <Link to="/recommendations" style={{ color: "white" }}>
          Recommendations
        </Link>

        <Link to="/applications" style={{ color: "white" }}>
          Applications
        </Link>

        <Link to="/admin-dashboard" style={{ color: "white" }}>
          Admin
        </Link>

        <Link to="/login" style={{ color: "white" }}>
          Login
        </Link>

        <Link to="/register" style={{ color: "white" }}>
          Register
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/resume-upload" element={<ResumeUpload />} />
        <Route path="/resume-analysis" element={<ResumeAnalysis />} />

        <Route path="/skills" element={<Skills />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/job-details" element={<JobDetails />} />
        <Route path="/job-matching" element={<JobMatching />} />
        <Route path="/skill-gap" element={<SkillGap />} />
        <Route
          path="/recommendations"
          element={<Recommendations />}
        />
        <Route path="/applications" element={<Applications />} />
        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;