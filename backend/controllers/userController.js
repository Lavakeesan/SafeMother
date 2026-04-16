const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const Midwife = require('../models/midwifeModel');
const Patient = require('../models/patientModel');
const Doctor = require('../models/doctorModel');
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
            } else if (role === 'doctor') {
                console.log('Creating Doctor profile...');
                profile = await Doctor.create({
                    user_id: user._id,
                    name: user.name,
                    specialization: profileData.specialization || 'Maternal-Fetal Medicine Specialists',
                    license_number: profileData.license_number || profileData.licenseNumber,
                    hospital_name: profileData.hospital_name || profileData.hospitalName
                });
                console.log('Doctor profile created successfully');
            }

            generateToken(res, user.id);
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                hasProfilePhoto: false,
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

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (user) {
            let profile = null;
            if (user.role === 'midwife') {
                profile = await Midwife.findOne({ user_id: user._id });
            } else if (user.role === 'patient') {
                profile = await Patient.findOne({ user_id: user._id });
            } else if (user.role === 'admin') {
                profile = await Admin.findOne({ user_id: user._id });
            }

            const { profile_photo, ...rest } = user._doc;
            res.json({
                ...rest,
                hasProfilePhoto: !!(profile_photo && profile_photo.data),
                profile
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate a user

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
                hasProfilePhoto: !!(user.profile_photo && user.profile_photo.data)
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

// @desc    Update user password
// @route   PUT /api/users/update-password
// @access  Private
const updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { currentPassword, newPassword } = req.body;

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword;
            await user.save();
            
            // Sync with midwife if applicable
            if (user.role === 'midwife') {
                const midwife = await Midwife.findOne({ user_id: user._id });
                if (midwife) {
                    midwife.password = user.password;
                    await midwife.save();
                }
            }

            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Upload profile photo
// @route   POST /api/users/profile-photo
// @access  Private
const uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.profile_photo = {
            data: req.file.buffer,
            contentType: req.file.mimetype
        };
        await user.save();

        // Sync with midwife if applicable
        if (user.role === 'midwife') {
            const midwife = await Midwife.findOne({ user_id: user._id });
            if (midwife) {
                midwife.profile_photo = user.profile_photo;
                await midwife.save();
            }
        }

        res.json({ message: 'Profile photo uploaded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during photo upload' });
    }
};

// @desc    Get profile photo
// @route   GET /api/users/profile-photo/:userId
// @access  Public
const getProfilePhoto = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user || !user.profile_photo || !user.profile_photo.data) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        res.set('Content-Type', user.profile_photo.contentType);
        res.send(user.profile_photo.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving photo' });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').lean();
        
        // Add flag and remove the heavy photo data if it exists
        const sanitizedUsers = users.map(user => {
            const hasPhoto = !!(user.profile_photo && user.profile_photo.data);
            const { profile_photo, ...rest } = user;
            return {
                ...rest,
                hasProfilePhoto: hasPhoto
            };
        });

        res.json(sanitizedUsers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Delete associated profile
            if (user.role === 'midwife') {
                await Midwife.deleteOne({ user_id: user._id });
            } else if (user.role === 'patient') {
                await Patient.deleteOne({ user_id: user._id });
            }

            await User.deleteOne({ _id: user._id });
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user by Admin
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUserByAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;

            const updatedUser = await user.save();

            // Sync profiles
            if (updatedUser.role === 'midwife') {
                const midwife = await Midwife.findOne({ user_id: updatedUser._id });
                if (midwife) {
                    midwife.name = updatedUser.name;
                    midwife.email = updatedUser.email;
                    await midwife.save();
                }
            } else if (updatedUser.role === 'patient') {
                const patient = await Patient.findOne({ user_id: updatedUser._id });
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
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    authUser,
    getUserProfile,
    logoutUser,
    updateUserProfile,
    updatePassword,
    uploadProfilePhoto,
    getProfilePhoto,
    getAllUsers,
    deleteUser,
    updateUserByAdmin,
};
