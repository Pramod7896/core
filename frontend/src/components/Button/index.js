import React from "react";
import styles from "./button.module.css";
import classNames from "classnames";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  width = "autoWidth",
  loading = false,
  disabled = false,
  className,
  type = "button",
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={classNames(
        styles.btn,
        styles[variant],
        styles[size],
        styles[width],
        className,
        {
          [styles.disabled]: isDisabled,
        }
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && <span className={styles.spinner}></span>}

      <span className={classNames({ [styles.loadingText]: loading })}>
        {children}
      </span>

    </button>
  );
};

export default Button;
