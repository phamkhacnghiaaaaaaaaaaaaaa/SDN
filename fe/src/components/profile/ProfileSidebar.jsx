import React from "react";
import { BookHeart, BookOpen, Clock, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProfileSidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navItems = [
    { id: "reading", label: "Reading Progress", icon: <BookOpen size={18} /> },
    { id: "favorites", label: "Favorite Books", icon: <BookHeart size={18} /> },
    { id: "rentals", label: "Rental History", icon: <Clock size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="bg-bg-secondary rounded-md shadow-shadow-sm p-6 w-full text-text">
      <div className="flex flex-col items-center mb-8 border-b border-border pb-6">
        <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center text-3xl font-bold mb-3">
          {user?.fullname?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <h2 className="text-lg font-bold line-clamp-1 text-center">{user?.fullname || "User"}</h2>
        <p className="text-sm text-text-muted line-clamp-1">{user?.email}</p>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors w-full text-left font-medium ${activeTab === item.id
              ? "bg-primary text-white"
              : "text-text-secondary hover:bg-surface hover:text-primary"
              }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-md transition-colors w-full text-left font-medium text-error hover:bg-error/10 mt-4 border-t border-border pt-6"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default ProfileSidebar;
