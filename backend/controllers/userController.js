const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const Midwife = require('../models/midwifeModel');
const Patient = require('../models/patientModel');
const generateToken = require('../utils/generateToken');

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, ...profileData } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password, role });

        if (user) {
            // Create role-specific profile
            if (role === 'admin') {
                await Admin.create({ user_id: user._id, permissions: profileData.permissions || [] });
            } else if (role === 'midwife') {
                await Midwife.create({ 
                    user_id: user._id, 
                    contact_number: profileData.contactNumber || profileData.contact_number, 
                    assigned_area: profileData.assignedArea || profileData.assigned_area
                });
            } else if (role === 'patient') {
                await Patient.create({
                    user_id: user._id,
                    name: user.name,
                    age: profileData.age,
                    address: profileData.address,
                    contact_number: profileData.contactNumber || profileData.contact_number,
                    medical_history: profileData.medicalHistory || profileData.medical_history,
                    risk_level: profileData.riskLevel || profileData.risk_level || 'Low',
                    midwife_id: profileData.midwifeId || profileData.midwife_id
                });
            }

            generateToken(res, user.id);
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            generateToken(res, user.id);
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
    registerUser,
    authUser,
    logoutUser,
};
