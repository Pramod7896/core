import React from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loader from "../components/Loader"; // adjust path if different

const ProtectedRoute = ({ children, roles: requiredRoles, action }) => {
  const location = useLocation();

  const { role: routeRole } = useParams();

  const {
    user: contextUser,
    roles: contextRoles,
    pages: contextPages,
    loading,
    ready,
  } = useAuth();

  // Wait until auth ready
  if (loading || !ready) return <Loader />;

  // ---------------------------
  // Safe load
  // ---------------------------

  const user = contextUser || JSON.parse(localStorage.getItem("user"));

  const userRoles = contextRoles?.length
    ? contextRoles
    : JSON.parse(localStorage.getItem("roles") || "[]");

  const pages = contextPages?.length
    ? contextPages
    : JSON.parse(localStorage.getItem("pages") || "[]");

  // ---------------------------
  // Not logged in
  // ---------------------------

  if (!user) return <Navigate to="/login" replace />;

  // ---------------------------
  // SUPER ADMIN FULL ACCESS
  // ---------------------------

  if (user.is_super_admin) return children;

  // ---------------------------
  // ROLE URL VALIDATION
  // ---------------------------

  const safeRouteRole = routeRole ? String(routeRole).toLowerCase() : null;
  const safeUserPrimaryRole = userRoles?.[0]
    ? String(userRoles[0]).toLowerCase()
    : null;

  const userPrimaryRole = safeUserPrimaryRole || safeRouteRole;

  if (!userPrimaryRole) return <Loader />;

  // Only enforce redirect when we actually know the user's role list.
  if (safeRouteRole && safeUserPrimaryRole && safeRouteRole !== safeUserPrimaryRole)
    return <Navigate to={`/${userPrimaryRole}/dashboard`} replace />;

  // ---------------------------
  // ROLE CHECK (if passed)
  // ---------------------------

  if (requiredRoles?.length) {
    const hasRole = userRoles?.some((r) =>
      requiredRoles.includes(r.toLowerCase()),
    );

    if (!hasRole) return <Navigate to="/404" replace />;
  }

  // ---------------------------
  // PAGE CHECK
  // ---------------------------

  const isDynamicPageRoute = location.pathname.includes("/page/");

  // If pages are not hydrated yet, don't kick the user out on refresh.
  if (isDynamicPageRoute && (!pages || pages.length === 0)) return <Loader />;

  const pageSegment = isDynamicPageRoute
    ? location.pathname.split("/page/")[1]
    : null;

  const normalizedPageSegment = pageSegment
    ? String(pageSegment).trim().toLowerCase()
    : null;

  const currentPage = normalizedPageSegment
    ? pages?.find(
        (p) => String(p?.model_name || "").trim().toLowerCase() === normalizedPageSegment,
      )
    : null;

  // If dynamic page URL and no permission

  if (isDynamicPageRoute && (!currentPage || !currentPage.can_view))
    return <Navigate to="/404" replace />;

  // ---------------------------
  // ACTION CHECK
  // ---------------------------

  if (action && currentPage) {
    const actionMap = {
      create: currentPage.can_create,

      edit: currentPage.can_edit,

      delete: currentPage.can_delete,
    };

    if (!actionMap[action]) return <Navigate to="/404" replace />;
  }

  return children;
};

export default ProtectedRoute;
