import api from "./api";

/**
 * CREATE RECORD
 */
export const createDynamicRecordAPI = async (model_name, formData) => {
  if (!model_name) throw new Error("model_name is required");
  if (!formData) throw new Error("formData is required");

  const res = await api.post("/page-crud/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/**
 * UPDATE RECORD
 */
export const updateDynamicRecordAPI = async (
  model_name,
  primaryKeyValue,
  formData,
  primaryKey = "id"
) => {
  if (!model_name) throw new Error("model_name is required");
  if (!primaryKeyValue) throw new Error(`${primaryKey} value is required`);
  if (!formData) throw new Error("formData is required");

  const res = await api.put("/page-crud/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/**
 * DELETE RECORD
 */
export const deleteDynamicRecordAPI = async (
  model_name,
  primaryKeyValue,
  primaryKey = "id"
) => {
  if (!model_name) throw new Error("model_name is required");
  if (!primaryKeyValue) throw new Error(`${primaryKey} value is required`);

  const res = await api.delete("/page-crud/delete", {
    data: { model_name, primaryKey, id: primaryKeyValue },
  });
  return res.data;
};

/**
 * CHANGE STATUS
 */
export const changeStatusAPI = async (
  model_name,
  primaryKeyValue,
  status,
  primaryKey = "id"
) => {
  if (!model_name) throw new Error("model_name is required");
  if (!primaryKeyValue) throw new Error(`${primaryKey} value is required`);
  if (status === undefined || status === null)
    throw new Error("status value is required");

  const res = await api.put("/page-crud/change-status", {
    model_name,
    primaryKey,
    id: primaryKeyValue,
    status,
  });
  return res.data;
};
