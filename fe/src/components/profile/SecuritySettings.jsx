import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Shield, Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import * as authService from "../../service/auth.service";

const SecuritySettings = () => {
  const { user } = useAuth();
  
  // We don't have twoFactorEnabled in the AuthContext user object initially
  // In a real app we'd fetch it, but here we assume it comes from getUserInfo or we manage it locally
  // For the sake of this demo, we'll try to get it from a backend call if we have an endpoint, 
  // or just rely on local state. We added twoFactorEnabled to user schema, so getInfo should return it.
  
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    const fetchSecurityInfo = async () => {
      try {
        const userInfo = await authService.getUserInfo();
        setIs2FAEnabled(userInfo.twoFactorEnabled || false);
      } catch (err) {
        console.error("Error fetching user info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSecurityInfo();
  }, []);

  const handleToggle2FA = async () => {
    setError("");
    setSuccess("");
    setActionLoading(true);

    try {
      if (is2FAEnabled) {
        // Disable 2FA directly
        await authService.disable2FA();
        setIs2FAEnabled(false);
        setSuccess("2-Factor Authentication has been disabled.");
      } else {
        // Request enabling 2FA (sends OTP)
        await authService.requestEnable2FA();
        setShowOtpModal(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update 2FA status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setActionLoading(true);

    try {
      await authService.verifyEnable2FA(otp);
      setIs2FAEnabled(true);
      setShowOtpModal(false);
      setOtp("");
      setSuccess("2-Factor Authentication has been successfully enabled!");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP or request failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading security settings...</div>;
  }

  return (
    <div className="bg-bg-secondary p-6 rounded-md shadow-shadow-sm max-w-3xl">
      <h2 className="text-2xl font-bold mb-6 border-b border-border pb-4">Security Settings</h2>
      
      {success && (
        <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg mb-6 flex items-center gap-3 animate-fade-in">
            <CheckCircle size={18} />
            <p>{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <AlertCircle size={18} />
            <p>{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-start justify-between border border-border p-4 rounded-lg bg-bg">
          <div className="flex gap-4">
            <div className={`p-3 rounded-full ${is2FAEnabled ? 'bg-success/20 text-success' : 'bg-gray-200 text-gray-500'}`}>
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Two-Factor Authentication (2FA)</h3>
              <p className="text-sm text-text-muted mt-1 max-w-md">
                Add an extra layer of security to your account. When enabled, you'll be required to enter an OTP sent to your email during login.
              </p>
            </div>
          </div>
          <div>
            <button
              onClick={handleToggle2FA}
              disabled={actionLoading}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                is2FAEnabled 
                  ? 'bg-error/10 text-error hover:bg-error/20' 
                  : 'bg-primary text-white hover:bg-primary-hover'
              }`}
            >
              {actionLoading ? <RefreshCw className="animate-spin" size={20} /> : (is2FAEnabled ? 'Disable' : 'Enable')}
            </button>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Verify Your Email</h3>
            <p className="text-sm text-text-muted mb-6">
              We've sent a 6-digit verification code to your email address. Please enter it below to enable 2FA.
            </p>
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-bg border border-border rounded-md py-3 pl-10 pr-3 text-center tracking-widest text-lg font-medium focus:outline-none focus:border-primary transition-colors text-text"
                    maxLength={6}
                    required
                  />
                  <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || otp.length < 6}
                  className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;
