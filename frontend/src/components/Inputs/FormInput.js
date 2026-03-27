import React, { useRef, useState } from "react";
import styles from "./formInput.module.css";
import classNames from "classnames";

const FormInput = ({
  label,
  variant = "primary",
  size = "medium",
  width = "fullWidth",
  className,
  inputClassName,
  error,
  leftIcon,
  rightIcon,
  showToggle = false,
  showPassword = false,
  togglePassword,
  type = "text",
  value,
  onChange,
  accept,
  placeholder,
  ...props
}) => {
  const inputType = showToggle ? (showPassword ? "text" : "password") : type;

  const fileRef = useRef(null);
  const [fileName, setFileName] = useState("");

  const handleFileClick = () => fileRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileName(file ? file.name : "");
    if (onChange) onChange(e);
  };

  return (
    <div className={classNames(styles.formGroup, styles[width], className)}>
      {label && <label className={styles.label}>{label}</label>}

      <div className={styles.wrapper}>
        {/* NORMAL INPUTS (text, email, password, etc.) */}
        {type !== "file" && (
          <>
            {leftIcon && (
              <span className={styles.leftIcon}>
                <i className={`bi ${leftIcon}`} />
              </span>
            )}

            <input
              type={inputType}
              className={classNames(
                styles.input,
                styles[variant],
                styles[size],
                inputClassName,
                {
                  [styles.withLeftIcon]: leftIcon,
                  [styles.withRightIcon]: rightIcon || showToggle,
                  [styles.errorInput]: error,
                }
              )}
              placeholder={placeholder}
              value={value || ""}
              onChange={onChange}
              {...props}
            />

            {rightIcon && !showToggle && (
              <span className={styles.rightIcon}>
                <i className={`bi ${rightIcon}`} />
              </span>
            )}

            {showToggle && (
              <span className={styles.rightIcon} onClick={togglePassword}>
                <i
                  className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"}`}
                />
              </span>
            )}
          </>
        )}

        {/* FILE INPUT */}
        {type === "file" && (
          <div className={styles.fileContainer}>
            <input
              type="text"
              readOnly
              value={fileName}
              placeholder="No file chosen"
              className={classNames(
                styles.input,
                styles.fileInput,
                styles[size],
                inputClassName,
                { [styles.errorInput]: error }
              )}
            />

            <button
              type="button"
              className={styles.fileButton}
              onClick={handleFileClick}
            >
              Choose File
            </button>

            <input
              ref={fileRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
        )}
      </div>

      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
};

export default FormInput;
