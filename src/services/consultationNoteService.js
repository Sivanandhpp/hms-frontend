// src/services/consultationNoteService.js
import apiClient from './api';

export const getConsultationNoteByEncounterId = (encounterId) => {
  // Placeholder: Implement actual API call when backend is ready
  console.warn(`consultationNoteService.getConsultationNoteByEncounterId for ${encounterId} not fully implemented.`);
  // return apiClient.get(`/consultation-notes/encounter/${encounterId}`);
  return Promise.resolve({ data: null }); // Return a promise that resolves to null or empty
};

export const saveOrUpdateConsultationNote = (noteData) => {
  console.warn("consultationNoteService.saveOrUpdateConsultationNote not fully implemented.");
  // if (noteData.id) {
  //     return apiClient.put(`/consultation-notes/${noteData.id}`, noteData);
  // } else {
  //     return apiClient.post('/consultation-notes', noteData);
  // }
  return Promise.resolve({ data: noteData });
};