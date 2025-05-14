// src/pages/ManageLabOrdersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getLabOrdersByEncounterId,
  createLabOrder,
  updateLabOrderStatus,
  updateLabOrderItemResult
} from '../services/labOrderService';
import { getEncounterById } from '../services/encounterService';
import LabOrderForm from '../components/emr/LabOrderForm';
import LabResultModal from '../components/emr/LabResultModal'; // We will create this
import './ManagePages.css';
import './ManageLabOrdersPage.css';

function ManageLabOrdersPage() {
  const { encounterId } = useParams();
  const navigate = useNavigate();

  const [encounter, setEncounter] = useState(null);
  const [labOrdersList, setLabOrdersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // For form submission
  const [isFetching, setIsFetching] = useState(true);
  const [serverError, setServerError] = useState('');
  const [formError, setFormError] = useState('');

  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [editingResultItem, setEditingResultItem] = useState(null); // { labOrderId, item }

  const fetchLabOrdersAndEncounter = useCallback(async () => {
    setIsFetching(true);
    setServerError('');
    try {
      const [encounterRes, ordersRes] = await Promise.all([
        getEncounterById(encounterId),
        getLabOrdersByEncounterId(encounterId)
      ]);
      setEncounter(encounterRes.data);
      setLabOrdersList(ordersRes.data);
    } catch (err) {
      console.error('Error fetching data for lab orders:', err);
      setServerError(err.response?.data?.message || err.message || 'Failed to load lab order data.');
    } finally {
      setIsFetching(false);
    }
  }, [encounterId]);

  useEffect(() => {
    if (encounterId) {
      fetchLabOrdersAndEncounter();
    }
  }, [encounterId, fetchLabOrdersAndEncounter]);

  const handleCreateOrderSubmit = async (orderData) => {
    setIsLoading(true);
    setFormError('');
    try {
      await createLabOrder(orderData);
      alert('Lab order created successfully!');
      setShowNewOrderForm(false); // Hide form
      fetchLabOrdersAndEncounter(); // Refresh list
    } catch (err) {
      console.error('Error creating lab order:', err.response?.data || err.message);
      let errorMessage = 'Failed to create lab order.';
       if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') errorMessage = err.response.data;
        else if (err.response.data.message) errorMessage = err.response.data.message;
        else if (typeof err.response.data === 'object') {
            const fieldErrors = Object.values(err.response.data).join(', ');
            if (fieldErrors) errorMessage = fieldErrors;
        }
      }
      setFormError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateOrderStatus = async (labOrderId, newStatus) => {
      if (!window.confirm(`Are you sure you want to update order ${labOrderId} status to ${newStatus}?`)) return;
      try {
          await updateLabOrderStatus(labOrderId, newStatus);
          alert(`Order ${labOrderId} status updated to ${newStatus}.`);
          fetchLabOrdersAndEncounter();
      } catch (err) {
          alert(`Failed to update order status: ${err.response?.data?.message || err.message}`);
      }
  };

  const handleOpenResultModal = (labOrderId, item) => {
    setEditingResultItem({ labOrderId, item });
  };

  const handleSaveResult = async (resultData) => {
    if (!editingResultItem) return;
    setIsLoading(true); // Use general loading for modal submit
    setFormError(''); // Clear form error for modal
    try {
      await updateLabOrderItemResult(editingResultItem.labOrderId, editingResultItem.item.id, resultData);
      alert('Lab result saved successfully!');
      setEditingResultItem(null); // Close modal
      fetchLabOrdersAndEncounter(); // Refresh list
    } catch (err) {
      console.error('Error saving lab result:', err.response?.data || err.message);
      // Error display within the modal is better, or set a general error.
      // For now, simple alert.
      alert(`Failed to save result: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };


  if (isFetching) {
    return <div className="loading-message">Loading lab order data...</div>;
  }

  if (serverError && !encounter) {
    return <div className="error-message page-error">{serverError}</div>;
  }

  return (
    <div className="manage-emr-page-container lab-orders-manage-page">
      <div className="page-header">
        <h1>Manage Lab Orders</h1>
        {encounter && (
          <p className="encounter-context-info">
            For Encounter ID: {encounter.id} (Patient: {encounter.patientFullName}, Date: {new Date(encounter.encounterDatetime).toLocaleDateString()})
          </p>
        )}
      </div>
      <Link to={`/encounters/${encounterId}`} className="back-link">Back to Encounter Details</Link>

      <button onClick={() => setShowNewOrderForm(!showNewOrderForm)} className="button-primary toggle-form-button">
        {showNewOrderForm ? 'Hide New Order Form' : '+ Create New Lab Order'}
      </button>

      {showNewOrderForm && (
        <div id="lab-order-form-section" className="emr-form-section">
          <h2>New Lab Order</h2>
          <LabOrderForm
            encounterId={parseInt(encounterId, 10)}
            onSubmit={handleCreateOrderSubmit}
            onCancel={() => setShowNewOrderForm(false)}
            isLoading={isLoading}
            serverError={formError}
          />
        </div>
      )}

      <div className="emr-list-section">
        <h2>Existing Lab Orders</h2>
        {serverError && labOrdersList.length === 0 && <p className="error-message">{serverError}</p>}
        {labOrdersList.length === 0 && !isFetching && !serverError && (
          <p className="info-message">No lab orders found for this encounter yet.</p>
        )}
        {labOrdersList.length > 0 && (
          <div className="lab-orders-list">
            {labOrdersList.map(order => (
              <div key={order.id} className="lab-order-card">
                <div className="lab-order-header">
                  <h3>Order ID: {order.id} <span className={`status-badge status-${order.status?.toLowerCase()}`}>{order.status}</span></h3>
                  <p>Ordered: {new Date(order.orderDatetime).toLocaleString()}</p>
                   {order.notes && <p className="order-notes">Notes: {order.notes}</p>}
                </div>
                <table className="lab-order-items-table">
                  <thead>
                    <tr>
                      <th>Test Name</th>
                      <th>Result</th>
                      <th>Unit</th>
                      <th>Normal Range</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item.id} className={item.isAbnormal ? 'abnormal-result' : ''}>
                        <td>{item.labTestName}</td>
                        <td>{item.resultValue || 'Pending'}</td>
                        <td>{item.resultUnit || 'N/A'}</td>
                        <td>{item.labTest?.normalRange || 'N/A'}</td>
                        <td>{item.resultValue ? 'Completed' : 'Pending'}</td>
                        <td>
                          <button 
                            onClick={() => handleOpenResultModal(order.id, item)} 
                            className="action-link result-link"
                            disabled={isLoading}
                          >
                            {item.resultValue ? 'View/Edit Result' : 'Add Result'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="order-actions">
                    {/* Example status update buttons */}
                    {order.status === 'ORDERED' && 
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'SAMPLE_COLLECTED')} className="button-small">Mark Sample Collected</button>}
                    {order.status === 'SAMPLE_COLLECTED' && 
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'IN_PROGRESS')} className="button-small">Mark In Progress</button>}
                     {/* More status updates as needed */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {editingResultItem && (
        <LabResultModal
          isOpen={!!editingResultItem}
          onClose={() => setEditingResultItem(null)}
          item={editingResultItem.item}
          labOrderId={editingResultItem.labOrderId}
          onSave={handleSaveResult}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default ManageLabOrdersPage;