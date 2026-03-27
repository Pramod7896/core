import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFoundPage.css"; // optional CSS for styling

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1>🚧 Feature Coming Soon!</h1>
        <p>Oops! This page is not available yet. Stay tuned for updates.</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/")}
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
