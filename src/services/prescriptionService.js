// src/services/prescriptionService.js
import apiClient from './api';

/**
 * Creates a new prescription for an encounter.
 * Corresponds to backend: POST /api/v1/prescriptions
 * @param {object} prescriptionData - The prescription data, including items.
 *                                    Example: { encounterId, prescriptionDate, notes, items: [{medicationId, dosage, ...}] }
 * @returns {Promise<AxiosResponse<PrescriptionDTO>>}
 */
export const createPrescription = (prescriptionData) => {
  return apiClient.post('/prescriptions', prescriptionData);
};

/**
 * Fetches a specific prescription by its ID.
 * Corresponds to backend: GET /api/v1/prescriptions/{id}
 * @param {number|string} prescriptionId - The ID of the prescription.
 * @returns {Promise<AxiosResponse<PrescriptionDTO>>}
 */
export const getPrescriptionById = (prescriptionId) => {
  return apiClient.get(`/prescriptions/${prescriptionId}`);
};

/**
 * Fetches the prescription associated with a specific encounter (usually one).
 * Your backend might return a single object or an array (if multiple were allowed, though our current backend implies one).
 * If it returns one object and 404 if not found, that's fine.
 * Corresponds to backend: GET /api/v1/prescriptions/encounter/{encounterId}
 * @param {number|string} encounterId - The ID of the encounter.
 * @returns {Promise<AxiosResponse<PrescriptionDTO>>}
 */
export const getPrescriptionByEncounterId = (encounterId) => {
  return apiClient.get(`/prescriptions/encounter/${encounterId}`);
};

/**
 * Fetches all prescriptions for a specific patient across all their encounters.
 * Corresponds to backend: GET /api/v1/prescriptions/patient/{patientId}
 * @param {number|string} patientId - The ID of the patient.
 * @returns {Promise<AxiosResponse<Array<PrescriptionDTO>>>}
 */
export const getPrescriptionsByPatientId = (patientId) => {
    return apiClient.get(`/prescriptions/patient/${patientId}`);
};


// --- Optional: Update Prescription ---
// True update of a prescription (especially its items) can be complex.
// It might involve deleting old items and adding new ones, or specific item updates.
// The backend PrescriptionDTO and service would need to handle this.
// For now, this is a placeholder if you decide to implement full update functionality.
// Your current backend logic for createPrescription prevents a second one for the same encounter.
/**
 * Updates an existing prescription. (Requires careful backend implementation)
 * Corresponds to backend: PUT /api/v1/prescriptions/{id}
 * @param {number|string} prescriptionId - The ID of the prescription to update.
 * @param {object} prescriptionData - The updated prescription data, including items.
 * @returns {Promise<AxiosResponse<PrescriptionDTO>>}
 */
// export const updatePrescription = (prescriptionId, prescriptionData) => {
//   return apiClient.put(`/prescriptions/${prescriptionId}`, prescriptionData);
// };

// Deletion of prescriptions is usually highly restricted or involves soft delete/archiving
// for medico-legal reasons.
// export const deletePrescription = (prescriptionId) => {
//   return apiClient.delete(`/prescriptions/${prescriptionId}`);
// };


/**
 * Searches for medications in the catalog for selection in the prescription form.
 * Assumes a backend endpoint like GET /api/v1/medications?name=searchTerm
 * @param {string} searchTerm - The term to search for in medication names.
 * @returns {Promise<Array<{value: number, label: string}>>} - Array suitable for react-select
 */
export const searchMedicationsForSelect = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
        return []; // Return empty if no search term
    }
    try {
        const response = await apiClient.get(`/medications?name=${encodeURIComponent(searchTerm)}`);
        if (response.data && Array.isArray(response.data)) {
            return response.data.map(med => ({
                value: med.id,
                label: `${med.medicationName} (${med.strength || 'N/A'}, ${med.form || 'N/A'})`
            }));
        }
        return []; // Return empty if data is not as expected
    } catch (error) {
        console.error("Error searching medications:", error);
        return []; // Return empty on error
    }
};