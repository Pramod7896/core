import React, { useState, useEffect, useMemo, useRef } from "react";

import Modal from "../../Modal";
import Form from "../../Form/Form";
import FormInput from "../../Inputs/FormInput";
import FormSelect from "../../Inputs/FormSelect";
import Button from "../../Button";

import styles from "./pageModal.module.css";
import useAlert from "../../../hooks/useAlert";
import { useAuth } from "../../../contexts/AuthContext";
import { getRolesByEnterprizeAPI } from "../../../api/rbac";

const isEnterpriseField = (field = {}) => {
  const name = String(field.name || "").toLowerCase();
  const label = String(field.label || "").toLowerCase();
  return (
    name.includes("enterprise") ||
    name.includes("enterprize") ||
    label.includes("enterprise") ||
    label.includes("enterprize")
  );
};

const orderFormFields = (fields = []) => {
  const enterpriseSelect = [];
  const otherSelects = [];
  const nonSelects = [];

  fields.forEach((field) => {
    if (field.type !== "select") {
      nonSelects.push(field);
      return;
    }

    if (isEnterpriseField(field)) {
      enterpriseSelect.push(field);
      return;
    }

    otherSelects.push(field);
  });

  return [...enterpriseSelect, ...otherSelects, ...nonSelects];
};

const groupFieldsBySection = (fields = [], fallbackSectionTitle = "") => {
  const sectionOrder = [];
  const sectionMap = {};

  fields.forEach((field) => {
    const explicitSectionName =
      typeof field.section === "string" ? field.section.trim() : "";
    const sectionName = explicitSectionName || fallbackSectionTitle;
    const sectionKey = sectionName || "__default__";

    if (!sectionMap[sectionKey]) {
      sectionMap[sectionKey] = {
        title: sectionName || null,
        fields: [],
      };
      sectionOrder.push(sectionKey);
    }

    sectionMap[sectionKey].fields.push(field);
  });

  return sectionOrder.map((key) => sectionMap[key]);
};

const PageModal = ({ show, onClose, config, mode, data, onSave }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [roleOptions, setRoleOptions] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const orderedFields = orderFormFields(config?.form || []);
  const pageCode = String(config?.code || config?.model_name || "").toLowerCase();
  const fallbackSectionTitle =
    pageCode === "enterprize" ? "Enterprize Details" : "";
  const formSections = groupFieldsBySection(orderedFields, fallbackSectionTitle);

  const hasEnterprizeSelect = useMemo(
    () => orderedFields.some((f) => f?.type === "select" && f?.name === "enterprize_fid"),
    [orderedFields],
  );

  const hasRoleSelect = useMemo(
    () => orderedFields.some((f) => f?.type === "select" && f?.name === "role_fid"),
    [orderedFields],
  );

  const hasEnterprizeRoleDependency = hasEnterprizeSelect && hasRoleSelect;
  const previousEnterprizeRef = useRef(null);

  useEffect(() => {
    if (show) return;
    previousEnterprizeRef.current = null;
    setRoleOptions([]);
    setRolesLoading(false);
  }, [show]);

  /**
   * =====================================
   * INITIALIZE FORM DATA
   * =====================================
   */

  const validateForm = () => {
    const errors = {};

    config.form.forEach((field) => {
      const value = formData[field.name];
      const isDependentRequiredSelect =
        hasEnterprizeRoleDependency &&
        field.type === "select" &&
        (field.name === "enterprize_fid" || field.name === "role_fid");

      // Skip password required validation in Edit mode
      const isPasswordField = field.type === "password";
      const isEditMode = mode === "Edit";

      // Required validation
      if (field.required || isDependentRequiredSelect) {
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          (field.type === "file" && !value?.name)
        ) {
          if (!(isEditMode && isPasswordField)) {
            // only skip password in edit
            errors[field.name] = `${field.label} is required`;
          }
        }
      }

      if (
        hasEnterprizeRoleDependency &&
        field.name === "role_fid" &&
        String(formData.enterprize_fid || "").trim() &&
        !rolesLoading &&
        roleOptions.length === 0
      ) {
        errors[field.name] = "No roles available for selected enterprize";
      }

      // Email validation (even if optional)
      if (field.type === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[field.name] = "Invalid email address";
        }
      }

      // Password length validation only if filled
      if (isPasswordField && value && value.length < 6) {
        errors[field.name] = "Password must be at least 6 characters";
      }
    });

    return errors;
  };

  useEffect(() => {
    if (!config) return;

    if (data && (mode === "Edit" || mode === "View")) {
      setFormData(data);
    } else {
      const initial = {};

      config.form.forEach((field) => {
        initial[field.name] = field.defaultValue || "";
      });

      setFormData(initial);
    }

    // Show validation messages only after a submit attempt
    setErrors({});
  }, [data, config, mode]);

  /**
   * =====================================
   * PRESELECT ENTERPRIZE FOR NON-SUPERADMIN
   * =====================================
   */

  useEffect(() => {
    if (!show) return;
    if (!hasEnterprizeSelect) return;
    if (!user || user.is_super_admin) return;

    setFormData((prev) => {
      const current = prev?.enterprize_fid;
      if (current !== undefined && current !== null && String(current) !== "") return prev;
      return { ...prev, enterprize_fid: user.enterprize_id };
    });
  }, [show, hasEnterprizeSelect, user]);

  /**
   * =====================================
   * DEPENDENT DROPDOWN: ENTERPRIZE -> ROLES
   * =====================================
   */

  useEffect(() => {
    if (!show) return;
    if (!hasEnterprizeRoleDependency) return;

    const selectedEnterprizeId = String(formData.enterprize_fid || "").trim();

    // Clear dependent when parent cleared
    if (!selectedEnterprizeId) {
      previousEnterprizeRef.current = null;
      setRoleOptions([]);
      setRolesLoading(false);
      setFormData((prev) => ({ ...prev, role_fid: "" }));
      return;
    }

    // Clear role selection when enterprize changes
    if (
      previousEnterprizeRef.current &&
      String(previousEnterprizeRef.current) !== selectedEnterprizeId
    ) {
      setFormData((prev) => ({ ...prev, role_fid: "" }));
    }

    previousEnterprizeRef.current = selectedEnterprizeId;

    let cancelled = false;

    const loadRoles = async () => {
      try {
        setRolesLoading(true);
        setRoleOptions([]);

        const res = await getRolesByEnterprizeAPI(selectedEnterprizeId);
        const roles = res?.data?.data || [];

        if (cancelled) return;

        setRoleOptions(
          roles.map((r) => ({
            label: r.role_name,
            value: r.role_id,
          })),
        );
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setRoleOptions([]);
        showAlert("error", "Failed to load roles for selected enterprize");
      } finally {
        if (!cancelled) setRolesLoading(false);
      }
    };

    loadRoles();

    return () => {
      cancelled = true;
    };
  }, [show, hasEnterprizeRoleDependency, formData.enterprize_fid, showAlert]);

  /**
   * =====================================
   * HANDLE CHANGE
   * =====================================
   */

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,

      [name]: value,
    }));

    // Clear field-level error after user updates that field
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  /**
   * =====================================
   * HANDLE SUBMIT
   * =====================================
   */

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Show first error via useAlert
      const firstError = Object.values(validationErrors)[0];
      showAlert("error", firstError);
      return;
    }

    console.log("Submitting form:", formData);

    onSave(formData);
  };

  /**
   * =====================================
   * MODE CHECK
   * =====================================
   */

  const readOnly = mode === "View";

  /**
   * =====================================
   * BUTTON LABEL
   * =====================================
   */

  const getActionLabel = () => {
    if (mode === "Add") return "Submit";

    if (mode === "Edit") return "Update";

    return "Save";
  };

  /**
   * =====================================
   * TITLE
   * =====================================
   */

  const getTitle = () => {
    if (!config?.title) return mode;

    return `${mode} ${config.title}`;
  };

  /**
   * =====================================
   * RENDER
   * =====================================
   */

  return (
    <Modal isOpen={show} onClose={onClose} title={getTitle()} size="large">
      <Form onSubmit={handleSubmit}>
        {formSections.map((section, sectionIndex) => (
          <div
            key={`section-${section.title || "default"}-${sectionIndex}`}
            className={styles.formSection}
          >
            {section.title && (
              <h3 className={styles.sectionTitle}>{section.title}</h3>
            )}

            <div className={styles.formGrid}>
              {section.fields.map((field) => {
                if (field.type === "select") {
                  const isEnterprizeField = field.name === "enterprize_fid";
                  const isRoleField = field.name === "role_fid";
                  const effectiveOptions =
                    hasEnterprizeRoleDependency && isRoleField
                      ? roleOptions
                      : field.options || [];

                  const roleDisabledReason =
                    hasEnterprizeRoleDependency &&
                    isRoleField &&
                    !String(formData.enterprize_fid || "").trim();

                  return (
                    <FormSelect
                      key={field.name}
                      label={
                        <>
                          {field.label}{" "}
                          {(field.required ||
                            (hasEnterprizeRoleDependency &&
                              (isEnterprizeField || isRoleField))) && (
                            <span style={{ color: "red" }}>*</span>
                          )}
                        </>
                      }
                      name={field.name}
                      value={formData[field.name] || ""}
                      options={effectiveOptions}
                      error={errors[field.name]}
                      disabled={readOnly || roleDisabledReason}
                      loading={hasEnterprizeRoleDependency && isRoleField && rolesLoading}
                      placeholder={
                        roleDisabledReason
                          ? "Select enterprize first"
                          : field.placeholder || "Select option"
                      }
                      selectClassName={
                        roleDisabledReason ? styles.disabledSelect : undefined
                      }
                      {...(isEnterprizeField && user && !user.is_super_admin
                        ? { disabled: true }
                        : {})}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                  );
                }

                return (
                  <FormInput
                    key={field.name}
                    label={
                      <>
                        {field.label}{" "}
                        {field.required && <span style={{ color: "red" }}>*</span>}
                      </>
                    }
                    name={field.name}
                    type={field.type}
                    error={errors[field.name]}
                    accept={
                      field.type === "file"
                        ? ".png,.jpg,.jpeg,application/pdf"
                        : undefined
                    }
                    value={
                      field.type !== "file" ? formData[field.name] || "" : undefined
                    }
                    disabled={readOnly}
                    onChange={(e) => {
                      if (field.type === "file") {
                        handleChange(field.name, e.target.files[0]);
                      } else {
                        handleChange(field.name, e.target.value);
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}

        <div className={styles.buttonGroup}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-25"
          >
            Cancel
          </Button>

          {!readOnly && (
            <Button type="submit" variant="primary" className="w-25">
              {getActionLabel()}
            </Button>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default PageModal;
