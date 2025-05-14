// src/components/emr/DiagnosisForm.jsx
import React, { useState, useEffect } from 'react';
import './Forms.css'; // Reuse generic EMR form CSS

// Props:
// - encounterId: (required)
// - initialData: (optional) for editing
// - onSubmit: function to call when form is submitted
// - isLoading: boolean to disable form
// - serverError: string for server errors

function DiagnosisForm({ encounterId, initialData, onSubmit, isLoading, serverError }) {
  const defaultDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const [formData, setFormData] = useState({
    encounterId: encounterId || '',
    diagnosisCodeSystem: 'ICD-10',
    diagnosisCode: '',
    description: '',
    diagnosisDate: defaultDate,
    isChronic: false,
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        encounterId: initialData.encounterId || encounterId || '',
        diagnosisCodeSystem: initialData.diagnosisCodeSystem || 'ICD-10',
        diagnosisCode: initialData.diagnosisCode || '',
        description: initialData.description || '',
        diagnosisDate: initialData.diagnosisDate ? new Date(initialData.diagnosisDate).toISOString().split('T')[0] : defaultDate,
        isChronic: initialData.isChronic || false,
        notes: initialData.notes || '',
      });
    } else {
      setFormData(prev => ({
        ...prev, // Keep other defaults like code system
        encounterId: encounterId || '',
        diagnosisCode: '',
        description: '',
        diagnosisDate: defaultDate,
        isChronic: false,
        notes: '',
      }));
    }
  }, [initialData, encounterId, defaultDate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic client-side validation
    if (!formData.diagnosisCode.trim() || !formData.description.trim()) {
        alert("Diagnosis Code and Description are required.");
        return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="emr-form diagnosis-form">
      {serverError && <p className="error-message form-server-error">{serverError}</p>}
      <input type="hidden" name="encounterId" value={formData.encounterId} />

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="diagnosisCodeSystem">Code System</label>
          <input
            type="text"
            id="diagnosisCodeSystem"
            name="diagnosisCodeSystem"
            value={formData.diagnosisCodeSystem}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="e.g., ICD-10, SNOMED CT"
          />
        </div>
        <div className="form-group">
          <label htmlFor="diagnosisCode">Diagnosis Code <span className="required">*</span></label>
          <input
            type="text"
            id="diagnosisCode"
            name="diagnosisCode"
            value={formData.diagnosisCode}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description <span className="required">*</span></label>
        <textarea
          id="description"
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="diagnosisDate">Diagnosis Date <span className="required">*</span></label>
          <input
            type="date"
            id="diagnosisDate"
            name="diagnosisDate"
            value={formData.diagnosisDate}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="isChronic"
            name="isChronic"
            checked={formData.isChronic}
            onChange={handleChange}
            disabled={isLoading}
          />
          <label htmlFor="isChronic" className="checkbox-label">Is Chronic?</label>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows="2"
          value={formData.notes}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="button-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : (initialData ? 'Update Diagnosis' : 'Add Diagnosis')}
        </button>
      </div>
    </form>
  );
}

export default DiagnosisForm;