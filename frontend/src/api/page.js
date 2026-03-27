// src/api/page.js
import api from "./api";

// ============================
// GET PAGE DATA
// ============================
/**
 * Fetch page data by page_code
 * @param {string} page_code - The identifier for the page
 * @returns {Promise<Object>} - Page config and data
 */
export const getPageDataAPI = async (page_code) => {
  if (!page_code) throw new Error("page_code is required");

  const res = await api.get("/pages/get-page-data", {
    params: { page_code },
  });

  return res.data;
};
