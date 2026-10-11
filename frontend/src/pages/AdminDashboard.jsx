import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("Loading admin dashboard...");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");

    if (!storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch {
      sessionStorage.removeItem("user");
      navigate("/login", { replace: true });
      return;
    }

    if (user.role !== "ADMIN") {
      navigate("/dashboard", { replace: true });
      return;
    }

    api
      .get("/admin/dashboard")
      .then((response) => {
        setMessage(
          response.data?.message || "Welcome to the ResumeIQ Admin Dashboard!"
        );
      })
      .catch((err) => {
        console.error("Admin dashboard error:", err);

        if (err.response?.status === 403) {
          setError("Access denied. Your account does not have admin permission.");
        } else {
          setError(
            "Unable to load admin data. Please check your backend and API endpoint."
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("authEmail");
    sessionStorage.removeItem("authPassword");
    sessionStorage.removeItem("authName");

    navigate("/login", { replace: true });
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link to="/admin-dashboard" style={styles.brand}>
          <span style={styles.logo}>R</span>
          <span>
            Resume<span style={{ color: "#67e8f9" }}>IQ</span>
          </span>
        </Link>

        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </header>

      <main style={styles.container}>
        <div style={styles.welcomeCard}>
          <span style={styles.badge}>ADMIN PANEL</span>

          <h1 style={styles.heading}>Admin Dashboard</h1>

          <p style={styles.description}>
            Manage and monitor your ResumeIQ application.
          </p>

          {loading ? (
            <p style={styles.info}>Loading dashboard information...</p>
          ) : error ? (
            <p role="alert" style={styles.error}>
              {error}
            </p>
          ) : (
            <p style={styles.success}>{message}</p>
          )}
        </div>

        <section style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.icon}>👤</div>
            <h2 style={styles.cardTitle}>User Management</h2>
            <p style={styles.cardText}>
              Manage user accounts and access.
            </p>
            <span style={styles.status}>Module overview</span>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>📄</div>
            <h2 style={styles.cardTitle}>Resume Analysis</h2>
            <p style={styles.cardText}>
              Review the resume-analysis module.
            </p>
            <Link to="/resume-analysis" style={styles.link}>
              Open module →
            </Link>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>💼</div>
            <h2 style={styles.cardTitle}>Job Management</h2>
            <p style={styles.cardText}>
              Visit the jobs section of ResumeIQ.
            </p>
            <Link to="/jobs" style={styles.link}>
              Open module →
            </Link>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>🎯</div>
            <h2 style={styles.cardTitle}>Job Matching</h2>
            <p style={styles.cardText}>
              Explore job-matching functionality.
            </p>
            <Link to="/job-matching" style={styles.link}>
              Open module →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    color: "#ffffff",
    background:
      "radial-gradient(circle at top left, #6638d9, transparent 35%), linear-gradient(135deg, #111b4b, #123f83, #087e91)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 6%",
    borderBottom: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "26px",
    fontWeight: "bold",
  },
  logo: {
    display: "grid",
    placeItems: "center",
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
  },
  logoutButton: {
    padding: "11px 22px",
    border: "1px solid rgba(255,255,255,0.5)",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.12)",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 24px",
  },
  welcomeCard: {
    padding: "32px",
    border: "1px solid rgba(255,255,255,0.22)",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(16px)",
  },
  badge: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "20px",
    background: "rgba(103,232,249,0.15)",
    color: "#a5f3fc",
    fontSize: "12px",
    fontWeight: "bold",
    letterSpacing: "1px",
  },
  heading: {
    margin: "18px 0 10px",
    fontSize: "clamp(28px, 4vw, 40px)",
  },
  description: {
    color: "#dbeafe",
    lineHeight: 1.6,
  },
  info: {
    color: "#a5f3fc",
  },
  success: {
    padding: "12px",
    borderRadius: "10px",
    background: "rgba(16,185,129,0.15)",
    color: "#a7f3d0",
  },
  error: {
    padding: "12px",
    borderRadius: "10px",
    background: "rgba(239,68,68,0.18)",
    color: "#fecaca",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "28px",
  },
  card: {
    padding: "24px",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(12px)",
  },
  icon: {
    fontSize: "32px",
  },
  cardTitle: {
    fontSize: "19px",
    margin: "16px 0 10px",
  },
  cardText: {
    color: "#dbeafe",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  status: {
    display: "inline-block",
    marginTop: "8px",
    color: "#a5f3fc",
    fontSize: "13px",
  },
  link: {
    display: "inline-block",
    marginTop: "8px",
    color: "#67e8f9",
    fontWeight: "bold",
    textDecoration: "none",
  },
};