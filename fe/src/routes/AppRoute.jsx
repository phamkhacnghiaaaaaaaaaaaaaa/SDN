import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";

import MainLayout from "../layout/MainLayout";
import ProtectedLayout from "../layout/ProtectedLayout";
import Home from "../page/Home";
import Login from "../page/Login";
import Register from "../page/Register";
import ForgotPassword from "../page/ForgotPassword";
import ResetPassword from "../page/ResetPassword";
import BookDetail from "../page/BookDetail";
import Books from "../page/Books";
import Cart from "../page/Cart";
import Profile from "../page/Profile";
import StaffLayout from "../layout/staff/StaffLayout";
import StaffGuard from "../layout/staff/StaffGuard";
import ManageBooks from "../page/staff/ManageBooks";
import ManageBookDetail from "../page/staff/ManageBookDetail";
import ManageRentals from "../page/staff/ManageRentals";
import StaffProfile from "../page/staff/StaffProfile";
import AdminGuard from "../layout/admin/AdminGuard";
import AdminLayout from "../layout/admin/AdminLayout";
import AdminDashboard from "../page/admin/AdminDashboard";
import ManageUsers from "../page/admin/ManageUsers";
import ManageTaxonomy from "../page/admin/ManageTaxonomy";
import SystemSettings from "../page/admin/SystemSettings";

/**
 * Component dành cho các route công khai (Login, Register)
 * Nếu đã đăng nhập thì tự động "đá" ra ngoài dựa theo Role
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null; // Chờ khởi tạo Auth xong

  if (isAuthenticated) {
    // Admin -> khu quản trị riêng
    if (user?.role === "Admin") {
      return <Navigate to="/admin" replace />;
    }
    // Staff -> khu quản lý nghiệp vụ
    if (user?.role === "Staff") {
      return <Navigate to="/staff/books" replace />;
    }
    // Ngược lại (User, Visitor) -> Đẩy về trang chủ khách hàng
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();

  // Tránh việc hiện trang Login trong tích tắc khi web vừa load (flash)
  if (loading) return null;

  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        {/* 
           TRANG ĐĂNG NHẬP / ĐĂNG KÝ
           Tự động chuyển hướng nếu người dùng đã đăng nhập
        */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 
           GIAO DIỆN CLIENT (Visitor, User)
        */}
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={
              // Nếu Staff/Admin truy cập vào "/" -> Tự động đẩy về khu quản lý tương ứng
              isAuthenticated && user?.role === "Admin" ? (
                <Navigate to="/admin" replace />
              ) : isAuthenticated && user?.role === "Staff" ? (
                <Navigate to="/staff/books" replace />
              ) : (
                <Home />
              )
            }
          />

          {/* Route yêu cầu đăng nhập mới được vào (Protected) */}
          <Route element={<ProtectedLayout />}>
            <Route path="/books" element={<Books />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* 
           GIAO DIỆN DÀNH RIÊNG CHO STAFF & ADMIN
        */}
        <Route element={<StaffGuard />}>
          <Route element={<StaffLayout />}>
            {/* Khi vào đường dẫn /staff thì tự động đẩy tới trang quản lý sách */}
            <Route
              path="/staff"
              element={<Navigate to="/staff/books" replace />}
            />

            <Route path="/staff/profile" element={<StaffProfile />} />
            <Route path="/staff/books" element={<ManageBooks />} />
            <Route path="/staff/books/:id" element={<ManageBookDetail />} />
            <Route path="/staff/rentals" element={<ManageRentals />} />
          </Route>
        </Route>

        {/*
           GIAO DIỆN DÀNH RIÊNG CHO ADMIN
        */}
        <Route element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/books" element={<ManageBooks />} />
            <Route path="/admin/books/:id" element={<ManageBookDetail />} />
            <Route path="/admin/rentals" element={<ManageRentals />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/taxonomy" element={<ManageTaxonomy />} />
            <Route path="/admin/settings" element={<SystemSettings />} />
            <Route path="/admin/profile" element={<StaffProfile />} />
          </Route>
        </Route>

        {/* Catch-all: Nếu gõ bừa URL, đẩy về đúng Landing Page tương ứng với Role */}
        <Route
          path="*"
          element={
            <Navigate
              to={
                user?.role === "Admin"
                  ? "/admin"
                  : user?.role === "Staff"
                    ? "/staff/books"
                    : "/"
              }
              replace
            />
          }
        />
      </Routes>
    </>
  );
};

export default AppRoute;
