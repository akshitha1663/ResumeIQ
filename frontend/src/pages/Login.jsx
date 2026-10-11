import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      const data = response.data;

      // Save the credentials for the existing HTTP Basic interceptor
      sessionStorage.setItem("authEmail", email.trim().toLowerCase());
      sessionStorage.setItem("authPassword", password);

      // Save user details returned by Spring Boot
      if (data.name) {
        sessionStorage.setItem("userName", data.name);
      }

      if (data.email) {
        sessionStorage.setItem("authEmail", data.email);
      }

      if (data.role) {
        sessionStorage.setItem("userRole", data.role);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (err.response?.status === 403) {
        setError("Access denied. Please check your account permissions.");
      } else {
        setError(
          err.response?.data?.message ||
          "Unable to log in. Please check whether the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/" style={styles.logo}>
          ResumeIQ
        </Link>

        <h1 style={styles.heading}>Welcome Back!</h1>

        <p style={styles.subtitle}>
          Sign in to continue your career journey.
        </p>

        <form onSubmit={handleLogin}>
          <label style={styles.label} htmlFor="email">
            Email Address
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
            style={styles.input}
          />

          <label style={styles.label} htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>
            Register
          </Link>
        </p>

        <Link to="/" style={styles.homeLink}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #eef2ff, #f5f3ff)",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    padding: "35px",
    borderRadius: "18px",
    boxShadow: "0 12px 35px rgba(79,70,229,0.12)",
  },

  logo: {
    display: "block",
    textAlign: "center",
    fontSize: "30px",
    fontWeight: "bold",
    color: "#4f46e5",
    textDecoration: "none",
    marginBottom: "25px",
  },

  heading: {
    textAlign: "center",
    color: "#1e293b",
    marginBottom: "10px",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    lineHeight: 1.6,
    marginBottom: "28px",
  },

  label: {
    display: "block",
    fontWeight: "bold",
    fontSize: "14px",
    color: "#334155",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "15px",
    outlineColor: "#4f46e5",
  },

  button: {
    width: "100%",
    padding: "14px",
    background: "#4f46e5",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  error: {
    color: "#dc2626",
    background: "#fef2f2",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  footerText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: "25px",
    fontSize: "14px",
  },

  link: {
    color: "#4f46e5",
    fontWeight: "bold",
    textDecoration: "none",
  },

  homeLink: {
    display: "block",
    textAlign: "center",
    color: "#64748b",
    textDecoration: "none",
    marginTop: "20px",
    fontSize: "14px",
  },
};

export default Login;