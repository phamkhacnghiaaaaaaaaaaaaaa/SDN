const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Visitor', 'User', 'Staff', 'Admin'], default: 'User' },
    status: { type: String, enum: ['Active', 'Locked'], default: 'Active' }
}, {
    timestamps: true
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema, 'users');
