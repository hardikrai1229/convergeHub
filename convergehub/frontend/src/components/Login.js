// src/components/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.token); // Store token in localStorage
      navigate("/chat"); // Redirect to chat page after login
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password"); // Improved error handling
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.heading}>Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleLogin} style={styles.form}>
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
            Login
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
    width: "100vw", // Ensures full viewport width
    backgroundColor: "#f4f4f4",
  },
  box: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "340px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // Ensurescontent is properly centered
  },
  heading: {
    marginBottom: "15px",
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
    width: "100%", // Makes the button span full width of form
  },
  error: {
    color: "red",
    marginBottom: "10px",
  },
};

export default Login;
