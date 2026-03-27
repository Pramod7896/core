import React from "react";
import ActionButtons from "./ActionButtons";
import styles from "./dataTable.module.css";

import { useAuth } from "../../../contexts/AuthContext";

import { formatDateTimeIST } from "../../../utils/dateFormatter"; // ? IMPORT

const isIdColumn = (col) => {
  const key = String(col?.key || "").trim().toLowerCase();
  const label = String(col?.label || "").trim().toLowerCase();
  return key === "id" || label === "id";
};

const DataTable = ({
  columns,
  data,
  loading,
  route,
  onEdit,
  onView,
  onDelete,
  onStatusToggle,
  primaryKey = "id",
}) => {
  const { hasActionAccess } = useAuth();

  const canView = hasActionAccess(route, "view");
  const canEdit = hasActionAccess(route, "edit");
  const canDelete = hasActionAccess(route, "delete");

  const showActionColumn = canView || canEdit || canDelete;
  const visibleColumns = (columns || []).filter((col) => col?.key && !isIdColumn(col));
  const colSpanCount = Math.max(1, visibleColumns.length + (showActionColumn ? 1 : 0));

  /**
   * LOADING
   */

  if (loading) {
    return <div className={styles.loading}>Loading Data...</div>;
  }

  /**
   * NO DATA
   */

  if (!data || data.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {visibleColumns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}

              {showActionColumn && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            <tr>
              <td
                colSpan={colSpanCount}
                className={styles.noData}
              >
                No records found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  /**
   * MAIN TABLE
   */

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        {/* HEADER */}

        <thead>
          <tr>
            {visibleColumns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}

            {showActionColumn && <th>Action</th>}
          </tr>
        </thead>

        {/* BODY */}

        <tbody>
          {data.map((row, index) => {
            const rowKey = row[primaryKey] || row.id || row.user_id || index;

            return (
              <tr
                key={rowKey}
                className={index % 2 === 0 ? styles.even : styles.odd}
              >
                {/* COLUMNS */}

                {visibleColumns.map((col) => {
                  const value = row[col.key];

                  /**
                   * ? DATETIME FORMAT
                   */

                  if (col.type === "datetime") {
                    return <td key={col.key}>{formatDateTimeIST(value)}</td>;
                  }

                  /**
                   * STATUS PILL (active/inactive)
                   */

                  if (
                    (col.key === "status" || String(col.label || "").toLowerCase() === "status") &&
                    typeof value === "string"
                  ) {
                    const normalizedStatus = value.trim().toLowerCase();
                    const statusClass =
                      normalizedStatus === "active"
                        ? styles.statusActive
                        : normalizedStatus === "inactive"
                        ? styles.statusInactive
                        : styles.statusDefault;

                    return (
                      <td key={col.key}>
                        <span className={`${styles.statusPill} ${statusClass}`}>
                          {value}
                        </span>
                      </td>
                    );
                  }

                  /**
                   * BOOLEAN
                   */

                  if (typeof value === "boolean") {
                    return <td key={col.key}>{value ? "Yes" : "No"}</td>;
                  }

                  /**
                   * IMAGE
                   */

                  if (
                    value &&
                    typeof value === "string" &&
                    value.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                  ) {
                    const normalizedPath = value.replace(/\\/g, "/");

                    const imageUrl = normalizedPath.startsWith("http")
                      ? normalizedPath
                      : `${process.env.REACT_APP_SERVER_URL}/${normalizedPath}`;

                    return (
                      <td key={col.key}>
                        <img
                          src={imageUrl}
                          alt="img"
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                          }}
                        />
                      </td>
                    );
                  }

                  /**
                   * EMPTY
                   */

                  if (value === null || value === undefined || value === "") {
                    return <td key={col.key}>-</td>;
                  }

                  /**
                   * DEFAULT
                   */

                  return <td key={col.key}>{value}</td>;
                })}

                {/* ACTION */}

                {showActionColumn && (
                  <td>
                    <ActionButtons
                      row={row}
                      route={route}
                      onEdit={onEdit}
                      onView={onView}
                      onDelete={onDelete}
                      onStatusToggle={onStatusToggle}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
