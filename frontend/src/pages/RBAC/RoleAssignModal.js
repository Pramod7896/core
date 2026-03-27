import React, { useState } from "react";
import "./RBACPage.css";

import { assignRoleAPI } from "../../api/rbac";

const RoleAssignModal = ({ show, onClose }) => {
  const [userId, setUserId] = useState("");

  const [roleId, setRoleId] = useState("");

  const submit = async () => {
    await assignRoleAPI({
      user_id: userId,

      role_id: roleId,
    });

    onClose();
  };

  if (!show) return null;

  return (
    <div className="rbac-modal">
      <div className="rbac-modal-content">
        <h4>Assign Role</h4>

        <input
          placeholder="User ID"
          onChange={(e) => setUserId(e.target.value)}
        />

        <input
          placeholder="Role ID"
          onChange={(e) => setRoleId(e.target.value)}
        />

        <button className="btn btn-success" onClick={submit}>
          Save
        </button>

        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default RoleAssignModal;
