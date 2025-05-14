// src/services/encounterService.js
import apiClient from './api';

export const createEncounter = (encounterData) => {
  return apiClient.post('/encounters', encounterData);
};

export const getEncounterById = (encounterId) => {
  return apiClient.get(`/encounters/${encounterId}`);
};

export const getEncountersByPatientId = (patientId) => {
  return apiClient.get(`/encounters/patient/${patientId}`);
};

export const getEncountersByDoctorId = (doctorId) => {
  return apiClient.get(`/encounters/doctor/${doctorId}`);
};

export const updateEncounter = (encounterId, encounterData) => {
  return apiClient.put(`/encounters/${encounterId}`, encounterData);
};

// We might also need to fetch appointments to link to an encounter
export const getAppointmentsForEncounterSelect = async (patientId) => {
    // Fetch recent, non-completed appointments for a patient to link to an encounter
    // This is a placeholder; your backend might need a specific endpoint for this
    const response = await apiClient.get(`/appointments/patient/${patientId}`); // Adjust endpoint as needed
    return response.data
        .filter(appt => appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED') // Example filter
        .map(appt => ({
            value: appt.id,
            label: `Appt. ID: ${appt.id} - ${new Date(appt.appointmentDatetime).toLocaleString()} with Dr. ${appt.doctorLastName}`
        }));
};