import api from "./api";

// ============================
// LOGIN
// ============================
export const loginAPI = async ({ user_name, user_password }) => {
  const res = await api.post("/auth/login", { user_name, user_password });
  return res.data;
};

// ============================
// LOGOUT
// ============================
export const logoutAPI = async (refreshToken) => {
  const res = await api.post("/auth/logout", { refreshToken });
  return res.data;
};

// ============================
// REFRESH TOKEN
// ============================
export const refreshTokenAPI = async (refreshToken) => {
  if (!refreshToken) throw new Error("No refresh token provided");
  const res = await api.post("/auth/refresh-token", { refreshToken });
  return res.data;
};

// ============================
// FORGOT PASSWORD
// ============================
export const forgotPasswordAPI = async (email) => {
  if (!email) throw new Error("Email is required");
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

// ============================
// VERIFY OTP
// ============================
export const verifyOtpAPI = async ({ email, otp }) => {
  if (!email || !otp) throw new Error("Email and OTP are required");
  const res = await api.post("/auth/verify-otp", { email, otp });
  return res.data;
};



// ============================
// RESET PASSWORD
// ============================
export const resetPasswordAPI = async ({ newPassword, confirmPassword, token }) => {
  if (!token) throw new Error("Reset token missing");
  const res = await api.post(
    "/auth/reset-password",
    { newPassword, confirmPassword, resetToken: token },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
