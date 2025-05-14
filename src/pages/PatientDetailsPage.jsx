// src/pages/PatientDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { getEncountersByPatientId } from '../services/encounterService'; // Import encounter service
import { useAuth } from '../contexts/AuthContext'; // To check roles for delete button
import './PatientDetailsPage.css';

function PatientDetailsPage() {
  const { patientId } = useParams(); // Get patientId from URL parameter
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user for role-based actions

  const [patient, setPatient] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true); // For patient details
  const [encountersLoading, setEncountersLoading] = useState(false); // For encounters list
  const [actionLoading, setActionLoading] = useState(false); // For delete action
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatientAndEncounters = async () => {
      setLoading(true);
      setEncountersLoading(true); // Start loading encounters too
      setError('');
      try {
        // Fetch patient details
        const patientResponse = await apiClient.get(`/patients/${patientId}`);
        setPatient(patientResponse.data);

        // Fetch encounters for this patient
        const encountersResponse = await getEncountersByPatientId(patientId);
        setEncounters(encountersResponse.data);

      } catch (err) {
        console.error("Error fetching patient data or encounters:", err);
        let errorMessage = err.response?.data?.message || err.message || 'Failed to fetch data.';
        if (err.response?.status === 404) {
             // Differentiate if patient not found or encounters not found (though encounters might just be an empty array)
            if (!patient && !encounters.length) { // Heuristic: if both patient and encounters are empty, likely patient not found
                 errorMessage = `Patient with ID ${patientId} not found.`;
            }
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
        setEncountersLoading(false);
      }
    };

    if (patientId) {
      fetchPatientAndEncounters();
    }
  }, [patientId]); // Rerun if patientId changes

  const handleDeletePatient = async () => {
    if (window.confirm(`Are you sure you want to delete patient ${patient?.firstName} ${patient?.lastName} (ID: ${patient?.id})? This action cannot be undone.`)) {
      setActionLoading(true);
      setError('');
      try {
        await apiClient.delete(`/patients/${patientId}`);
        alert('Patient deleted successfully.');
        navigate('/patients'); // Redirect to patient list
      } catch (err) {
        console.error("Error deleting patient:", err);
        setError(err.response?.data?.message || err.message || 'Failed to delete patient.');
        setActionLoading(false); // Ensure loading is false on error
      }
      // No finally for setActionLoading here, as navigate might unmount
    }
  };

  // Determine if current user has permission to edit/delete
  // Based on roles defined in App.jsx for patientAddEditDeleteAllowedRoles
  const canEditDelete = user?.roles?.some(role => ["ROLE_ADMIN", "ROLE_RECEPTIONIST"].includes(role));


  if (loading && !patient) { // Show main loading only if patient data isn't available yet
    return <div className="loading-message">Loading patient details...</div>;
  }

  if (error && !patient) { // If initial patient fetch failed critically
    return <div className="error-message page-error">{error}</div>;
  }

  if (!patient) { // Should be covered by above, but as a fallback
    return <div className="info-message">No patient data found or patient does not exist.</div>;
  }

  return (
    <div className="patient-details-container">
      <div className="page-header">
        <h1>Patient Details: {patient.firstName} {patient.middleName || ''} {patient.lastName}</h1>
        <div className="action-buttons-group">
          <Link
            to={`/patients/${patientId}/encounters/new`}
            className="action-button primary"
          >
            New Encounter
          </Link>
          {canEditDelete && (
            <>
              <Link to={`/patients/edit/${patient.id}`} className="action-button edit">Edit Patient</Link>
              <button onClick={handleDeletePatient} className="action-button delete" disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Delete Patient'}
              </button>
            </>
          )}
          <Link to="/patients" className="action-button secondary">Back to List</Link>
        </div>
      </div>
      {/* Display general error if it occurred after patient load (e.g., during encounter load or delete) */}
      {error && encounters.length > 0 && <p className="error-message form-level-error">{error}</p>}


      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">Patient ID:</span>
          <span className="detail-value">{patient.id}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Full Name:</span>
          <span className="detail-value">{patient.firstName} {patient.middleName || ''} {patient.lastName}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Date of Birth:</span>
          <span className="detail-value">{new Date(patient.dateOfBirth).toLocaleDateString()}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Gender:</span>
          <span className="detail-value">{patient.gender}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Email:</span>
          <span className="detail-value">{patient.email || 'N/A'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Phone Number:</span>
          <span className="detail-value">{patient.phoneNumber || 'N/A'}</span>
        </div>

        <h3 className="section-title">Address</h3>
        <div className="detail-item full-width">
          <span className="detail-label">Address:</span>
          <span className="detail-value">
            {patient.addressLine1 || 'N/A'}<br />
            {patient.addressLine2 && <>{patient.addressLine2}<br /></>}
            {patient.city || ''}{patient.city && patient.state ? ', ' : ''}{patient.state || ''} {patient.postalCode || ''}<br />
            {patient.country || ''}
          </span>
        </div>

        <h3 className="section-title">Emergency Contact</h3>
        <div className="detail-item">
          <span className="detail-label">Name:</span>
          <span className="detail-value">{patient.emergencyContactName || 'N/A'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Phone:</span>
          <span className="detail-value">{patient.emergencyContactPhone || 'N/A'}</span>
        </div>

        <h3 className="section-title">Insurance Information</h3>
        <div className="detail-item">
          <span className="detail-label">Provider:</span>
          <span className="detail-value">{patient.insuranceProvider || 'N/A'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Policy Number:</span>
          <span className="detail-value">{patient.insurancePolicyNumber || 'N/A'}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Registration Date:</span>
          <span className="detail-value">{new Date(patient.registrationDate).toLocaleString()}</span>
        </div>
         <div className="detail-item">
          <span className="detail-label">Last Updated:</span>
          <span className="detail-value">{patient.updatedAt ? new Date(patient.updatedAt).toLocaleString() : 'N/A'}</span>
        </div>
      </div>

      {/* Encounters Section */}
      <div className="related-info-section encounters-section">
        <h3 className="section-title">Patient Encounters</h3>
        {encountersLoading && <p className="small-loading">Loading encounters...</p>}
        {!encountersLoading && error && encounters.length === 0 && ( // Show error specific to encounters if patient loaded
             <p className="error-message">Could not load encounters: {error}</p>
        )}
        {!encountersLoading && !error && encounters.length === 0 && (
          <p className="info-message">No encounters recorded for this patient.</p>
        )}
        {!encountersLoading && encounters.length > 0 && (
          <ul className="encounters-list">
            {encounters.sort((a,b) => new Date(b.encounterDatetime) - new Date(a.encounterDatetime))
                .map(encounter => (
              <li key={encounter.id} className="encounter-list-item">
                <Link to={`/encounters/${encounter.id}`}>
                  <strong>{encounter.encounterType || 'Encounter'}</strong> on {' '}
                  {new Date(encounter.encounterDatetime).toLocaleDateString()} at {' '}
                  {new Date(encounter.encounterDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  <br />
                  <span>With: Dr. {encounter.doctorFullName || 'N/A'}</span>
                  <br/>
                  <span>Chief Complaint: {encounter.chiefComplaint || 'N/A'}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PatientDetailsPage;