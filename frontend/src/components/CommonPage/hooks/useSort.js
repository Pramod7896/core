import { useState } from "react";

const useSort = () => {
  const [sortField, setSortField] = useState(null);

  const [sortOrder, setSortOrder] = useState("asc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);

      setSortOrder("asc");
    }
  };

  const resetSort = () => {
    setSortField(null);

    setSortOrder("asc");
  };

  return {
    sortField,

    sortOrder,

    handleSort,

    resetSort,
  };
};

export default useSort;
