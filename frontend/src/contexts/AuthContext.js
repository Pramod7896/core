// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { loginAPI, refreshTokenAPI, logoutAPI } from "../api/auth";
import api from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ---------------------------
  // State
  // ---------------------------
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  // ---------------------------
  // Helper: Save to localStorage
  // ---------------------------
  const saveToLocalStorage = ({
    accessToken,
    refreshToken,
    user,
    roles,
    permissions,
    pages,
  }) => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    localStorage.setItem("roles", JSON.stringify(roles || []));
    localStorage.setItem("permissions", JSON.stringify(permissions || []));
    localStorage.setItem("pages", JSON.stringify(pages || []));
  };

  const hydrateFromLocalStorage = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      const storedRoles = JSON.parse(localStorage.getItem("roles") || "[]");
      const storedPermissions = JSON.parse(
        localStorage.getItem("permissions") || "[]",
      );
      const storedPages = JSON.parse(localStorage.getItem("pages") || "[]");

      const storedAccessToken = localStorage.getItem("accessToken");

      if (storedUser) {
        setUser(storedUser);
      }

      if (storedRoles) {
        setRoles(storedRoles);
      }

      if (storedPermissions) {
        setPermissions(storedPermissions);
      }

      if (storedPages) {
        setPages(storedPages);
      }

      if (storedAccessToken) {
        api.defaults.headers.common["Authorization"] =
          `Bearer ${storedAccessToken}`;
      }
    } catch (err) {
      console.warn("❌ Failed to hydrate auth", err);
    }
  };

  // ---------------------------
  // Auto-login / refresh token
  // ---------------------------
  useEffect(() => {
    const autoLogin = async () => {
      hydrateFromLocalStorage();

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        setLoading(false);
        setReady(true);
        return;
      }

      try {
        const response = await refreshTokenAPI(refreshToken);

        if (!response.success) {
          throw new Error("Refresh failed");
        }

        const {
          accessToken,
          refreshToken: newRefreshToken,
          user,
          roles,
          permissions,
          pages,
        } = response.data;

        saveToLocalStorage({
          accessToken,
          refreshToken: newRefreshToken,
          user,
          roles,
          permissions,
          pages,
        });

        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        setUser(user);
        setRoles(roles);
        setPermissions(permissions);
        setPages(pages);

      } catch (err) {
        console.error("❌ Auto login failed", err);

        localStorage.clear();

        setUser(null);
        setRoles([]);
        setPermissions([]);
        setPages([]);
      } finally {
        setLoading(false);
        setReady(true);
      }
    };

    autoLogin();
  }, []);

  // ---------------------------
  // Login
  // ---------------------------
  const login = async ({ user_name, user_password }) => {
    setLoading(true);
    try {
      const res = await loginAPI({ user_name, user_password });
      const { accessToken, refreshToken, user, roles, permissions, pages } =
        res.data;

      saveToLocalStorage({
        accessToken,
        refreshToken,
        user,
        roles,
        permissions,
        pages,
      });

      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      setUser(user);
      setRoles(roles || []);
      setPermissions(permissions || []);
      setPages(pages || []);

      return { user, roles };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Logout
  // ---------------------------
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) await logoutAPI(refreshToken);
    } catch (err) {
      console.warn("Logout API failed", err);
    }

    localStorage.clear();
    setUser(null);
    setRoles([]);
    setPermissions([]);
    setPages([]);
  };

  // ---------------------------
  // Access helpers
  // ---------------------------
  const hasPageAccess = (route) => {
    if (user?.is_super_admin) return true;
    const page = pages.find((p) => p.page_route == route);
    return page?.can_view || false;
  };

  const hasActionAccess = (route, action) => {
    if (user?.is_super_admin) return true;
    const page = pages.find((p) => p.page_route == route);

    if (!page) return false;

    return page[`can_${action}`] || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        permissions,
        pages,
        loading,
        ready,
        login,
        logout,
        hasPageAccess,
        hasActionAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
