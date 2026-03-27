import React from "react";
import ReactDOM from "react-dom";
import styles from "./modal.module.css";
import classNames from "classnames";

const Modal = ({ isOpen, onClose, title, children, size = "medium" }) => {
  if (!isOpen) return null;

  // modal size classes
  const modalSizeClass = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  }[size];

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={classNames(styles.modal, modalSizeClass)}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {title && <h5 className={styles.title}>{title}</h5>}
        <div className={styles.content}>{children}</div>
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>
      </div>
    </div>,
    document.getElementById("root") // make sure your index.html has <div id="modal-root"></div>
  );
};

export default Modal;
