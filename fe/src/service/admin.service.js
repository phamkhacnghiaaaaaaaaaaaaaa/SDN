import api from "../config/api";

// --- Dashboard ---
export const getDashboardStats = async () => {
    const rs = await api.get("/dashboard/stats");
    return rs.data;
};

// --- Quản lý người dùng ---
export const getAllUsers = async (params = {}) => {
    const rs = await api.get("/users/admin/all", { params });
    return rs.data;
};

export const updateUserRole = async (id, role) => {
    const rs = await api.patch(`/users/admin/${id}/role`, { role });
    return rs.data;
};

export const updateUserStatus = async (id, status) => {
    const rs = await api.patch(`/users/admin/${id}/status`, { status });
    return rs.data;
};

// --- Cấu hình hệ thống ---
export const getSettings = async () => {
    const rs = await api.get("/settings");
    return rs.data;
};

export const updateSettings = async (payload) => {
    const rs = await api.patch("/settings", payload);
    return rs.data;
};
