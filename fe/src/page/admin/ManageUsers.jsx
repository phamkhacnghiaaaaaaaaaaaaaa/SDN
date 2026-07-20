import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Search, Lock, Unlock, ShieldCheck, Mail, Users } from "lucide-react";
import * as adminService from "../../service/admin.service";
import { useAuth } from "../../context/AuthContext";

const ROLES = ["Visitor", "User", "Staff", "Admin"];

const ROLE_STYLE = {
    Admin: "bg-red-500/10 text-red-400 border-red-500/20",
    Staff: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    User: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Visitor: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const ManageUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (search.trim()) params.search = search.trim();
            if (roleFilter !== "all") params.role = roleFilter;
            if (statusFilter !== "all") params.status = statusFilter;
            const data = await adminService.getAllUsers(params);
            setUsers(data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Không tải được danh sách người dùng");
        } finally {
            setLoading(false);
        }
    }, [search, roleFilter, statusFilter]);

    useEffect(() => {
        const t = setTimeout(fetchUsers, 300);
        return () => clearTimeout(t);
    }, [fetchUsers]);

    const handleRoleChange = async (u, role) => {
        if (role === u.role) return;
        try {
            await adminService.updateUserRole(u._id, role);
            toast.success(`Đã đổi vai trò của ${u.fullname} thành ${role}`);
            setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, role } : x)));
        } catch (err) {
            toast.error(err.response?.data?.message || "Đổi vai trò thất bại");
        }
    };

    const handleToggleStatus = async (u) => {
        const next = u.status === "Locked" ? "Active" : "Locked";
        try {
            await adminService.updateUserStatus(u._id, next);
            toast.success(next === "Locked" ? `Đã khóa ${u.fullname}` : `Đã mở khóa ${u.fullname}`);
            setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, status: next } : x)));
        } catch (err) {
            toast.error(err.response?.data?.message || "Cập nhật trạng thái thất bại");
        }
    };

    const getInitials = (name) =>
        (name || "U").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                        <Users size={24} className="text-primary" /> Quản lý người dùng
                    </h1>
                    <p className="text-text-muted text-sm mt-1">
                        {users.length} tài khoản • đổi vai trò, khóa/mở tài khoản.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[220px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm theo tên hoặc email..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-bg-secondary border border-border text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-bg-secondary border border-border text-white text-sm focus:outline-none focus:border-primary"
                >
                    <option value="all">Tất cả vai trò</option>
                    {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-bg-secondary border border-border text-white text-sm focus:outline-none focus:border-primary"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Active">Active</option>
                    <option value="Locked">Locked</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-bg-secondary rounded-2xl border border-border shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-surface/30">
                                <th className="p-4 text-xs font-bold uppercase text-text-muted">Người dùng</th>
                                <th className="p-4 text-xs font-bold uppercase text-text-muted">Vai trò</th>
                                <th className="p-4 text-xs font-bold uppercase text-text-muted">Trạng thái</th>
                                <th className="p-4 text-xs font-bold uppercase text-text-muted">Ngày tạo</th>
                                <th className="p-4 text-xs font-bold uppercase text-text-muted text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-text-muted animate-pulse">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-text-muted italic">
                                        Không tìm thấy người dùng nào.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => {
                                    const isSelf = currentUser?.id === u._id;
                                    return (
                                        <tr key={u._id} className="hover:bg-surface/10 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                                        {getInitials(u.fullname)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-white text-sm truncate">
                                                            {u.fullname}
                                                            {isSelf && (
                                                                <span className="ml-2 text-[10px] font-semibold text-primary">(Bạn)</span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-text-muted flex items-center gap-1 truncate">
                                                            <Mail size={11} /> {u.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${ROLE_STYLE[u.role]}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${u.status === "Locked"
                                                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                        : "bg-green-500/10 text-green-400 border-green-500/20"
                                                        }`}
                                                >
                                                    {u.status || "Active"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-text-muted">
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—"}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <select
                                                        value={u.role}
                                                        disabled={isSelf}
                                                        onChange={(e) => handleRoleChange(u, e.target.value)}
                                                        title={isSelf ? "Không thể đổi vai trò của chính mình" : "Đổi vai trò"}
                                                        className="px-2 py-1.5 rounded-lg bg-surface border border-border text-white text-xs focus:outline-none focus:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        {ROLES.map((r) => (
                                                            <option key={r} value={r}>{r}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => handleToggleStatus(u)}
                                                        disabled={isSelf}
                                                        title={isSelf ? "Không thể khóa chính mình" : u.status === "Locked" ? "Mở khóa" : "Khóa tài khoản"}
                                                        className={`p-1.5 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${u.status === "Locked"
                                                            ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500 hover:text-white"
                                                            : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white"
                                                            }`}
                                                    >
                                                        {u.status === "Locked" ? <Unlock size={15} /> : <Lock size={15} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="text-xs text-text-muted flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-primary" />
                Tài khoản bị khóa sẽ không thể đăng nhập vào hệ thống.
            </p>
        </div>
    );
};

export default ManageUsers;
