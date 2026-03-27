import React, { createContext, useContext, useState, useCallback } from "react";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const showAlert = useCallback(
    (type, message, duration = 4000) => {
      const id = Date.now();

      setAlerts((prev) => [...prev, { id, type, message }]);

      if (duration > 0) {
        setTimeout(() => removeAlert(id), duration);
      }
    },
    []
  );

  return (
    <AlertContext.Provider
      value={{
        alerts,
        showAlert,
        removeAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlertContext = () => useContext(AlertContext);
