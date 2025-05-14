// src/pages/ManagePrescriptionsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPrescriptionByEncounterId, createPrescription /*, updatePrescription */ } from '../services/prescriptionService';
import { getEncounterById } from '../services/encounterService';
import PrescriptionForm from '../components/emr/PrescriptionForm';
import './ManagePages.css';

function ManagePrescriptionsPage() {
  const { encounterId } = useParams();
  const navigate = useNavigate();

  const [encounter, setEncounter] = useState(null);
  const [existingPrescription, setExistingPrescription] = useState(null); // Can be null if new
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [serverError, setServerError] = useState('');

  const fetchPrescriptionAndEncounter = useCallback(async () => {
    setIsFetching(true);
    setServerError('');
    try {
      const encounterRes = await getEncounterById(encounterId);
      setEncounter(encounterRes.data);

      try {
        const prescriptionRes = await getPrescriptionByEncounterId(encounterId);
        setExistingPrescription(prescriptionRes.data);
      } catch (prescError) {
        if (prescError.response && prescError.response.status === 404) {
          setExistingPrescription(null); // No existing prescription, which is fine
        } else {
          throw prescError; // Rethrow other errors
        }
      }
    } catch (err) {
      console.error('Error fetching data for prescription:', err);
      setServerError(err.response?.data?.message || err.message || 'Failed to load prescription data.');
    } finally {
      setIsFetching(false);
    }
  }, [encounterId]);

  useEffect(() => {
    if (encounterId) {
      fetchPrescriptionAndEncounter();
    }
  }, [encounterId, fetchPrescriptionAndEncounter]);

  const handleFormSubmit = async (prescriptionData) => {
    setIsLoading(true);
    setServerError('');
    
    // If existingPrescription exists, it implies an update, but our backend currently only has create
    // For simplicity, let's assume we're always creating a new one, or backend createPrescription handles upsert.
    // A true "update" would need a PUT request and a different service call if prescription.id exists.
    // For now, let's use createPrescription. If backend allows only one prescription per encounter, it might fail if one exists.
    // Backend `PrescriptionServiceImpl` has a check: `prescriptionRepository.findByEncounterId(dto.getEncounterId()).ifPresent(p -> { throw ... });`
    // This means you can only create one. To "edit", you'd need an update endpoint or delete+recreate.
    // For this example, we'll try to create. If it fails because one exists, the error will show.

    try {
      // if (existingPrescription && existingPrescription.id) {
      //   await updatePrescription(existingPrescription.id, prescriptionData);
      //   alert('Prescription updated successfully!');
      // } else {
        await createPrescription(prescriptionData);
        alert('Prescription saved successfully!');
      // }
      navigate(`/encounters/${encounterId}`);
    } catch (err) {
      console.error('Error saving prescription:', err.response?.data || err.message);
      let errorMessage = 'Failed to save prescription. Please try again.';
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
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/encounters/${encounterId}`);
  };

  if (isFetching) {
    return <div className="loading-message">Loading prescription data...</div>;
  }

  if (serverError && !encounter) {
    return <div className="error-message page-error">{serverError}</div>;
  }

  return (
    <div className="manage-emr-page-container prescription-manage-page">
      <div className="page-header">
        <h1>{existingPrescription ? 'View/Edit' : 'Create'} Prescription</h1>
        {encounter && (
          <p className="encounter-context-info">
            For Encounter ID: {encounter.id} (Patient: {encounter.patientFullName}, Date: {new Date(encounter.encounterDatetime).toLocaleDateString()})
          </p>
        )}
      </div>
      <Link to={`/encounters/${encounterId}`} className="back-link" style={{marginBottom:'20px', display:'inline-block'}}>Back to Encounter Details</Link>

      {/* If prescription exists and you only want to view, you'd have a display mode here.
          For simplicity, we go directly to the form for add/edit.
          A more complex UI might show existing prescription read-only with an "Edit" button.
      */}
      <PrescriptionForm
        encounterId={parseInt(encounterId, 10)}
        initialData={existingPrescription}
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        serverError={serverError}
      />
    </div>
  );
}

export default ManagePrescriptionsPage;