import React from "react";
import styles from "./formSelect.module.css";
import classNames from "classnames";

const FormSelect = ({
  label,

  name,

  value,

  onChange,

  onBlur,

  options = [],

  placeholder = "Select option",

  loading = false,

  disabled = false,

  variant = "primary",

  size = "medium",

  width = "fullWidth",

  error,

  className,

  selectClassName,

  ...props
}) => {
  return (
    <div className={classNames(styles.selectGroup, styles[width], className)}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={loading || disabled}
        className={classNames(
          styles.select,

          styles[variant],

          styles[size],

          selectClassName,

          {
            [styles.errorInput]: error,
          },
        )}
        {...props}
      >
        <option value="">{loading ? "Loading..." : placeholder}</option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
};

export default FormSelect;
