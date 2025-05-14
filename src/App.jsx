// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useParams, Link } from 'react-router-dom';

// --- Common Components ---
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

// --- Page Components ---
// Authentication
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Core & Home
import HomePage from './pages/HomePage';

// Patient Management
import PatientListPage from './pages/PatientListPage';
import AddNewPatientPage from './pages/AddNewPatientPage';
import PatientDetailsPage from './pages/PatientDetailsPage';
import EditPatientPage from './pages/EditPatientPage';

// Appointment Management
import AppointmentListPage from './pages/AppointmentListPage';
import AddAppointmentPage from './pages/AddAppointmentPage';
import AppointmentDetailsPage from './pages/AppointmentDetailsPage';
import EditAppointmentPage from './pages/EditAppointmentPage'; // Make sure this is the correct component for appointments if distinct from patient edit

// Encounter and EMR Management
import AddEncounterPage from './pages/AddEncounterPage';
import EncounterDetailsPage from './pages/EncounterDetailsPage';
import ManageConsultationNotePage from './pages/ManageConsultationNotePage';
import ManageVitalSignsPage from './pages/ManageVitalSignsPage';
import ManageDiagnosesPage from './pages/ManageDiagnosesPage';
import ManagePrescriptionsPage from './pages/ManagePrescriptionsPage';
import ManageLabOrdersPage from './pages/ManageLabOrdersPage';

// --- Toastify for Notifications ---
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Global App Styles ---
import './App.css';

// --- Placeholder Components (for routes not yet fully implemented or for simple display) ---
// You would replace these with actual imports if/when the full pages are built.
const AdminDashboardPagePlaceholder = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Admin Dashboard</h1>
    <p>This area is for administrators to manage system settings, users, and view overall analytics.</p>
    <p><em>(Full functionality to be implemented)</em></p>
    <Link to="/" style={{ color: '#007bff', textDecoration: 'underline', marginTop: '20px', display: 'inline-block' }}>Back to Home</Link>
  </div>
);

const NotFoundPagePlaceholder = () => (
  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
    <h1>404 - Page Not Found</h1>
    <p>Oops! The page you are looking for does not exist or may have been moved.</p>
    <Link to="/" style={{ color: '#007bff', textDecoration: 'underline', marginTop: '20px', display: 'inline-block' }}>Go to Homepage</Link>
  </div>
);

const UserProfilePagePlaceholder = () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>My Profile</h1>
        <p>User profile information, password change, and other settings will go here.</p>
        <p><em>(Functionality to be implemented)</em></p>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'underline', marginTop: '20px', display: 'inline-block' }}>Back to Home</Link>
    </div>
);


// --- Main App Component ---
function App() {
  // Define role groups for route protection to keep it DRY and readable
  const patientViewRoles = ["ROLE_ADMIN", "ROLE_RECEPTIONIST", "ROLE_DOCTOR", "ROLE_NURSE"];
  const patientModifyRoles = ["ROLE_ADMIN", "ROLE_RECEPTIONIST"];

  const appointmentViewRoles = ["ROLE_ADMIN", "ROLE_RECEPTIONIST", "ROLE_DOCTOR", "ROLE_NURSE"];
  const appointmentModifyRoles = ["ROLE_ADMIN", "ROLE_RECEPTIONIST", "ROLE_DOCTOR"];

  const encounterAndEmrRoles = ["ROLE_ADMIN", "ROLE_DOCTOR", "ROLE_NURSE", "LAB_TECHNICIAN"];
  
  const adminOnlyRoles = ["ROLE_ADMIN"];
  const authenticatedUserRoles = ["ROLE_ADMIN", "ROLE_RECEPTIONIST", "ROLE_DOCTOR", "ROLE_NURSE", "LAB_TECHNICIAN", "ROLE_PATIENT"]; // All logged-in users

  return (
    <Router>
      <Navbar /> {/* Navbar is present on all pages */}
      <main className="app-main-content"> {/* Class for global main content styling */}
        <Routes>
          {/* === Public Routes === */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* === Patient Management Routes === */}
          <Route element={<ProtectedRoute allowedRoles={patientViewRoles} />}>
            <Route path="/patients" element={<PatientListPage />} />
            <Route path="/patients/:patientId" element={<PatientDetailsPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={patientModifyRoles} />}>
            <Route path="/patients/new" element={<AddNewPatientPage />} />
            <Route path="/patients/edit/:patientId" element={<EditPatientPage />} />
          </Route>
          
          {/* === Appointment Management Routes === */}
          <Route element={<ProtectedRoute allowedRoles={appointmentViewRoles} />}>
             <Route path="/appointments" element={<AppointmentListPage />} />
             <Route path="/appointments/:appointmentId" element={<AppointmentDetailsPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={appointmentModifyRoles} />}>
             <Route path="/appointments/new" element={<AddAppointmentPage />} />
             <Route path="/appointments/edit/:appointmentId" element={<EditAppointmentPage />} />
          </Route>

          {/* === Encounter & EMR Management Routes === */}
          <Route element={<ProtectedRoute allowedRoles={encounterAndEmrRoles} />}>
            <Route path="/patients/:patientId/encounters/new" element={<AddEncounterPage />} />
            <Route path="/encounters/:encounterId" element={<EncounterDetailsPage />} />
            
            <Route path="/encounters/:encounterId/consultation-notes" element={<ManageConsultationNotePage />} />
            <Route path="/encounters/:encounterId/vitals" element={<ManageVitalSignsPage />} />
            <Route path="/encounters/:encounterId/diagnoses" element={<ManageDiagnosesPage />} />
            <Route path="/encounters/:encounterId/prescriptions" element={<ManagePrescriptionsPage />} />
            <Route path="/encounters/:encounterId/lab-orders" element={<ManageLabOrdersPage />} />
          </Route>

          {/* === User Profile Route (All authenticated users) === */}
          <Route element={<ProtectedRoute allowedRoles={authenticatedUserRoles} />}>
            <Route path="/profile" element={<UserProfilePagePlaceholder />} />
          </Route>

          {/* === Admin Only Routes === */}
          <Route element={<ProtectedRoute allowedRoles={adminOnlyRoles} />}>
             <Route path="/admin/dashboard" element={<AdminDashboardPagePlaceholder />} />
             {/* Add other admin-specific routes here, e.g., user management, system settings */}
          </Route>
          
          {/* === Fallback Not Found Route (should be last) === */}
          <Route path="*" element={<NotFoundPagePlaceholder />} />
        </Routes>
      </main>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Router>
  );
}

export default App;