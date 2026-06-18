const User = require('../model/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
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
        res.status(201).json({ message: 'User registered successfully' });
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

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token, user: { id: user._id, fullname: user.fullname, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    register,
    login
};
