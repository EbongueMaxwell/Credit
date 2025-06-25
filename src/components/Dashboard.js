import React, { useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserX,
  RefreshCw,
} from "lucide-react";
import Layout from "./Layout";
import { refreshToken } from "../Auth";

const Card = ({ title, value, change, Icon, loading }) => (
  <div className="card shadow-sm h-100">
    <div className="card-header d-flex justify-content-between align-items-center bg-white">
      <h5 className="card-title mb-0">{title}</h5>
      <Icon className="icon text-primary" />
    </div>
    <div className="card-body">
      {loading ? (
        <div className="placeholder-glow">
          <div className="placeholder col-8 fs-3 fw-bold"></div>
          <div className="placeholder col-10 text-muted mb-0"></div>
        </div>
      ) : (
        <>
          <div className="value fs-3 fw-bold">{value}</div>
          <p className="change text-muted mb-0">{change}</p>
        </>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    approval_rate: 0,
    default_rate: 0,
    model_accuracy: 0,
    approval_change: 0,
    default_change: 0,
    accuracy_change: 0,
    total_clients: 0,
    average_score: 0,
    high_risk_clients: 0,
    portfolio_risk: "Low",
    score_distribution: [
      { name: "High (300-579)", count: 0 },
      { name: "Medium (580-667)", count: 0 },
      { name: "Low (668-850)", count: 0 },
    ],
    decision_distribution: [
      { name: "Approved", count: 0 },
      { name: "Approved with Conditions", count: 0 },
      { name: "Declined", count: 0 },
    ],
  });
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [ws, setWs] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Debugging useEffect
  useEffect(() => {
    console.log("Dashboard data updated:", dashboardData);
  }, [dashboardData]);

  useEffect(() => {
    console.log("Recent analyses updated:", recentAnalyses);
  }, [recentAnalyses]);

  useEffect(() => {
    console.log("WebSocket status:", connectionStatus, "WS instance:", ws);
  }, [connectionStatus, ws]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    if (ws) ws.close();
    window.location.href = "/login";
  };

  const fetchDashboardData = useCallback(async (token) => {
    try {
      const response = await fetch("http://localhost:8000/dashboard-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log("Fetched dashboard data:", data);

      const formattedData = {
        approval_rate: data.approval_rate || 0,
        default_rate: data.default_rate || 0,
        model_accuracy: data.model_accuracy || 0,
        approval_change: data.approval_change || 0,
        default_change: data.default_change || 0,
        accuracy_change: data.accuracy_change || 0,
        total_clients: data.total_clients || 0,
        average_score: data.average_score || 0,
        high_risk_clients: data.high_risk_clients || 0,
        portfolio_risk: data.portfolio_risk || "Low",
        score_distribution: data.score_distribution || [
          { name: "High (300-579)", count: 0 },
          { name: "Medium (580-667)", count: 0 },
          { name: "Low (668-850)", count: 0 },
        ],
        decision_distribution: data.decision_distribution || [
          { name: "Approved", count: 0 },
          { name: "Approved with Conditions", count: 0 },
          { name: "Declined", count: 0 },
        ],
      };

      setDashboardData(formattedData);
      return formattedData;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again later.");
      throw error;
    }
  }, []);

  const fetchRecentAnalyses = useCallback(async (token) => {
    try {
      const response = await fetch("http://localhost:8000/recent-analyses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log("Fetched recent analyses:", data);

      const formattedData = data.map((item) => ({
        id: item.id,
        client_name: item.client_name || "Unknown Client",
        credit_score: item.credit_score || 0,
        risk_level: item.risk_level || "medium",
        decision: item.decision || "pending",
        timestamp: item.timestamp || new Date().toISOString(),
      }));

      setRecentAnalyses(formattedData);
      return formattedData;
    } catch (error) {
      console.error("Error fetching recent analyses:", error);
      setError("Failed to load recent analyses.");
      setRecentAnalyses([]);
      throw error;
    }
  }, []);

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (e) {
      return true;
    }
  };

  const refreshAllData = useCallback(async () => {
    setUpdating(true);
    const token = localStorage.getItem("authToken");

    if (!token || isTokenExpired(token)) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserEmail(decoded.sub);
      await Promise.all([fetchDashboardData(token), fetchRecentAnalyses(token)]);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Refresh failed:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      } else {
        setError("Failed to refresh data. Please try again.");
      }
    } finally {
      setUpdating(false);
      setLoading(false);
    }
  }, [fetchDashboardData, fetchRecentAnalyses]);

  // Token refresh check
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const decoded = jwtDecode(token);
        const expiresIn = decoded.exp * 1000 - Date.now();

        if (expiresIn < 5 * 60 * 1000) {
          const newToken = await refreshToken();
          if (newToken) {
            localStorage.setItem("authToken", newToken);
          }
        }
      } catch (error) {
        console.error("Token check failed:", error);
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      }
    };

    const interval = setInterval(checkToken, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Initial data load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.sub);
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    }
    refreshAllData();
  }, [refreshAllData]);

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token || isTokenExpired(token)) {
      console.error("No valid token for WebSocket connection");
      return;
    }

    const socketUrl = `ws://localhost:8000/ws?token=${token}`;
    console.log("Attempting to connect to WebSocket:", socketUrl);

    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
      console.log("WebSocket CONNECTED successfully");
      setWs(socket);
      setConnectionStatus("connected");
      setReconnectAttempts(0);

      // Send initial ping
      socket.send(JSON.stringify({ type: "ping" }));

      // Heartbeat every 25s
      const heartbeatInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "ping" }));
        }
      }, 25000);

      socket.heartbeatInterval = heartbeatInterval;
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("WebSocket message received:", message);

        if (message.type === "new_prediction") {
          console.log("Processing new prediction:", message.data);
          
          // Update recent analyses
          setRecentAnalyses((prev) => [
            {
              id: message.data.id,
              client_name: message.data.client_name,
              credit_score: message.data.credit_score,
              risk_level: message.data.risk_level,
              decision: message.data.decision,
              timestamp: message.data.timestamp,
            },
            ...prev.slice(0, 9), // Keep only 10 most recent
          ]);

          // Update dashboard stats
          setDashboardData((prev) => {
            const newTotalClients = message.data.total_clients || prev.total_clients + 1;
            const newScore = message.data.credit_score;
            const newAverageScore = 
              (prev.average_score * prev.total_clients + newScore) / newTotalClients;

            const newScoreDistribution = [...prev.score_distribution];
            if (newScore <= 579) newScoreDistribution[0].count += 1;
            else if (newScore <= 667) newScoreDistribution[1].count += 1;
            else newScoreDistribution[2].count += 1;

            const newDecisionDistribution = [...prev.decision_distribution];
            const decision = message.data.decision.toLowerCase();
            if (decision === "approved") newDecisionDistribution[0].count += 1;
            else if (decision.includes("approved with conditions")) {
              newDecisionDistribution[1].count += 1;
            } else {
              newDecisionDistribution[2].count += 1;
            }

            const riskLevel = message.data.risk_level.toLowerCase();
            const newHighRiskClients = 
              prev.high_risk_clients + (riskLevel.includes("high") ? 1 : 0);

            let newPortfolioRisk = prev.portfolio_risk;
            const highRiskRatio = newHighRiskClients / newTotalClients;
            if (highRiskRatio > 0.3) {
              newPortfolioRisk = "High";
            } else if (highRiskRatio > 0.2) {
              newPortfolioRisk = "Medium";
            } else {
              newPortfolioRisk = "Low";
            }

            const updatedData = {
              ...prev,
              total_clients: newTotalClients,
              average_score: Math.round(newAverageScore),
              high_risk_clients: newHighRiskClients,
              portfolio_risk: newPortfolioRisk,
              score_distribution: newScoreDistribution,
              decision_distribution: newDecisionDistribution,
              approval_rate: parseFloat(
                (
                  ((newDecisionDistribution[0].count +
                    newDecisionDistribution[1].count * 0.5) /
                    newTotalClients) *
                  100
                ).toFixed(1)
              ),
              default_rate: parseFloat(
                ((newHighRiskClients / newTotalClients) * 100).toFixed(1)
              ),
            };
            

            console.log("Updated dashboard data:", updatedData);
            return updatedData;
          });

          setLastUpdate(new Date());
        } else if (message.type === "pong") {
          console.log("Received pong from server");
        }
      } catch (e) {
        console.error("Error processing WebSocket message:", e);
      }
    };

    socket.onclose = (event) => {
      console.log(`WebSocket closed: ${event.code} - ${event.reason}`);
      setWs(null);
      setConnectionStatus("disconnected");

      if (socket.heartbeatInterval) {
        clearInterval(socket.heartbeatInterval);
      }

      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      setTimeout(() => {
        console.log(`Attempting to reconnect (attempt ${reconnectAttempts + 1})`);
        setReconnectAttempts((prev) => prev + 1);
        connectWebSocket();
      }, delay);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("error");
    };

    return () => {
      if (socket) {
        if (socket.heartbeatInterval) {
          clearInterval(socket.heartbeatInterval);
        }
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      }
    };
  }, [reconnectAttempts]);

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws) {
        if (ws.heartbeatInterval) clearInterval(ws.heartbeatInterval);
        if (ws.readyState === WebSocket.OPEN) ws.close();
      }
    };
  }, [connectWebSocket]);

  // Storage event listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "lastPredictionTime") {
        refreshAllData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refreshAllData]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel.toLowerCase()) {
      case "high":
      case "very high":
        return "text-danger fw-bold";
      case "medium":
        return "text-warning fw-bold";
      case "low":
      case "very low":
        return "text-success fw-bold";
      default:
        return "text-secondary";
    }
  };

  const getDecisionColor = (decision) => {
    switch (decision.toLowerCase()) {
      case "approved":
        return "text-success fw-bold";
      case "declined":
        return "text-danger fw-bold";
      case "approved with conditions":
      case "pending":
        return "text-warning fw-bold";
      default:
        return "text-secondary";
    }
  };

  const COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77"];

  return (
    <Layout
      userEmail={userEmail}
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}
      handleLogout={handleLogout}
    >
      <div className="container py-4">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="text-center mb-4">
          <h2>Welcome to Your Dashboard</h2>
          <p className="text-muted">
            Overview of your credit analysis activities
            {lastUpdate && (
              <span className="ms-2 text-muted small">
                (Last updated: {lastUpdate.toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <Card
              title="Approval Rate"
              value={!loading ? `${dashboardData.approval_rate.toFixed(1)}%` : "--"}
              change={
                !loading
                  ? `${dashboardData.approval_change > 0 ? "+" : ""}${
                      dashboardData.approval_change
                    }% from last month`
                  : "Loading..."
              }
              Icon={TrendingUp}
              loading={loading}
            />
          </div>
          <div className="col-md-4">
            <Card
              title="Default Rate"
              value={!loading ? `${dashboardData.default_rate.toFixed(1)}%` : "--"}
              change={
                !loading
                  ? `${dashboardData.default_change > 0 ? "+" : ""}${
                      dashboardData.default_change
                    }% from last month`
                  : "Loading..."
              }
              Icon={AlertTriangle}
              loading={loading}
            />
          </div>
          <div className="col-md-4">
            <Card
              title="Model Accuracy"
              value={!loading ? `${dashboardData.model_accuracy.toFixed(1)}%` : "--"}
              change={
                !loading
                  ? `${dashboardData.accuracy_change > 0 ? "+" : ""}${
                      dashboardData.accuracy_change
                    }% from last month`
                  : "Loading..."
              }
              Icon={CheckCircle}
              loading={loading}
            />
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="p-4 bg-white rounded shadow-sm text-center h-100">
              <i className="bi bi-people-fill fs-1 text-primary mb-2"></i>
              <h5>Total Clients Analyzed</h5>
              <h3>
                {loading ? (
                  <span className="placeholder col-6"></span>
                ) : (
                  dashboardData.total_clients
                )}
              </h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-4 bg-white rounded shadow-sm text-center h-100">
              <i className="bi bi-speedometer2 fs-1 text-success mb-2"></i>
              <h5>Average Credit Score</h5>
              <h3>
                {loading ? (
                  <span className="placeholder col-6"></span>
                ) : (
                  dashboardData.average_score
                )}
              </h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-4 bg-white rounded shadow-sm text-center h-100">
              <i className="bi bi-exclamation-triangle-fill fs-1 text-danger mb-2"></i>
              <h5>High Risk Clients</h5>
              <h3>
                {loading ? (
                  <span className="placeholder col-6"></span>
                ) : (
                  dashboardData.high_risk_clients
                )}
              </h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-4 bg-white rounded shadow-sm text-center h-100">
              <i className="bi bi-graph-up-arrow fs-1 text-warning mb-2"></i>
              <h5>Portfolio Risk Level</h5>
              <h3
                className={`fw-bold ${
                  !loading
                    ? dashboardData.portfolio_risk === "High"
                      ? "text-danger"
                      : dashboardData.portfolio_risk === "Medium"
                      ? "text-warning"
                      : "text-success"
                    : "placeholder col-6"
                }`}
              >
                {loading ? "" : dashboardData.portfolio_risk}
              </h3>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="p-4 bg-white rounded shadow-sm h-100">
              <h4 className="text-center mb-3">Credit Score Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.score_distribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {dashboardData.score_distribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} clients`, "Count"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-4 bg-white rounded shadow-sm h-100">
              <h4 className="text-center mb-3">Decision Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dashboardData.decision_distribution}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#4D96FF"
                    name="Number of Clients"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Recent Client Analyses</h4>
            <div>
              <button
                onClick={refreshAllData}
                className="btn btn-sm btn-outline-secondary me-2"
                disabled={loading || updating}
              >
                <RefreshCw size={16} className={updating ? "spin" : ""} />
                {updating ? " Updating..." : " Refresh Data"}
              </button>
              <small className="text-muted">
                Showing {recentAnalyses.length} most recent
              </small>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : recentAnalyses.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Client Name</th>
                    <th>Credit Score</th>
                    <th>Risk Level</th>
                    <th>Decision</th>
                    <th>Date Analyzed</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAnalyses.map((analysis) => (
                    <tr key={analysis.id}>
                      <td>{analysis.client_name}</td>
                      <td>{analysis.credit_score}</td>
                      <td className={getRiskColor(analysis.risk_level)}>
                        {analysis.risk_level.toUpperCase()}
                      </td>
                      <td className={getDecisionColor(analysis.decision)}>
                        {analysis.decision.toUpperCase()}
                      </td>
                      <td>
                        <Clock size={16} className="me-2" />
                        {formatDate(analysis.timestamp)}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="d-flex flex-column align-items-center">
                <UserX size={48} className="text-muted mb-3" />
                <p>No recent analyses found</p>
                <button className="btn btn-primary mt-2">
                  Perform New Analysis
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          className={`position-fixed bottom-0 end-0 p-3 ${
            connectionStatus === "connected" ? "text-success" : "text-danger"
          }`}
        >
          <i className={`bi bi-circle-fill me-2`}></i>
          {connectionStatus === "connected"
            ? "Live updates connected"
            : "Live updates disconnected"}
        </div>

        {updating && (
          <div className="position-fixed bottom-0 start-0 p-3 text-info">
            <i className="bi bi-arrow-repeat me-2 spin"></i>
            Updating dashboard...
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;