// src/pages/AppointmentListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllAppointments,
  getAppointmentsByPatientId, // if we want to filter by patient
  getAppointmentsByDoctorId,  // if we want to filter by doctor
  cancelAppointment
} from '../services/appointmentService';
import { useAuth } from '../contexts/AuthContext'; // To get current user roles/ID if needed
import './AppointmentListPage.css'; // We'll create this

function AppointmentListPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // const { user } = useAuth(); // Get current user for role-based fetching later

  // For simplicity, fetching all appointments for now.
  // In a real app, you'd filter by date, doctor, patient, or status.
  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      // TODO: Implement role-based fetching or filters
      // For example, if user is DOCTOR, fetch only their appointments
      // if (user && user.roles.includes('ROLE_DOCTOR') && user.doctorId) {
      //   const response = await getAppointmentsByDoctorId(user.doctorId);
      //   setAppointments(response.data);
      // } else if (user && user.roles.includes('ROLE_PATIENT') && user.patientId) {
      //   const response = await getAppointmentsByPatientId(user.patientId);
      //   setAppointments(response.data);
      // } else {
        const response = await getAllAppointments(); // Admin/Receptionist might see all
        setAppointments(response.data);
      // }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []); // Re-fetch if user changes, or add other dependencies for filters

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
        try {
            await cancelAppointment(appointmentId);
            alert('Appointment cancelled successfully.');
            // Refetch appointments to update the list
            fetchAppointments();
        } catch (err) {
            console.error("Error cancelling appointment:", err);
            alert(err.response?.data?.message || 'Failed to cancel appointment.');
        }
    }
  };


  if (loading) {
    return <div className="loading-message">Loading appointments...</div>;
  }

  if (error) {
    return <div className="error-message page-error">{error}</div>;
  }

  return (
    <div className="appointment-list-container">
      <div className="page-header">
        <h1>Appointments Schedule</h1>
        <Link to="/appointments/new" className="add-appointment-button">Schedule New Appointment</Link>
      </div>

      {/* TODO: Add filter controls (by date, doctor, patient, status) here */}

      {appointments.length === 0 && !loading && (
        <p className="no-appointments-message">No appointments found.</p>
      )}

      {appointments.length > 0 && (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date & Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id}>
                <td>{appt.id}</td>
                <td>{appt.patientFirstName} {appt.patientLastName} (ID: {appt.patientId})</td>
                <td>Dr. {appt.doctorFirstName} {appt.doctorLastName} (ID: {appt.doctorId})</td>
                <td>{new Date(appt.appointmentDatetime).toLocaleString()}</td>
                <td>{appt.reasonForVisit || 'N/A'}</td>
                <td className={`status-${appt.status?.toLowerCase()}`}>{appt.status}</td>
                <td>
                  <Link to={`/appointments/${appt.id}`} className="action-link view-link">View</Link>
                  <Link to={`/appointments/edit/${appt.id}`} className="action-link edit-link">Reschedule</Link>
                  {/* Only allow cancel if status is appropriate e.g. SCHEDULED or RESCHEDULED */}
                  {(appt.status === 'SCHEDULED' || appt.status === 'RESCHEDULED') && (
                    <button onClick={() => handleCancelAppointment(appt.id)} className="action-link delete-link">
                        Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AppointmentListPage;