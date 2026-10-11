
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-shell">

        <section className="register-showcase">
          <Link to="/" className="register-brand">
            <span className="brand-icon">R</span>
            <span>Resume<span className="brand-highlight">IQ</span></span>
          </Link>

          <div className="showcase-content">
            <span className="showcase-tag">YOUR CAREER, REIMAGINED</span>

            <h1>
              Your next big
              <br />
              opportunity
              <br />
              <span>starts here.</span>
            </h1>

            <p>
              Build a stronger resume, discover your skills, and find
              opportunities that match your potential.
            </p>

            <div className="showcase-card">
              <div className="mini-avatar">✦</div>
              <div>
                <strong>Your career copilot</strong>
                <p>Smarter resumes. Better opportunities.</p>
              </div>
              <span className="live-dot"></span>
            </div>
          </div>

          <div className="showcase-footer">
            <span>AI-powered career growth</span>
            <span>✦ &nbsp; Make your next move count</span>
          </div>
        </section>

        <section className="register-form-section">
          <div className="register-form-wrapper">
            <div className="mobile-brand">
              <span className="brand-icon">R</span>
              <span>Resume<span className="brand-highlight">IQ</span></span>
            </div>

            <div className="form-heading">
              <span className="form-eyebrow">GET STARTED — IT'S FREE</span>
              <h2>Create your account</h2>
              <p>Take the first step toward your dream career.</p>
            </div>

            <form onSubmit={handleSubmit} className="register-form">
              <div className="register-field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <span className="field-hint">
                  Use at least 8 characters.
                </span>
              </div>

              <div className="register-field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password again"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>

              {error && (
                <div className="register-message error-message" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="register-message success-message" role="status">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create my account"}
                {!loading && <span>→</span>}
              </button>
            </form>

            <div className="register-login">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>

            <p className="register-legal">
              By creating an account, you agree to use ResumeIQ responsibly.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
