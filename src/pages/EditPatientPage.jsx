// src/pages/EditPatientPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import PatientForm from '../components/patient/PatientForm'; // Reuse the form
import './EditPatientPage.css'; // We'll create this

function EditPatientPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // For form submission
  const [isFetching, setIsFetching] = useState(true); // For initial data fetch
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const fetchPatient = async () => {
      setIsFetching(true);
      setServerError('');
      try {
        const response = await apiClient.get(`/patients/${patientId}`);
        setInitialData(response.data);
      } catch (err) {
        console.error('Error fetching patient for edit:', err);
        setServerError(err.response?.data?.message || err.message || 'Failed to fetch patient data.');
      } finally {
        setIsFetching(false);
      }
    };
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const handleUpdatePatient = async (patientData) => {
    setIsLoading(true);
    setServerError('');
    try {
      // The backend PUT /patients/{id} expects the full updated patient object
      const response = await apiClient.put(`/patients/${patientId}`, patientData);
      console.log('Patient updated successfully:', response.data);
      alert('Patient updated successfully!'); // Simple alert
      navigate(`/patients/${patientId}`); // Redirect to patient details page
    } catch (err) {
      console.error('Error updating patient:', err.response?.data || err.message);
      let errorMessage = 'Failed to update patient. Please try again.';
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
    navigate(`/patients/${patientId}`); // Back to details page
  };

  if (isFetching) {
    return <div className="loading-message">Loading patient data for editing...</div>;
  }

  if (serverError && !initialData) { // If initial fetch failed
    return <div className="error-message page-error">{serverError}</div>;
  }


  return (
    <div className="edit-patient-page-container">
      <div className="page-header">
        <h1>Edit Patient Record (ID: {patientId})</h1>
      </div>
      {initialData ? (
        <PatientForm
          initialData={initialData}
          onSubmit={handleUpdatePatient}
          onCancel={handleCancel}
          isLoading={isLoading}
          serverError={serverError}
        />
      ) : (
        <p>Patient data could not be loaded.</p> // Should be covered by serverError above
      )}
    </div>
  );
}

export default EditPatientPage;