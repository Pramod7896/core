import { useState, useEffect } from "react";
import { getPageDataAPI } from "../../../api/page";
import {
  createDynamicRecordAPI,
  updateDynamicRecordAPI,
  deleteDynamicRecordAPI,
  changeStatusAPI,
} from "../../../api/pagecrud";
import useAlert from "../../../hooks/useAlert";

const usePageData = (pageCode) => {
  const { showAlert } = useAlert();

  // ============================================
  // STATES
  // ============================================
  const [config, setConfig] = useState(null);
  const [data, setData] = useState([]);
  const [exportRows, setExportRows] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("Add");
  const [selectedRow, setSelectedRow] = useState(null);

  // ============================================
  // FETCH PAGE DATA
  // ============================================
  const fetchData = async () => {
    if (!pageCode) return;

    setLoading(true);
    try {
      const response = await getPageDataAPI(pageCode);
      const pageKey = Object.keys(response)[0];
      const pageData = response[pageKey];

      setConfig({ ...pageData, code: pageKey });
      setStats(pageData.stats_data || []);

      let filteredData = pageData.data || [];

      if (search) {
        filteredData = filteredData.filter((row) =>
          Object.values(row).some((val) =>
            String(val).toLowerCase().includes(search.toLowerCase())
          )
        );
      }

      setTotalEntries(filteredData.length);
      setExportRows(filteredData);
      setTotalPages(Math.ceil(filteredData.length / entriesPerPage));
      const start = (page - 1) * entriesPerPage;
      setData(filteredData.slice(start, start + entriesPerPage));
    } catch (error) {
      console.error(error);
      showAlert(
        "error",
        error.response?.data?.message || "Failed to load page data"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CREATE RECORD
  // ============================================
  const handleCreate = async (formData) => {
    try {
      setLoading(true);

      // Convert plain object to FormData for files dynamically
      const payload = new FormData();
      for (const key in formData) {
        if (formData[key] instanceof File) {
          payload.append(key, formData[key]);
        } else {
          payload.append(`data[${key}]`, formData[key]);
        }
      }
      payload.append("model_name", config.model_name);

      await createDynamicRecordAPI(config.model_name, payload);
      showAlert("success", "Record created successfully");
      fetchData();
      setShowModal(false);
    } catch (error) {
      showAlert("error", error.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // UPDATE RECORD
  // ============================================
  const handleUpdate = async (formData) => {
    try {
      setLoading(true);
      const pk = config.primaryKey || "id";

      // Convert plain object to FormData for files dynamically
      const payload = new FormData();
      for (const key in formData) {
        if (formData[key] instanceof File) {
          payload.append(key, formData[key]);
        } else {
          payload.append(`data[${key}]`, formData[key]);
        }
      }
      payload.append("model_name", config.model_name);
      payload.append("primaryKey", pk);
      payload.append("id", formData[pk]);

      await updateDynamicRecordAPI(config.model_name, formData[pk], payload, pk);
      showAlert("success", "Record updated successfully");
      fetchData();
      setShowModal(false);
    } catch (error) {
      showAlert("error", error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // DELETE RECORD
  // ============================================
  const handleDelete = async (row) => {
    if (!window.confirm("Are you sure to delete?")) return;

    try {
      setLoading(true);
      const pk = config.primaryKey || "id";
      await deleteDynamicRecordAPI(config.model_name, row[pk], pk);
      showAlert("success", "Record deleted successfully");
      fetchData();
    } catch (error) {
      showAlert("error", error.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // STATUS TOGGLE
  // ============================================
  const handleStatusToggle = async (row) => {
    try {
      setLoading(true);
      if (!config) throw new Error("Config not loaded");

      const pk = config.primaryKey || "id";
      const statusField = `${config.model_name.toLowerCase()}_status`;
      const newStatus = row[statusField] === "active" ? "inactive" : "active";

      await changeStatusAPI(config.model_name, row[pk], newStatus, pk);
      showAlert("success", "Status updated successfully");
      fetchData();
    } catch (error) {
      console.error(error);
      showAlert(
        "error",
        error.response?.data?.message || "Status update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SAVE HANDLER
  // ============================================
  const handleSave = async (formData) => {
    if (modalMode === "Add") {
      await handleCreate(formData);
    } else {
      await handleUpdate(formData);
    }
  };

  // ============================================
  // AUTO FETCH
  // ============================================
  useEffect(() => {
    fetchData();
  }, [pageCode, page, entriesPerPage, search]);

  return {
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
    fetchData,
    handleDelete,
    handleStatusToggle,
    handleSave,
    showModal,
    setShowModal,
    modalMode,
    setModalMode,
    selectedRow,
    setSelectedRow,
  };
};

export default usePageData;
