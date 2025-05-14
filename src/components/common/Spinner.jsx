// src/components/common/Spinner.jsx
import React from 'react';
import './Spinner.css'; // We'll create this

const Spinner = ({ size = 'medium', message }) => {
  return (
    <div className={`spinner-overlay ${size}`}>
      <div className="spinner"></div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export const InlineSpinner = ({ size = 'small' }) => {
    return <div className={`spinner inline-spinner ${size}`}></div>;
}

export default Spinner;