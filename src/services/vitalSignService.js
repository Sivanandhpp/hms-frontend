// src/services/vitalSignService.js
import apiClient from './api';

/**
 * Fetches all vital signs recorded for a specific encounter.
 * Corresponds to backend: GET /api/v1/vital-signs/encounter/{encounterId}
 * @param {number|string} encounterId - The ID of the encounter.
 * @returns {Promise<AxiosResponse<Array<VitalSignDTO>>>}
 */
export const getVitalSignsByEncounterId = (encounterId) => {
  return apiClient.get(`/vital-signs/encounter/${encounterId}`);
};

/**
 * Records a new set of vital signs for an encounter.
 * Corresponds to backend: POST /api/v1/vital-signs
 * @param {object} vitalData - The vital signs data to record.
 *                             Should include encounterId and other vital measurements.
 * @returns {Promise<AxiosResponse<VitalSignDTO>>}
 */
export const recordVitalSign = (vitalData) => {
  return apiClient.post('/vital-signs', vitalData);
};

/**
 * Fetches a specific vital sign record by its ID.
 * Corresponds to backend: GET /api/v1/vital-signs/{id}
 * (This might not be strictly needed for the current "ManageVitalSignsPage" which lists all for an encounter,
 *  but good to have if you ever need to view/edit a single vital sign record directly).
 * @param {number|string} vitalId - The ID of the vital sign record.
 * @returns {Promise<AxiosResponse<VitalSignDTO>>}
 */
export const getVitalSignById = (vitalId) => {
  return apiClient.get(`/vital-signs/${vitalId}`);
};

// --- Optional: Update and Delete ---
// Updating or deleting vital signs is often restricted to maintain historical accuracy.
// If your application allows it, you would add:

/**
 * Updates an existing vital sign record. (Use with caution)
 * Corresponds to backend: PUT /api/v1/vital-signs/{id}
 * @param {number|string} vitalId - The ID of the vital sign record to update.
 * @param {object} vitalData - The updated vital signs data.
 * @returns {Promise<AxiosResponse<VitalSignDTO>>}
 */
// export const updateVitalSign = (vitalId, vitalData) => {
//   return apiClient.put(`/vital-signs/${vitalId}`, vitalData);
// };

/**
 * Deletes a vital sign record. (Use with extreme caution)
 * Corresponds to backend: DELETE /api/v1/vital-signs/{id}
 * @param {number|string} vitalId - The ID of the vital sign record to delete.
 * @returns {Promise<AxiosResponse<void>>}
 */
// export const deleteVitalSign = (vitalId) => {
//   return apiClient.delete(`/vital-signs/${vitalId}`);
// };