// src/components/emr/LabResultModal.jsx
import React, { useState, useEffect } from 'react';
import './Modal.css'; // Generic modal styles
import './Forms.css'; // Generic EMR form styles

function LabResultModal({ isOpen, onClose, item, labOrderId, onSave, isLoading }) {
  const [resultData, setResultData] = useState({
    resultValue: '',
    resultUnit: '',
    resultDatetime: new Date().toISOString().slice(0, 16),
    isAbnormal: false,
    technicianNotes: '',
    resultAttachmentPath: '', // For future file uploads
  });
  const [error, setError] = useState('');


  useEffect(() => {
    if (item) {
      setResultData({
        resultValue: item.resultValue || '',
        resultUnit: item.resultUnit || item.labTest?.unit || '', // Default to test's unit
        resultDatetime: item.resultDatetime ? new Date(item.resultDatetime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        isAbnormal: item.isAbnormal || false,
        technicianNotes: item.technicianNotes || '',
        resultAttachmentPath: item.resultAttachmentPath || '',
      });
    } else {
        // Reset if item becomes null (e.g. modal closed and re-opened for new item implicitly)
         setResultData({
            resultValue: '', resultUnit: '',
            resultDatetime: new Date().toISOString().slice(0, 16),
            isAbnormal: false, technicianNotes: '', resultAttachmentPath: ''
        });
    }
    setError(''); // Clear error when modal opens or item changes
  }, [item, isOpen]); // Depend on isOpen to reset/populate when modal visibility changes

  if (!isOpen || !item) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setResultData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!resultData.resultValue.trim()){
        setError("Result value is required.");
        return;
    }
    setError('');
    onSave(resultData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content emr-form lab-result-modal">
        <div className="modal-header">
          <h2>{item.resultValue ? 'Edit' : 'Add'} Lab Result for: {item.labTestName}</h2>
          <button onClick={onClose} className="modal-close-button">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message form-server-error">{error}</p>}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="resultValue">Result Value <span className="required">*</span></label>
              <input type="text" id="resultValue" name="resultValue" value={resultData.resultValue} onChange={handleChange} disabled={isLoading} required/>
            </div>
            <div className="form-group">
              <label htmlFor="resultUnit">Unit</label>
              <input type="text" id="resultUnit" name="resultUnit" value={resultData.resultUnit} onChange={handleChange} disabled={isLoading} placeholder={item.labTest?.unit || ''}/>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="resultDatetime">Result Date & Time <span className="required">*</span></label>
            <input type="datetime-local" id="resultDatetime" name="resultDatetime" value={resultData.resultDatetime} onChange={handleChange} disabled={isLoading} required/>
          </div>
          <div className="form-group checkbox-group">
            <input type="checkbox" id="isAbnormal" name="isAbnormal" checked={resultData.isAbnormal} onChange={handleChange} disabled={isLoading}/>
            <label htmlFor="isAbnormal" className="checkbox-label">Is Abnormal?</label>
          </div>
          <div className="form-group">
            <label htmlFor="technicianNotes">Technician Notes</label>
            <textarea id="technicianNotes" name="technicianNotes" rows="3" value={resultData.technicianNotes} onChange={handleChange} disabled={isLoading}></textarea>
          </div>
          {/* Placeholder for file upload for resultAttachmentPath */}
          {/* <div className="form-group">
            <label htmlFor="resultAttachmentPath">Attachment Path</label>
            <input type="text" id="resultAttachmentPath" name="resultAttachmentPath" value={resultData.resultAttachmentPath} onChange={handleChange} disabled={isLoading}/>
          </div> */}
          <div className="modal-actions form-actions">
            <button type="submit" className="button-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Result'}
            </button>
            <button type="button" className="button-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LabResultModal;