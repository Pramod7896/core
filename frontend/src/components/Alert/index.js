import React from "react";
import styles from "./alert.module.css";
import classNames from "classnames";

const Alert = ({ type = "info", message, onClose }) => {
  return (
    <div className={classNames(styles.alert, styles[type])}>
      <span className={styles.message}>{message}</span>

      {onClose && (
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
