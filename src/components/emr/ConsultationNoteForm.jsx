// src/components/emr/ConsultationNoteForm.jsx
import React, { useState, useEffect } from 'react';
import './Forms.css'; // We can create a generic EMR form CSS

// Props:
// - initialData: object containing existing note data (for editing)
// - onSubmit: function to call when form is submitted
// - onCancel: function to call if there's a cancel action
// - isLoading: boolean to disable form during submission
// - serverError: string for displaying errors from the server

function ConsultationNoteForm({ initialData, onSubmit, onCancel, isLoading, serverError }) {
  const [formData, setFormData] = useState({
    symptoms: '',
    observations: '',
    assessment: '',
    treatmentPlan: '',
    followUpInstructions: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        symptoms: initialData.symptoms || '',
        observations: initialData.observations || '',
        assessment: initialData.assessment || '',
        treatmentPlan: initialData.treatmentPlan || '',
        followUpInstructions: initialData.followUpInstructions || '',
      });
    } else {
      // Reset form if no initial data (e.g., for adding new)
      setFormData({
        symptoms: '', observations: '', assessment: '',
        treatmentPlan: '', followUpInstructions: '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation can be added here if needed, though backend handles primary validation
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="emr-form consultation-note-form">
      {serverError && <p className="error-message form-server-error">{serverError}</p>}

      <div className="form-group">
        <label htmlFor="symptoms">Symptoms</label>
        <textarea
          id="symptoms"
          name="symptoms"
          rows="4"
          value={formData.symptoms}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="observations">Observations</label>
        <textarea
          id="observations"
          name="observations"
          rows="4"
          value={formData.observations}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="assessment">Assessment</label>
        <textarea
          id="assessment"
          name="assessment"
          rows="4"
          value={formData.assessment}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="treatmentPlan">Treatment Plan</label>
        <textarea
          id="treatmentPlan"
          name="treatmentPlan"
          rows="4"
          value={formData.treatmentPlan}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="followUpInstructions">Follow-up Instructions</label>
        <textarea
          id="followUpInstructions"
          name="followUpInstructions"
          rows="3"
          value={formData.followUpInstructions}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="button-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : (initialData ? 'Update Note' : 'Save Note')}
        </button>
        {onCancel && (
          <button type="button" className="button-secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default ConsultationNoteForm;