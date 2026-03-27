import React from "react";
import styles from "./Form.module.css";
import classNames from "classnames";

const Form = ({ children, onSubmit, className, variant = "vertical" }) => {
  return (
    <form
      onSubmit={onSubmit}
      className={classNames(styles.form, styles[variant], className)}
    >
      {children}
    </form>
  );
};

export default Form;
