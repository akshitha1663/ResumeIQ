import { useEffect, useState } from "react";
import api from "../services/api";

function Skills() {

  const [skills, setSkills] = useState({
    technicalSkills: [],
    softSkills: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSkills();
  }, []);

  const getSkills = async () => {
    try {
      const response = await api.get("/resume/skills");

      setSkills(response.data);
      setLoading(false);

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading skills...</h2>;
  }

  return (
    <div>

      <h1>My Skills</h1>

      <h2>Technical Skills</h2>

      {skills.technicalSkills.length > 0 ? (
        <ul>
          {skills.technicalSkills.map((skill, index) => (
            <li key={index}>
              {skill}
            </li>
          ))}
        </ul>
      ) : (
        <p>No technical skills found.</p>
      )}

      <h2>Soft Skills</h2>

      {skills.softSkills.length > 0 ? (
        <ul>
          {skills.softSkills.map((skill, index) => (
            <li key={index}>
              {skill}
            </li>
          ))}
        </ul>
      ) : (
        <p>No soft skills found.</p>
      )}

    </div>
  );
}

export default Skills;