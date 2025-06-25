import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../firebase/config'; // Fixed: Import auth from config file
import { signInWithEmailAndPassword } from 'firebase/auth'; // Fixed: Import from firebase/auth

const LoginForm = ({ switchForm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleLogin = async (e) => {
  e.preventDefault();

  const strongPasswordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!strongPasswordRegex.test(password)) {
    setError("Password must be at least 8 characters and include letters, numbers, and a special character.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful!");
    switchForm(null); // closes the modal
  } catch (err) {
    setError("Invalid email or password");
    console.error("Login error:", err.message);
  }
};

<small style={{ color: "#666" }}>
  Must be at least 8 characters, include a number, a letter, and a special character.
</small>


  return (
    <div className="auth-form" ref={formRef}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        Don't have an account?{" "}
        <span className="form-link" onClick={() => switchForm('signup')}>Sign up</span>
      </p>
    </div>
  );
};

export default LoginForm;