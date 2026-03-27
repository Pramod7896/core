import React, { useState } from "react";

import { updatePermissionAPI } from "../../api/rbac";

const PermissionModal = ({ show, page, onClose, refresh }) => {
  const [permissions, setPermissions] = useState({
    can_view: page?.can_view,

    can_create: page?.can_create,

    can_edit: page?.can_edit,

    can_delete: page?.can_delete,
  });

  if (!show) return null;

  const save = async () => {
    await updatePermissionAPI({
      role_id: page.role_id,

      page_id: page.page_id,

      permissions,
    });

    refresh();

    onClose();
  };

  return (
    <div className="rbac-modal">
      <div className="rbac-modal-content">
        <h4>Edit Permission</h4>

        {Object.keys(permissions).map((key) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={permissions[key]}
              onChange={(e) =>
                setPermissions({
                  ...permissions,

                  [key]: e.target.checked,
                })
              }
            />

            {key}
          </label>
        ))}

        <button onClick={save} className="btn btn-success">
          Save
        </button>
      </div>
    </div>
  );
};

export default PermissionModal;
