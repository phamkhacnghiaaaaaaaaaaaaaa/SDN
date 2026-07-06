import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as authService from "../service/auth.service";
import {
  BookOpen,
  Mail,
  Loader2,
  Library,
  ArrowLeft,
  Send,
  CheckCircle,
} from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link. Please try again.");
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
            <h2 className="forgot-success__title">Check your email</h2>
            <p className="forgot-success__desc">
              We've sent a password reset link to{" "}
              <strong>{email}</strong>. Please check your inbox and follow
              the instructions.
            </p>
            <Link to="/login" className="login-btn" style={{ marginTop: "1.5rem", textDecoration: "none", display: "flex" }}>
              <ArrowLeft size={18} />
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="login-card__header">
              <div className="login-logo">
                <div className="login-logo__icon">
                  <Mail size={26} />
                </div>
                <h1 className="login-logo__title">Reset Password</h1>
              </div>
              <p className="login-card__subtitle">
                Enter your email and we'll send you a reset link
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
              <div className="login-field">
                <label htmlFor="email" className="login-field__label">
                  Email Address
                </label>
                <div className="login-field__input-wrap">
                  <Mail className="login-field__icon" size={18} />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="login-field__input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                  <Loader2 className="login-btn__spinner" size={20} />
                ) : (
                  <>
                    Send Reset Link
                    <Send size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Back to login */}
            <div style={{ marginTop: "1.5rem" }}>
              <Link
                to="/login"
                className="forgot-back"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
