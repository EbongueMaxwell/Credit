// Badge.js
import React from "react";

const Badge = ({ children, variant }) => {
  const className = `badge ${
    variant === "default"
      ? "bg-primary"
      : variant === "secondary"
      ? "bg-secondary"
      : "bg-danger"
  }`;
  return <span className={className}>{children}</span>;
};

export default Badge;
