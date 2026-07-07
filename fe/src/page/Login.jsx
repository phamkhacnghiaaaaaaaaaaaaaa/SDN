import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as authService from "../service/auth.service";
import toast from "react-hot-toast";
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Library,
  ArrowRight,
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [needs2FA, setNeeds2FA] = useState(false);
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");

  const { login, verify2FA } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!needs2FA) {
      if (!email || !password) {
        setError("Please fill in all fields");
        return;
      }

      setLoading(true);
      try {
        const res = await login(email, password);
        if (res?.requires2FA) {
          setNeeds2FA(true);
          setUserId(res.userId);
          toast.success("Please enter the OTP sent to your email");
        } else {
          toast.success("Login successful!");
          navigate("/");
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Login failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    } else {
      // Handle OTP submission
      if (!otp) {
        setError("Please enter the OTP sent to your email");
        return;
      }

      setLoading(true);
      try {
        await verify2FA(userId, otp);
        toast.success("Login successful!");
        navigate("/");
      } catch (err) {
        setError(
          err.response?.data?.message || "Invalid OTP. Please try again."
        );
      } finally {
        setLoading(false);
      }
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

      {/* Login card */}
      <div className="login-card">
        {/* Header */}
        <div className="login-card__header">
          <div className="login-logo">
            <div className="login-logo__icon">
              <BookOpen size={28} />
            </div>
            <h1 className="login-logo__title">Library SDN302</h1>
          </div>
          <p className="login-card__subtitle">
            {needs2FA ? "Enter the verification code sent to your email" : "Welcome back! Sign in to your account"}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="login-error">
            <div className="login-error__dot" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {!needs2FA ? (
            <>
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
                <div className="login-field__label-row">
                  <label htmlFor="password" className="login-field__label">
                    Password
                  </label>
                  <Link to="/forgot-password" className="login-field__forgot">
                    Forgot password?
                  </Link>
                </div>
                <div className="login-field__input-wrap">
                  <Lock className="login-field__icon" size={18} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="login-field__input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
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
            </>
          ) : (
            /* OTP Field */
            <div className="login-field">
              <label htmlFor="otp" className="login-field__label">
                One-Time Password (OTP)
              </label>
              <div className="login-field__input-wrap">
                <Lock className="login-field__icon" size={18} />
                <input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className="login-field__input text-center tracking-widest text-lg font-medium"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>
              <button 
                type="button" 
                onClick={() => { setNeeds2FA(false); setOtp(""); setError(""); }}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Back to Login
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading || (needs2FA && otp.length < 6)}
          >
            {loading ? (
              <Loader2 className="login-btn__spinner" size={20} />
            ) : (
              <>
                {needs2FA ? "Verify" : "Sign In"}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {!needs2FA && (
          <>
            {/* Divider */}
            <div className="login-divider">
              <div className="login-divider__line" />
              <span className="login-divider__text">or</span>
              <div className="login-divider__line" />
            </div>

            {/* Footer */}
            <p className="login-footer">
              Don't have an account?{" "}
              <Link to="/register" className="login-footer__link">
                Create account
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
