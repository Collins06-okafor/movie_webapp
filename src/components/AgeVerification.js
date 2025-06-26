import React, { useState } from 'react';
import './AgeVerification.css';

const AgeVerification = ({ onVerify }) => {
  const [age, setAge] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericAge = parseInt(age);
    if (isNaN(numericAge)) {
      setErrorMessage('Please enter a valid number.');
      return;
    }

    if (numericAge >= 18) {
      onVerify(true);
    } else {
      setErrorMessage('You are not of age to access this site.');
    }
  };

  return (
    <div className="age-verification-overlay">
      <div className="age-verification-modal">
        <h2>Age Verification</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="age">Enter your age:</label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              setErrorMessage(''); // clear error on change
            }}
            min="1"
            required
          />
          {errorMessage && <p className="age-verification-error">{errorMessage}</p>}
          <button type="submit">Enter</button>
        </form>
      </div>
    </div>
  );
};

export default AgeVerification;
