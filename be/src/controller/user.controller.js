const User = require('../model/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Admin: quản lý người dùng ---
const VALID_ROLES = ['Visitor', 'User', 'Staff', 'Admin'];
const VALID_STATUS = ['Active', 'Locked'];

// GET /users/admin/all - danh sách người dùng (kèm số liệu, không gồm password)
const getAllUsersForAdmin = async (req, res) => {
    try {
        const { search, role, status } = req.query;
        const query = {};

        if (role && VALID_ROLES.includes(role)) query.role = role;
        if (status && VALID_STATUS.includes(status)) query.status = status;
        if (search && search.trim()) {
            const rx = new RegExp(search.trim(), 'i');
            query.$or = [{ fullname: rx }, { email: rx }];
        }

        const users = await User.find(query)
            .select('-password -twoFactorSecret -resetPasswordToken -resetPasswordExpires')
            .sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /users/admin/:id/role - đổi vai trò người dùng
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!VALID_ROLES.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Không cho tự hạ quyền chính mình để tránh khoá cửa hệ thống
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot change your own role' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Không cho hạ quyền Admin cuối cùng
        if (user.role === 'Admin' && role !== 'Admin') {
            const adminCount = await User.countDocuments({ role: 'Admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot demote the last remaining Admin' });
            }
        }

        user.role = role;
        await user.save();

        const obj = user.toObject();
        delete obj.password;
        res.status(200).json({ message: 'Role updated', user: obj });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /users/admin/:id/status - khoá / mở khoá tài khoản
const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!VALID_STATUS.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot lock your own account' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.status = status;
        await user.save();

        const obj = user.toObject();
        delete obj.password;
        res.status(200).json({ message: `Account ${status === 'Locked' ? 'locked' : 'unlocked'}`, user: obj });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const register = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ fullname, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', newUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        if (user.status === 'Locked') {
            return res.status(403).json({ message: 'Your account has been locked. Please contact the administrator.' });
        }

        if (user.twoFactorEnabled) {
            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.twoFactorSecret = otp;
            await user.save();

            // Send OTP email
            await sendEmail(
                user.email,
                'Your Login OTP',
                `Your OTP is ${otp}`,
                `<p>Your OTP is <strong>${otp}</strong>. It is valid for a short time.</p>`
            );

            return res.status(200).json({ 
                requires2FA: true, 
                userId: user._id, 
                message: "OTP sent to email" 
            });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token, user: { id: user._id, fullname: user.fullname, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyLogin2FA = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const user = await User.findById(userId);

        if (!user || user.twoFactorSecret !== otp) {
            return res.status(401).json({ message: 'Invalid OTP' });
        }

        // Clear OTP after successful login
        user.twoFactorSecret = null;
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token, user: { id: user._id, fullname: user.fullname, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInfo = async(req, res) =>{
    try {
        const user = await User.findById(req.user.id).select("-password");
        if(!user){
            res.status(404).json({message: "User not found!"})
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateProfile = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        await user.save();
        
        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({ message: "Profile updated successfully", user: userObj });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 2FA Settings ---
const requestEnable2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.twoFactorSecret = otp;
        await user.save();

        await sendEmail(
            user.email,
            'Enable 2-Factor Authentication',
            `Your OTP to enable 2FA is ${otp}`,
            `<p>Your OTP to enable 2FA is <strong>${otp}</strong>.</p>`
        );

        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyEnable2FA = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await User.findById(req.user.id);

        if (!user || user.twoFactorSecret !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        user.twoFactorEnabled = true;
        user.twoFactorSecret = null; // Clear OTP
        await user.save();

        res.status(200).json({ message: '2FA has been successfully enabled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const disable2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.twoFactorEnabled = false;
        await user.save();

        res.status(200).json({ message: '2FA has been successfully disabled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Forgot Password ---
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'No user found with this email' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // The URL should point to your frontend app
        const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
        
        await sendEmail(
            user.email,
            'Password Reset Request',
            `You requested a password reset. Please click on the following link: ${resetUrl}`,
            `<p>You requested a password reset.</p><p>Please click on the following link, or paste this into your browser to complete the process:</p><a href="${resetUrl}">${resetUrl}</a>`
        );

        res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({ 
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    getAllUsersForAdmin,
    updateUserRole,
    updateUserStatus,
    register,
    login,
    verifyLogin2FA,
    getInfo,
    updateProfile,
    requestEnable2FA,
    verifyEnable2FA,
    disable2FA,
    forgotPassword,
    resetPassword
};
