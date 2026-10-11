
import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const features = [
  {
    icon: "▤",
    title: "Easy Resume Upload",
    description: "Upload your resume in PDF, DOC or DOCX format.",
    color: "purple",
  },
  {
    icon: "✳",
    title: "AI-Powered Analysis",
    description: "Get instant insights into your skills, strengths and gaps.",
    color: "blue",
  },
  {
    icon: "⌕",
    title: "Smart Job Matching",
    description: "Find jobs that match your skills and career goals.",
    color: "green",
  },
  {
    icon: "▥",
    title: "Skill Gap Analysis",
    description: "Know what to learn and grow your career faster.",
    color: "yellow",
  },
  {
    icon: "☆",
    title: "Personalized Recommendations",
    description: "Get curated job suggestions just for you.",
    color: "pink",
  },
  {
    icon: "♙",
    title: "Track Applications",
    description: "Manage and track all your job applications in one place.",
    color: "purple",
  },
];

export default function Home() {
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="home-page">
      {/* Navigation */}
      <header className="home-navbar">
        <Link to="/" className="home-logo">
          <span className="home-logo-icon">R</span>
          <span>Resume<span className="logo-iq">IQ</span></span>
        </Link>

        <nav className="home-nav-links">
          <a className="active-link" href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
        </nav>

        <div className="home-nav-actions">
          <Link to="/login" className="home-login-btn">Login</Link>
          <Link to="/register" className="home-register-btn">Register</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="home-hero" id="home">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            AI-POWERED CAREER PLATFORM
          </span>

          <h1>
            Turn Your Resume Into
            <br />
            <span>New Opportunities</span>
          </h1>

          <p className="hero-description">
            Get AI-powered resume analysis, discover your skills,
            find the best job matches, and build the career you deserve
            — all in one place.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="hero-primary-btn">
              Get Started <span>→</span>
            </Link>

            <button
              type="button"
              className="hero-video-btn"
              onClick={scrollToFeatures}
            >
              <span className="play-icon">▶</span>
              Explore Features
            </button>
          </div>

          <div className="hero-trust">
            <div className="trust-avatars">
              <span>A</span>
              <span>R</span>
              <span>S</span>
            </div>
            <p>
              <strong>Build your future</strong>
              <br />
              One smart step at a time
            </p>
          </div>
        </div>

        {/* CSS-based career illustration */}
        <div className="hero-visual">
          <div className="visual-orbit orbit-one"></div>
          <div className="visual-orbit orbit-two"></div>
          <div className="visual-glow"></div>

          <div className="floating-card resume-card">
            <div className="floating-card-heading">
              <span className="document-icon">▤</span>
              <strong>Resume Analysis</strong>
            </div>

            <div className="resume-profile">
              <div className="profile-circle">●</div>
              <div className="profile-lines">
                <span></span>
                <span></span>
              </div>
            </div>

            <div className="resume-check">
              <span>✓</span> Skills Identified
            </div>
            <div className="resume-check">
              <span>✓</span> Strengths Found
            </div>
            <div className="resume-check">
              <span>✓</span> Improvement Areas
            </div>

            <div className="resume-score">
              <div className="score-circle">92%</div>
              <span>Resume Score</span>
            </div>
          </div>

          <div className="career-person">
            <div className="person-hair"></div>
            <div className="person-face">
              <span className="person-eye eye-left"></span>
              <span className="person-eye eye-right"></span>
              <span className="person-smile"></span>
            </div>
            <div className="person-neck"></div>
            <div className="person-body">
              <span className="person-shirt-detail">R</span>
            </div>
            <div className="person-arm"></div>
          </div>

          <div className="laptop">
            <div className="laptop-screen">
              <div className="laptop-logo">R</div>
              <div className="laptop-line"></div>
              <div className="laptop-line short-line"></div>
              <div className="laptop-bars">
                <span></span><span></span><span></span><span></span>
              </div>
            </div>
            <div className="laptop-base"></div>
          </div>

          <div className="floating-card jobs-card">
            <div className="jobs-card-title">
              <span>▣</span>
              <strong>Job Matches</strong>
            </div>
            <div className="job-row">
              <span>Software Developer</span>
              <strong>92%</strong>
            </div>
            <div className="job-row">
              <span>Data Analyst</span>
              <strong>88%</strong>
            </div>
            <div className="job-row">
              <span>Frontend Developer</span>
              <strong>85%</strong>
            </div>
          </div>

          <div className="floating-card skills-card">
            <h4>✳ &nbsp; Skills</h4>
            <div className="skill-pills">
              <span>Java</span>
              <span>React</span>
              <span>MySQL</span>
              <span>Communication</span>
            </div>
          </div>

          <div className="visual-sparkle sparkle-one">✦</div>
          <div className="visual-sparkle sparkle-two">✧</div>
          <div className="visual-sparkle sparkle-three">✦</div>
        </div>
      </section>

      {/* Features */}
      <section className="home-features" id="features">
        <div className="features-heading">
          <span>WHY CHOOSE RESUMEIQ</span>
          <h2>Everything You Need for a Successful Career</h2>
          <p>
            Smart tools, personalized insights, and real opportunities
            — all powered by AI.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className={`feature-icon ${feature.color}`}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="how-section" id="how-it-works">
        <span className="section-eyebrow">YOUR JOURNEY STARTS HERE</span>
        <h2>Three Steps to Your Next Opportunity</h2>

        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">01</span>
            <h3>Create Your Account</h3>
            <p>Join ResumeIQ and set up your career profile.</p>
          </div>

          <div className="step-card">
            <span className="step-number">02</span>
            <h3>Analyze Your Resume</h3>
            <p>Upload your resume and explore your skills.</p>
          </div>

          <div className="step-card">
            <span className="step-number">03</span>
            <h3>Discover Opportunities</h3>
            <p>Explore suitable jobs and your next career steps.</p>
          </div>
        </div>

        <Link to="/register" className="bottom-cta">
          Start Your Career Journey <span>→</span>
        </Link>
      </section>

      {/* About */}
      <section className="about-section" id="about">
        <div>
          <span className="section-eyebrow">ABOUT RESUMEIQ</span>
          <h2>Your potential deserves the right opportunity.</h2>
        </div>
        <p>
          ResumeIQ brings resume analysis, skill insights, job matching,
          and career recommendations together in one place to help you
          take your next career step with confidence.
        </p>
      </section>

      <footer className="home-footer">
        <Link to="/" className="home-logo footer-logo">
          <span className="home-logo-icon">R</span>
          <span>Resume<span className="logo-iq">IQ</span></span>
        </Link>
        <p>Smarter resumes. Better opportunities.</p>
        <span>© {new Date().getFullYear()} ResumeIQ</span>
      </footer>
    </div>
  );
}
