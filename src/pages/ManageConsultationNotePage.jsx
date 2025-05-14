// src/pages/ManageConsultationNotePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsultationNoteByEncounterId, saveOrUpdateConsultationNote } from '../services/consultationNoteService';
import { getEncounterById } from '../services/encounterService'; // To display encounter info
import ConsultationNoteForm from '../components/emr/ConsultationNoteForm';
import './ManagePages.css'; // Generic styling for manage pages

function ManageConsultationNotePage() {
  const { encounterId } = useParams();
  const navigate = useNavigate();

  const [encounter, setEncounter] = useState(null);
  const [initialNoteData, setInitialNoteData] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // For form submission
  const [isFetching, setIsFetching] = useState(true);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      setServerError('');
      try {
        const encounterRes = await getEncounterById(encounterId);
        setEncounter(encounterRes.data);

        // Try to fetch existing note, might be 404 if new
        try {
          const noteRes = await getConsultationNoteByEncounterId(encounterId);
          setInitialNoteData(noteRes.data);
        } catch (noteError) {
          if (noteError.response && noteError.response.status === 404) {
            // No existing note, this is fine, form will be for adding new
            setInitialNoteData(null); // Ensure it's explicitly null
          } else {
            // Other error fetching note
            throw noteError;
          }
        }
      } catch (err) {
        console.error('Error fetching data for consultation note:', err);
        setServerError(err.response?.data?.message || err.message || 'Failed to load data.');
      } finally {
        setIsFetching(false);
      }
    };

    if (encounterId) {
      fetchData();
    }
  }, [encounterId]);

  const handleSubmitNote = async (noteData) => {
    setIsLoading(true);
    setServerError('');
    const submissionData = {
      ...noteData,
      encounterId: parseInt(encounterId, 10), // Ensure encounterId is part of submission
      id: initialNoteData ? initialNoteData.id : null, // Include ID if updating
    };

    try {
      await saveOrUpdateConsultationNote(submissionData);
      alert('Consultation note saved successfully!');
      navigate(`/encounters/${encounterId}`); // Back to encounter details
    } catch (err) {
      console.error('Error saving consultation note:', err.response?.data || err.message);
      let errorMessage = 'Failed to save note. Please try again.';
       if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
        } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'object') {
            const fieldErrors = Object.values(err.response.data).join(', ');
            if (fieldErrors) errorMessage = fieldErrors;
        }
      }
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/encounters/${encounterId}`);
  };

  if (isFetching) {
    return <div className="loading-message">Loading consultation note data...</div>;
  }

  if (serverError && !encounter) { // Critical error fetching encounter
    return <div className="error-message page-error">{serverError}</div>;
  }
  
  return (
    <div className="manage-emr-page-container">
      <div className="page-header">
        <h1>{initialNoteData ? 'Edit' : 'Add'} Consultation Note</h1>
        {encounter && (
            <p className="encounter-context-info">
                For Encounter ID: {encounter.id} (Patient: {encounter.patientFullName}, Date: {new Date(encounter.encounterDatetime).toLocaleDateString()})
            </p>
        )}
      </div>
      {/* Display serverError related to form submission, not critical fetch error */}
      {/* serverError (from submit) will be passed to ConsultationNoteForm */}
      
      <ConsultationNoteForm
        initialData={initialNoteData}
        onSubmit={handleSubmitNote}
        onCancel={handleCancel}
        isLoading={isLoading}
        serverError={serverError}
      />
    </div>
  );
}

export default ManageConsultationNotePage;