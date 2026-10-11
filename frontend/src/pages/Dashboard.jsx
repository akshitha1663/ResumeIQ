
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const userName = sessionStorage.getItem("userName") || "User";
  const userEmail = sessionStorage.getItem("authEmail") || "";

  const logout = () => {
    sessionStorage.removeItem("authEmail");
    sessionStorage.removeItem("authPassword");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userRole");
    navigate("/login");
  };

  const modules = [
    {
      icon: "📄",
      title: "Resume Upload",
      description: "Upload your resume to get started.",
      path: "/resume-upload",
    },
    {
      icon: "✨",
      title: "Resume Analysis",
      description: "Explore your resume insights.",
      path: "/resume-analysis",
    },
    {
      icon: "🧠",
      title: "My Skills",
      description: "Discover and manage your skills.",
      path: "/skills",
    },
    {
      icon: "💼",
      title: "Find Jobs",
      description: "Explore career opportunities.",
      path: "/jobs",
    },
    {
      icon: "🎯",
      title: "Job Matching",
      description: "Find jobs that fit your profile.",
      path: "/job-matching",
    },
    {
      icon: "📈",
      title: "Skill Gap Analysis",
      description: "Identify skills you can improve.",
      path: "/skill-gap",
    },
    {
      icon: "⭐",
      title: "Recommendations",
      description: "Explore personalized suggestions.",
      path: "/recommendations",
    },
    {
      icon: "📌",
      title: "Applications",
      description: "Keep track of your applications.",
      path: "/applications",
    },
  ];

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <Link to="/" className="dashboard-logo">
          <span className="dashboard-logo-icon">R</span>
          Resume<span>IQ</span>
        </Link>

        <p className="sidebar-label">WORKSPACE</p>

        <Link to="/dashboard" className="sidebar-link selected">
          <span>▦</span> Dashboard
        </Link>
        <Link to="/resume-upload" className="sidebar-link">
          <span>▤</span> Resume Upload
        </Link>
        <Link to="/jobs" className="sidebar-link">
          <span>💼</span> Find Jobs
        </Link>
        <Link to="/job-matching" className="sidebar-link">
          <span>🎯</span> Job Matching
        </Link>
        <Link to="/skill-gap" className="sidebar-link">
          <span>📈</span> Skill Gap Analysis
        </Link>

        <div className="sidebar-bottom">
          <div className="dashboard-user">
            <div className="user-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{userName}</strong>
              <small>{userEmail}</small>
            </div>
          </div>
          <button className="dashboard-logout" onClick={logout}>
            ↪ Sign out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span className="dashboard-breadcrumb">Workspace / Dashboard</span>
            <h2>Dashboard</h2>
          </div>
          <Link to="/resume-upload" className="dashboard-upload-btn">
            + Upload Resume
          </Link>
        </header>

        <section className="dashboard-welcome">
          <div>
            <span className="welcome-tag">YOUR CAREER JOURNEY</span>
            <h1>Welcome back, {userName}! 👋</h1>
            <p>
              Ready to take the next step in your career?
              Let's make your resume stand out.
            </p>
            <Link to="/resume-upload" className="welcome-btn">
              Analyze My Resume →
            </Link>
          </div>
          <div className="welcome-art">🚀</div>
        </section>

        <section className="dashboard-stats">
          <article className="stat-card">
            <span className="stat-icon purple-stat">📄</span>
            <p>Resumes Uploaded</p>
            <h3>Get started</h3>
            <small>Upload your first resume</small>
          </article>
          <article className="stat-card">
            <span className="stat-icon blue-stat">💼</span>
            <p>Job Opportunities</p>
            <h3>Explore jobs</h3>
            <small>Discover suitable roles</small>
          </article>
          <article className="stat-card">
            <span className="stat-icon green-stat">✨</span>
            <p>Career Insights</p>
            <h3>Unlock insights</h3>
            <small>Understand your strengths</small>
          </article>
        </section>

        <section className="dashboard-modules">
          <div className="modules-heading">
            <div>
              <span>YOUR TOOLS</span>
              <h2>Explore ResumeIQ</h2>
            </div>
            <p>Everything you need to move your career forward.</p>
          </div>

          <div className="module-grid">
            {modules.map((module) => (
              <Link
                to={module.path}
                className="module-card"
                key={module.title}
              >
                <div className="module-icon">{module.icon}</div>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <span className="module-arrow">Explore →</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
