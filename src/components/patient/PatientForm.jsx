// src/components/patient/PatientForm.jsx
import React, { useState, useEffect } from 'react';
import './PatientForm.css'; // We'll create this CSS

// Props:
// - initialData: object containing patient data (for editing)
// - onSubmit: function to call when form is submitted (passes form data)
// - onCancel: function to call when cancel is clicked
// - isLoading: boolean to disable form during submission
// - serverError: string containing error from server
function PatientForm({ initialData, onSubmit, onCancel, isLoading, serverError }) {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '', // Will be in YYYY-MM-DD format
    gender: 'MALE', // Default gender
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phoneNumber: '',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
  });
  const [errors, setErrors] = useState({}); // For client-side validation

  useEffect(() => {
    if (initialData) {
      // Format dateOfBirth for input type="date" if it exists
      const formattedData = { ...initialData };
      if (initialData.dateOfBirth) {
        // Assuming dateOfBirth comes as ISO string or can be parsed by Date
        // Ensure it's formatted as YYYY-MM-DD for the input field
        try {
            const dob = new Date(initialData.dateOfBirth);
            formattedData.dateOfBirth = dob.toISOString().split('T')[0];
        } catch (e) {
            console.error("Error formatting dateOfBirth for form:", initialData.dateOfBirth);
            formattedData.dateOfBirth = ''; // Fallback
        }
      }
      setFormData(formattedData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required.';
    else if (new Date(formData.dateOfBirth) >= new Date()) {
        newErrors.dateOfBirth = 'Date of birth must be in the past.';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required.';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid.';
    }
    // Add more validations as needed (e.g., phone format)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="patient-form">
      {serverError && <p className="error-message form-server-error">{serverError}</p>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">First Name <span className="required">*</span></label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.firstName && <p className="error-text">{errors.firstName}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="middleName">Middle Name</label>
          <input
            type="text"
            id="middleName"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name <span className="required">*</span></label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.lastName && <p className="error-text">{errors.lastName}</p>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth <span className="required">*</span></label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.dateOfBirth && <p className="error-text">{errors.dateOfBirth}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="gender">Gender <span className="required">*</span></label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.gender && <p className="error-text">{errors.gender}</p>}
        </div>
      </div>

      <div className="form-section-title">Contact Information</div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-section-title">Address</div>
       <div className="form-group">
          <label htmlFor="addressLine1">Address Line 1</label>
          <input
            type="text"
            id="addressLine1"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="addressLine2">Address Line 2</label>
          <input
            type="text"
            id="addressLine2"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="state">State/Province</label>
          <input type="text" id="state" name="state" value={formData.state} onChange={handleChange} disabled={isLoading} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="postalCode">Postal Code</label>
          <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="country">Country</label>
          <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} disabled={isLoading} />
        </div>
      </div>


      <div className="form-section-title">Emergency Contact</div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="emergencyContactName">Name</label>
          <input type="text" id="emergencyContactName" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="emergencyContactPhone">Phone</label>
          <input type="tel" id="emergencyContactPhone" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} disabled={isLoading} />
        </div>
      </div>

      <div className="form-section-title">Insurance Information</div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="insuranceProvider">Provider</label>
          <input type="text" id="insuranceProvider" name="insuranceProvider" value={formData.insuranceProvider} onChange={handleChange} disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="insurancePolicyNumber">Policy Number</label>
          <input type="text" id="insurancePolicyNumber" name="insurancePolicyNumber" value={formData.insurancePolicyNumber} onChange={handleChange} disabled={isLoading} />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="button-primary" disabled={isLoading}>
          {isLoading ? (initialData ? 'Updating...' : 'Saving...') : (initialData ? 'Update Patient' : 'Add Patient')}
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

export default PatientForm;