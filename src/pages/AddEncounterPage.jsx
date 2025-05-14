// src/pages/AddEncounterPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createEncounter, getAppointmentsForEncounterSelect } from '../services/encounterService';
import { getDoctorById } from '../services/doctorService'; // To get doctor's name for display
import { getPatientById } from '../services/patientService'; // To get patient's name for display
import { useAuth } from '../contexts/AuthContext'; // To get current doctor's ID if applicable
import './AddEncounterPage.css';

function AddEncounterPage() {
  const { patientId: patientIdFromParams } = useParams(); // If navigating from patient details
  const navigate = useNavigate();
  const { user } = useAuth(); // Assuming user object has doctorId if logged-in user is a doctor

  const [formData, setFormData] = useState({
    patientId: patientIdFromParams || '',
    doctorId: '', // Will try to prefill if current user is a doctor
    appointmentId: '',
    encounterDatetime: new Date().toISOString().slice(0, 16), // Default to now
    encounterType: 'CONSULTATION',
    chiefComplaint: '',
  });

  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState(''); // For displaying pre-filled doctor
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
        setIsFetchingData(true);
        try {
            if (patientIdFromParams) {
                const patientRes = await getPatientById(patientIdFromParams);
                setPatientName(`${patientRes.data.firstName} ${patientRes.data.lastName}`);
                setFormData(prev => ({ ...prev, patientId: patientIdFromParams }));

                // Fetch appointments for this patient
                const appts = await getAppointmentsForEncounterSelect(patientIdFromParams);
                setAppointments(appts);
            }

            // If logged in user is a doctor, pre-fill their ID and name
            // This assumes 'user' from useAuth() might have a 'doctorId' field if they are a doctor
            // You'll need to ensure your AuthContext populates this if true.
            // For now, let's assume the user object in AuthContext has a `doctorId` and `roles`
            if (user && user.roles?.includes('ROLE_DOCTOR') && user.doctorId) { // user.doctorId is hypothetical
                setFormData(prev => ({ ...prev, doctorId: user.doctorId.toString() }));
                // Fetch this doctor's details to display name - or user.fullName could be used
                // This part requires your UserDTO from backend or AuthContext's user to have doctorId / name
                // For simplicity, we'll assume doctorId needs to be selected if not auto-filled
                // Or, if user.fullName is available:
                // setDoctorName(user.fullName);
            }

        } catch (err) {
            console.error("Error loading initial data for encounter:", err);
            setError("Failed to load necessary data.");
        } finally {
            setIsFetchingData(false);
        }
    };
    loadInitialData();
  }, [patientIdFromParams, user]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.patientId || !formData.doctorId || !formData.encounterDatetime || !formData.encounterType) {
        setError('Patient, Doctor, Encounter Date/Time, and Type are required.');
        setIsLoading(false);
        return;
    }
    
    const submissionData = {
        ...formData,
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
        appointmentId: formData.appointmentId ? parseInt(formData.appointmentId) : null,
    };


    try {
      const response = await createEncounter(submissionData);
      alert('Encounter created successfully!');
      navigate(`/encounters/${response.data.id}`); // Navigate to the new encounter's details page
    } catch (err) {
      console.error('Error creating encounter:', err.response?.data || err.message);
      let errorMessage = 'Failed to create encounter. Please try again.';
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
  
  if (isFetchingData) {
      return <div className="loading-message">Loading form data...</div>;
  }

  return (
    <div className="add-encounter-page-container">
      <div className="page-header">
        <h1>Create New Encounter {patientName && `for ${patientName}`}</h1>
      </div>
      <form onSubmit={handleSubmit} className="encounter-form"> {/* Reuse .appointment-form styles or create new */}
        {error && <p className="error-message form-server-error">{error}</p>}

        {/* Patient ID is likely pre-filled if coming from patient details, or needs a selector */}
        <div className="form-group">
          <label htmlFor="patientId">Patient ID <span className="required">*</span></label>
          <input
            type="number"
            id="patientId"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required
            disabled={isLoading || !!patientIdFromParams} // Disable if pre-filled
            placeholder="Enter Patient ID"
          />
           {patientName && <small>Patient: {patientName}</small>}
        </div>
        
        {/* Doctor ID: could be pre-filled if current user is doctor, otherwise a selector */}
        <div className="form-group">
          <label htmlFor="doctorId">Doctor ID <span className="required">*</span></label>
          <input
            type="number"
            id="doctorId"
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            required
            disabled={isLoading} // Potentially disable if current user is doctor and prefilled
            placeholder="Enter Doctor ID"
          />
          {/* Ideally, a dropdown/search for doctors would be here if not pre-filled */}
        </div>

        <div className="form-group">
          <label htmlFor="appointmentId">Link to Appointment (Optional)</label>
          <select
            id="appointmentId"
            name="appointmentId"
            value={formData.appointmentId}
            onChange={handleChange}
            disabled={isLoading || !patientIdFromParams || appointments.length === 0}
          >
            <option value="">None</option>
            {appointments.map(appt => (
              <option key={appt.value} value={appt.value}>{appt.label}</option>
            ))}
          </select>
          {!patientIdFromParams && <small>Select a patient first to see their appointments.</small>}
        </div>

        <div className="form-group">
          <label htmlFor="encounterDatetime">Encounter Date & Time <span className="required">*</span></label>
          <input
            type="datetime-local"
            id="encounterDatetime"
            name="encounterDatetime"
            value={formData.encounterDatetime}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="encounterType">Encounter Type <span className="required">*</span></label>
          <input
            type="text"
            id="encounterType"
            name="encounterType"
            value={formData.encounterType}
            onChange={handleChange}
            required
            disabled={isLoading}
            placeholder="e.g., CONSULTATION, FOLLOW_UP"
          />
        </div>

        <div className="form-group">
          <label htmlFor="chiefComplaint">Chief Complaint / Reason</label>
          <textarea
            id="chiefComplaint"
            name="chiefComplaint"
            rows="4"
            value={formData.chiefComplaint}
            onChange={handleChange}
            disabled={isLoading}
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="button-primary" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Encounter'}
          </button>
          <button type="button" className="button-secondary" onClick={() => navigate(patientIdFromParams ? `/patients/${patientIdFromParams}` : '/patients')} disabled={isLoading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEncounterPage;