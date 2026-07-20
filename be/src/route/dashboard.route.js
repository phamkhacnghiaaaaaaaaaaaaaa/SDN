const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controller/dashboard.controller");
const { verifyToken, authorizeRole } = require("../middleware/auth");

// Chỉ Admin mới được xem số liệu tổng hợp toàn hệ thống
router.get("/stats", verifyToken, authorizeRole("Admin"), getDashboardStats);

module.exports = router;
