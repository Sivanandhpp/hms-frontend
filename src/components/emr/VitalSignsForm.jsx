// src/components/emr/VitalSignsForm.jsx
import React, { useState, useEffect } from 'react';
import './Forms.css'; // Reuse the generic EMR form CSS

// Props:
// - encounterId: (required) to associate vitals with an encounter
// - initialData: (optional) for editing, though vitals are often append-only
// - onSubmit: function to call when form is submitted
// - isLoading: boolean to disable form
// - serverError: string for server errors

function VitalSignsForm({ encounterId, initialData, onSubmit, isLoading, serverError }) {
  const defaultTime = new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
  const [formData, setFormData] = useState({
    encounterId: encounterId || '',
    recordedAt: defaultTime,
    temperatureCelsius: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRateBpm: '',
    respiratoryRateRpm: '',
    spo2Percentage: '',
    heightCm: '',
    weightKg: '',
    // bmi: '', // BMI is typically calculated, not directly input
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        encounterId: initialData.encounterId || encounterId || '',
        recordedAt: initialData.recordedAt ? new Date(initialData.recordedAt).toISOString().slice(0, 16) : defaultTime,
        temperatureCelsius: initialData.temperatureCelsius || '',
        bloodPressureSystolic: initialData.bloodPressureSystolic || '',
        bloodPressureDiastolic: initialData.bloodPressureDiastolic || '',
        heartRateBpm: initialData.heartRateBpm || '',
        respiratoryRateRpm: initialData.respiratoryRateRpm || '',
        spo2Percentage: initialData.spo2Percentage || '',
        heightCm: initialData.heightCm || '',
        weightKg: initialData.weightKg || '',
        notes: initialData.notes || '',
      });
    } else {
      // Reset or set default for new entry, ensuring encounterId is passed
      setFormData(prev => ({
        ...prev,
        encounterId: encounterId || '',
        recordedAt: defaultTime, // Reset time for new entry
        // Reset other fields if needed when switching from edit to add
      }));
    }
  }, [initialData, encounterId, defaultTime]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add any client-side validation if necessary
    const submissionData = {
        ...formData,
        // Convert numeric fields from string to number if backend expects numbers
        // and they are not empty strings
        temperatureCelsius: formData.temperatureCelsius ? parseFloat(formData.temperatureCelsius) : null,
        bloodPressureSystolic: formData.bloodPressureSystolic ? parseInt(formData.bloodPressureSystolic) : null,
        bloodPressureDiastolic: formData.bloodPressureDiastolic ? parseInt(formData.bloodPressureDiastolic) : null,
        heartRateBpm: formData.heartRateBpm ? parseInt(formData.heartRateBpm) : null,
        respiratoryRateRpm: formData.respiratoryRateRpm ? parseInt(formData.respiratoryRateRpm) : null,
        spo2Percentage: formData.spo2Percentage ? parseInt(formData.spo2Percentage) : null,
        heightCm: formData.heightCm ? parseFloat(formData.heightCm) : null,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
    };
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="emr-form vital-signs-form">
      {serverError && <p className="error-message form-server-error">{serverError}</p>}

      <input type="hidden" name="encounterId" value={formData.encounterId} />

      <div className="form-group">
        <label htmlFor="recordedAt">Recorded At <span className="required">*</span></label>
        <input
          type="datetime-local"
          id="recordedAt"
          name="recordedAt"
          value={formData.recordedAt}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="temperatureCelsius">Temperature (°C)</label>
          <input type="number" step="0.1" id="temperatureCelsius" name="temperatureCelsius" value={formData.temperatureCelsius} onChange={handleChange} disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="heartRateBpm">Heart Rate (bpm)</label>
          <input type="number" id="heartRateBpm" name="heartRateBpm" value={formData.heartRateBpm} onChange={handleChange} disabled={isLoading} />
        </div>
      </div>

      <div className="form-row">
         <div className="form-group">
          <label htmlFor="bloodPressureSystolic">BP Systolic (mmHg)</label>
          <input type="number" id="bloodPressureSystolic" name="bloodPressureSystolic" value={formData.bloodPressureSystolic} onChange={handleChange} disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="bloodPressureDiastolic">BP Diastolic (mmHg)</label>
          <input type="number" id="bloodPressureDiastolic" name="bloodPressureDiastolic" value={formData.bloodPressureDiastolic} onChange={handleChange} disabled={isLoading} />
        </div>
      </div>


      <div className="form-row">
        <div className="form-group">
          <label htmlFor="respiratoryRateRpm">Respiratory Rate (rpm)</label>
          <input type="number" id="respiratoryRateRpm" name="respiratoryRateRpm" value={formData.respiratoryRateRpm} onChange={handleChange} disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="spo2Percentage">SpO2 (%)</label>
          <input type="number" id="spo2Percentage" name="spo2Percentage" min="0" max="100" value={formData.spo2Percentage} onChange={handleChange} disabled={isLoading} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="heightCm">Height (cm)</label>
          <input type="number" step="0.1" id="heightCm" name="heightCm" value={formData.heightCm} onChange={handleChange} disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="weightKg">Weight (kg)</label>
          <input type="number" step="0.1" id="weightKg" name="weightKg" value={formData.weightKg} onChange={handleChange} disabled={isLoading} />
        </div>
      </div>
      {/* BMI is usually calculated, so not an input field here */}

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows="3"
          value={formData.notes}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="button-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Record Vitals'}
        </button>
      </div>
    </form>
  );
}

export default VitalSignsForm;