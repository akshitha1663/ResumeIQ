import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Jobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getJobs();
  }, []);

  const getJobs = async () => {
    try {
      const response = await api.get("/jobs");

      console.log("Jobs:", response.data);

      setJobs(response.data);
    } catch (error) {
      console.error(error);
      setError("Unable to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const searchText = search.toLowerCase();

    return (
      job.title?.toLowerCase().includes(searchText) ||
      job.company?.toLowerCase().includes(searchText) ||
      job.location?.toLowerCase().includes(searchText) ||
      job.skills?.toLowerCase().includes(searchText)
    );
  });

  const getInitial = (company) => {
    return company?.charAt(0)?.toUpperCase() || "C";
  };

  if (loading) {
    return (
      <div className="loading">
        🔍 Finding opportunities for you...
      </div>
    );
  }

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

        <button onClick={() => navigate("/dashboard")}>
          🏠 Dashboard
        </button>
      </header>


      <main className="page-container">

        {/* HERO */}

        <section
          className="gradient-card"
          style={{
            textAlign: "center"
          }}
        >

          <span
            style={{
              background: "rgba(255,255,255,0.18)",
              padding: "7px 14px",
              borderRadius: "20px",
              fontSize: "13px"
            }}
          >
            🎯 Find Your Next Opportunity
          </span>

          <h1 style={{ marginTop: "20px" }}>
            Discover Jobs That Match You
          </h1>

          <p>
            Explore opportunities based on your
            skills, experience and career goals.
          </p>

        </section>


        {/* SEARCH */}

        <section
          className="card"
          style={{
            marginTop: "-10px",
            position: "relative",
            zIndex: 2,
            maxWidth: "850px",
            marginLeft: "auto",
            marginRight: "auto"
          }}
        >

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center"
            }}
          >

            <span style={{ fontSize: "24px" }}>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search by job title, company, location or skill..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={{
                maxWidth: "none",
                border: "none",
                boxShadow: "none"
              }}
            />

          </div>

        </section>


        {/* ERROR */}

        {error && (
          <div
            className="error"
            style={{ marginTop: "25px" }}
          >
            {error}
          </div>
        )}


        {/* RESULTS HEADER */}

        <section
          style={{
            marginTop: "35px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >

          <div>

            <h2>
              Available Jobs 💼
            </h2>

            <p>
              {filteredJobs.length} opportunities found
            </p>

          </div>

          <span className="badge">
            🤖 AI Powered
          </span>

        </section>


        {/* JOB CARDS */}

        {filteredJobs.length > 0 ? (

          <div
            className="grid grid-2"
            style={{ marginTop: "20px" }}
          >

            {filteredJobs.map((job) => (

              <div
                className="job-card"
                key={job.id}
              >

                {/* COMPANY HEADER */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px"
                  }}
                >

                  <div
                    style={{
                      width: "55px",
                      height: "55px",
                      borderRadius: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "linear-gradient(135deg,#6c5ce7,#00b8d9)",
                      color: "white",
                      fontSize: "23px",
                      fontWeight: "800"
                    }}
                  >
                    {getInitial(job.company)}
                  </div>

                  <div>

                    <h3 style={{ marginBottom: "3px" }}>
                      {job.title}
                    </h3>

                    <div className="job-company">
                      {job.company}
                    </div>

                  </div>

                </div>


                {/* JOB INFO */}

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "18px"
                  }}
                >

                  <span className="badge">
                    📍 {job.location}
                  </span>

                  <span className="badge">
                    💼 {job.jobType}
                  </span>

                  <span className="badge">
                    💰 {job.salary}
                  </span>

                </div>


                {/* DESCRIPTION */}

                <p
                  style={{
                    marginTop: "18px"
                  }}
                >
                  {job.description}
                </p>


                {/* SKILLS */}

                <h3
                  style={{
                    marginTop: "18px"
                  }}
                >
                  🧠 Required Skills
                </h3>

                <div>

                  {job.skills
                    ?.split(",")
                    .map((skill, index) => (

                      <span
                        className="skill-badge"
                        key={index}
                      >
                        {skill.trim()}
                      </span>

                    ))}

                </div>


                {/* MATCH */}

                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    borderRadius: "13px",
                    background:
                      "rgba(108,92,231,0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >

                  <span>
                    🎯 Your potential match
                  </span>

                  <strong
                    style={{
                      color: "#6c5ce7"
                    }}
                  >
                    AI Match
                  </strong>

                </div>


                {/* BUTTON */}

                <button
                  style={{
                    width: "100%",
                    marginTop: "18px"
                  }}
                  onClick={() =>
                    navigate(
                      `/job-details/${job.id}`
                    )
                  }
                >
                  View Job Details →
                </button>

              </div>

            ))}

          </div>

        ) : (

          <div
            className="card"
            style={{
              textAlign: "center",
              marginTop: "25px",
              padding: "50px"
            }}
          >

            <div style={{ fontSize: "55px" }}>
              🔎
            </div>

            <h2>
              No Jobs Found
            </h2>

            <p>
              Try searching for another job title,
              company or skill.
            </p>

            <button
              onClick={() => setSearch("")}
            >
              Clear Search
            </button>

          </div>

        )}


        {/* BOTTOM */}

        <section
          className="card"
          style={{
            marginTop: "35px",
            textAlign: "center"
          }}
        >

          <div style={{ fontSize: "35px" }}>
            🤖
          </div>

          <h2>
            Want more personalized results?
          </h2>

          <p>
            Let ResumeIQ compare your resume with
            available jobs and calculate your match score.
          </p>

          <button
            onClick={() =>
              navigate("/job-matching")
            }
          >
            🎯 Try AI Job Matching
          </button>

          <button
            onClick={() =>
              navigate("/recommendations")
            }
          >
            ⭐ Get Recommendations
          </button>

        </section>


        <div
          style={{
            textAlign: "center",
            marginTop: "25px"
          }}
        >

          <button
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Back to Dashboard
          </button>

        </div>

      </main>

    </div>
  );
}

export default Jobs;