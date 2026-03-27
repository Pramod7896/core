import React from "react";
import "./PageTitle.css";

const PageTitle = ({ title, onCreate }) => {
  return (
    <div className="d-flex justify-content-between mt-2">
      <h5 className="page-title"> {title} <span>Details</span></h5>
    </div>
  );
};

export default PageTitle;
