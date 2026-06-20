import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth
import { useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Patient pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientSymptoms from './pages/patient/Symptoms';
import PatientEmergency from './pages/patient/Emergency';
import PatientHistory from './pages/patient/History';
import PatientProfile from './pages/patient/Profile';
import PatientSimulator from './pages/patient/Simulator';

// Doctor pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatientDetail from './pages/doctor/PatientDetail';
import DoctorPatientHistory from './pages/doctor/PatientHistory';

// Layout & protection
import DashboardLayout from './components/DashboardLayout';

/** Route guard — redirects unauthenticated or wrong-role users */
const ProtectedRoute = ({ role, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Patient routes */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute role="patient">
            <DashboardLayout role="patient" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="symptoms" element={<PatientSymptoms />} />
        <Route path="emergency" element={<PatientEmergency />} />
        <Route path="history" element={<PatientHistory />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="simulator" element={<PatientSimulator />} />
      </Route>

      {/* Doctor routes */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute role="doctor">
            <DashboardLayout role="doctor" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="patient/:id" element={<DoctorPatientDetail />} />
        <Route path="history/:id" element={<DoctorPatientHistory />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
