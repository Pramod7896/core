import React from "react";

import FormSelect from "../../Inputs/FormSelect";
import FormInput from "../../Inputs/FormInput";
import Button from "../../Button";

import styles from "./pageHeader.module.css";
import { useAuth } from "../../../contexts/AuthContext"; // ✅ ADD THIS

const PageHeader = ({
  title,
  route,

  entriesPerPage,
  setEntriesPerPage,

  search,
  setSearch,

  onAdd,
  addLabel = "Add",
  onDownload,
  disableDownload = false,
}) => {
  const { hasActionAccess } = useAuth(); // ✅ GET RBAC FUNCTION

  const canCreate = hasActionAccess(route, "create");

  return (
    <div className={styles.headerWrapper}>
      {/* LEFT */}
      <div className={styles.leftSection}>
        <FormSelect
          width="autoWidth" // ✅ ADD CUSTOM WIDTH OPTION
          className="w-25"
          value={entriesPerPage}
          onChange={(e) => setEntriesPerPage(Number(e.target.value))}
          options={[
            { value: 50, label: "50" },
            { value: 100, label: "100" },
            { value: 500, label: "500" },
          ]}
        />

        <span className={styles.entriesLabel}>Entries per page</span>
      </div>

      {/* RIGHT */}
      <div className={styles.rightSection}>
        <FormInput
          width="autoWidth"
          placeholder={`Search ${title}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon="bi-search"
        />

        <Button
          variant="outline"
          onClick={onDownload}
          disabled={disableDownload}
        >
          <i className="bi bi-download"></i>
          &nbsp;
          {/* Download */}
        </Button>


        {/* ✅ SHOW BUTTON ONLY IF CAN CREATE */}
        {canCreate && (
          <Button variant="outline" onClick={onAdd}>
            <i className="bi bi-plus-lg"></i>
            &nbsp;
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
