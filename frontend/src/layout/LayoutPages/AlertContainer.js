import React from "react";
import Alert from "../../components/Alert";
import { useAlertContext } from "../../contexts/AlertContext";
import "../LayoutCss/alertContainer.css";

const AlertContainer = () => {
  const { alerts, removeAlert } = useAlertContext();

  return (
    <div className="alert-container">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => removeAlert(alert.id)}
        />
      ))}
    </div>
  );
};

export default AlertContainer;
