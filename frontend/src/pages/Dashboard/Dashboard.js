import React from "react";
import { useAuth } from "../../contexts/AuthContext";

const Dashboard = () => {
  const { user, ready , permissions} = useAuth();
  console.log("Dashboard render", { user, ready, permissions, });
  return (
    <div className="card">
      <div className="card-body">
        <h5>Dashboard {user?.user_name}</h5>

      </div>
    </div>
  );
};

export default Dashboard;
