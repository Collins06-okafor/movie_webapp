import React, { useState } from 'react';
import { auth,signInWithEmailAndPassword } from 'firebase/auth';

const LoginForm = ({ switchForm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      switchForm(null); // closes the modal
      // Optional: close modal or redirect here
    } catch (err) {
      setError("Invalid email or password");
      console.error("Login error:", err.message);
    }
  };

  return (
    <div className="auth-form">
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
