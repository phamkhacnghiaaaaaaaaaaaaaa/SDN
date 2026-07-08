import React from "react";
import { BookHeart, BookOpen, Clock, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfileSidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 1. Định nghĩa tất cả các item có thể có
  const allNavItems = [
    { id: "reading", label: "Reading Progress", icon: <BookOpen size={18} /> },
    { id: "favorites", label: "Favorite Books", icon: <BookHeart size={18} /> },
    { id: "rentals", label: "Rental History", icon: <Clock size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  // 2. Logic lọc: Nếu là Staff thì chỉ lấy Settings
  const navItems = user?.role === "Staff"
    ? allNavItems.filter(item => item.id === "settings")
    : allNavItems;

  return (
    <div className="bg-bg-secondary rounded-md shadow-shadow-sm p-6 w-full text-text">
      <div className="flex flex-col items-center mb-8 border-b border-border pb-6">
        <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center text-3xl font-bold mb-3">
          {user?.fullname?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <h2 className="text-lg font-bold line-clamp-1 text-center">
          {user?.fullname || "User"}
          {/* Thêm tag Staff cho oai */}
          {user?.role === "Staff" && <span className="ml-2 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded">STAFF</span>}
        </h2>
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

        <div className="mt-4 border-t border-border pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-md transition-colors w-full text-left font-medium text-error hover:bg-error/10"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ProfileSidebar;