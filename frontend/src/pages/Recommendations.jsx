import { useEffect, useState } from "react";
import api from "../services/api";

function Recommendations() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecommendations();
  }, []);

  const getRecommendations = async () => {
    try {
      const response = await api.get("/recommendations");
      setJobs(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Finding suitable jobs for you...</h2>;
  }

  return (
    <div>
      <h1>AI Job Recommendations</h1>

      <p>
        Based on your resume, skills, education and experience,
        ResumeIQ recommends the most suitable jobs for you.
      </p>

      <hr />

      {jobs.length > 0 ? (
        jobs.map((job) => (
          <div key={job.id}>
            <h2>{job.title}</h2>

            <p>
              <strong>Company:</strong> {job.company}
            </p>

            <p>
              <strong>Location:</strong> {job.location}
            </p>

            <p>
              <strong>Match Score:</strong> {job.matchScore}%
            </p>

            <p>
              <strong>Skills:</strong> {job.skills}
            </p>

            <button
              onClick={() =>
                (window.location.href = `/job-details/${job.id}`)
              }
            >
              View Job
            </button>

            <hr />
          </div>
        ))
      ) : (
        <p>No job recommendations available.</p>
      )}
    </div>
  );
}

export default Recommendations;