import React from "react";
import styles from "./FormRadio.module.css";
import classNames from "classnames";

const FormRadio = ({
  label,
  name,
  options = [],
  value,
  onChange,
  error,
  className,
  radioClassName,
  labelClassName,
}) => {
  return (
    <div className={classNames(styles.wrapper, className)}>
      {label && (
        <label className={classNames(styles.groupLabel, labelClassName)}>
          {label}
        </label>
      )}

      {options.map((opt) => (
        <label
          key={opt.value}
          className={classNames(styles.radioItem, radioClassName)}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={onChange}
            className={styles.radioInput}
          />

          <span className={styles.radioLabel}>{opt.label}</span>
        </label>
      ))}

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default FormRadio;
