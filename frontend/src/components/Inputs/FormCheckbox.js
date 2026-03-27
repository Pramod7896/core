import React from "react";
import styles from "./formCheckbox.module.css";
import classNames from "classnames";

const FormCheckbox = ({
  label,

  variant = "primary",

  size = "medium",

  className,

  inputClassName,

  error,

  ...props
}) => {
  return (
    <div className={classNames(styles.checkboxGroup, className)}>
      <div className={styles.wrapper}>
        <input
          type="checkbox"
          className={classNames(
            styles.checkbox,

            styles[variant],

            styles[size],

            inputClassName,

            {
              [styles.errorInput]: error,
            },
          )}
          {...props}
        />

        {label && <label className={styles.label}>{label}</label>}
      </div>

      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
};

export default FormCheckbox;
