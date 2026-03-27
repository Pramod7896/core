import { useState, useEffect } from "react";

const useSearch = (fetchData, delay = 500) => {
  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, delay);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [debouncedSearch]);

  return {
    search,

    setSearch,

    debouncedSearch,
  };
};

export default useSearch;
