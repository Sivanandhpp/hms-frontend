// src/services/diagnosisService.js
import apiClient from './api';

/**
 * Fetches all diagnoses recorded for a specific encounter.
 * Corresponds to backend: GET /api/v1/diagnoses/encounter/{encounterId}
 * @param {number|string} encounterId - The ID of the encounter.
 * @returns {Promise<AxiosResponse<Array<DiagnosisDTO>>>}
 */
export const getDiagnosesByEncounterId = (encounterId) => {
  return apiClient.get(`/diagnoses/encounter/${encounterId}`);
};

/**
 * Fetches all diagnoses for a specific patient across all their encounters.
 * Corresponds to backend: GET /api/v1/diagnoses/patient/{patientId}
 * @param {number|string} patientId - The ID of the patient.
 * @returns {Promise<AxiosResponse<Array<DiagnosisDTO>>>}
 */
export const getDiagnosesByPatientId = (patientId) => {
    return apiClient.get(`/diagnoses/patient/${patientId}`);
};

/**
 * Adds a new diagnosis for an encounter.
 * Corresponds to backend: POST /api/v1/diagnoses
 * @param {object} diagnosisData - The diagnosis data to record.
 *                               Should include encounterId, diagnosisCode, description, etc.
 * @returns {Promise<AxiosResponse<DiagnosisDTO>>}
 */
export const addDiagnosis = (diagnosisData) => {
  return apiClient.post('/diagnoses', diagnosisData);
};

/**
 * Fetches a specific diagnosis record by its ID.
 * Corresponds to backend: GET /api/v1/diagnoses/{id}
 * @param {number|string} diagnosisId - The ID of the diagnosis record.
 * @returns {Promise<AxiosResponse<DiagnosisDTO>>}
 */
export const getDiagnosisById = (diagnosisId) => {
  return apiClient.get(`/diagnoses/${diagnosisId}`);
};

/**
 * Updates an existing diagnosis record.
 * Corresponds to backend: PUT /api/v1/diagnoses/{id}
 * @param {number|string} diagnosisId - The ID of the diagnosis to update.
 * @param {object} diagnosisData - The updated diagnosis data.
 * @returns {Promise<AxiosResponse<DiagnosisDTO>>}
 */
export const updateDiagnosis = (diagnosisId, diagnosisData) => {
  return apiClient.put(`/diagnoses/${diagnosisId}`, diagnosisData);
};

/**
 * Deletes a diagnosis record. (Use with caution, often restricted)
 * Corresponds to backend: DELETE /api/v1/diagnoses/{id}
 * @param {number|string} diagnosisId - The ID of the diagnosis to delete.
 * @returns {Promise<AxiosResponse<void>>}
 */
// export const deleteDiagnosis = (diagnosisId) => {
//   return apiClient.delete(`/diagnoses/${diagnosisId}`);
// };