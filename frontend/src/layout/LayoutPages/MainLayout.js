import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

import "../LayoutCss/mainLayout.css";

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="layout-container">
      <Sidebar collapsed={collapsed} />

      <div className="layout-main">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div className="layout-content">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
