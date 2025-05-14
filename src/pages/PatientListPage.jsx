// src/pages/PatientListPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api'; // Our Axios instance
import { Link } from 'react-router-dom';
import './PatientListPage.css'; // We'll create this CSS

function PatientListPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPatients = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const endpoint = query ? `/patients/search?query=${encodeURIComponent(query)}` : '/patients';
      const response = await apiClient.get(endpoint);
      setPatients(response.data);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch patients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(); // Fetch all patients on initial load
  }, []); // Empty dependency array means this runs once on mount

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(searchTerm);
  };

  if (loading) {
    return <div className="loading-message">Loading patients...</div>;
  }

  if (error) {
    return <div className="error-message page-error">{error}</div>;
  }

  return (
    <div className="patient-list-container">
      <div className="page-header">
        <h1>Patient Records</h1>
        <Link to="/patients/new" className="add-patient-button">Add New Patient</Link>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      {patients.length === 0 && !loading && (
        <p className="no-patients-message">No patients found.</p>
      )}

      {patients.length > 0 && (
        <table className="patients-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>DOB</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.id}</td>
                <td>{patient.firstName} {patient.lastName}</td>
                <td>{patient.email || 'N/A'}</td>
                <td>{patient.phoneNumber || 'N/A'}</td>
                <td>{patient.gender}</td>
                <td>{new Date(patient.dateOfBirth).toLocaleDateString()}</td>
                <td>
                  <Link to={`/patients/${patient.id}`} className="action-link view-link">View</Link>
                  <Link to={`/patients/edit/${patient.id}`} className="action-link edit-link">Edit</Link>
                  {/* Delete button would require more logic (confirmation, API call) */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PatientListPage;