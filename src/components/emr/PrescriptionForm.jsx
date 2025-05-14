// src/components/emr/PrescriptionForm.jsx
import React, { useState, useEffect } from 'react';
import { searchMedicationsForSelect } from '../../services/prescriptionService'; // Assuming this service exists
import AsyncSelect from 'react-select/async'; // For medication search
import './Forms.css'; // Reuse generic EMR form CSS
import './PrescriptionForm.css'; // Specific styles

// Props:
// - encounterId: (required)
// - initialData: (optional) for editing an existing prescription
// - onSubmit: function to call when form is submitted
// - onCancel: function to call
// - isLoading: boolean to disable form
// - serverError: string for server errors

function PrescriptionForm({ encounterId, initialData, onSubmit, onCancel, isLoading, serverError }) {
  const defaultPrescriptionDate = new Date().toISOString().split('T')[0];
  const [prescriptionDate, setPrescriptionDate] = useState(defaultPrescriptionDate);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { medicationId: '', medicationName: '', dosage: '', frequency: '', duration: '', route: '', instructions: '' }
  ]);

  useEffect(() => {
    if (initialData) {
      setPrescriptionDate(initialData.prescriptionDate ? new Date(initialData.prescriptionDate).toISOString().split('T')[0] : defaultPrescriptionDate);
      setNotes(initialData.notes || '');
      setItems(initialData.items?.map(item => ({
        medicationId: item.medicationId || '',
        medicationName: item.medicationName || '', // Important for AsyncSelect display
        dosage: item.dosage || '',
        frequency: item.frequency || '',
        duration: item.duration || '',
        route: item.route || '',
        instructions: item.instructions || '',
      })) || [{ medicationId: '', medicationName: '', dosage: '', frequency: '', duration: '', route: '', instructions: '' }]);
    } else {
      // Reset for new prescription
      setPrescriptionDate(defaultPrescriptionDate);
      setNotes('');
      setItems([{ medicationId: '', medicationName: '', dosage: '', frequency: '', duration: '', route: '', instructions: '' }]);
    }
  }, [initialData, defaultPrescriptionDate]);

  const handleItemChange = (index, event) => {
    const { name, value } = event.target;
    const newItems = [...items];
    newItems[index][name] = value;
    setItems(newItems);
  };

  const handleMedicationSelect = (index, selectedOption) => {
    const newItems = [...items];
    if (selectedOption) {
        newItems[index].medicationId = selectedOption.value;
        newItems[index].medicationName = selectedOption.label; // Store name for display/initial value
    } else {
        newItems[index].medicationId = '';
        newItems[index].medicationName = '';
    }
    setItems(newItems);
  };


  const addItem = () => {
    setItems([...items, { medicationId: '', medicationName: '', dosage: '', frequency: '', duration: '', route: '', instructions: '' }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return; // Always keep at least one item row
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = items.filter(item => item.medicationId && item.dosage && item.frequency);
    if (validItems.length === 0) {
        alert("Please add at least one valid medication with dosage and frequency.");
        return;
    }
    const prescriptionData = {
      encounterId: parseInt(encounterId, 10),
      prescriptionDate,
      notes,
      items: validItems.map(item => ({ // Send only necessary fields to backend DTO
          medicationId: parseInt(item.medicationId, 10),
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          route: item.route,
          instructions: item.instructions
      })),
    };
    if (initialData && initialData.id) { // If editing, include prescription ID
        prescriptionData.id = initialData.id;
    }
    onSubmit(prescriptionData);
  };

  const loadMedicationOptions = (inputValue, callback) => {
    if (!inputValue || inputValue.length < 2) { // Start searching after 2 characters
      callback([]);
      return;
    }
    searchMedicationsForSelect(inputValue)
      .then(options => callback(options))
      .catch(() => callback([]));
  };

  return (
    <form onSubmit={handleSubmit} className="emr-form prescription-form">
      {serverError && <p className="error-message form-server-error">{serverError}</p>}
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="prescriptionDate">Prescription Date <span className="required">*</span></label>
          <input
            type="date"
            id="prescriptionDate"
            name="prescriptionDate"
            value={prescriptionDate}
            onChange={(e) => setPrescriptionDate(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="notes">General Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows="2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <h4>Medications</h4>
      {items.map((item, index) => (
        <div key={index} className="prescription-item-row">
          <div className="form-group item-medication">
            <label htmlFor={`medicationId-${index}`}>Medication <span className="required">*</span></label>
            <AsyncSelect
                id={`medicationId-${index}`}
                cacheOptions
                loadOptions={loadMedicationOptions}
                defaultOptions // Load some default options on focus or initial load if desired
                value={item.medicationId ? { value: item.medicationId, label: item.medicationName } : null}
                onChange={(selectedOption) => handleMedicationSelect(index, selectedOption)}
                placeholder="Search for medication..."
                isDisabled={isLoading}
                isClearable
            />
             {/* Hidden input to help with form structure if needed, or rely on state */}
             <input type="hidden" name="medicationId" value={item.medicationId} />
          </div>
          <div className="form-group item-dosage">
            <label htmlFor={`dosage-${index}`}>Dosage <span className="required">*</span></label>
            <input type="text" id={`dosage-${index}`} name="dosage" value={item.dosage} onChange={(e) => handleItemChange(index, e)} disabled={isLoading} required />
          </div>
          <div className="form-group item-frequency">
            <label htmlFor={`frequency-${index}`}>Frequency <span className="required">*</span></label>
            <input type="text" id={`frequency-${index}`} name="frequency" value={item.frequency} onChange={(e) => handleItemChange(index, e)} disabled={isLoading} required />
          </div>
          <div className="form-group item-duration">
            <label htmlFor={`duration-${index}`}>Duration</label>
            <input type="text" id={`duration-${index}`} name="duration" value={item.duration} onChange={(e) => handleItemChange(index, e)} disabled={isLoading} />
          </div>
          <div className="form-group item-route">
            <label htmlFor={`route-${index}`}>Route</label>
            <input type="text" id={`route-${index}`} name="route" value={item.route} onChange={(e) => handleItemChange(index, e)} disabled={isLoading} />
          </div>
          <div className="form-group item-instructions full-width-item">
            <label htmlFor={`instructions-${index}`}>Instructions</label>
            <textarea id={`instructions-${index}`} name="instructions" rows="1" value={item.instructions} onChange={(e) => handleItemChange(index, e)} disabled={isLoading}></textarea>
          </div>
          <div className="item-actions">
            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(index)} className="button-danger-small" disabled={isLoading}>Remove</button>
            )}
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem} className="button-add-item" disabled={isLoading}>+ Add Medication</button>

      <div className="form-actions">
        <button type="submit" className="button-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : (initialData ? 'Update Prescription' : 'Save Prescription')}
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

export default PrescriptionForm;