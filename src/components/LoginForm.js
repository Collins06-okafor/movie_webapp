import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

const LoginForm = ({ switchForm, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const formRef = useRef(null);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        switchForm(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [switchForm]);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    const strongPasswordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      setError("Password must be at least 8 characters and include letters, numbers, and a special character.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
      if (onLoginSuccess) onLoginSuccess();
      switchForm(null);
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  // Forgot password handler
  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setError(""); // clear error
      alert("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError("Failed to send reset email. Make sure your email is correct.");
      console.error(err);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-form" ref={formRef}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            required
          />
          <button type="submit">Login</button>
          <p
            className="forgot-password-link"
            onClick={handlePasswordReset}
            style={{ color: "#007bff", cursor: "pointer", marginTop: "10px", fontSize: "14px", textDecoration: "underline" }}
          >
            Forgot Password?
          </p>
        </form>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

        <p>
          Don't have an account?{" "}
          <span className="form-link" onClick={() => switchForm('signup')} style={{ color: "#ffffff", cursor: "pointer" }}>
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
