import React, { useState, useRef } from 'react';
import './AgeVerification.css';
import ReCAPTCHA from 'react-google-recaptcha';

const AgeVerification = ({ onVerify }) => {
  const [age, setAge] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null);
  const recaptchaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const numericAge = parseInt(age);
    if (isNaN(numericAge)) {
      setErrorMessage('Please enter a valid number.');
      return;
    }

    if (!captchaValue) {
      setErrorMessage('Please verify that you are not a robot.');
      return;
    }

    if (numericAge >= 18) {
      onVerify(true);
    } else {
      setErrorMessage('You are not of age to access this site.');
    }
  };

  const onCaptchaChange = (value) => {
    setCaptchaValue(value);
    if (errorMessage) setErrorMessage('');
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
              setErrorMessage('');
            }}
            min="1"
            required
          />
          
          {/* Add reCAPTCHA */}
          <ReCAPTCHA
            sitekey="6LelLW4rAAAAAANsrREmpHhuo72g19aWpidLI_y3"
            onChange={onCaptchaChange}
            ref={recaptchaRef}
          />

          {errorMessage && <p className="age-verification-error">{errorMessage}</p>}
          <button type="submit">Enter</button>
        </form>
      </div>
    </div>
  );
};

export default AgeVerification;
