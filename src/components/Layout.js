import React from "react";
import { Link } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  Brain,
  House,
  Gauge,
  PanelLeftClose,
  ReceiptText,
  Users,
  FolderOpenDot,
  Settings,
  UserRound,
  PanelLeftOpen,
  BookMarked,
  LogOut,
  BellDot,
  SearchCheck,
} from "lucide-react";

const Layout = ({ children, userEmail, sidebarOpen, toggleSidebar }) => {
  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token
    window.location.href = "/"; // Redirect to the homepage
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div
          className="bg-dark text-white p-3"
          style={{
            width: "300px",
            position: "fixed", // Make sidebar fixed
            height: "100vh", // Full height
            overflowY: "auto", // Allow scrolling if content overflows
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Brain size={35} color="#2563eb" />
            <h4 className="text-white mb-0">Credit Score App</h4>
            <button
              className="btn btn-sm btn-outline-light"
              onClick={toggleSidebar}
            >
              <PanelLeftClose />
            </button>
          </div>
          <h6>Menu</h6>
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <Link to="/" className="nav-link text-white">
                <House size={25} color="white" />
                Home
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/about" className="nav-link text-white">
                <BookMarked size={25} color="white" />
                About
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/dashboard" className="nav-link text-white">
                <Gauge size={25} color="white" /> Dashboard
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/scoring" className="nav-link text-white">
                <ReceiptText size={25} color="white" /> Apply for Credit
              </Link>
            </li>
            <li className="nav-item mb-2">
              <button className="nav-link text-white bg-transparent border-0">
                <Users size={25} color="white" /> Clients
              </button>
            </li>
            <li className="nav-item mb-2">
              <button className="nav-link text-white bg-transparent border-0">
                <FolderOpenDot size={25} color="white" /> Reports
              </button>
            </li>
            <li className="nav-item mb-2">
              <button className="nav-link text-white bg-transparent border-0">
                <Settings size={25} color="white" /> Settings
              </button>
            </li>
          </ul>
          <div className="text-center mt-4 pt-4 border-top border-secondary">
            <UserRound size={40} color="#2563eb" />
            <p className="mb-0 mt-2 fw-semibold">{userEmail || "User"}</p>
            <small className="text-muted">Logged in</small>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className="flex-grow-1 bg-light"
        style={{ marginLeft: sidebarOpen ? "300px" : "0" }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 bg-white border-bottom">
          <div className="d-flex align-items-center flex-grow-1">
            {!sidebarOpen && (
              <button
                className="btn btn-sm btn-outline-primary me-3"
                onClick={toggleSidebar}
              >
                <PanelLeftOpen />
              </button>
            )}
            <div className="input-group" style={{ maxWidth: "700px" }}>
              <span className="input-group-text bg-white">
                <SearchCheck size={25} color="#2563eb" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search clients, reports..."
              />
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            {userEmail && (
              <span className="fw-semibold text-primary d-none d-md-inline">
                Analyst
              </span>
            )}
            <button className="btn btn-sm btn-outline-secondary position-relative">
              <BellDot size={25} color="#2563eb" />
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger rounded-circle border border-light"></span>
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleLogout}
            >
              <LogOut size={25} color="#2563eb" /> Logout
            </button>
          </div>
        </div>
        {children} {/* Render child components here */}
      </div>
    </div>
  );
};

export default Layout;
