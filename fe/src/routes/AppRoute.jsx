import React from "react";
import { Routes, Route } from "react-router-dom";
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

const AppRoute = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
      </Routes>
    </>
  );
};

export default AppRoute;
