import { useState } from "react";
import api from "../services/api";

function SkillGap() {

  const [jobId, setJobId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSkillGap = async () => {

    if (!jobId) {
      alert("Please enter Job ID");
      return;
    }

    try {

      setLoading(true);

      const response = await api.get(
        `/skill-gap/${jobId}`
      );

      setResult(response.data);

      setLoading(false);

    } catch (error) {

      console.error(error);

      alert("Unable to calculate skill gap.");

      setLoading(false);
    }
  };

  return (
    <div>

      <h1>Skill Gap Analysis</h1>

      <p>
        Find out which skills you need to improve
        for a particular job.
      </p>

      <input
        type="number"
        placeholder="Enter Job ID"
        value={jobId}
        onChange={(e) => setJobId(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleSkillGap}>
        Analyze Skill Gap
      </button>

      {loading && (
        <h3>Analyzing your skills...</h3>
      )}

      {result && (
        <div>

          <hr />

          <h2>Skill Gap Result</h2>

          <p>
            <strong>Job:</strong>{" "}
            {result.jobTitle}
          </p>

          <h3>Your Current Skills</h3>

          <ul>
            {result.currentSkills &&
              result.currentSkills.map((skill, index) => (
                <li key={index}>
                  {skill}
                </li>
              ))}
          </ul>

          <h3>Skills You Need</h3>

          <ul>
            {result.requiredSkills &&
              result.requiredSkills.map((skill, index) => (
                <li key={index}>
                  {skill}
                </li>
              ))}
          </ul>

          <h3>Skills to Improve</h3>

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

export default SkillGap;