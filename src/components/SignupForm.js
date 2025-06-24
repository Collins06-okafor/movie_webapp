import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../firebase/config'; // Fixed: Import auth from config file
import { createUserWithEmailAndPassword } from 'firebase/auth';

const SignupForm = ({ switchForm }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const formRef = useRef(null);

  // Handle clicking outside the form
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        switchForm(null); // Close the modal
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [switchForm]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Signup successful!");
      switchForm('login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-form" ref={formRef}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required /><br />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><br />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /><br />
        <input type="password" placeholder="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /><br />
        <button type="submit">Sign Up</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>Already have an account? <span className="form-link" onClick={() => switchForm('login')}>Login</span></p>
    </div>
  );
};

export default SignupForm;