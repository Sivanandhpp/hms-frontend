// src/services/appointmentService.js
import apiClient from './api';

export const createAppointment = (appointmentData) => {
  return apiClient.post('/appointments', appointmentData);
};

export const getAppointmentById = (appointmentId) => {
  return apiClient.get(`/appointments/${appointmentId}`);
};

export const getAllAppointments = () => { // Primarily for Admin/Receptionist view
  return apiClient.get('/appointments');
};

export const getAppointmentsByPatientId = (patientId) => {
  return apiClient.get(`/appointments/patient/${patientId}`);
};

export const getAppointmentsByDoctorId = (doctorId) => {
  return apiClient.get(`/appointments/doctor/${doctorId}`);
};

export const getAppointmentsForDoctorByDate = (doctorId, date) => { // date in 'YYYY-MM-DD'
  return apiClient.get(`/appointments/doctor/${doctorId}/date?date=${date}`);
};

export const getAppointmentsForPatientByDate = (patientId, date) => { // date in 'YYYY-MM-DD'
  return apiClient.get(`/appointments/patient/${patientId}/date?date=${date}`);
};

export const updateAppointmentStatus = (appointmentId, status) => {
  return apiClient.patch(`/appointments/${appointmentId}/status?status=${status}`);
};

export const rescheduleAppointment = (appointmentId, appointmentData) => {
  return apiClient.put(`/appointments/${appointmentId}/reschedule`, appointmentData);
};

export const cancelAppointment = (appointmentId) => {
  return apiClient.delete(`/appointments/${appointmentId}/cancel`);
};

// We'll also need to fetch doctors and patients for dropdowns in the appointment form
export const getDoctorsForSelect = async () => {
    // This endpoint might need to be optimized on the backend to return minimal data
    const response = await apiClient.get('/doctors');
    return response.data.map(doc => ({
        value: doc.id, // Doctor's specific ID (from doctors table)
        label: `${doc.fullName || doc.username} (ID: ${doc.id}, Spec: ${doc.specialization || 'N/A'})`
    }));
};

export const getPatientsForSelect = async () => {
    const response = await apiClient.get('/patients'); // Might need a search/autocomplete for many patients
    return response.data.map(pat => ({
        value: pat.id,
        label: `${pat.firstName} ${pat.lastName} (ID: ${pat.id})`
    }));
};