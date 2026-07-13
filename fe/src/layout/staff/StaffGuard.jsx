import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const StaffGuard = () => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    // 1. Hệ thống đang check token ngầm -> Hiện hiệu ứng xoay xoay cho đồng bộ
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-bg">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // 2. Nếu CHƯA login HOẶC role không phải 'Staff' (chữ S viết hoa theo DB) -> Đá về login
    if (!isAuthenticated || user?.role !== "Staff") {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Đúng là Staff xịn -> Cho đi qua cửa kiểm soát
    return <Outlet />;
};

export default StaffGuard;