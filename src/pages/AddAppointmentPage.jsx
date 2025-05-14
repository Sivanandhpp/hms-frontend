// src/pages/AddAppointmentPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAppointment, getDoctorsForSelect, getPatientsForSelect } from '../services/appointmentService';
import './AddAppointmentPage.css'; // We'll create this CSS

function AddAppointmentPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDatetime: '', // YYYY-MM-DDTHH:MM
    reasonForVisit: '',
    notes: '',
  });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSelectData, setIsFetchingSelectData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDropdownData = async () => {
      setIsFetchingSelectData(true);
      try {
        const [doctorsRes, patientsRes] = await Promise.all([
          getDoctorsForSelect(),
          getPatientsForSelect()
        ]);
        setDoctors(doctorsRes);
        setPatients(patientsRes);
      } catch (err) {
        console.error('Error fetching doctors/patients for dropdown:', err);
        setError('Could not load necessary data for scheduling.');
      } finally {
        setIsFetchingSelectData(false);
      }
    };
    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.patientId || !formData.doctorId || !formData.appointmentDatetime) {
        setError('Patient, Doctor, and Appointment Date/Time are required.');
        setIsLoading(false);
        return;
    }

    try {
      await createAppointment(formData);
      alert('Appointment scheduled successfully!');
      navigate('/appointments'); // Or to the details of this new appointment
    } catch (err) {
      console.error('Error scheduling appointment:', err.response?.data || err.message);
      let errorMessage = 'Failed to schedule appointment. Please try again.';
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
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingSelectData) {
    return <div className="loading-message">Loading scheduling data...</div>;
  }

  return (
    <div className="add-appointment-page-container">
      <div className="page-header">
        <h1>Schedule New Appointment</h1>
      </div>
      <form onSubmit={handleSubmit} className="appointment-form">
        {error && <p className="error-message form-server-error">{error}</p>}

        <div className="form-group">
          <label htmlFor="patientId">Patient <span className="required">*</span></label>
          <select
            id="patientId"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required
            disabled={isLoading}
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
            disabled={isLoading}
          >
            <option value="">Select Doctor</option>
            {doctors.map(doctor => (
              <option key={doctor.value} value={doctor.value}>{doctor.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="appointmentDatetime">Date & Time <span className="required">*</span></label>
          <input
            type="datetime-local"
            id="appointmentDatetime"
            name="appointmentDatetime"
            value={formData.appointmentDatetime}
            onChange={handleChange}
            required
            disabled={isLoading}
            min={new Date().toISOString().slice(0, 16)} // Prevent past dates
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
            disabled={isLoading}
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
            disabled={isLoading}
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="button-primary" disabled={isLoading}>
            {isLoading ? 'Scheduling...' : 'Schedule Appointment'}
          </button>
          <button type="button" className="button-secondary" onClick={() => navigate('/appointments')} disabled={isLoading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddAppointmentPage;