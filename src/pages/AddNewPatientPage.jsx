// src/pages/AddNewPatientPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import PatientForm from '../components/patient/PatientForm';
import { toast } from 'react-toastify'; // Import toast
import './AddNewPatientPage.css';

function AddNewPatientPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(''); // This can still be used for form-level errors

  const handleAddPatient = async (patientData) => {
    setIsLoading(true);
    setServerError('');
    try {
      const response = await apiClient.post('/patients', patientData);
      console.log('Patient added successfully:', response.data);
      toast.success('Patient added successfully!'); // Use toast for success
      navigate('/patients');
    } catch (err) {
      console.error('Error adding patient:', err.response?.data || err.message);
      let errorMessage = 'Failed to add patient. Please try again.';
      if (err.response && err.response.data) {
        // ... (existing error message parsing logic) ...
         if (typeof err.response.data === 'string') errorMessage = err.response.data;
         else if (err.response.data.message) errorMessage = err.response.data.message;
         else if (typeof err.response.data === 'object') {
            const fieldErrors = Object.values(err.response.data).join(', ');
            if (fieldErrors) errorMessage = fieldErrors;
         }
      }
      setServerError(errorMessage); // Keep for form-level display
      toast.error(errorMessage); // Also show a toast for the error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/patients');
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
        serverError={serverError} // PatientForm can still display this if needed
      />
    </div>
  );
}

export default AddNewPatientPage;