// src/pages/ManageVitalSignsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getVitalSignsByEncounterId, recordVitalSign } from '../services/vitalSignService';
import { getEncounterById } from '../services/encounterService';
import VitalSignsForm from '../components/emr/VitalSignsForm';
import './ManagePages.css'; // Reuse generic manage page styles
import './ManageVitalSignsPage.css'; // Specific styles if needed

function ManageVitalSignsPage() {
  const { encounterId } = useParams();
  const navigate = useNavigate();

  const [encounter, setEncounter] = useState(null);
  const [vitalSignsList, setVitalSignsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // For form submission
  const [isFetching, setIsFetching] = useState(true);
  const [serverError, setServerError] = useState('');
  const [formError, setFormError] = useState(''); // For form-specific errors

  const fetchVitalSignsAndEncounter = useCallback(async () => {
    setIsFetching(true);
    setServerError('');
    try {
      const [encounterRes, vitalsRes] = await Promise.all([
        getEncounterById(encounterId),
        getVitalSignsByEncounterId(encounterId)
      ]);
      setEncounter(encounterRes.data);
      setVitalSignsList(vitalsRes.data);
    } catch (err) {
      console.error('Error fetching data for vital signs:', err);
      setServerError(err.response?.data?.message || err.message || 'Failed to load vital signs data.');
    } finally {
      setIsFetching(false);
    }
  }, [encounterId]);

  useEffect(() => {
    if (encounterId) {
      fetchVitalSignsAndEncounter();
    }
  }, [encounterId, fetchVitalSignsAndEncounter]);

  const handleRecordVitals = async (vitalsData) => {
    setIsLoading(true);
    setFormError('');
    const submissionData = {
      ...vitalsData,
      encounterId: parseInt(encounterId, 10),
    };

    try {
      await recordVitalSign(submissionData);
      alert('Vital signs recorded successfully!');
      fetchVitalSignsAndEncounter(); // Refresh the list
      // Optionally reset the form here if it's kept on the page
    } catch (err) {
      console.error('Error recording vital signs:', err.response?.data || err.message);
       let errorMessage = 'Failed to record vital signs. Please try again.';
       if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
        } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'object') {
            const fieldErrors = Object.values(err.response.data).join(', ');
            if (fieldErrors) errorMessage = fieldErrors;
        }
      }
      setFormError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="loading-message">Loading vital signs data...</div>;
  }

  if (serverError && !encounter) { // Critical error fetching encounter
    return <div className="error-message page-error">{serverError}</div>;
  }

  return (
    <div className="manage-emr-page-container vital-signs-manage-page">
      <div className="page-header">
        <h1>Manage Vital Signs</h1>
        {encounter && (
          <p className="encounter-context-info">
            For Encounter ID: {encounter.id} (Patient: {encounter.patientFullName}, Date: {new Date(encounter.encounterDatetime).toLocaleDateString()})
          </p>
        )}
      </div>
      <Link to={`/encounters/${encounterId}`} className="back-link">Back to Encounter Details</Link>

      <div className="vitals-form-section">
        <h2>Record New Vital Signs</h2>
        <VitalSignsForm
          encounterId={parseInt(encounterId, 10)}
          onSubmit={handleRecordVitals}
          isLoading={isLoading}
          serverError={formError}
        />
      </div>

      <div className="vitals-history-section">
        <h2>Recorded Vital Signs</h2>
        {serverError && vitalSignsList.length === 0 && <p className="error-message">{serverError}</p>}
        {vitalSignsList.length === 0 && !isFetching && !serverError && (
          <p className="info-message">No vital signs recorded for this encounter yet.</p>
        )}
        {vitalSignsList.length > 0 && (
          <table className="vitals-table">
            <thead>
              <tr>
                <th>Recorded At</th>
                <th>Temp (°C)</th>
                <th>BP (mmHg)</th>
                <th>HR (bpm)</th>
                <th>RR (rpm)</th>
                <th>SpO2 (%)</th>
                <th>Height (cm)</th>
                <th>Weight (kg)</th>
                <th>BMI</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {vitalSignsList.map(vital => (
                <tr key={vital.id}>
                  <td>{new Date(vital.recordedAt).toLocaleString()}</td>
                  <td>{vital.temperatureCelsius ?? 'N/A'}</td>
                  <td>{vital.bloodPressureSystolic && vital.bloodPressureDiastolic ? `${vital.bloodPressureSystolic}/${vital.bloodPressureDiastolic}` : 'N/A'}</td>
                  <td>{vital.heartRateBpm ?? 'N/A'}</td>
                  <td>{vital.respiratoryRateRpm ?? 'N/A'}</td>
                  <td>{vital.spo2Percentage ?? 'N/A'}</td>
                  <td>{vital.heightCm ?? 'N/A'}</td>
                  <td>{vital.weightKg ?? 'N/A'}</td>
                  <td>{vital.bmi ?? 'N/A'}</td>
                  <td>{vital.notes || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageVitalSignsPage;