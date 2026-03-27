import React from "react";
import styles from "./actionButtons.module.css";

import editIcon from "../../../assets/ActionIcons/EditTextIcon.svg";
import viewIcon from "../../../assets/ActionIcons/ViewIcon.svg";
import deleteIcon from "../../../assets/ActionIcons/DeleteIcon.svg";
import toggleIcon from "../../../assets/ActionIcons/ChangeStatusIcon.svg";

import { useAuth } from "../../../contexts/AuthContext"; // ✅ ADD

const ActionButtons = ({
  row,
  route, // ✅ PASS CURRENT PAGE ROUTE
  onEdit,
  onView,
  onDelete,
  onStatusToggle,
}) => {
  const { hasActionAccess } = useAuth();

  const canView = hasActionAccess(route, "view");
  const canEdit = hasActionAccess(route, "edit");
  const canDelete = hasActionAccess(route, "delete");
  const canToggle = hasActionAccess(route, "edit"); // status change usually edit permission

  return (
    <div className={styles.buttonGroup}>
      {/* VIEW */}
      {canView && (
        <button
          className={styles.iconButton}
          onClick={() => onView(row)}
          title="View"
        >
          <img src={viewIcon} alt="View" className={styles.iconImage} />
        </button>
      )}

      {/* EDIT */}
      {canEdit && (
        <button
          className={styles.iconButton}
          onClick={() => onEdit(row)}
          title="Edit"
        >
          <img src={editIcon} alt="Edit" className={styles.iconImage} />
        </button>
      )}

      {/* DELETE */}
      {canDelete && (
        <button
          className={styles.iconButton}
          onClick={() => onDelete(row)}
          title="Delete"
        >
          <img src={deleteIcon} alt="Delete" className={styles.iconImage} />
        </button>
      )}

      {/* STATUS TOGGLE */}
      {canToggle && (
        <button
          className={styles.iconButton}
          onClick={() => onStatusToggle(row)}
          title="Toggle Status"
        >
          <img
            src={toggleIcon}
            alt="Toggle Status"
            className={styles.iconImage}
          />
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
