// src/pages/ManageDiagnosesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDiagnosesByEncounterId, addDiagnosis, updateDiagnosis /*, deleteDiagnosis */ } from '../services/diagnosisService';
import { getEncounterById } from '../services/encounterService';
import DiagnosisForm from '../components/emr/DiagnosisForm';
import './ManagePages.css';
import './ManageDiagnosesPage.css'; // Specific styles

function ManageDiagnosesPage() {
  const { encounterId } = useParams();
  const navigate = useNavigate();

  const [encounter, setEncounter] = useState(null);
  const [diagnosesList, setDiagnosesList] = useState([]);
  const [editingDiagnosis, setEditingDiagnosis] = useState(null); // For editing
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [serverError, setServerError] = useState('');
  const [formError, setFormError] = useState('');

  const fetchDiagnosesAndEncounter = useCallback(async () => {
    setIsFetching(true);
    setServerError('');
    try {
      const [encounterRes, diagnosesRes] = await Promise.all([
        getEncounterById(encounterId),
        getDiagnosesByEncounterId(encounterId)
      ]);
      setEncounter(encounterRes.data);
      setDiagnosesList(diagnosesRes.data);
    } catch (err) {
      console.error('Error fetching data for diagnoses:', err);
      setServerError(err.response?.data?.message || err.message || 'Failed to load diagnoses data.');
    } finally {
      setIsFetching(false);
    }
  }, [encounterId]);

  useEffect(() => {
    if (encounterId) {
      fetchDiagnosesAndEncounter();
    }
  }, [encounterId, fetchDiagnosesAndEncounter]);

  const handleFormSubmit = async (diagnosisData) => {
    setIsLoading(true);
    setFormError('');
    const submissionData = {
      ...diagnosisData,
      encounterId: parseInt(encounterId, 10),
    };

    try {
      if (editingDiagnosis) { // Update existing
        await updateDiagnosis(editingDiagnosis.id, submissionData);
        alert('Diagnosis updated successfully!');
      } else { // Add new
        await addDiagnosis(submissionData);
        alert('Diagnosis added successfully!');
      }
      setEditingDiagnosis(null); // Clear editing state
      fetchDiagnosesAndEncounter(); // Refresh the list
    } catch (err) {
      console.error('Error saving diagnosis:', err.response?.data || err.message);
       let errorMessage = 'Failed to save diagnosis. Please try again.';
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

  const handleEditDiagnosis = (diagnosis) => {
    setEditingDiagnosis(diagnosis);
    setFormError(''); // Clear previous form errors
    window.scrollTo({ top: document.getElementById('diagnosis-form-section').offsetTop - 80, behavior: 'smooth' }); // Scroll to form
  };

  const handleCancelEdit = () => {
    setEditingDiagnosis(null);
    setFormError('');
  };

  // const handleDeleteDiagnosis = async (diagnosisId) => { ... if implementing delete ... }

  if (isFetching) {
    return <div className="loading-message">Loading diagnoses data...</div>;
  }

  if (serverError && !encounter) {
    return <div className="error-message page-error">{serverError}</div>;
  }

  return (
    <div className="manage-emr-page-container diagnoses-manage-page">
      <div className="page-header">
        <h1>Manage Diagnoses</h1>
        {encounter && (
          <p className="encounter-context-info">
            For Encounter ID: {encounter.id} (Patient: {encounter.patientFullName}, Date: {new Date(encounter.encounterDatetime).toLocaleDateString()})
          </p>
        )}
      </div>
      <Link to={`/encounters/${encounterId}`} className="back-link">Back to Encounter Details</Link>

      <div id="diagnosis-form-section" className="emr-form-section"> {/* Reusable class from ManageVitalSignsPage.css */}
        <h2>{editingDiagnosis ? 'Edit Diagnosis' : 'Add New Diagnosis'}</h2>
        <DiagnosisForm
          encounterId={parseInt(encounterId, 10)}
          initialData={editingDiagnosis}
          onSubmit={handleFormSubmit}
          isLoading={isLoading}
          serverError={formError}
          // onCancel={editingDiagnosis ? handleCancelEdit : null} // Optional cancel for edit mode
        />
        {editingDiagnosis && (
            <button onClick={handleCancelEdit} className="button-secondary" style={{marginTop: '10px'}}>Cancel Edit</button>
        )}
      </div>

      <div className="emr-list-section"> {/* Reusable class */}
        <h2>Recorded Diagnoses</h2>
        {serverError && diagnosesList.length === 0 && <p className="error-message">{serverError}</p>}
        {diagnosesList.length === 0 && !isFetching && !serverError && (
          <p className="info-message">No diagnoses recorded for this encounter yet.</p>
        )}
        {diagnosesList.length > 0 && (
          <ul className="diagnoses-list">
            {diagnosesList.map(diag => (
              <li key={diag.id} className="diagnosis-list-item">
                <div>
                  <strong>{diag.diagnosisCode} ({diag.diagnosisCodeSystem || 'N/A'})</strong>: {diag.description}
                </div>
                <div className="diagnosis-meta">
                  <span>Date: {new Date(diag.diagnosisDate).toLocaleDateString()}</span>
                  {diag.isChronic && <span className="chronic-tag">Chronic</span>}
                </div>
                <div className="diagnosis-notes">Notes: {diag.notes || 'N/A'}</div>
                <div className="diagnosis-actions">
                    <button onClick={() => handleEditDiagnosis(diag)} className="action-link edit-link-alt">Edit</button>
                    {/* <button onClick={() => handleDeleteDiagnosis(diag.id)} className="action-link delete-link-alt">Delete</button> */}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ManageDiagnosesPage;