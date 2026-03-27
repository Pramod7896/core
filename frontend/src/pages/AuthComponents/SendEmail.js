import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPasswordAPI } from "../../api/auth"; // ✅ use auth.js API
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

const SendEmail = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [email, setEmail] = useState("");
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
  // SEND EMAIL HANDLER
  // =======================
  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (loading) return;

    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailTrimmed) {
      showAlert("warning", "Please enter your email address.");
      return;
    }

    if (!emailRegex.test(emailTrimmed)) {
      showAlert(
        "warning",
        "Please enter a valid email address (e.g., user@example.com).",
      );
      return;
    }

    setLoading(true);

    try {
      const data = await forgotPasswordAPI(emailTrimmed);
      showAlert("success", data.message || "Reset code sent to your email");

      sessionStorage.setItem("resetEmail", emailTrimmed);
      navigate("/verify-email");
    } catch (err) {
      showAlert(
        "error",
        err.response?.data?.message ||
          err.message ||
          "Failed to send reset code",
      );
    } finally {
      setLoading(false);
    }
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

        <Form onSubmit={handleSendEmail} className="w-50">
          <h3 className="mb-3 mt-2 text-left fw-bolder">Forgot Password</h3>
          <p className="text-left mb-3">
            We will send you a code to reset your password.
          </p>

          {/* EMAIL INPUT */}
          <FormInput
            // label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // leftIcon="bi-envelope-fill"
            placeholder="Enter your email address"
          />

          {/* CONTINUE BUTTON */}
          <Button
            type="submit"
            loading={loading}
            variant="primary"
            className="w-100 mt-3"
          >
            {loading ? "Sending..." : "Continue"}
          </Button>

          {/* BACK TO LOGIN LINK */}
          {/* <div className="text-center mt-2">
            <Link to="/login" className="forgot-password-link">
              Back to Login
            </Link>
          </div> */}
        </Form>
      </div>
    </div>
  );
};

export default SendEmail;
