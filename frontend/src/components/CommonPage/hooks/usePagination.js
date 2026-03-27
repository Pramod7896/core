import { useState } from "react";

const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);

  const [limit, setLimit] = useState(initialLimit);

  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  const goToPage = (newPage) => {
    if (newPage < 1) return;

    if (newPage > totalPages) return;

    setPage(newPage);
  };

  const nextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const resetPagination = () => {
    setPage(1);
  };

  return {
    page,

    limit,

    total,

    totalPages,

    setTotal,

    goToPage,

    nextPage,

    prevPage,

    setLimit,

    resetPagination,
  };
};

export default usePagination;
