import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { verifyOtpAPI } from "../../api/auth"; // ✅ auth.js APIs
import useAlert from "../../hooks/useAlert";

import Form from "../../components/Form/Form";
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

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const email = sessionStorage.getItem("resetEmail");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

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
  // OTP CHANGE HANDLER
  // =======================
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const updatedOtp = [...otp];
      if (otp[index]) {
        updatedOtp[index] = "";
        setOtp(updatedOtp);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        updatedOtp[index - 1] = "";
        setOtp(updatedOtp);
      }
    } else if (e.key >= "0" && e.key <= "9") {
      const updatedOtp = [...otp];
      updatedOtp[index] = e.key;
      setOtp(updatedOtp);
      if (index < otp.length - 1) inputsRef.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  // =======================
  // VERIFY OTP SUBMIT
  // =======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const code = otp.join("");
    if (code.length < 6) {
      showAlert("warning", "Please enter full 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const data = await verifyOtpAPI({ email, otp: code });
      sessionStorage.setItem("resetToken", data.resetToken);
      showAlert("success", data.message || "Email verified");
      navigate("/reset-password");
    } catch (err) {
      showAlert("error", err.response?.data?.message || err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // =======================
  // RESEND OTP
  // =======================
 
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

        <Form onSubmit={handleSubmit} className="w-50 text-left">
          <h3 className="mb-3 mt-2 fw-bolder">Enter Verification Code</h3>
          <p className="mb-3">
            Enter the 6-digit code sent to your email address.
          </p>

          {/* OTP INPUTS */}
          <div className="d-flex justify-content-between mb-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength="1"
                className="form-control text-center mx-1 otp-input"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputsRef.current[index] = el)}
                autoFocus={index === 0}
                disabled={loading}
              />
            ))}
          </div>

          {/* VERIFY BUTTON */}
          <Button type="submit" loading={loading} variant="primary" className="w-100 mb-2">
            {loading ? "Verifying..." : "Continue"}
          </Button>

          {/* BACK TO LOGIN */}
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

export default VerifyEmail;
