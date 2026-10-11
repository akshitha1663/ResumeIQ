import { useEffect, useState } from "react";
import api from "../services/api";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApplications();
  }, []);

  const getApplications = async () => {
    try {
      const response = await api.get("/applications");
      setApplications(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading applications...</h2>;
  }

  return (
    <div>
      <h1>My Applications</h1>

      <p>Track the jobs you have applied for.</p>

      <hr />

      {applications.length > 0 ? (
        applications.map((application) => (
          <div key={application.id}>
            <h2>{application.jobTitle}</h2>

            <p>
              <strong>Company:</strong> {application.company}
            </p>

            <p>
              <strong>Location:</strong> {application.location}
            </p>

            <p>
              <strong>Applied Date:</strong> {application.appliedDate}
            </p>

            <p>
              <strong>Status:</strong> {application.status}
            </p>

            <hr />
          </div>
        ))
      ) : (
        <p>You have not applied for any jobs yet.</p>
      )}
    </div>
  );
}

export default Applications;