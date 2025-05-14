// src/pages/EncounterDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } // Potentially useNavigate later
from 'react-router-dom';
import { getEncounterById } from '../services/encounterService';
// Import services for related EMR data
import { getConsultationNoteByEncounterId } from '../services/consultationNoteService';
import { getVitalSignsByEncounterId } from '../services/vitalSignService';
import { getDiagnosesByEncounterId } from '../services/diagnosisService';
import { getPrescriptionByEncounterId } from '../services/prescriptionService';
import { getLabOrdersByEncounterId } from '../services/labOrderService';
import './EncounterDetailsPage.css';

function EncounterDetailsPage() {
  const { encounterId } = useParams();
  const [encounter, setEncounter] = useState(null);
  const [consultationNote, setConsultationNote] = useState(null);
  const [vitalSigns, setVitalSigns] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [prescription, setPrescription] = useState(null);
  const [labOrders, setLabOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEncounterData = async () => {
      setLoading(true);
      setError('');
      try {
        const encounterRes = await getEncounterById(encounterId);
        setEncounter(encounterRes.data);

        // Fetch related data - wrap in try/catch individually if some might not exist
        try {
            const noteRes = await getConsultationNoteByEncounterId(encounterId);
            setConsultationNote(noteRes.data);
        } catch (noteErr) { if(noteErr.response?.status !== 404) console.warn("Error fetching consultation note:", noteErr); }

        try {
            const vitalsRes = await getVitalSignsByEncounterId(encounterId);
            setVitalSigns(vitalsRes.data);
        } catch (vitalsErr) { if(vitalsErr.response?.status !== 404) console.warn("Error fetching vital signs:", vitalsErr); }

        try {
            const diagnosesRes = await getDiagnosesByEncounterId(encounterId);
            setDiagnoses(diagnosesRes.data);
        } catch (diagErr) { if(diagErr.response?.status !== 404) console.warn("Error fetching diagnoses:", diagErr); }
        
        try {
            const presRes = await getPrescriptionByEncounterId(encounterId);
            setPrescription(presRes.data);
        } catch (presErr) { if(presErr.response?.status !== 404) console.warn("Error fetching prescription:", presErr); }

        try {
            const labsRes = await getLabOrdersByEncounterId(encounterId);
            setLabOrders(labsRes.data);
        } catch (labsErr) { if(labsErr.response?.status !== 404) console.warn("Error fetching lab orders:", labsErr); }


      } catch (err) {
        console.error("Error fetching encounter details:", err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch encounter details.');
         if (err.response?.status === 404) {
            setError(`Encounter with ID ${encounterId} not found.`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (encounterId) {
      fetchEncounterData();
    }
  }, [encounterId]);

  if (loading) {
    return <div className="loading-message">Loading encounter details...</div>;
  }

  if (error) {
    return <div className="error-message page-error">{error}</div>;
  }

  if (!encounter) {
    return <div className="info-message">No encounter data found.</div>;
  }

  return (
    <div className="encounter-details-container">
      <div className="page-header">
        <h1>Encounter on {new Date(encounter.encounterDatetime).toLocaleDateString()}</h1>
        <Link to={`/patients/${encounter.patientId}`} className="action-button secondary">Back to Patient</Link>
      </div>

      <div className="encounter-summary">
        <p><strong>Patient:</strong> {encounter.patientFullName} (ID: {encounter.patientId})</p>
        <p><strong>Doctor:</strong> Dr. {encounter.doctorFullName} (ID: {encounter.doctorId})</p>
        <p><strong>Type:</strong> {encounter.encounterType}</p>
        <p><strong>Time:</strong> {new Date(encounter.encounterDatetime).toLocaleTimeString()}</p>
        <p><strong>Chief Complaint:</strong> {encounter.chiefComplaint || 'N/A'}</p>
        {encounter.appointmentId && <p><strong>Linked Appointment ID:</strong> {encounter.appointmentId}</p>}
      </div>

      {/* Sections for EMR data - each would have "Add/Edit" links */}
      <div className="emr-section">
        <h3>Consultation Note</h3>
        {consultationNote ? (
            <div>
                <p><strong>Symptoms:</strong> {consultationNote.symptoms || 'N/A'}</p>
                <p><strong>Observations:</strong> {consultationNote.observations || 'N/A'}</p>
                <p><strong>Assessment:</strong> {consultationNote.assessment || 'N/A'}</p>
                {/* <Link to={`/encounters/${encounterId}/notes/edit`}>Edit Note</Link> */}
            </div>
        ) : <p>No consultation note recorded. {/*<Link to={`/encounters/${encounterId}/notes/add`}>Add Note</Link>*/}</p>}
         <p><Link to={`/encounters/${encounterId}/consultation-notes`} className="action-button">Manage Consultation Note</Link></p>
      </div>

      <div className="emr-section">
        <h3>Vital Signs</h3>
        {vitalSigns.length > 0 ? (
            vitalSigns.map(vital => (
                <div key={vital.id} className="vital-item">
                    <p><strong>Recorded:</strong> {new Date(vital.recordedAt).toLocaleString()}</p>
                    <p>Temp: {vital.temperatureCelsius}°C, BP: {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}, HR: {vital.heartRateBpm} bpm, RR: {vital.respiratoryRateRpm} rpm, SpO2: {vital.spo2Percentage}%</p>
                </div>
            ))
        ) : <p>No vital signs recorded for this encounter.</p>}
        <p><Link to={`/encounters/${encounterId}/vitals`} className="action-button">Manage Vital Signs</Link></p>
      </div>

      <div className="emr-section">
        <h3>Diagnoses</h3>
        {diagnoses.length > 0 ? (
            diagnoses.map(diag => (
                <div key={diag.id} className="diagnosis-item">
                    <p><strong>{diag.diagnosisCode} ({diag.diagnosisCodeSystem}):</strong> {diag.description}</p>
                    <p>Date: {new Date(diag.diagnosisDate).toLocaleDateString()} {diag.isChronic ? '(Chronic)' : ''}</p>
                </div>
            ))
        ) : <p>No diagnoses recorded for this encounter.</p>}
        <p><Link to={`/encounters/${encounterId}/diagnoses`} className="action-button">Manage Diagnoses</Link></p>
      </div>

      <div className="emr-section">
        <h3>Prescription</h3>
        {prescription ? (
            <div>
                <p><strong>Date:</strong> {new Date(prescription.prescriptionDate).toLocaleDateString()}</p>
                <ul>
                    {prescription.items?.map(item => (
                        <li key={item.id}>{item.medicationName} - {item.dosage}, {item.frequency}</li>
                    ))}
                </ul>
                {/* <Link to={`/prescriptions/${prescription.id}/edit`}>Edit Prescription</Link> */}
            </div>
        ) : <p>No prescription issued for this encounter.</p>}
        <p><Link to={`/encounters/${encounterId}/prescriptions`} className="action-button">Manage Prescription</Link></p>
      </div>
      
      <div className="emr-section">
        <h3>Lab Orders</h3>
        {labOrders.length > 0 ? (
            labOrders.map(order => (
                <div key={order.id} className="lab-order-item">
                    <p><strong>Order ID: {order.id}</strong> ({order.status}) on {new Date(order.orderDatetime).toLocaleDateString()}</p>
                    <ul>
                        {order.items?.map(item => (
                            <li key={item.id}>{item.labTestName} - {item.resultValue || 'Pending'}</li>
                        ))}
                    </ul>
                </div>
            ))
        ) : <p>No lab orders for this encounter.</p>}
        <p><Link to={`/encounters/${encounterId}/lab-orders`} className="action-button">Manage Lab Orders</Link></p>
      </div>

    </div>
  );
}

export default EncounterDetailsPage;