const express = require('express');
const router = express.Router();
const {
    getAllUsers, getAllUsersForAdmin, updateUserRole, updateUserStatus,
    register, login, verifyLogin2FA, getInfo, updateProfile,
    requestEnable2FA, verifyEnable2FA, disable2FA, forgotPassword, resetPassword
} = require('../controller/user.controller');
const { verifyToken, authorizeRole } = require('../middleware/auth');

router.get('/', getAllUsers);
router.post('/register', register);
router.post('/login', login);
router.post('/login/verify-2fa', verifyLogin2FA);

// Admin: quản lý người dùng
router.get('/admin/all', verifyToken, authorizeRole('Admin'), getAllUsersForAdmin);
router.patch('/admin/:id/role', verifyToken, authorizeRole('Admin'), updateUserRole);
router.patch('/admin/:id/status', verifyToken, authorizeRole('Admin'), updateUserStatus);

router.get('/me', verifyToken, getInfo);
router.put('/me', verifyToken, updateProfile);

// 2FA Routes
router.post('/2fa/request-enable', verifyToken, requestEnable2FA);
router.post('/2fa/verify-enable', verifyToken, verifyEnable2FA);
router.post('/2fa/disable', verifyToken, disable2FA);

// Forgot Password Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
