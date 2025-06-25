import React from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  Shield,
  BarChart3,
} from "lucide-react";
import "./HomePage.css"; // <-- create this file next

const features = [
  {
    icon: <Brain size={36} color="#2563eb" />,
    title: "AI-Powered Scoring",
    description:
      "Advanced machine learning algorithms for accurate credit risk assessment",
    points: [
      "XGBoost & Random Forest models",
      "Real-time processing",
      "Bias detection & mitigation",
    ],
  },
  {
    icon: <Users size={36} color="#7c3aed" />,
    title: "Financial Inclusion",
    description: "Expanding credit access for underserved populations",
    points: [
      "Thin-file borrowers",
      "Emerging economies focus",
      "Equitable lending practices",
    ],
  },
  {
    icon: <Clock size={36} color="#f97316" />,
    title: "Real-Time Processing",
    description: "Instant credit decisions with sub-5 second response times",
    points: [
      "Cloud-based architecture",
      "Scalable infrastructure",
      "99.9% uptime reliability",
    ],
  },
  {
    icon: <Shield size={36} color="#ef4444" />,
    title: "Security & Compliance",
    description: "Enterprise-grade security with regulatory compliance",
    points: ["GDPR compliance", "End-to-end encryption", "Fraud detection"],
  },
  {
    icon: <BarChart3 size={36} color="#6366f1" />,
    title: "Analytics & Monitoring",
    description: "Comprehensive insights and model performance tracking",
    points: [
      "Model drift detection",
      "Performance metrics",
      "Risk visualization",
    ],
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      {/* Header */}
      <header className="navbar sticky-top bg-white shadow-sm px-4 py-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <img
            src="/mylogo.png"
            alt="logo"
            width={50}
            height={50}
            className="rounded-full"
          />

          <span className="fw-bold fs-5">AI Credit Risk</span>
        </div>
        <nav className="d-flex align-items-center">
          <Link to="/" className="nav-link px-3 text-secondary">
            Home
          </Link>
          <Link to="/about" className="nav-link px-3 text-secondary">
            About
          </Link>
          <Link to="/login" className="btn btn-primary ms-3">
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="text-center py-5 hero-section">
        <span className="badge bg-primary text-white px-3 py-2 mb-3">
          B.Tech Project - Cloud Computing
        </span>
        <h1 className="display-5 fw-bold mb-4">
          Artificial Intelligence in the{" "}
          <span className="text-primary">Analysis of Credit Risk</span>
        </h1>
        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: 900 }}>
          Revolutionizing credit scoring through AI-powered analysis, promoting
          financial inclusion and reducing bias in lending decisions for
          underserved populations.
        </p>
      </section>

      {/* Features */}
      <section className="py-5 features-section">
        <div className="container">
          <h2 className="text-center fw-bold mb-5 text-white">Key Features</h2>
          <div className="row g-4">
            {features.map((feature, idx) => (
              <div key={idx} className="col-md-6 col-lg-4">
                <div className="card feature-card h-100 text-center shadow-sm p-3">
                  <div>{feature.icon}</div>
                  <h5 className="fw-bold my-3">{feature.title}</h5>
                  <p className="text-muted">{feature.description}</p>
                  <ul className="list-unstyled text-start ps-2">
                    {feature.points.map((point, i) => (
                      <li
                        key={i}
                        className="d-flex align-items-center mb-2 text-dark"
                      >
                        <CheckCircle size={16} className="me-2 text-success" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section
        className="py-5 text-white"
        style={{ background: "linear-gradient(to right, #2563eb, #7c3aed)" }}
      >
        <div className="container">
          <h2 className="text-center fw-bold mb-5">Project Impact</h2>
          <div className="row justify-content-center g-4">
            <div className="col-md-6 col-lg-5">
              <h5 className="d-flex align-items-center justify-content-center mb-3">
                <TrendingUp className="me-2" />
                For Financial Institutions
              </h5>
              <ul className="ps-3">
                <li>Enhanced risk management capabilities</li>
                <li>Improved lending decision accuracy</li>
                <li>Reduced default rates and bad debt</li>
                <li>Automated compliance monitoring</li>
              </ul>
            </div>
            <div className="col-md-6 col-lg-5">
              <h5 className="d-flex align-items-center justify-content-center mb-3">
                <Users className="me-2" />
                For the Population
              </h5>
              <ul className="ps-3">
                <li>Increased access to credit</li>
                <li>Economic empowerment opportunities</li>
                <li>Protection against over-indebtedness</li>
                <li>Fair and unbiased lending practices</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center text-lg-start py-5 px-3">
        <div className="container">
          {/* Logo and Title */}
          <div className="d-flex justify-content-center align-items-center mb-4">
            <Brain size={20} className="me-2" />
            <span className="fw-bold">AI Credit Risk Analysis</span>
          </div>
          {/*phrase statements */}
          <div>
            <p>
              <center>
                Credit risk analysis evaluates a borrower's likelihood of
                defaulting on a loan, helping lenders make informed financial
                decisions.
              </center>
            </p>
          </div>
          <div className="row text-start">
            {/* Contact Info */}
            <div className="col-md-4 mb-4">
              <h5 className="text-uppercase fw-bold">Contact</h5>
              <p className="mb-1">
                <i className="bi bi-geo-alt-fill me-2"></i> Douala, Cameroon
              </p>
              <p className="mb-1">
                <i className="bi bi-telephone-fill me-2"></i> +237 655182969
              </p>
              <p className="mb-1">
                <i className="bi bi-envelope-fill me-2"></i> maxwell@example.com
              </p>
            </div>

            {/* Quick Links */}
            <div className="col-md-4 mb-4">
              <h5 className="text-uppercase fw-bold">Quick Links</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="/" className="text-white text-decoration-none">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-white text-decoration-none">
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="/dashboard"
                    className="text-white text-decoration-none"
                  >
                    Dashboard
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="col-md-4 mb-4">
              <h5 className="text-uppercase fw-bold">Legal</h5>
              <ul className="list-unstyled">
                <li>
                  <a
                    href="/privacy"
                    className="text-white text-decoration-none"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-white text-decoration-none">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/support"
                    className="text-white text-decoration-none"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-4">
            <p className="small text-secondary mb-2">
              DEVELOPED by MR. EBONGUE NSAME ELIE MAXWELL | Cloud Computing
              Department
            </p>
            <hr className="border-secondary" />
            <p className="small text-secondary mt-2 mb-0">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
