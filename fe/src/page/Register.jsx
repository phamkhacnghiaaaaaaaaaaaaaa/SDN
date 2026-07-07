import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authService from "../service/auth.service";
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Library,
  ArrowRight,
  UserPlus,
  CheckCircle,
} from "lucide-react";

const Register = () => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!fullname || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return false;
    }
    if (fullname.trim().length < 2) {
      setError("Full name must be at least 2 characters");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validate()) return;

    setLoading(true);
    try {
      await authService.register(fullname.trim(), email, password);
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
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

      {/* Register card */}
      <div className="login-card">
        {/* Header */}
        <div className="login-card__header">
          <div className="login-logo">
            <div className="login-logo__icon">
              <UserPlus size={26} />
            </div>
            <h1 className="login-logo__title">Create Account</h1>
          </div>
          <p className="login-card__subtitle">
            Join Library SDN302 — start exploring today
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="login-error">
            <div className="login-error__dot" />
            <span>{error}</span>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="login-success">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Full name */}
          <div className="login-field">
            <label htmlFor="fullname" className="login-field__label">
              Full Name
            </label>
            <div className="login-field__input-wrap">
              <UserPlus className="login-field__icon" size={18} />
              <input
                id="fullname"
                type="text"
                placeholder="John Doe"
                className="login-field__input"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
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

          {/* Password */}
          <div className="login-field">
            <label htmlFor="password" className="login-field__label">
              Password
            </label>
            <div className="login-field__input-wrap">
              <Lock className="login-field__icon" size={18} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                className="login-field__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                className="login-field__input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="login-field__eye"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <Loader2 className="login-btn__spinner" size={20} />
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider">
          <div className="login-divider__line" />
          <span className="login-divider__text">or</span>
          <div className="login-divider__line" />
        </div>

        {/* Footer */}
        <p className="login-footer">
          Already have an account?{" "}
          <Link to="/login" className="login-footer__link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
