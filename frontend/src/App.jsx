import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import Skills from "./pages/Skills";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import JobMatching from "./pages/JobMatching";
import SkillGap from "./pages/SkillGap";
import Recommendations from "./pages/Recommendations";
import Applications from "./pages/Applications";
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import ManageJobs from "./pages/ManageJobs";
import AiChat from "./pages/AiChat";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student-protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/resume-upload" element={
            <ProtectedRoute><ResumeUpload /></ProtectedRoute>
          } />
          <Route path="/resume-analysis" element={
            <ProtectedRoute><ResumeAnalysis /></ProtectedRoute>
          } />
          <Route path="/skills" element={
            <ProtectedRoute><Skills /></ProtectedRoute>
          } />
          <Route path="/jobs" element={
            <ProtectedRoute><Jobs /></ProtectedRoute>
          } />
          <Route path="/job-details/:id" element={
            <ProtectedRoute><JobDetails /></ProtectedRoute>
          } />
          <Route path="/job-details" element={
            <ProtectedRoute><JobDetails /></ProtectedRoute>
          } />
          <Route path="/job-matching" element={
            <ProtectedRoute><JobMatching /></ProtectedRoute>
          } />
          <Route path="/skill-gap" element={
            <ProtectedRoute><SkillGap /></ProtectedRoute>
          } />
          <Route path="/recommendations" element={
            <ProtectedRoute><Recommendations /></ProtectedRoute>
          } />
          <Route path="/applications" element={
            <ProtectedRoute><Applications /></ProtectedRoute>
          } />
          <Route path="/ai-assistant" element={
            <ProtectedRoute><AiChat /></ProtectedRoute>
          } />

          {/* Admin-only routes */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="ADMIN"><ManageUsers /></ProtectedRoute>
          } />
          <Route path="/admin/jobs" element={
            <ProtectedRoute requiredRole="ADMIN"><ManageJobs /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;