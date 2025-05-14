// src/pages/AppointmentDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAppointmentById, cancelAppointment, updateAppointmentStatus } from '../services/appointmentService';
import './AppointmentDetailsPage.css'; // We'll create this CSS

function AppointmentDetailsPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getAppointmentById(appointmentId);
        setAppointment(response.data);
      } catch (err) {
        console.error("Error fetching appointment details:", err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch appointment details.');
        if (err.response?.status === 404) {
            setError(`Appointment with ID ${appointmentId} not found.`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId]);

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      setActionLoading(true);
      setError('');
      try {
        await cancelAppointment(appointmentId);
        alert('Appointment cancelled successfully.');
        // Option 1: Navigate back to list
        // navigate('/appointments');
        // Option 2: Update current page's appointment status
        setAppointment(prev => ({ ...prev, status: 'CANCELLED' }));
      } catch (err) {
        console.error("Error cancelling appointment:", err);
        setError(err.response?.data?.message || 'Failed to cancel appointment.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleMarkAsCompleted = async () => {
    if (window.confirm('Are you sure you want to mark this appointment as completed?')) {
        setActionLoading(true);
        setError('');
        try {
            await updateAppointmentStatus(appointmentId, 'COMPLETED');
            alert('Appointment marked as completed.');
            setAppointment(prev => ({ ...prev, status: 'COMPLETED' }));
        } catch (err) {
            console.error("Error updating appointment status:", err);
            setError(err.response?.data?.message || 'Failed to update status.');
        } finally {
            setActionLoading(false);
        }
    }
  };


  if (loading && !appointment) { // Show loading only if appointment is not yet fetched
    return <div className="loading-message">Loading appointment details...</div>;
  }

  if (error && !appointment) { // Show error if initial fetch failed
    return <div className="error-message page-error">{error}</div>;
  }

  if (!appointment) {
    return <div className="info-message">No appointment data found.</div>;
  }

  const canCancel = appointment.status === 'SCHEDULED' || appointment.status === 'RESCHEDULED';
  const canComplete = appointment.status === 'SCHEDULED' || appointment.status === 'RESCHEDULED';


  return (
    <div className="appointment-details-container">
      <div className="page-header">
        <h1>Appointment Details (ID: {appointment.id})</h1>
        <div>
          <Link to={`/appointments/edit/${appointment.id}`} className="action-button edit">Reschedule</Link>
          {canComplete && (
            <button onClick={handleMarkAsCompleted} className="action-button complete" disabled={actionLoading}>
                {actionLoading ? 'Updating...' : 'Mark Completed'}
            </button>
          )}
          {canCancel && (
            <button onClick={handleCancel} className="action-button delete" disabled={actionLoading}>
              {actionLoading ? 'Cancelling...' : 'Cancel Appointment'}
            </button>
          )}
          <Link to="/appointments" className="action-button secondary">Back to List</Link>
        </div>
      </div>
      {error && <p className="error-message form-level-error">{error}</p>}


      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">Patient:</span>
          <span className="detail-value">
            <Link to={`/patients/${appointment.patientId}`}>
                {appointment.patientFirstName} {appointment.patientLastName} (ID: {appointment.patientId})
            </Link>
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Doctor:</span>
          <span className="detail-value">
            Dr. {appointment.doctorFirstName} {appointment.doctorLastName} (ID: {appointment.doctorId})
            {/* TODO: Link to doctor profile page if it exists */}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Date & Time:</span>
          <span className="detail-value">{new Date(appointment.appointmentDatetime).toLocaleString()}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Status:</span>
          <span className={`detail-value status-${appointment.status?.toLowerCase()}`}>{appointment.status}</span>
        </div>
        <div className="detail-item full-width">
          <span className="detail-label">Reason for Visit:</span>
          <span className="detail-value">{appointment.reasonForVisit || 'N/A'}</span>
        </div>
        <div className="detail-item full-width">
          <span className="detail-label">Notes:</span>
          <span className="detail-value">{appointment.notes || 'N/A'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Created At:</span>
          <span className="detail-value">{new Date(appointment.createdAt).toLocaleString()}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Last Updated:</span>
          <span className="detail-value">{appointment.updatedAt ? new Date(appointment.updatedAt).toLocaleString() : 'N/A'}</span>
        </div>
      </div>
      {/* Placeholder for linking to Encounter details if an encounter is created from this appointment */}
      {/* {appointment.status === 'COMPLETED' && (
          <div className="related-info-section">
              <h4>Encounter</h4>
              <p><Link to={`/encounters/appointment/${appointment.id}`}>View/Create Encounter Details</Link></p>
          </div>
      )} */}
    </div>
  );
}

export default AppointmentDetailsPage;