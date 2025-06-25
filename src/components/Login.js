import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", form.email);
      formData.append("password", form.password);

      const response = await axios.post(
        "http://localhost:8000/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (!response.data.access_token) {
        throw new Error("No token received");
      }

      // Store token and user email
      localStorage.setItem("authToken", response.data.access_token);
      localStorage.setItem("userEmail", form.email);

      // Set default authorization header for axios
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.access_token}`;

      // Callback and redirect
      if (onLogin) onLogin(response.data.access_token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "An unexpected error occurred";
      if (error.response) {
        errorMessage =
          error.response.data.detail ||
          error.response.data.message ||
          "Invalid email or password";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Styles
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundImage: "url('/Installment Loan Advisors.jpeg')", // ✅ image path (in public folder)
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    fontFamily: "Arial, sans-serif",
  };

  const formStyle = {
    padding: "60px",
    borderRadius: "10px",
    background: "#ffffff",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
    width: "500px",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginTop: "10px",
    marginBottom: "16px",
    fontSize: "16px",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007BFF",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
    marginTop: "10px",
    opacity: isLoading ? 0.7 : 1,
    pointerEvents: isLoading ? "none" : "auto",
  };

  const headingStyle = {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  };

  const linkStyle = {
    color: "#007BFF",
    textDecoration: "none",
  };

  const textCenterStyle = {
    textAlign: "center",
    marginTop: "12px",
    fontSize: "16px",
    color: "#555",
  };

  const errorStyle = {
    color: "red",
    marginBottom: "16px",
    textAlign: "center",
  };

  return (
    <div style={containerStyle}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <h2 style={headingStyle}>Credit Score</h2>
        <h3 style={headingStyle}>Login</h3>

        {error && <div style={errorStyle}>{error}</div>}

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            style={inputStyle}
            required
            disabled={isLoading}
          />
        </div>

        <button type="submit" style={buttonStyle} disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <div style={textCenterStyle}>
          Don't have an account?{" "}
          <Link to="/register" style={linkStyle}>
            Register here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
