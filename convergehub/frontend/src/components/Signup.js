// src/components/Signup.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/signup", {
        username,
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      navigate("/chat"); // Redirect to chat page after signup
    } catch (err) {
      setError("Signup failed. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.heading}>Signup</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSignup} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>
            Signup
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "100vw",
    backgroundColor: "#f4f4f4",
  },
  box: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "340px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  heading: {
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "95%",
  },
  input: {
    padding: "10px",
    marginBottom: "10px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    width: "100%",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background 0.3s",
    width: "100%",
  },
  error: {
    color: "red",
    marginBottom: "10px",
  },
};

export default Signup;
