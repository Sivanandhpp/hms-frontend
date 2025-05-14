// src/services/labOrderService.js
import apiClient from './api';

/**
 * Creates a new lab order for an encounter.
 * Corresponds to backend: POST /api/v1/lab-orders
 * @param {object} labOrderData - The lab order data, including items (tests).
 *                                Example: { encounterId, orderDatetime, notes, items: [{labTestId}] }
 * @returns {Promise<AxiosResponse<LabOrderDTO>>}
 */
export const createLabOrder = (labOrderData) => {
  return apiClient.post('/lab-orders', labOrderData);
};

/**
 * Fetches a specific lab order by its ID.
 * Corresponds to backend: GET /api/v1/lab-orders/{id}
 * @param {number|string} labOrderId - The ID of the lab order.
 * @returns {Promise<AxiosResponse<LabOrderDTO>>}
 */
export const getLabOrderById = (labOrderId) => {
  return apiClient.get(`/lab-orders/${labOrderId}`);
};

/**
 * Fetches all lab orders for a specific encounter.
 * Corresponds to backend: GET /api/v1/lab-orders/encounter/{encounterId}
 * @param {number|string} encounterId - The ID of the encounter.
 * @returns {Promise<AxiosResponse<Array<LabOrderDTO>>>}
 */
export const getLabOrdersByEncounterId = (encounterId) => {
  return apiClient.get(`/lab-orders/encounter/${encounterId}`);
};

/**
 * Fetches all lab orders for a specific patient across all encounters.
 * Corresponds to backend: GET /api/v1/lab-orders/patient/{patientId}
 * @param {number|string} patientId - The ID of the patient.
 * @returns {Promise<AxiosResponse<Array<LabOrderDTO>>>}
 */
export const getLabOrdersByPatientId = (patientId) => {
    return apiClient.get(`/lab-orders/patient/${patientId}`);
};

/**
 * Updates the status of an overall lab order.
 * Corresponds to backend: PATCH /api/v1/lab-orders/{id}/status?status=NEW_STATUS
 * @param {number|string} labOrderId - The ID of the lab order.
 * @param {string} status - The new status (e.g., "SAMPLE_COLLECTED", "COMPLETED").
 * @returns {Promise<AxiosResponse<LabOrderDTO>>}
 */
export const updateLabOrderStatus = (labOrderId, status) => {
  return apiClient.patch(`/lab-orders/${labOrderId}/status?status=${encodeURIComponent(status)}`);
};

/**
 * Updates the result for a specific item within a lab order.
 * Corresponds to backend: PATCH /api/v1/lab-orders/{labOrderId}/item/{labOrderItemId}/result
 * @param {number|string} labOrderId - The ID of the parent lab order.
 * @param {number|string} labOrderItemId - The ID of the lab order item to update.
 * @param {object} resultData - The result data (e.g., { resultValue, resultUnit, isAbnormal, ... }).
 * @returns {Promise<AxiosResponse<LabOrderDTO>>} - Returns the updated parent LabOrderDTO
 */
export const updateLabOrderItemResult = (labOrderId, labOrderItemId, resultData) => {
  return apiClient.patch(`/lab-orders/${labOrderId}/item/${labOrderItemId}/result`, resultData);
};

// Deletion of lab orders is usually restricted for audit and historical purposes.
// If implemented, ensure backend handles cascading effects or soft deletes appropriately.
// export const deleteLabOrder = (labOrderId) => {
//   return apiClient.delete(`/lab-orders/${labOrderId}`);
// };


/**
 * Searches for lab tests in the catalog for selection in the lab order form.
 * Assumes a backend endpoint like GET /api/v1/lab-tests?name=searchTerm
 * @param {string} searchTerm - The term to search for in lab test names.
 * @returns {Promise<Array<{value: number, label: string}>>} - Array suitable for react-select
 */
export const searchLabTestsForSelect = async (searchTerm) => {
    // Allow empty search term to potentially fetch initial/common tests, or if backend supports it
    // if (!searchTerm || searchTerm.trim() === '') {
    //     return [];
    // }
    try {
        const query = searchTerm ? `?name=${encodeURIComponent(searchTerm)}` : '';
        const response = await apiClient.get(`/lab-tests${query}`); // Endpoint for lab test catalog
        if (response.data && Array.isArray(response.data)) {
            return response.data.map(test => ({
                value: test.id,
                label: `${test.testName} (Category: ${test.category || 'N/A'})`
            }));
        }
        return [];
    } catch (error) {
        console.error("Error searching lab tests:", error);
        return []; // Return empty on error to prevent AsyncSelect from breaking
    }
};