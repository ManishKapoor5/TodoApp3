import React, { useState } from "react";
import { useStore } from "../store";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const { response } = await login(username, password);

      if (response && response.success) {
        navigate("/");
      } else {
        setError(
          response?.error || "Login failed. Please check your credentials."
        );
        alert("User not found. Redirecting to registration page.");
        navigate("/register");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again later.");
      console.error("Login error:", err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
