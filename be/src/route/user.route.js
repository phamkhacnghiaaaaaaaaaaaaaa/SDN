const express = require('express');
const router = express.Router();
const { 
    getAllUsers, register, login, verifyLogin2FA, getInfo, updateProfile, 
    requestEnable2FA, verifyEnable2FA, disable2FA, forgotPassword, resetPassword 
} = require('../controller/user.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/', getAllUsers);
router.post('/register', register);
router.post('/login', login);
router.post('/login/verify-2fa', verifyLogin2FA);

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
