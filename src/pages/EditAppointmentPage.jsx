// src/pages/EditAppointmentPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAppointmentById, rescheduleAppointment, getDoctorsForSelect, getPatientsForSelect } from '../services/appointmentService';
import './EditAppointmentPage.css'; // We'll create this (can be similar to AddAppointmentPage.css)

function EditAppointmentPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDatetime: '',
    reasonForVisit: '',
    notes: '',
    // status: '', // Status is usually updated via specific actions, not direct edit here
  });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // For form submission
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsFetchingData(true);
      setServerError('');
      try {
        const [appointmentRes, doctorsRes, patientsRes] = await Promise.all([
          getAppointmentById(appointmentId),
          getDoctorsForSelect(),
          getPatientsForSelect()
        ]);
        
        const apptData = appointmentRes.data;
        // Format datetime-local which expects 'YYYY-MM-DDTHH:mm'
        const formattedDatetime = apptData.appointmentDatetime
          ? new Date(apptData.appointmentDatetime).toISOString().slice(0, 16)
          : '';

        setFormData({
          patientId: apptData.patientId,
          doctorId: apptData.doctorId,
          appointmentDatetime: formattedDatetime,
          reasonForVisit: apptData.reasonForVisit || '',
          notes: apptData.notes || '',
        });
        setDoctors(doctorsRes);
        setPatients(patientsRes);

      } catch (err) {
        console.error('Error fetching data for edit appointment:', err);
        setServerError(err.response?.data?.message || err.message || 'Failed to load appointment data.');
      } finally {
        setIsFetchingData(false);
      }
    };

    if (appointmentId) {
      fetchInitialData();
    }
  }, [appointmentId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError('');

    if (!formData.patientId || !formData.doctorId || !formData.appointmentDatetime) {
        setServerError('Patient, Doctor, and Appointment Date/Time are required.');
        setIsLoading(false);
        return;
    }

    // The rescheduleAppointment service expects the DTO structure
    // Ensure patientId and doctorId are numbers if they are strings from the form
    const submissionData = {
        ...formData,
        patientId: parseInt(formData.patientId, 10),
        doctorId: parseInt(formData.doctorId, 10),
    };

    try {
      await rescheduleAppointment(appointmentId, submissionData);
      alert('Appointment rescheduled successfully!');
      navigate(`/appointments/${appointmentId}`); // Go to details page of the rescheduled appointment
    } catch (err) {
      console.error('Error rescheduling appointment:', err.response?.data || err.message);
      let errorMessage = 'Failed to reschedule appointment. Please try again.';
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

  if (isFetchingData) {
    return <div className="loading-message">Loading appointment data for rescheduling...</div>;
  }

  if (serverError && !formData.patientId) { // If initial fetch failed critically
      return <div className="error-message page-error">{serverError}</div>;
  }

  return (
    <div className="edit-appointment-page-container">
      <div className="page-header">
        <h1>Reschedule Appointment (ID: {appointmentId})</h1>
      </div>
      <form onSubmit={handleSubmit} className="appointment-form"> {/* Reuse appointment-form class */}
        {serverError && <p className="error-message form-server-error">{serverError}</p>}

        <div className="form-group">
          <label htmlFor="patientId">Patient <span className="required">*</span></label>
          <select
            id="patientId"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required
            disabled={isLoading || isFetchingData} // Disable if fetching or submitting
          >
            <option value="">Select Patient</option>
            {patients.map(patient => (
              <option key={patient.value} value={patient.value}>{patient.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="doctorId">Doctor <span className="required">*</span></label>
          <select
            id="doctorId"
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            required
            disabled={isLoading || isFetchingData}
          >
            <option value="">Select Doctor</option>
            {doctors.map(doctor => (
              <option key={doctor.value} value={doctor.value}>{doctor.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="appointmentDatetime">New Date & Time <span className="required">*</span></label>
          <input
            type="datetime-local"
            id="appointmentDatetime"
            name="appointmentDatetime"
            value={formData.appointmentDatetime}
            onChange={handleChange}
            required
            disabled={isLoading || isFetchingData}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="reasonForVisit">Reason for Visit</label>
          <textarea
            id="reasonForVisit"
            name="reasonForVisit"
            rows="3"
            value={formData.reasonForVisit}
            onChange={handleChange}
            disabled={isLoading || isFetchingData}
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            rows="2"
            value={formData.notes}
            onChange={handleChange}
            disabled={isLoading || isFetchingData}
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="button-primary" disabled={isLoading || isFetchingData}>
            {isLoading ? 'Rescheduling...' : 'Reschedule Appointment'}
          </button>
          <button type="button" className="button-secondary" onClick={() => navigate(`/appointments/${appointmentId}`)} disabled={isLoading || isFetchingData}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditAppointmentPage;