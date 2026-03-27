import React from "react";

import FormInput from "../../Inputs/FormInput";

const SearchFilter = ({ search, setSearch }) => {
  return (
    <FormInput
      placeholder="Search..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}

    />
  );
};

export default SearchFilter;

