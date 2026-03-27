import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import ActionDropdown from "../../components/ActionDropDown/ActionDropdown";

import "../LayoutCss/topbar.css";

const APP_NAME = "FurniSense";

const prettifyModuleName = (value = "") => {
  return String(value)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const Topbar = () => {
  const location = useLocation();

  const { user, logout, pages } = useAuth();

  // Page name from Redux
  const pageName = useSelector((state) => state.page.currentPageName);

  // First letter avatar fallback
  const firstLetter = user?.user_name?.charAt(0)?.toUpperCase() || "U";

  const getModuleNameFromPath = () => {
    const pathname = location.pathname;

    if (pathname.endsWith("/dashboard")) {
      return "Dashboard";
    }

    if (pathname === "/superadmin/rbac") {
      return "RBAC";
    }

    const pageSegment = pathname.split("/page/")[1];

    if (pageSegment) {
      const normalized = String(pageSegment).trim().toLowerCase();
      const matchedPage = pages?.find(
        (p) => String(p?.model_name || "").trim().toLowerCase() === normalized,
      );
      return matchedPage?.page_name || prettifyModuleName(pageSegment);
    }

    return pageName || "Dashboard";
  };

  const moduleName = getModuleNameFromPath();

  useEffect(() => {
    document.title = `${APP_NAME} | ${moduleName}`;
  }, [moduleName]);

  // Profile dropdown menu
  const profileMenu = [
    {
      label: "Settings",
      icon: "gear",
      onClick: () => {
        console.log("Open Settings");
      },
    },

    {
      label: "Logout",
      icon: "box-arrow-right",
      onClick: logout,
    },
  ];

  return (
    <div className="topbar">
      {/* LEFT SIDE -> PAGE NAME */}

      <div className="topbar-left">
        <h3 className="topbar-page-title">{moduleName}</h3>
      </div>

      {/* RIGHT SIDE -> PROFILE */}

      <div className="topbar-right">
        {/* User name */}

        <span className="topbar-username">{user?.user_name}</span>

        {/* Profile Dropdown */}

        <ActionDropdown items={profileMenu}>
          <div className="topbar-avatar">
            {user?.profile_image ? (
              <img src={user.profile_image} alt="profile" />
            ) : (
              firstLetter
            )}
          </div>
        </ActionDropdown>
      </div>
    </div>
  );
};

export default Topbar;
