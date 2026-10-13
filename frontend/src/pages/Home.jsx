import { Link } from "react-router-dom";

const features = [
  { icon: "✨", title: "AI Resume Analysis",   desc: "Apache Tika extracts text from your PDF or DOCX. Our engine scores your resume across 5 key criteria and highlights exactly what to improve." },
  { icon: "🎯", title: "Smart Job Matching",   desc: "Every open role is compared against your resume's skills. You see a match percentage, matched skills, and what you're missing — instantly." },
  { icon: "📈", title: "Skill Gap Analysis",   desc: "Pick any job. We tell you which required skills you have and which ones to acquire, with targeted learning suggestions for each gap." },
  { icon: "⭐", title: "Job Recommendations",  desc: "All available jobs are ranked by how well they match your profile. Your top opportunities, surfaced without any searching." },
  { icon: "🛡️", title: "Secure by Design",     desc: "Role-based access keeps student and admin areas separate. Passwords are BCrypt-hashed server-side. No plaintext credentials ever stored." },
  { icon: "🏢", title: "Admin Job Board",      desc: "Admins can create and manage the full job catalogue. Students always see an up-to-date board ready for matching." },
];

const steps = [
  { n: "01", title: "Create an account", desc: "Register in seconds. No credit card required." },
  { n: "02", title: "Upload your resume", desc: "Drop a PDF, DOC, or DOCX. We handle the rest." },
  { n: "03", title: "Get your analysis",  desc: "See your score, skills, and improvement areas." },
  { n: "04", title: "Explore matches",   desc: "Browse recommended jobs ranked for your profile." },
];

export default function Home() {
  return (
    <div style={{ fontFamily: "var(--font)", background: "var(--clr-bg)", color: "var(--clr-text)", minHeight: "100vh" }}>
      {/* ─── Nav ──────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--clr-border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 64,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 20, color: "var(--clr-primary)" }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--grad-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>R</span>
          Resume<span style={{ color: "var(--clr-secondary)" }}>IQ</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started →</Link>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section style={{
        background: "var(--grad-hero)", color: "#fff", textAlign: "center",
        padding: "clamp(60px,10vw,120px) 24px clamp(80px,12vw,140px)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          {[
            { w: 320, h: 320, top: -80, left: -80, bg: "rgba(139,92,246,.25)" },
            { w: 280, h: 280, top: 60,  right: -60, bg: "rgba(6,182,212,.2)" },
            { w: 200, h: 200, bottom: -60, left: "40%", bg: "rgba(79,70,229,.2)" },
          ].map((b, i) => (
            <div key={i} style={{ position: "absolute", width: b.w, height: b.h, top: b.top, bottom: b.bottom, left: b.left, right: b.right, background: b.bg, borderRadius: "50%", filter: "blur(60px)" }} />
          ))}
        </div>

        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto" }}>
          <span style={{ display: "inline-block", padding: "6px 14px", background: "rgba(255,255,255,.12)", borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 22, border: "1px solid rgba(255,255,255,.2)" }}>
            🚀 AI-Powered Career Platform
          </span>
          <h1 style={{ fontSize: "clamp(34px,5.5vw,64px)", fontWeight: 900, lineHeight: 1.15, marginBottom: 22 }}>
            Land your dream job with{" "}
            <span style={{ background: "linear-gradient(90deg, #a5f3fc, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              AI-powered insights
            </span>
          </h1>
          <p style={{ fontSize: "clamp(16px,2vw,20px)", opacity: .82, maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.65 }}>
            Upload your resume. Get an instant score, skill analysis, job matches, and personalised recommendations — all backed by real data.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", background: "#fff", color: "var(--clr-primary)", borderRadius: 12, fontWeight: 800, fontSize: 16, textDecoration: "none", boxShadow: "0 8px 30px rgba(0,0,0,.2)" }}>
              Get Started Free →
            </Link>
            <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.25)", borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats bar ────────────────────────────────────────── */}
      <div style={{ background: "var(--clr-surface)", borderBottom: "1px solid var(--clr-border)", padding: "24px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 24 }}>
          {[
            { n: "300+",  l: "Skills Detected" },
            { n: "100pt", l: "Scoring Rubric" },
            { n: "AI",    l: "Text Extraction" },
            { n: "∞",     l: "Job Matches" },
          ].map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 28, fontWeight: 900, color: "var(--clr-primary)", margin: 0 }}>{s.n}</p>
              <p style={{ fontSize: 13, color: "var(--clr-text-muted)", marginTop: 4 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Features ─────────────────────────────────────────── */}
      <section style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: "var(--clr-primary)", textTransform: "uppercase", marginBottom: 12 }}>FEATURES</p>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800, marginBottom: 14 }}>Everything you need to get hired</h2>
            <p style={{ fontSize: 17, color: "var(--clr-text-muted)", maxWidth: 500, margin: "0 auto" }}>Built on real analysis — not guesswork.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 22 }}>
            {features.map(f => (
              <div key={f.title} className="card" style={{ borderTop: "3px solid var(--clr-primary)" }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
                <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{f.title}</p>
                <p style={{ fontSize: 14, color: "var(--clr-text-muted)", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────── */}
      <section style={{ padding: "80px 32px", background: "var(--clr-surface)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: "var(--clr-primary)", textTransform: "uppercase", marginBottom: 12 }}>HOW IT WORKS</p>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800 }}>Four steps to your next role</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24 }}>
            {steps.map((s, i) => (
              <div key={s.n} style={{ textAlign: "center", position: "relative" }}>
                {i < steps.length - 1 && (
                  <div style={{ position: "absolute", top: 28, left: "60%", right: "-40%", height: 2, background: "linear-gradient(90deg, var(--clr-primary), transparent)", display: "none" }} />
                )}
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--grad-primary)", color: "#fff", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>{s.n}</div>
                <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{s.title}</p>
                <p style={{ fontSize: 13, color: "var(--clr-text-muted)", lineHeight: 1.55 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section style={{ background: "var(--grad-hero)", color: "#fff", textAlign: "center", padding: "80px 24px" }}>
        <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, marginBottom: 16 }}>Ready to transform your job search?</h2>
        <p style={{ fontSize: 17, opacity: .82, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>Join ResumeIQ and start matching with roles that actually fit your skills.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 30px", background: "#fff", color: "var(--clr-primary)", borderRadius: 12, fontWeight: 800, fontSize: 16, textDecoration: "none", boxShadow: "0 8px 30px rgba(0,0,0,.2)" }}>
            Start for Free →
          </Link>
          <Link to="/login" style={{ display: "inline-flex", alignItems: "center", padding: "14px 30px", background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.25)", borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
            Admin Login 🛡️
          </Link>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer style={{ background: "var(--clr-dark)", color: "#94a3b8", textAlign: "center", padding: "28px 24px", fontSize: 13 }}>
        <p>© 2026 ResumeIQ · AI-Powered Career Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
