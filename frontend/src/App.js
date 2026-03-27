import React from "react";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/AuthComponents";
import SendEmail from "./pages/AuthComponents/SendEmail";
import VerifyEmail from "./pages/AuthComponents/VerifyEmail";
import ResetPassword from "./pages/AuthComponents/ResetPassword";

import MainLayout from "./layout/LayoutPages/MainLayout";
import AlertContainer from "./layout/LayoutPages/AlertContainer";

import Dashboard from "./pages/Dashboard/Dashboard";
import NotFoundPage from "./pages/NotFoundPage";

import DynamicPage from "./pages/DynamicPage/DynamicPage";

import ProtectedRoute from "./routes/ProtectedRoute";

import RBACPage from "./pages/RBAC/RBACPage";


// STYLES
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./theme/bootstrapOverrides.css";

function App() {
  return (
    <BrowserRouter>
      <AlertContainer />

      <Routes>
        {/* PUBLIC */}

        <Route path="/login" element={<LoginPage />} />

        <Route path="/forgot-password" element={<SendEmail />} />

        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ============================= */}
        {/* ⭐ ROLE BASED DASHBOARD */}
        {/* ============================= */}

        <Route
          path="/:role/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ============================= */}
        {/* ⭐ ROLE BASED DYNAMIC PAGE */}
        {/* ============================= */}

        <Route
          path="/:role/page/:pageCode"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DynamicPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ============================= */}
        {/* RBAC */}
        {/* ============================= */}

        <Route
          path="/superadmin/rbac"
          element={
            <ProtectedRoute superAdminOnly>
              <MainLayout>
                <RBACPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ============================= */}
        {/* DEFAULT */}
        {/* ============================= */}

        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ============================= */}
        {/* 404 */}
        {/* ============================= */}

        <Route path="/404" element={<NotFoundPage />} />

        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
