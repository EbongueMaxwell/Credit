import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage"; // Adjust the path as necessary
import Login from "./components/Login"; // Your Login component
import Register from "./components/Register"; // Your Register component
import Dashboard from "./components/Dashboard"; // Your Dashboard component
import Scoring from "./components/Scoring"; // Your Scoring component
import ApplicationForm from "./components/ApplicationForm"; // Your Application Form component
import About from "./components/About"; // Your About component
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const handleLogin = () => {
    console.log("User logged in");
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Main homepage */}
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/scoring" element={<Scoring />} />
        <Route path="/application-form" element={<ApplicationForm />} />
        <Route path="/about" element={<About />} />
        {/* Remove Badge, Layout, and QuickActionsCard routes if not needed directly */}
      </Routes>
    </Router>
  );
}

export default App;

