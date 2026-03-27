import React, { useEffect, useState } from "react";

import "./RBACPage.css";

import { getRBACAPI, updatePermissionAPI } from "../../api/rbac";

import { useAuth } from "../../contexts/AuthContext";

import useAlert from "../../hooks/useAlert";

import ActionDropdown from "../../components/ActionDropDown/ActionDropdown";

import Button from "../../components/Button";

const RBACPage = () => {
  const { user } = useAuth();

  const { showAlert } = useAlert();

  const [roles, setRoles] = useState([]);

  const [pages, setPages] = useState([]);

  const [selectedRole, setSelectedRole] = useState(null);

  /**
   * LOAD ONLY ROLES AND PAGES (NO AUTO SELECT)
   */

  useEffect(() => {
    fetchRBAC("");
  }, []);

  /**
   * FETCH RBAC
   */

  const fetchRBAC = async (roleId = "") => {
    try {
      const res = await getRBACAPI(roleId);

      setRoles(res.data.data.roles || []);

      setPages(res.data.data.pages || []);
    } catch (err) {
      console.error(err);

      showAlert("error", "Failed to load RBAC");
    }
  };

  /**
   * ROLE SELECT
   */

  const handleRoleSelect = async (role) => {
    setSelectedRole(role);

    // fetch permission of selected role

    fetchRBAC(role.role_id);
  };

  /**
   * VALIDATE ROLE
   */

  const validateRole = () => {
    if (!selectedRole) {
      showAlert("warning", "Please select role first");

      return false;
    }

    return true;
  };

  /**
   * SWITCH
   */

  const handleSwitch = async (pageId, field, value) => {
    if (!validateRole()) return;

    try {
      const page = pages.find((p) => p.page_id === pageId);

      await updatePermissionAPI({
        role_id: selectedRole.role_id,

        page_id: pageId,

        can_view: field === "can_view" ? value : page.can_view,

        can_create: field === "can_create" ? value : page.can_create,

        can_edit: field === "can_edit" ? value : page.can_edit,

        can_delete: field === "can_delete" ? value : page.can_delete,
      });

      showAlert("success", "Permission updated");

      fetchRBAC(selectedRole.role_id);
    } catch (err) {
      console.error(err);

      showAlert("error", "Update failed");
    }
  };

  /**
   * ENABLE / DISABLE ALL
   */

  const handleAll = async (pageId, enable) => {
    if (!validateRole()) return;

    try {
      await updatePermissionAPI({
        role_id: selectedRole.role_id,

        page_id: pageId,

        can_view: enable,

        can_create: enable,

        can_edit: enable,

        can_delete: enable,
      });

      showAlert("success", "Permission updated");

      fetchRBAC(selectedRole.role_id);
    } catch (err) {
      console.error(err);

      showAlert("error", "Update failed");
    }
  };

  /**
   * ROLE DROPDOWN
   */

  const roleItems = roles.map((role) => ({
    label: role.role_name,

    icon: "person",

    onClick: () => handleRoleSelect(role),
  }));

  return (
    <div className="rbac-container">
      <h3>RBAC Management</h3>

      {/* DROPDOWN */}

      <div className="mb-3 d-flex justify-content-end">
        {user.is_super_admin && (
          <ActionDropdown items={roleItems}>
            <Button variant="secondary">
              {selectedRole ? selectedRole.role_name : "Select Role"}

              <i className="ms-3 bi bi-chevron-down" />
            </Button>
          </ActionDropdown>
        )}
      </div>

      {/* TABLE */}
      <div className="rbac-table-wrapper">
        <table className="rbac-table">
          <thead>
            <tr>
              <th>Page</th>

              <th>All</th>

              <th>View</th>

              <th>Create</th>

              <th>Edit</th>

              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {pages.map((page) => {
              const allEnabled =
                page.can_view &&
                page.can_create &&
                page.can_edit &&
                page.can_delete;

              return (
                <tr key={page.page_id}>
                  <td>{page.page_name}</td>

                  {/* ALL BUTTON */}

                  <td>
                    <Button
                      variant={allEnabled ? "danger" : "success"}
                      size="small"
                      onClick={() => handleAll(page.page_id, !allEnabled)}
                    >
                      {allEnabled ? "Disable" : "Enable"}
                    </Button>
                  </td>

                  {/* SWITCH */}

                  {["can_view", "can_create", "can_edit", "can_delete"].map(
                    (field) => (
                      <td key={field}>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={page[field]}
                            onChange={(e) =>
                              handleSwitch(page.page_id, field, e.target.checked)
                            }
                          />

                          <span className="slider round"></span>
                        </label>
                      </td>
                    ),
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RBACPage;
