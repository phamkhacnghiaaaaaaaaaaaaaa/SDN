import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../service/auth.service";
import { User, Mail, Lock, CheckCircle, AlertCircle, Save } from "lucide-react";

const ProfileSettings = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    password: "",
    confirmPassword: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const dataToUpdate = {
        fullname: formData.fullname,
        email: formData.email,
        ...(formData.password ? { password: formData.password } : {})
      };
      
      const res = await updateProfile(dataToUpdate.fullname, dataToUpdate.email, dataToUpdate.password);
      
      // Update local storage if needed, though context might fetch again on reload
      // A full solution would update the context's user object directly
      setSuccess("Profile updated successfully!");
      setFormData({ ...formData, password: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-secondary p-6 rounded-md shadow-shadow-sm max-w-3xl">
      <h2 className="text-2xl font-bold mb-6 border-b border-border pb-4">Profile Settings</h2>
      
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Full Name</label>
          <div className="relative">
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
              className="w-full bg-bg border border-border rounded-md py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:border-primary transition-colors text-text"
            />
            <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Email Address</label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-bg border border-border rounded-md py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:border-primary transition-colors text-text"
            />
            <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="text-lg font-medium mb-4">Change Password</h3>
          <p className="text-sm text-text-muted mb-4">Leave blank if you don't want to change your password.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="w-full bg-bg border border-border rounded-md py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:border-primary transition-colors text-text"
                />
                <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full bg-bg border border-border rounded-md py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:border-primary transition-colors text-text"
                />
                <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium py-2.5 px-6 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <><Save size={18} /> Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
