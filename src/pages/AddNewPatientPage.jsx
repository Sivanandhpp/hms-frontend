// src/pages/AddNewPatientPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import PatientForm from '../components/patient/PatientForm'; // Import the form
import './AddNewPatientPage.css'; // We'll create this

function AddNewPatientPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleAddPatient = async (patientData) => {
    setIsLoading(true);
    setServerError('');
    try {
      // The PatientDTO on the backend expects certain fields.
      // Ensure patientData matches the structure.
      // For example, gender is already uppercase from the select.
      // dateOfBirth should be in "YYYY-MM-DD" format from the input.
      const response = await apiClient.post('/patients', patientData);
      console.log('Patient added successfully:', response.data);
      // Optionally show a success message before redirecting
      alert('Patient added successfully!'); // Simple alert for now
      navigate('/patients'); // Redirect to patient list page
    } catch (err) {
      console.error('Error adding patient:', err.response?.data || err.message);
      let errorMessage = 'Failed to add patient. Please try again.';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
        } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'object') {
            // Handle Spring Boot validation errors which might be an object
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
    navigate('/patients'); // Or to a previous page
  };

  return (
    <div className="add-patient-page-container">
      <div className="page-header">
        <h1>Register New Patient</h1>
      </div>
      <PatientForm
        onSubmit={handleAddPatient}
        onCancel={handleCancel}
        isLoading={isLoading}
        serverError={serverError}
        // No initialData for adding a new patient
      />
    </div>
  );
}

export default AddNewPatientPage;