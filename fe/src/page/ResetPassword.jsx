import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import * as authService from "../service/auth.service";
import {
  BookOpen,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Library,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract token from URL (e.g. ?token=XYZ)
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to reset password. The link might have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-orb login-bg-orb--1" />
        <div className="login-bg-orb login-bg-orb--2" />
        <div className="login-bg-orb login-bg-orb--3" />
      </div>

      {/* Floating decorative elements */}
      <div className="login-floating">
        <BookOpen className="login-float-icon login-float-icon--1" size={28} />
        <Library className="login-float-icon login-float-icon--2" size={22} />
        <BookOpen className="login-float-icon login-float-icon--3" size={18} />
      </div>

      {/* Card */}
      <div className="login-card">
        {success ? (
          /* Success State */
          <div className="forgot-success">
            <div className="forgot-success__icon">
              <CheckCircle size={48} />
            </div>
            <h2 className="forgot-success__title">Password Reset Successfully</h2>
            <p className="forgot-success__desc">
              Your password has been changed. You can now log in with your new password.
            </p>
            <Link to="/login" className="login-btn" style={{ marginTop: "1.5rem", textDecoration: "none", display: "flex", justifyContent: "center" }}>
              Go to Login
              <ArrowRight size={18} style={{ marginLeft: "8px" }} />
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="login-card__header">
              <div className="login-logo">
                <div className="login-logo__icon">
                  <Lock size={26} />
                </div>
                <h1 className="login-logo__title">Create New Password</h1>
              </div>
              <p className="login-card__subtitle">
                Enter your new password below
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="login-error">
                <div className="login-error__dot" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              {/* New Password */}
              <div className="login-field">
                <label htmlFor="password" className="login-field__label">
                  New Password
                </label>
                <div className="login-field__input-wrap">
                  <Lock className="login-field__icon" size={18} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="login-field__input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!token}
                  />
                  <button
                    type="button"
                    className="login-field__eye"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="login-field">
                <label htmlFor="confirmPassword" className="login-field__label">
                  Confirm Password
                </label>
                <div className="login-field__input-wrap">
                  <Lock className="login-field__icon" size={18} />
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="login-field__input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!token}
                  />
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={loading || !token}>
                {loading ? (
                  <Loader2 className="login-btn__spinner" size={20} />
                ) : (
                  <>
                    Reset Password
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
