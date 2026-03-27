import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { resetPasswordAPI } from "../../api/auth"; // ✅ auth.js API
import useAlert from "../../hooks/useAlert";

import Form from "../../components/Form/Form";
import FormInput from "../../components/Inputs/FormInput";
import Button from "../../components/Button";

import "../../css/Login.css";
import CompanyLogo from "../../assets/Images/CompName.svg";
import VelaKoda from "../../assets/Logo/project_logo.svg";
import VelaKodaMobile from "../../assets/Images/MobileLogo.svg";

const images = [
  "/img/superadminbg2.png",
  "/img/superadminbg5.png",
  "/img/superadminbg3.png",
  "/img/superadminbg4.png",
];

const ResetPassword = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const token = sessionStorage.getItem("resetToken");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  // =======================
  // IMAGE SLIDER
  // =======================
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // =======================
  // VALIDATE PASSWORD
  // =======================
  const validatePassword = (password) => {
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      return "Password must contain at least one special character.";
    return null;
  };

  // =======================
  // RESET PASSWORD SUBMIT
  // =======================
  const handleReset = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!token) {
      showAlert("error", "Reset session token missing. Please login again.");
      navigate("/login", { replace: true });
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      showAlert("warning", validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("warning", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordAPI({ newPassword, confirmPassword, token });
      showAlert("success", "Password reset successfully!");

      // Clear all session / local storage
      sessionStorage.clear();
      localStorage.clear();

      navigate("/login", { replace: true });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to reset password";
      showAlert("error", errorMsg);

      if (err.response?.status === 401) {
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  // =======================
  // UI
  // =======================
  return (
    <div className="login-container">
      {/* LEFT IMAGE SLIDER */}
      <div className="login-left">
        <div
          className="bg-slide active"
          style={{ backgroundImage: "url(/img/login_img.svg)" }}
        >
          <img src={VelaKoda} alt="logo" className="slide-logo" />
        </div>
      </div>

      {/* MOBILE LOGO */}
      <img src={VelaKodaMobile} alt="logo" className="mobile-logo profile-i" />

      {/* RIGHT SIDE FORM */}
      <div className="login-right d-flex flex-column justify-content-center">
        {/* <div className="logo-wrapper mb-3">
          <img className="zerobox-logo" src={CompanyLogo} alt="Company Logo" />
        </div> */}

        <Form onSubmit={handleReset} className="w-50">
          <h3 className="mb-3 mt-2 text-left fw-bolder">Reset Password</h3>
          <p className="text-left mb-3">
            New password must be different from previous password.
          </p>

          {/* NEW PASSWORD */}
          <FormInput
            // label="New Password"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            showToggle
            showPassword={showNewPassword}
            togglePassword={() => setShowNewPassword(!showNewPassword)}
            placeholder="Enter new password"
            className="mb-3"
          />

          {/* CONFIRM PASSWORD */}
          <FormInput
            // label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            showToggle
            showPassword={showConfirmPassword}
            togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            placeholder="Confirm new password"
          />

          {/* BUTTONS */}
          <div className="d-flex flex-column flex-md-row gap-2 w-100 mt-3">
            <Button type="button" variant="cancel" className="flex-fill" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-fill" loading={loading}>
              {loading ? "Resetting..." : "Continue"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;
