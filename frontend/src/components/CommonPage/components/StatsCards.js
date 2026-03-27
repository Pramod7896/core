import React from "react";
import "./statsCard.css";

const StatsCards = ({ stats }) => {
  const safeStats = Array.isArray(stats) ? stats : [];

  return (
    <div className="stats-container">
      {safeStats.map((item, index) => (
        <div key={index} className="dashboard-box stats-card">
          {/* TOP SECTION */}
          <div className="stats-card-top">
            <div className="stats-card-header">
              {item.icon && (
                <i className={`bi bi-${item.icon} stats-card-icon`}></i>
              )}

              <h5 className="stats-card-title">{item.title}</h5>
            </div>

            <h4 className="stats-card-value">
              {typeof item.value !== "undefined" ? item.value : "0"}
            </h4>
          </div>

          {/* BOTTOM SUMMARY */}
          <div className="stats-card-summary">
            {item.summary && item.summary.length > 0 ? (
              item.summary.map((s, i) => (
                <span key={i}>
                  {s.label}: {s.value}
                </span>
              ))
            ) : (
              <span className="stats-placeholder">placeholder</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
