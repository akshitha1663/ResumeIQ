import { useState } from "react";
import api from "../services/api";

function JobMatching() {

  const [jobId, setJobId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMatching = async () => {

    if (!jobId) {
      alert("Please enter Job ID");
      return;
    }

    try {

      setLoading(true);

      const response = await api.get(
        `/matching/${jobId}`
      );

      setResult(response.data);

      setLoading(false);

    } catch (error) {

      console.error(error);

      alert("Unable to calculate job match.");

      setLoading(false);
    }
  };

  return (
    <div>

      <h1>AI Job Matching</h1>

      <p>
        Check how well your resume matches a job.
      </p>

      <input
        type="number"
        placeholder="Enter Job ID"
        value={jobId}
        onChange={(e) => setJobId(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleMatching}>
        Calculate Match
      </button>

      {loading && (
        <h3>Calculating match...</h3>
      )}

      {result && (
        <div>

          <hr />

          <h2>Job Match Result</h2>

          <p>
            <strong>Job:</strong>{" "}
            {result.jobTitle}
          </p>

          <p>
            <strong>Match Score:</strong>{" "}
            {result.matchScore}%
          </p>

          <h3>Matched Skills</h3>

          <ul>
            {result.matchedSkills &&
              result.matchedSkills.map((skill, index) => (
                <li key={index}>
                  {skill}
                </li>
              ))}
          </ul>

          <h3>Missing Skills</h3>

          <ul>
            {result.missingSkills &&
              result.missingSkills.map((skill, index) => (
                <li key={index}>
                  {skill}
                </li>
              ))}
          </ul>

        </div>
      )}

    </div>
  );
}

export default JobMatching;