// src/services/doctorService.js
import apiClient from './api';

export const getDoctorById = (doctorId) => {
  // This should match the endpoint in your backend DoctorController
  // Example: GET /api/v1/doctors/{id}
  return apiClient.get(`/doctors/${doctorId}`);
};

export const getAllDoctors = () => {
  // Example: GET /api/v1/doctors
  return apiClient.get('/doctors');
};

// Add other doctor-related service functions as needed, for example:
// export const createDoctorProfile = (doctorData) => {
//   return apiClient.post('/doctors', doctorData);
// };

// export const updateDoctorProfile = (doctorId, doctorData) => {
//   return apiClient.put(`/doctors/${doctorId}`, doctorData);
// };

// export const findDoctorsBySpecialization = (specialization) => {
//   return apiClient.get(`/doctors/specialization/${specialization}`);
// };