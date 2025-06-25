import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate here

const Register = () => {
  const [form, setForm] = useState({ username: "", password: "", email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Now properly imported

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Optional Gmail-only check
    if (!form.email.endsWith("@gmail.com")) {
      alert("Please use a valid Gmail address.");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:8000/register", form);
      navigate("/login"); // Redirect on success
    } catch (error) {
      console.error("Registration failed:", error);
      alert(error.response?.data?.detail || "Registration failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of your component code remains the same ...

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundImage: "url('/Managing debt client.jpeg')", // ✅ image path (in public folder)
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    fontFamily: "Arial, sans-serif",
  };
  const formStyle = {
    padding: "35px",
    borderRadius: "12px",
    background: "#fff",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
    width: "600px",
  };

  const tableStyle = {
    width: "100%",
  };

  const inputStyle = {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginTop: "4px",
    marginBottom: "12px",
    fontSize: "16px",
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
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

  return (
    <div style={containerStyle}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <h2 style={headingStyle}>Create Account</h2>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td>
                <label htmlFor="username">Username:</label>
              </td>
              <td>
                <input
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="email">Email:</label>
              </td>
              <td>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="password">Password:</label>
              </td>
              <td>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                <button type="submit" style={buttonStyle}>
                  Register
                </button>
              </td>
            </tr>
            <tr>
              <td
                colSpan="2"
                style={{ textAlign: "center", paddingTop: "12px" }}
              >
                <p>
                  Already have an account?{" "}
                  <Link to="/login" style={linkStyle}>
                    Login here
                  </Link>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default Register;
