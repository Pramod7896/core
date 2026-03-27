import React from "react";
import { useParams } from "react-router-dom";

import PageHeader from "./components/PageHeader";
import StatsCards from "./components/StatsCards";
import DataTable from "./components/DataTable";
import Pagination from "./components/Pagination";
import PageModal from "./components/PageModal";
import PageTitle from "./components/PageTitle";

import usePageData from "./hooks/usePageData";
import Loader from "../Loader";

const getExportTimestamp = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "");
  return `${date}_${time}`;
};

const sanitizeFilePart = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "data";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isIdColumn = (col) => {
  const key = String(col?.key || "").trim().toLowerCase();
  const label = String(col?.label || "").trim().toLowerCase();
  return key === "id" || label === "id";
};

const CommonPage = () => {
  const { pageCode } = useParams();

  const {
    config,

    data,
    exportRows,

    stats,

    loading,

    search,
    setSearch,

    page,
    setPage,

    totalPages,
    totalEntries,

    entriesPerPage,
    setEntriesPerPage,

    handleDelete,
    handleStatusToggle,

    handleSave,

    showModal,
    setShowModal,

    modalMode,
    setModalMode,

    selectedRow,
    setSelectedRow,
  } = usePageData(pageCode);

  const handleDownload = () => {
    if (!config?.columns?.length || !exportRows?.length) return;

    const columns = config.columns.filter((col) => col?.key && !isIdColumn(col));

    const headerHtml = `<tr>${columns
      .map((col) => `<th>${escapeHtml(col.label || col.key)}</th>`)
      .join("")}</tr>`;

    const bodyHtml = exportRows
      .map((row) => {
        const rowCells = columns
          .map((col) => `<td>${escapeHtml(row[col.key] ?? "")}</td>`)
          .join("");
        return `<tr>${rowCells}</tr>`;
      })
      .join("");

    const tableHtml = `<table>${headerHtml}${bodyHtml}</table>`;
    const htmlDocument = `
      <html>
        <head><meta charset="UTF-8" /></head>
        <body>${tableHtml}</body>
      </html>
    `;

    const blob = new Blob([htmlDocument], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });

    const filePart = sanitizeFilePart(config.code || config.title || pageCode);
    const filename = `${getExportTimestamp()}_${filePart}.xls`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * LOADING STATE
   */
  if (!config) return <div><Loader/></div>;

  return (
    <>
      {/* ============================= */}
      {/* STATS */}
      {/* ============================= */}

      {stats?.length > 0 && <StatsCards stats={stats} />}

      {/* ============================= */}
      {/* TITLE */}
      {/* ============================= */}

      <PageTitle title={config.title} />

      {/* ============================= */}
      {/* HEADER */}
      {/* ============================= */}

      <PageHeader
        title={config.title}
        route={config.page_route}
        search={search}
        setSearch={setSearch}
        entriesPerPage={entriesPerPage}
        setEntriesPerPage={setEntriesPerPage}
        addLabel={config.addLabel || "Add"}
        onDownload={handleDownload}
        disableDownload={!exportRows?.length}
        onAdd={() => {
          setSelectedRow(null);

          setModalMode("Add");

          setShowModal(true);
        }}
      />

      {/* ============================= */}
      {/* TABLE */}
      {/* ============================= */}

      <DataTable
        columns={config.columns}
        data={data}
        route={config.page_route}
        loading={loading}
        onEdit={(row) => {
          setSelectedRow(row);

          setModalMode("Edit");

          setShowModal(true);
        }}
        onView={(row) => {
          setSelectedRow(row);

          setModalMode("View");

          setShowModal(true);
        }}
        onDelete={handleDelete}
        onStatusToggle={handleStatusToggle}
      />

      {/* ============================= */}
      {/* PAGINATION */}
      {/* ============================= */}

      <Pagination
        page={page}
        totalPages={totalPages}
        totalEntries={totalEntries}
        entriesPerPage={entriesPerPage}
        fetchData={setPage}
      />

      {/* ============================= */}
      {/* MODAL */}
      {/* ============================= */}

      <PageModal
        show={showModal}
        onClose={() => setShowModal(false)}
        config={config}
        mode={modalMode}
        data={selectedRow}
        onSave={handleSave}
      />
    </>
  );
};

export default CommonPage;
