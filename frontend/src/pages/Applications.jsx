import Sidebar from "../components/Sidebar";

export default function Applications() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Workspace / Applications</p>
            <h1 className="page-title">Applications</h1>
          </div>
        </div>
        <div className="page-body">
          <div className="empty-state">
            <div className="empty-icon">📌</div>
            <h3>Application Tracking — Coming Soon</h3>
            <p>
              Job application tracking will be available in a future update.
              Use the Jobs page to explore opportunities and note the ones you apply to.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}