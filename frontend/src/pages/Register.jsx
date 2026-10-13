import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleRegister = async e => {
    e.preventDefault();
    setError("");
    if (!form.name.trim())  { setError("Full name is required."); return; }
    if (!form.email.trim()) { setError("Email is required."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2200);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      {/* Left panel */}
      <aside style={S.panel}>
        <Link to="/" style={S.brand}>
          <span style={S.brandBadge}>R</span>
          Resume<span style={{ color: "#67e8f9" }}>IQ</span>
        </Link>
        <div style={S.panelContent}>
          <p style={S.eyebrow}>CREATE YOUR ACCOUNT</p>
          <h1 style={S.heading}>Start your career journey today.</h1>
          <p style={S.sub}>Upload your resume and instantly discover your best-fit roles.</p>
        </div>
        <div style={S.bullets}>
          {[
            "Free AI resume scoring",
            "Personalised job recommendations",
            "Skill gap analysis",
            "No credit card required",
          ].map(b => (
            <div key={b} style={S.bullet}>
              <span style={S.check}>✓</span>
              <span style={{ color: "#dbeafe", fontSize: 14 }}>{b}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Right form */}
      <main style={S.formSide}>
        <div style={S.card}>
          <h2 style={S.title}>Create Account</h2>
          <p style={S.subtitle}>Join thousands of students landing better jobs.</p>

          {success
            ? (
              <div className="alert alert-success" role="status" style={{ marginTop: 16, textAlign: "center", padding: 24 }}>
                <p style={{ fontSize: 36, marginBottom: 10 }}>🎉</p>
                <p style={{ fontWeight: 700, fontSize: 16 }}>Account created!</p>
                <p style={{ fontSize: 14, marginTop: 6 }}>Redirecting you to login…</p>
              </div>
            )
            : (
              <form onSubmit={handleRegister} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="form-field">
                  <label className="form-label" htmlFor="name">Full Name</label>
                  <input id="name" name="name" type="text" className="form-input"
                    placeholder="Jane Smith" value={form.name} onChange={handleChange}
                    autoComplete="name" required />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" className="form-input"
                    placeholder="jane@example.com" value={form.email} onChange={handleChange}
                    autoComplete="email" required />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="password">Password</label>
                  <input id="password" name="password" type="password" className="form-input"
                    placeholder="Min. 6 characters" value={form.password} onChange={handleChange}
                    autoComplete="new-password" required />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="confirm">Confirm Password</label>
                  <input id="confirm" name="confirm" type="password" className="form-input"
                    placeholder="Repeat password" value={form.confirm} onChange={handleChange}
                    autoComplete="new-password" required />
                </div>

                {error && <div className="alert alert-error" role="alert">{error}</div>}

                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                  {loading
                    ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />&nbsp;Creating account…</>
                    : "Create Account →"}
                </button>
              </form>
            )
          }

          <p style={S.footer}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--clr-primary)", fontWeight: 600 }}>Sign In</Link>
          </p>
          <Link to="/" style={S.backLink}>← Back to Home</Link>
        </div>
      </main>
    </div>
  );
}

const S = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "var(--font)" },
  panel: {
    width: 420, background: "var(--grad-hero)", color: "#fff",
    display: "flex", flexDirection: "column", padding: "40px 44px", flexShrink: 0,
  },
  brand: { display: "flex", alignItems: "center", gap: 12, fontSize: 24, fontWeight: 800, color: "#fff", textDecoration: "none", marginBottom: 60 },
  brandBadge: { width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900 },
  panelContent: { flex: 1 },
  eyebrow: { fontSize: 11, letterSpacing: 1.5, color: "#a5f3fc", marginBottom: 14, fontWeight: 700 },
  heading: { fontSize: "clamp(26px,3vw,34px)", fontWeight: 800, lineHeight: 1.25, marginBottom: 16 },
  sub: { color: "#dbeafe", fontSize: 15, lineHeight: 1.6 },
  bullets: { marginTop: 40, display: "flex", flexDirection: "column", gap: 12 },
  bullet: { display: "flex", alignItems: "center", gap: 10 },
  check: { width: 22, height: 22, borderRadius: "50%", background: "rgba(16,185,129,.25)", color: "#6ee7b7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 },
  formSide: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--clr-bg)", padding: "40px 24px" },
  card: { width: "100%", maxWidth: 440, background: "#fff", borderRadius: 24, padding: "40px 36px", boxShadow: "var(--shadow-lg)" },
  title: { fontSize: 26, fontWeight: 800, color: "var(--clr-text)", marginBottom: 6 },
  subtitle: { color: "var(--clr-text-muted)", fontSize: 14 },
  footer: { textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--clr-text-muted)" },
  backLink: { display: "block", textAlign: "center", color: "var(--clr-text-faint)", fontSize: 13, marginTop: 12 },
};
