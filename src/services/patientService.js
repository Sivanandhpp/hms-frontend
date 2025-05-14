// src/services/patientService.js
import apiClient from './api';

export const getAllPatients = (query = '') => {
  const endpoint = query ? `/patients/search?query=${encodeURIComponent(query)}` : '/patients';
  return apiClient.get(endpoint);
};

export const getPatientById = (patientId) => {
  return apiClient.get(`/patients/${patientId}`);
};

export const createPatient = (patientData) => {
  return apiClient.post('/patients', patientData);
};

export const updatePatient = (patientId, patientData) => {
  return apiClient.put(`/patients/${patientId}`, patientData);
};

export const deletePatient = (patientId) => {
  return apiClient.delete(`/patients/${patientId}`);
};

// This was used in AddAppointmentPage, good to have it centralized here
export const getPatientsForSelect = async () => {
    const response = await apiClient.get('/patients'); // Might need a search/autocomplete for many patients
    return response.data.map(pat => ({
        value: pat.id,
        label: `${pat.firstName} ${pat.lastName} (ID: ${pat.id})`
    }));
};