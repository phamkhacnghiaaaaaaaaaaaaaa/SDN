import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    Users,
    Tags,
    LogOut,
    Menu,
    ShieldCheck,
    Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/books", label: "Quản lý sách", icon: BookOpen },
    { to: "/admin/rentals", label: "Đơn thuê", icon: ClipboardList },
    { to: "/admin/users", label: "Người dùng", icon: Users },
    { to: "/admin/taxonomy", label: "Danh mục / Tác giả / NXB", icon: Tags },
    { to: "/admin/settings", label: "Cấu hình hệ thống", icon: Settings },
];

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getInitials = (name) => {
        if (!name) return "A";
        return name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const SidebarContent = () => (
        <>
            {/* Brand */}
            <Link
                to="/admin"
                className="flex items-center gap-3 px-6 h-16 border-b border-border shrink-0"
                onClick={() => setMobileOpen(false)}
            >
                <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                    <ShieldCheck size={20} />
                </div>
                <div className="leading-tight">
                    <p className="font-extrabold text-white text-sm">Library Admin</p>
                    <p className="text-[11px] text-text-muted">SDN302 Control</p>
                </div>
            </Link>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive
                                ? "bg-primary text-white shadow-md"
                                : "text-text-muted hover:bg-surface hover:text-white"
                            }`
                        }
                    >
                        <Icon size={18} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User + logout */}
            <div className="border-t border-border p-3 shrink-0">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-9 h-9 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-sm">
                        {getInitials(user?.fullname)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                            {user?.fullname || "Admin"}
                        </p>
                        <p className="text-[11px] text-text-muted truncate">
                            {user?.role || "Admin"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <LogOut size={18} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-bg flex">
            {/* Sidebar (desktop) */}
            <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-bg-secondary border-r border-border sticky top-0 h-screen">
                <SidebarContent />
            </aside>

            {/* Sidebar (mobile drawer) */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative w-64 flex flex-col bg-bg-secondary border-r border-border h-full">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar (mobile) */}
                <header className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-bg-secondary sticky top-0 z-30">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-surface"
                    >
                        <Menu size={20} />
                    </button>
                    <span className="font-bold text-white text-sm">Library Admin</span>
                    <div className="w-9" />
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
