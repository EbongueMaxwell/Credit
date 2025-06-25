import React, { useState } from "react";
import { Brain, Check } from "lucide-react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Card = ({ children }) => (
  <div className="card shadow-sm mb-4 rounded-3">{children}</div>
);
const CardHeader = ({ children }) => (
  <div className="card-header bg-light border-bottom">{children}</div>
);
const CardContent = ({ children }) => (
  <div className="card-body bg-white">{children}</div>
);
const CardTitle = ({ children }) => (
  <h5 className="card-title mb-1 d-flex align-items-center gap-2">
    {children}
  </h5>
);
const CardDescription = ({ children }) => (
  <p className="text-muted mb-0">{children}</p>
);
const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="form-label fw-semibold">
    {children}
  </label>
);
const Input = ({ id, ...props }) => (
  <input id={id} className="form-control rounded-2" {...props} />
);
const Select = ({ id, children, onChange }) => (
  <select id={id} className="form-select rounded-2" onChange={onChange}>
    {children}
  </select>
);
const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const btnClass =
    variant === "outline" ? "btn btn-outline-primary" : "btn btn-primary";
  return (
    <button className={`${btnClass} ${className}`} {...props}>
      {children}
    </button>
  );
};
const Progress = ({ value }) => (
  <div className="progress" style={{ height: "20px" }}>
    <div
      className="progress-bar progress-bar-striped progress-bar-animated bg-success"
      role="progressbar"
      style={{ width: `${value}%` }}
      aria-valuenow={value}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      {value}%
    </div>
  </div>
);

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    client_name: "",
    age: "",
    income: "",
    employment: "",
    loanAmount: "",
    loanPurpose: "",
    location: "",
    phoneUsage: "",
    utilityPayments: "",
    interestRate: "",
    turnover: "",
    customerTenure: "",
    avgDaysLateCurrent: "",
    numLatePaymentsCurrent: "",
    unpaidAmount: "",
    industrySector: "",
    creditType: "",
    hasGuarantee: "",
    guaranteeType: "",
    repaymentFrequency: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [creditScore, setCreditScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState("");
  const [approvalProbability, setApprovalProbability] = useState(0);

  const downloadPdf = async () => {
    try {
      const response = await fetch("http://localhost:8000/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: formData.client_name,
          creditScore: creditScore,
          riskLevel: riskLevel,
          approvalProbability: approvalProbability,
          decision:
            riskLevel === "high" || riskLevel === "very high"
              ? "declined"
              : "approved",
          keyFactors: {
            positive: ["High income", "Good payment history"],
            negative: ["High debt ratio"],
          },
        }),
      });

      if (!response.ok) throw new Error("PDF generation failed");

      // Create a blob from the response
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `credit_report_${formData.client_name}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF report");
    }
  };
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowResults(false);

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Prediction request failed");

      const result = await response.json();
      setCreditScore(result.creditScore);
      setRiskLevel(result.riskLevel);
      setApprovalProbability(result.approvalProbability);
      setShowResults(true);
      // Notify dashboard of new prediction (success)
      localStorage.setItem("lastPredictionTime", Date.now().toString());
    } catch (error) {
      console.error("Error:", error);
      alert("Error processing credit prediction.");
      // Notify dashboard of prediction attempt (failure)
      localStorage.setItem("lastPredictionTime", Date.now().toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <Check size={25} color="#2563eb" /> Credit Application
          </CardTitle>
          <CardDescription>
            Enter applicant information for AI-powered credit assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="row g-3">
              {/* Existing fields */}
              <div className="col-md-6">
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) =>
                    handleInputChange("client_name", e.target.value)
                  }
                  required
                />
              </div>

              <div className="col-md-6">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <Label htmlFor="income">Monthly Income (CFA)</Label>
                <Input
                  id="income"
                  type="number"
                  value={formData.income}
                  onChange={(e) => handleInputChange("income", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <Label htmlFor="employment">Employment Status</Label>
                <Select
                  id="employment"
                  onChange={(e) =>
                    handleInputChange("employment", e.target.value)
                  }
                >
                  <option value="">Select status</option>
                  <option value="employed">Employed</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="student">Student</option>
                </Select>
              </div>
              <div className="col-md-6">
                <Label htmlFor="loanAmount">Loan Amount (CFA)</Label>
                <Input
                  id="loanAmount"
                  type="number"
                  value={formData.loanAmount}
                  onChange={(e) =>
                    handleInputChange("loanAmount", e.target.value)
                  }
                  required
                />
              </div>
              <div className="col-md-6">
                <Label htmlFor="loanPurpose">Loan Purpose</Label>
                <Select
                  id="loanPurpose"
                  onChange={(e) =>
                    handleInputChange("loanPurpose", e.target.value)
                  }
                >
                  <option value="">Select purpose</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="home">Home Purchase</option>
                  <option value="personal">Personal</option>
                </Select>
              </div>
              <div className="col-md-6">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  required
                />
              </div>
              <div className="col-md-6">
                <Label htmlFor="phoneUsage">Mobile Usage Pattern</Label>
                <Select
                  id="phoneUsage"
                  onChange={(e) =>
                    handleInputChange("phoneUsage", e.target.value)
                  }
                >
                  <option value="">Select usage</option>
                  <option value="elevated">Elevated &gt; 8-12 hrs/day</option>
                  <option value="heavy">Heavy &gt;5 hrs/day</option>
                  <option value="moderate">Moderate 2-5 hrs/day</option>
                  <option value="light">Light &lt;2 hrs/day</option>
                </Select>
              </div>
              <div className="col-md-6">
                <Label htmlFor="utilityPayments">Utility Payment History</Label>
                <Select
                  id="utilityPayments"
                  onChange={(e) =>
                    handleInputChange("utilityPayments", e.target.value)
                  }
                >
                  <option value="">Select history</option>
                  <option value="excellent">Always on time</option>
                  <option value="good">Mostly on time</option>
                  <option value="fair">Sometimes late</option>
                  <option value="poor">Often late</option>
                </Select>
              </div>
              {/* ... existing JSX ... */}

              {/* Additional Numeric Fields */}
              <div className="col-md-6">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) =>
                    handleInputChange("interestRate", e.target.value)
                  }
                  required
                />
              </div>
              <div className="col-md-6">
                <Label htmlFor="turnover">Monthly Turnover</Label>
                <Input
                  id="turnover"
                  type="number"
                  value={formData.turnover}
                  onChange={(e) =>
                    handleInputChange("turnover", e.target.value)
                  }
                  required
                />
              </div>
              <div className="col-md-6">
                <Label htmlFor="customerTenure">Customer Tenure (months)</Label>
                <Input
                  id="customerTenure"
                  type="number"
                  value={formData.customerTenure}
                  onChange={(e) =>
                    handleInputChange("customerTenure", e.target.value)
                  }
                  required
                />
              </div>
              <div className="col-md-6">
                <Label htmlFor="avgDaysLateCurrent">
                  Avg. Days Late (Current)
                </Label>
                <Input
                  id="avgDaysLateCurrent"
                  type="number"
                  value={formData.avgDaysLateCurrent}
                  onChange={(e) =>
                    handleInputChange("avgDaysLateCurrent", e.target.value)
                  }
                  required
                />
              </div>
              <div className="col-md-6">
                <Label htmlFor="numLatePaymentsCurrent">
                  # Late Payments (Current)
                </Label>
                <Input
                  id="numLatePaymentsCurrent"
                  type="number"
                  value={formData.numLatePaymentsCurrent}
                  onChange={(e) =>
                    handleInputChange("numLatePaymentsCurrent", e.target.value)
                  }
                  required
                />
              </div>
              <div className="col-md-6">
                <Label htmlFor="unpaidAmount">Unpaid Amount</Label>
                <Input
                  id="unpaidAmount"
                  type="number"
                  value={formData.unpaidAmount}
                  onChange={(e) =>
                    handleInputChange("unpaidAmount", e.target.value)
                  }
                  required
                />
              </div>

              {/* Additional Categorical Fields */}
              <div className="col-md-6">
                <Label htmlFor="industrySector">Industry Sector</Label>
                <Select
                  id="industrySector"
                  onChange={(e) =>
                    handleInputChange("industrySector", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  <option value="retail">Retail</option>
                  <option value="services">Services</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Health Care</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="construction">Construction</option>
                </Select>
              </div>
              <div className="col-md-6">
                <Label htmlFor="creditType">Credit Type</Label>
                <Select
                  id="creditType"
                  onChange={(e) =>
                    handleInputChange("creditType", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  <option value="term_loan">Term Loan</option>
                  <option value="line_of_credit">Line of Credit</option>
                </Select>
              </div>
              <div className="col-md-6">
                <Label htmlFor="hasGuarantee">Has Guarantee?</Label>
                <Select
                  id="hasGuarantee"
                  onChange={(e) =>
                    handleInputChange("hasGuarantee", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </div>
              <div className="col-md-6">
                <Label htmlFor="guaranteeType">Guarantee Type</Label>
                <Select
                  id="guaranteeType"
                  onChange={(e) =>
                    handleInputChange("guaranteeType", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  <option value="collateral">Collateral</option>
                  <option value="third_party">Third-Party</option>
                </Select>
              </div>
              <div className="col-md-6">
                <Label htmlFor="repaymentFrequency">Repayment Frequency</Label>
                <Select
                  id="repaymentFrequency"
                  onChange={(e) =>
                    handleInputChange("repaymentFrequency", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Button type="submit" disabled={isLoading} className="w-100">
                {isLoading ? "Processing with AI..." : "Analyze Credit Risk"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>
              <Brain className="text-info" /> AI Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={100} />
          </CardContent>
        </Card>
      )}

      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle>
              <Check size={24} className="text-success" /> Credit Score Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Credit Score:</strong> {creditScore}
            </p>
            <p>
              <strong>Risk Level:</strong> {riskLevel}
            </p>
            <p>
              <strong>Approval Probability:</strong> {approvalProbability}%
            </p>
            <Button onClick={downloadPdf} variant="outline" className="w-100">
              Download PDF Report
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicationForm;