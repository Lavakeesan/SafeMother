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
        console.log('Registration Request Body:', req.body);

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ 
            name, 
            email, 
            password, 
            role,
            contact_number: profileData.contact_number || profileData.contactNumber,
            assigned_area: profileData.assigned_area || profileData.assignedArea,
            qualification: profileData.qualification,
            experience_years: profileData.experience_years || profileData.experienceYears,
            hospital_name: profileData.hospital_name || profileData.hospitalName
        });

        if (user) {
            console.log('User created successfully, role:', user.role);
            let profile = null;
            // Create role-specific profile
            if (role === 'admin') {
                console.log('Creating Admin profile...');
                profile = await Admin.create({ user_id: user._id, permissions: profileData.permissions || [] });
            } else if (role === 'midwife') {
                console.log('Creating Midwife profile...');
                profile = await Midwife.create({ 
                    user_id: user._id, 
                    name: user.name,
                    email: user.email,
                    contact_number: profileData.contactNumber || profileData.contact_number, 
                    assigned_area: profileData.assignedArea || profileData.assigned_area,
                    qualification: profileData.qualification,
                    experience_years: profileData.experience_years || profileData.experienceYears,
                    hospital_name: profileData.hospital_name || profileData.hospitalName,
                    password: user.password
                });
                console.log('Midwife profile created successfully');
            } else if (role === 'patient') {
                console.log('Creating Patient profile...');
                profile = await Patient.create({
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
                profile: profile
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.contact_number = req.body.contact_number || user.contact_number;
            user.assigned_area = req.body.assigned_area || user.assigned_area;
            user.qualification = req.body.qualification || user.qualification;
            user.experience_years = req.body.experience_years || user.experience_years;
            user.hospital_name = req.body.hospital_name || user.hospital_name;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            // If user is a midwife, update the Midwife profile too
            if (user.role === 'midwife') {
                const midwife = await Midwife.findOne({ user_id: user._id });
                if (midwife) {
                    midwife.name = updatedUser.name;
                    midwife.email = updatedUser.email;
                    midwife.contact_number = req.body.contact_number || midwife.contact_number;
                    midwife.assigned_area = req.body.assigned_area || midwife.assigned_area;
                    midwife.qualification = req.body.qualification || midwife.qualification;
                    midwife.experience_years = req.body.experience_years || midwife.experience_years;
                    midwife.hospital_name = req.body.hospital_name || midwife.hospital_name;
                    
                    if (req.body.password) {
                        midwife.password = updatedUser.password; // sync hashed password
                    }
                    
                    await midwife.save();
                }
            }
            
            // If user is a patient, update the Patient profile too
            if (user.role === 'patient') {
                const patient = await Patient.findOne({ user_id: user._id });
                if (patient) {
                    patient.name = updatedUser.name;
                    patient.email = updatedUser.email;
                    await patient.save();
                }
            }

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

module.exports = {
    registerUser,
    authUser,
    logoutUser,
    updateUserProfile,
};
