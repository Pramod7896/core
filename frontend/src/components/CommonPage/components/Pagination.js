import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

const Pagination = ({ page, totalPages, totalEntries, entriesPerPage, fetchData }) => {
  if (!totalPages) return null;

  const pageNumbers = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
  let endPage = startPage + maxPagesToShow - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  const showingFrom = totalEntries === 0 ? 0 : (page - 1) * entriesPerPage + 1;
  const showingTo = Math.min(page * entriesPerPage, totalEntries);

  const footerStyle = {
    backgroundColor: "var(--color-light)",
    padding: "0.75rem 1rem",
    borderTop: "1px solid var(--border-color)",
    zIndex: 10,
  };

  const promptStyle = {
    fontSize: "var(--font-small)",
    color: "var(--color-text)",
  };

  const pageLinkBaseStyle = {
    borderRadius: "8px",
    padding: "0.35rem 0.65rem",
    cursor: "pointer",
    transition: "background-color 0.2s ease, color 0.2s ease",
    backgroundColor: "#000",
    borderColor: "#000",
    color: "#fff",
  };

  const getPageLinkStyle = (isActive, isDisabled) => ({
    ...pageLinkBaseStyle,
    ...(isActive
      ? {
          backgroundColor: "#fff",
          borderColor: "#000",
          color: "#000",
        }
      : {}),
    ...(isDisabled
      ? {
          opacity: 0.5,
          cursor: "not-allowed",
        }
      : {}),
  });

  return (
    <div
      className="table-footer fixed-bottom-footer d-flex justify-content-between align-items-center"
      style={footerStyle}
    >
      <div className="refresh-prompts" style={promptStyle}>
        Showing {showingFrom} to {showingTo} of {totalEntries} entries
      </div>

      <ul className="pagination mb-0 gap-2">
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            style={getPageLinkStyle(false, page === 1)}
            onClick={() => fetchData(1)}
            disabled={page === 1}
          >
            <i className="bi bi-chevron-double-left" />
          </button>
        </li>

        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            style={getPageLinkStyle(false, page === 1)}
            onClick={() => fetchData(page - 1)}
            disabled={page === 1}
          >
            <i className="bi bi-chevron-left" />
          </button>
        </li>

        {pageNumbers.map((num) => {
          const isActive = page === num;
          return (
            <li key={num} className={`page-item ${isActive ? "active" : ""}`}>
              <button
                className="page-link"
                style={getPageLinkStyle(isActive, false)}
                onClick={() => fetchData(num)}
              >
                {num}
              </button>
            </li>
          );
        })}

        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
          <button
            className="page-link"
            style={getPageLinkStyle(false, page === totalPages)}
            onClick={() => fetchData(page + 1)}
            disabled={page === totalPages}
          >
            <i className="bi bi-chevron-right" />
          </button>
        </li>

        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
          <button
            className="page-link"
            style={getPageLinkStyle(false, page === totalPages)}
            onClick={() => fetchData(totalPages)}
            disabled={page === totalPages}
          >
            <i className="bi bi-chevron-double-right" />
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
