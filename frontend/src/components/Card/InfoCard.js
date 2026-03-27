import React from "react";

const InfoCard = ({ title, content }) => {
  return (
    <div style={{
      backgroundColor: "var(--color-background)",
      color: "var(--color-text)",
      padding: "1rem",
      borderRadius: "var(--border-radius)",
      border: "1px solid var(--border-color)",
      fontFamily: "var(--font-family)"
    }}>
      <h3 style={{ fontSize: "var(--font-h3)" }}>{title}</h3>
      <p style={{ fontSize: "var(--font-body)" }}>{content}</p>
    </div>
  );
};

export default InfoCard;
