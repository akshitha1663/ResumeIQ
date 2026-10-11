import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getJobDetails();
  }, [id]);

  const getJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);

      console.log("Job details:", response.data);

      setJob(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load job details.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      setMessage("");

      const response = await api.post(`/jobs/${id}/apply`);

      console.log(response.data);

      setMessage("Application submitted successfully! 🎉");
    } catch (error) {
      console.error(error);

      if (error.response) {
        setMessage(
          "Application failed: " +
          (error.response.data || "Server error")
        );
      } else {
        setMessage("Cannot connect to backend.");
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        💼 Loading job details...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page-container">

        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "50px"
          }}
        >
          <div style={{ fontSize: "55px" }}>
            😕
          </div>

          <h2>Job Not Found</h2>

          <p>
            We couldn't find the job you're looking for.
          </p>

          <button onClick={() => navigate("/jobs")}>
            ← Back to Jobs
          </button>
        </div>

      </div>
    );
  }

  const skills = job.skills
    ? job.skills.split(",")
    : [];

  return (
    <div className="app-container">

      {/* NAVBAR */}

      <header
        style={{
          background: "white",
          padding: "16px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e7e7f3",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}
      >

        <div>

          <h2
            style={{
              margin: 0,
              color: "#6c5ce7"
            }}
          >
            ✨ ResumeIQ
          </h2>

          <small style={{ color: "#73758c" }}>
            AI Career Assistant
          </small>

        </div>

        <button
          onClick={() => navigate("/dashboard")}
        >
          🏠 Dashboard
        </button>

      </header>


      <main className="page-container">

        {/* BACK BUTTON */}

        <button
          onClick={() => navigate("/jobs")}
          style={{
            background: "transparent",
            color: "#6c5ce7",
            boxShadow: "none",
            paddingLeft: 0
          }}
        >
          ← Back to Jobs
        </button>


        {/* JOB HEADER */}

        <section
          className="gradient-card"
          style={{
            marginTop: "10px"
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap"
            }}
          >

            {/* COMPANY ICON */}

            <div
              style={{
                width: "75px",
                height: "75px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.20)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                fontWeight: "800"
              }}
            >
              {job.company?.charAt(0)?.toUpperCase()}
            </div>


            <div>

              <span
                style={{
                  background: "rgba(255,255,255,0.18)",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "13px"
                }}
              >
                💼 Job Opportunity
              </span>

              <h1
                style={{
                  marginTop: "12px"
                }}
              >
                {job.title}
              </h1>

              <p>
                🏢 {job.company}
              </p>

            </div>

          </div>


          {/* JOB QUICK INFO */}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "25px"
            }}
          >

            <span
              style={{
                background: "rgba(255,255,255,0.15)",
                padding: "9px 14px",
                borderRadius: "10px"
              }}
            >
              📍 {job.location}
            </span>

            <span
              style={{
                background: "rgba(255,255,255,0.15)",
                padding: "9px 14px",
                borderRadius: "10px"
              }}
            >
              💼 {job.jobType}
            </span>

            <span
              style={{
                background: "rgba(255,255,255,0.15)",
                padding: "9px 14px",
                borderRadius: "10px"
              }}
            >
              💰 {job.salary}
            </span>

          </div>

        </section>


        {/* MAIN CONTENT */}

        <div
          className="grid grid-2"
          style={{
            marginTop: "30px",
            alignItems: "start"
          }}
        >

          {/* LEFT SIDE */}

          <div>

            {/* DESCRIPTION */}

            <section className="card">

              <span className="badge">
                📋 About the Job
              </span>

              <h2 style={{ marginTop: "15px" }}>
                Job Description
              </h2>

              <p>
                {job.description ||
                  "No job description available."}
              </p>

            </section>


            {/* SKILLS */}

            <section
              className="card"
              style={{ marginTop: "25px" }}
            >

              <span className="badge">
                🧠 Skills
              </span>

              <h2 style={{ marginTop: "15px" }}>
                Required Skills
              </h2>

              <p>
                Skills required for this position:
              </p>

              <div style={{ marginTop: "15px" }}>

                {skills.map((skill, index) => (

                  <span
                    className="skill-badge"
                    key={index}
                  >
                    ✓ {skill.trim()}
                  </span>

                ))}

              </div>

            </section>


            {/* JOB INFORMATION */}

            <section
              className="card"
              style={{ marginTop: "25px" }}
            >

              <span className="badge">
                ℹ️ Job Information
              </span>

              <div
                style={{
                  marginTop: "20px"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "14px 0",
                    borderBottom:
                      "1px solid #e7e7f3"
                  }}
                >
                  <strong>Company</strong>
                  <span>{job.company}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "14px 0",
                    borderBottom:
                      "1px solid #e7e7f3"
                  }}
                >
                  <strong>Location</strong>
                  <span>{job.location}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "14px 0",
                    borderBottom:
                      "1px solid #e7e7f3"
                  }}
                >
                  <strong>Job Type</strong>
                  <span>{job.jobType}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "14px 0"
                  }}
                >
                  <strong>Salary</strong>
                  <span>{job.salary}</span>
                </div>

              </div>

            </section>

          </div>


          {/* RIGHT SIDE */}

          <div
            style={{
              position: "sticky",
              top: "100px"
            }}
          >

            {/* APPLY CARD */}

            <section
              className="card"
              style={{
                textAlign: "center"
              }}
            >

              <div style={{ fontSize: "45px" }}>
                🚀
              </div>

              <h2>
                Ready to Apply?
              </h2>

              <p>
                Take the next step toward your
                career opportunity.
              </p>

              <button
                onClick={handleApply}
                disabled={applying}
                style={{
                  width: "100%",
                  marginTop: "15px",
                  padding: "15px"
                }}
              >
                {applying
                  ? "⏳ Applying..."
                  : "🚀 Apply Now"}
              </button>


              {message && (
                <div
                  className={
                    message.includes("successfully")
                      ? "success"
                      : "error"
                  }
                  style={{
                    marginTop: "15px",
                    textAlign: "left"
                  }}
                >
                  {message}
                </div>
              )}

            </section>


            {/* AI MATCH CARD */}

            <section
              className="gradient-card"
              style={{
                marginTop: "25px",
                textAlign: "center"
              }}
            >

              <div style={{ fontSize: "40px" }}>
                🤖
              </div>

              <h2>
                AI Job Matching
              </h2>

              <p>
                See how well your resume matches
                this job's requirements.
              </p>

              <button
                onClick={() =>
                  navigate("/job-matching")
                }
                style={{
                  background: "white",
                  color: "#6c5ce7",
                  width: "100%",
                  marginTop: "15px"
                }}
              >
                🎯 Check Match
              </button>

            </section>


            {/* APPLICATIONS */}

            <section
              className="card"
              style={{
                marginTop: "25px"
              }}
            >

              <h3>
                📋 Track Your Application
              </h3>

              <p>
                After applying, you can track
                your application status.
              </p>

              <button
                onClick={() =>
                  navigate("/applications")
                }
                style={{
                  width: "100%",
                  marginTop: "10px"
                }}
              >
                View My Applications
              </button>

            </section>

          </div>

        </div>


        {/* BOTTOM ACTIONS */}

        <section
          style={{
            textAlign: "center",
            marginTop: "35px",
            marginBottom: "30px"
          }}
        >

          <button
            onClick={() => navigate("/jobs")}
          >
            🔍 Explore More Jobs
          </button>

          <button
            onClick={() =>
              navigate("/recommendations")
            }
          >
            ⭐ AI Recommendations
          </button>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
          >
            🏠 Dashboard
          </button>

        </section>

      </main>

    </div>
  );
}

export default JobDetails;