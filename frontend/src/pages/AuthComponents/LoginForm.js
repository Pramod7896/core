import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import Form from "../../components/Form/Form";
import FormInput from "../../components/Inputs/FormInput";
import Button from "../../components/Button";

import "../../css/Login.css";

import CompanyLogo from "../../assets/Images/CompName.svg";
import VelaKoda from "../../assets/Logo/project_logo.svg";
import VelaKodaMobile from "../../assets/Images/MobileLogo.svg";
import { Link } from "react-router-dom";

import useAlert from "../../hooks/useAlert";

const LoginForm = () => {
  const navigate = useNavigate();
  const { user, roles, login, loading: authLoading, ready } = useAuth();
  const { showAlert } = useAlert();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ---------------------------
  // REDIRECT AFTER LOGIN / AUTO LOGIN
  // ---------------------------
  useEffect(() => {
    console.log("Auth state changed", { user, roles, ready });
    if (!ready) return; // wait for auto-login to finish

    if (!user) return; // not logged in, stay on login page

    proceedToDashboard(user, roles);
  }, [user, roles, ready]);

  const proceedToDashboard = (user, roles) => {
    // Super Admin priority
    if (user?.is_super_admin) {
      navigate("/superadmin/dashboard", { replace: true });
      return;
    }

    // Dynamic role redirect
    if (roles && roles.length > 0) {
      const role = roles[0].toLowerCase();
      navigate(`/${role}/dashboard`, { replace: true });
      return;
    }

    // fallback
    navigate("/", { replace: true });
  };

  // ---------------------------
  // LOGIN SUBMIT
  // ---------------------------
  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!username.trim() || !password) {
      showAlert("warning", "Username and Password are required");
      return;
    }

    try {
      setLoading(true);

      const { user: loggedUser, roles: userRoles } = await login({
        user_name: username.trim(),
        user_password: password,
      });

      showAlert("success", "Login successful");

      // Redirect immediately after login
      proceedToDashboard(loggedUser, userRoles);
    } catch (err) {
      console.error("Login failed", err);
      showAlert("error", err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="login-container">
      {/* LEFT IMAGE */}
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
          <img className="zerobox-logo" src={CompanyLogo} alt="Logo" />
        </div> */}

        <Form onSubmit={handleLogin} className="w-50">
          <h3 className="mb-3 mt-2 text-left fw-bolder">Welcome Back</h3>

          <p className="text-left mb-3">Sign in to your account</p>

          {/* USERNAME */}
          <FormInput
            // label="Username or Email"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            // leftIcon="bi-person-badge-fill"
            className="mb-4"
            placeholder="your@exmaple.com"
          />

          {/* PASSWORD */}
          <FormInput
            // label="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            // leftIcon="bi-lock-fill"
            showToggle={true}
            showPassword={showPassword}
            togglePassword={() => setShowPassword(!showPassword)}
            placeholder="•••••••••"
          />

          {/* FORGOT PASSWORD LINK */}
          <div className="d-flex justify-content-end mt-2">
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>

          {/* LOGIN BUTTON */}
          <Button
            type="submit"
            loading={loading || authLoading}
            variant="primary"
            className="w-100 mt-3"
          >
            {loading || authLoading ? "Signing In..." : "Sign In"}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default LoginForm;
