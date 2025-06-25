import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import { jwtDecode } from "jwt-decode";
import {
  ShieldCheck,
  BarChart2,
  Lock,
  Users,
  Code,
  Database,
  Cpu,
} from "lucide-react";

const About = () => {
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.sub);
      } catch (err) {
        console.error("Token decode failed", err);
      }
    }
  }, []);

  const features = [
    {
      icon: <ShieldCheck size={48} className="text-primary mb-3" />,
      title: "Reliable Scoring",
      description:
        "Our advanced algorithms provide accurate credit risk assessments based on comprehensive financial data.",
    },
    {
      icon: <BarChart2 size={48} className="text-success mb-3" />,
      title: "Real-time Analytics",
      description:
        "Get instant insights with our live dashboard and up-to-date reporting tools.",
    },
    {
      icon: <Lock size={48} className="text-warning mb-3" />,
      title: "Secure Processing",
      description:
        "All data is encrypted and processed with bank-level security protocols.",
    },
    {
      icon: <Users size={48} className="text-info mb-3" />,
      title: "Client Focused",
      description:
        "Designed by financial experts to meet the needs of modern lenders.",
    },
    {
      icon: <Cpu size={48} className="text-danger mb-3" />,
      title: "AI-Powered",
      description:
        "Leveraging machine learning for more accurate predictions over time.",
    },
    {
      icon: <Database size={48} className="text-secondary mb-3" />,
      title: "Data Integrity",
      description:
        "All analyses are stored securely for compliance and audit purposes.",
    },
  ];

  return (
    <Layout
      userEmail={userEmail}
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}
      handleLogout={handleLogout}
    >
      <div className="container py-5">
        {/* Hero Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3">
            About Our Credit Scoring System
          </h1>
          <p className="lead text-muted">
            Transforming financial risk assessment through advanced analytics
            and machine learning
          </p>
        </div>

        {/* Mission Statement */}
        <div className="card mb-5 border-0 shadow-sm">
          <div className="card-body p-5 bg-light rounded-3">
            <h2 className="text-center mb-4">Our Mission</h2>
            <p className="text-center fs-5">
              "To empower financial institutions with precise, fair, and
              transparent credit scoring solutions that streamline
              decision-making while maintaining the highest standards of data
              security and compliance."
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <h2 className="text-center mb-4">Key Features</h2>
        <div className="row g-4 mb-5">
          {features.map((feature, index) => (
            <div key={index} className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  {feature.icon}
                  <h3>{feature.title}</h3>
                  <p className="text-muted">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Technology Stack */}
        <div className="card mb-5 border-0 shadow-sm">
          <div className="card-body p-4">
            <h2 className="text-center mb-4">Technology Stack</h2>
            <div className="row align-items-center">
              <div className="col-md-6">
                <ul className="list-unstyled fs-5">
                  <li className="mb-3">
                    <strong>Frontend:</strong> React.js, Bootstrap, Recharts
                  </li>
                  <li className="mb-3">
                    <strong>Backend:</strong> FastAPI, Python
                  </li>
                  <li className="mb-3">
                    <strong>Database:</strong> PostgreSQL
                  </li>
                  <li className="mb-3">
                    <strong>Machine Learning:</strong> Scikit-learn, Logistic
                    Regression
                  </li>
                  <li className="mb-3">
                    <strong>Security:</strong> JWT Authentication, HTTPS
                  </li>
                </ul>
              </div>
              <div className="col-md-6">
                <div className="p-4 bg-light rounded-3 text-center">
                  <Code size={80} className="text-primary mb-3" />
                  <h4>Modern Architecture</h4>
                  <p className="text-muted">
                    Built with scalability and maintainability in mind using
                    industry best practices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <h2 className="text-center mb-4">Our Team</h2>
        <div className="row g-4 mb-5">
          {[
            {
              name: "Alex Johnson",
              role: "Lead Data Scientist",
              bio: "10+ years in financial risk modeling",
            },
            {
              name: "Maria Garcia",
              role: "Full Stack Developer",
              bio: "Specializes in secure web applications",
            },
            {
              name: "Sam Wilson",
              role: "Product Manager",
              bio: "Financial technology expert",
            },
          ].map((member, index) => (
            <div key={index} className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="mb-3">
                    <div
                      className="ratio ratio-1x1 mx-auto"
                      style={{ maxWidth: "120px" }}
                    >
                      <div className="bg-light rounded-circle d-flex align-items-center justify-content-center">
                        <Users size={48} className="text-secondary" />
                      </div>
                    </div>
                  </div>
                  <h3>{member.name}</h3>
                  <h5 className="text-primary">{member.role}</h5>
                  <p className="text-muted">{member.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="card border-0 shadow-sm bg-primary text-white">
          <div className="card-body p-5 text-center">
            <h2 className="mb-3">Have Questions?</h2>
            <p className="lead mb-4">
              Our team is ready to help you get the most out of our platform.
            </p>
            <a href="/contact" className="btn btn-light btn-lg px-4">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
