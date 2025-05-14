// src/components/emr/LabOrderForm.jsx
import React, { useState, useEffect } from 'react';
import { searchLabTestsForSelect } from '../../services/labOrderService';
import AsyncSelect from 'react-select/async';
import './Forms.css'; // Reuse generic EMR form CSS
import './LabOrderForm.css'; // Specific styles

// Props:
// - encounterId: (required)
// - initialData: (optional) for viewing/editing (though adding items to existing orders might be complex)
// - onSubmit: function to call when form is submitted
// - onCancel: function to call
// - isLoading: boolean to disable form
// - serverError: string for server errors

function LabOrderForm({ encounterId, initialData, onSubmit, onCancel, isLoading, serverError }) {
  const defaultOrderDatetime = new Date().toISOString().slice(0, 16);
  const [orderDatetime, setOrderDatetime] = useState(defaultOrderDatetime);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ labTestId: '', labTestName: '' /* other item fields if needed at creation */ }]);

  useEffect(() => {
    if (initialData) { // Typically for viewing, not direct editing of items via this form
      setOrderDatetime(initialData.orderDatetime ? new Date(initialData.orderDatetime).toISOString().slice(0, 16) : defaultOrderDatetime);
      setNotes(initialData.notes || '');
      setItems(initialData.items?.map(item => ({
        labTestId: item.labTestId || '',
        labTestName: item.labTestName || '', // For display/initial value
        // Result fields would be populated if viewing an existing order with results
        resultValue: item.resultValue || '',
        resultUnit: item.resultUnit || '',
        isAbnormal: item.isAbnormal || false,
        // ... other result fields
      })) || [{ labTestId: '', labTestName: '' }]);
    } else {
      setOrderDatetime(defaultOrderDatetime);
      setNotes('');
      setItems([{ labTestId: '', labTestName: '' }]);
    }
  }, [initialData, defaultOrderDatetime]);

  const handleItemChange = (index, event) => { // For any direct input fields on items, if any
    const { name, value } = event.target;
    const newItems = [...items];
    newItems[index][name] = value;
    setItems(newItems);
  };

  const handleLabTestSelect = (index, selectedOption) => {
    const newItems = [...items];
    if (selectedOption) {
        newItems[index].labTestId = selectedOption.value;
        newItems[index].labTestName = selectedOption.label;
    } else {
        newItems[index].labTestId = '';
        newItems[index].labTestName = '';
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { labTestId: '', labTestName: '' }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = items.filter(item => item.labTestId);
    if (validItems.length === 0) {
        alert("Please add at least one lab test to the order.");
        return;
    }
    const labOrderData = {
      encounterId: parseInt(encounterId, 10),
      orderDatetime,
      notes,
      items: validItems.map(item => ({
          labTestId: parseInt(item.labTestId, 10),
          // Other item fields if they are set at creation (usually not results)
      })),
    };
     if (initialData && initialData.id) { // If we were to support editing the top-level order details
        labOrderData.id = initialData.id;
    }
    onSubmit(labOrderData);
  };

  const loadLabTestOptions = (inputValue, callback) => {
    if (!inputValue || inputValue.length < 1) { // Search with at least 1 char or on focus
      // callback([]); // Or load some defaults initially
      // return;
    }
    searchLabTestsForSelect(inputValue)
      .then(options => callback(options))
      .catch(() => callback([]));
  };

  return (
    <form onSubmit={handleSubmit} className="emr-form lab-order-form">
      {serverError && <p className="error-message form-server-error">{serverError}</p>}
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="orderDatetime">Order Date & Time <span className="required">*</span></label>
          <input
            type="datetime-local"
            id="orderDatetime"
            name="orderDatetime"
            value={orderDatetime}
            onChange={(e) => setOrderDatetime(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Order Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows="2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <h4>Lab Tests to Order</h4>
      {items.map((item, index) => (
        <div key={index} className="lab-order-item-row"> {/* Similar to prescription-item-row */}
          <div className="form-group item-lab-test">
            <label htmlFor={`labTestId-${index}`}>Lab Test <span className="required">*</span></label>
            <AsyncSelect
                id={`labTestId-${index}`}
                cacheOptions
                loadOptions={loadLabTestOptions}
                defaultOptions // Consider loading some common tests by default
                value={item.labTestId ? { value: item.labTestId, label: item.labTestName } : null}
                onChange={(selectedOption) => handleLabTestSelect(index, selectedOption)}
                placeholder="Search for lab test..."
                isDisabled={isLoading}
                isClearable
            />
            <input type="hidden" name="labTestId" value={item.labTestId} />
          </div>
          {/* Add other input fields per item if needed at creation time */}
          <div className="item-actions">
            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(index)} className="button-danger-small" disabled={isLoading}>Remove Test</button>
            )}
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem} className="button-add-item" disabled={isLoading}>+ Add Test</button>

      <div className="form-actions">
        <button type="submit" className="button-primary" disabled={isLoading}>
          {isLoading ? 'Submitting...' : (initialData ? 'Update Order' : 'Submit Lab Order')}
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

export default LabOrderForm;