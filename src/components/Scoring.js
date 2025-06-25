import React, { useEffect, useState } from "react";
import Layout from "./Layout"; // Adjust the path as needed
import ApplicationForm from "./ApplicationForm";
import { jwtDecode } from "jwt-decode";

const Scoring = () => {
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true); // Manage sidebar state

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.sub); // Ensure 'sub' is the correct key for the email
      } catch (err) {
        console.error("Token decode failed", err);
      }
    }
  }, []);

  return (
    <Layout
      userEmail={userEmail}
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}
      handleLogout={handleLogout}
    >
      <div className="container py-4">
        <ApplicationForm />
      </div>
    </Layout>
  );
};

export default Scoring;
