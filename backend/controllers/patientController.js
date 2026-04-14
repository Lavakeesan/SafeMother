const Patient = require('../models/patientModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const Midwife = require('../models/midwifeModel');
const sendEmail = require('../utils/emailService');
const sendSMS = require('../utils/smsService');
const crypto = require('crypto');

// @desc    Create a patient profile
// @route   POST /api/patients
// @access  Private/Admin/Midwife
const createPatient = async (req, res) => {
    try {
        console.log('Registering patient with data:', req.body);
        const { user_id, name, email, age, address, contact_number, medical_history, risk_level, midwife_id, mrn, delivery_date } = req.body;

        // Check if MRN already exists
        const mrnExists = await Patient.findOne({ mrn });
        if (mrnExists) {
            return res.status(400).json({ message: 'A patient with this MRN already exists' });
        }

        let finalUserId = user_id || null;

        // Auto-generate User Account if email is provided and no user_id is given
        if (email && !finalUserId) {
            const existingUser = await User.findOne({ email });
            if (!existingUser) {
                // Generate random 8 character password
                const generatedPassword = crypto.randomBytes(4).toString('hex');
                
                const newUser = await User.create({
                    name,
                    email,
                    password: generatedPassword,
                    role: 'patient'
                });
                
                finalUserId = newUser._id;

                // Send email with credentials
                await sendEmail({
                    email: email,
                    subject: 'SafeMother Patient Portal Access',
                    message: `Hello ${name},\n\nYou have been registered on the SafeMother platform by your midwife.\n\nYou can access your Patient Portal using the following credentials:\n\nEmail: ${email}\nPassword: ${generatedPassword}\n\nPlease stay safe and healthy!\n\nBest regards,\nThe SafeMother Team`
                });

                // Send SMS with credentials
                if (contact_number) {
                    try {
                        await sendSMS(
                            contact_number, 
                            `SafeMother: Hello ${name}, your portal is ready. Login with Email: ${email} and Password: ${generatedPassword}. Stay safe!`
                        );
                    } catch (smsError) {
                        console.error('SMS notification failed, but registration continued:', smsError.message);
                    }
                }
            } else {
                finalUserId = existingUser._id;
            }
        }

        const midwife = await Midwife.findOne({ user_id: req.user._id });
        const finalMidwifeId = midwife_id || (midwife ? midwife._id : null);

        const patient = await Patient.create({
            user_id: finalUserId,
            name,
            email,
            age,
            address,
            contact_number,
            medical_history,
            delivery_date: delivery_date ? new Date(delivery_date) : null,
            risk_level: risk_level || 'Low',
            midwife_id: finalMidwifeId,
            mrn,
        });

        res.status(201).json(patient);
    } catch (error) {
        console.error('Create Patient Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a patient profile
// @route   PUT /api/patients/:id
// @access  Private/Admin/Midwife
const updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (patient) {
            patient.name = req.body.name || patient.name;
            patient.email = req.body.email || patient.email;
            patient.age = req.body.age || patient.age;
            patient.address = req.body.address || patient.address;
            patient.contact_number = req.body.contact_number || patient.contact_number;
            patient.medical_history = req.body.medical_history || patient.medical_history;
            if (req.body.delivery_date) {
                patient.delivery_date = new Date(req.body.delivery_date);
            }
            patient.risk_level = req.body.risk_level || patient.risk_level;
            patient.midwife_id = req.body.midwife_id || patient.midwife_id;
            patient.mrn = req.body.mrn || patient.mrn;

            const updatedPatient = await patient.save();
            res.json(updatedPatient);
        } else {
            res.status(404).json({ message: 'Patient profile not found' });
        }
    } catch (error) {
        console.error('Update Patient Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private/Admin/Midwife
const getPatients = async (req, res) => {
    try {
        let filter = {};
        if (req.user && req.user.role === 'midwife') {
            const midwife = await Midwife.findOne({ user_id: req.user._id });
            filter = { midwife_id: midwife ? midwife._id : null };
        }

        const patients = await Patient.find(filter).populate({
            path: 'midwife_id',
            populate: {
                path: 'user_id',
                model: 'User',
                select: 'name'
            }
        });
        res.json(patients);
    } catch (error) {
        console.error('Get Patients Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private
const getPatientById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Invalid patient profile ID' });
        }
        
        const patient = await Patient.findById(req.params.id).populate({
            path: 'midwife_id',
            populate: {
                path: 'user_id',
                model: 'User',
                select: 'name'
            }
        });
        if (patient) {
            // Check if patient belongs to midwife or is the patient themselves
            if (req.user && req.user.role === 'patient' && patient.user_id && patient.user_id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to view this profile' });
            }
            res.json(patient);
        } else {
            res.status(404).json({ message: 'Patient profile not found' });
        }
    } catch (error) {
        console.error('Get Patient By ID Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in patient profile
// @route   GET /api/patients/profile
// @access  Private/Patient
const getPatientProfile = async (req, res) => {
    try {
        const patient = await Patient.findOne({ user_id: req.user._id }).populate({
            path: 'midwife_id',
            populate: {
                path: 'user_id',
                model: 'User',
                select: 'name'
            }
        });
        if (patient) {
            res.json(patient);
        } else {
            res.status(404).json({ message: 'Patient profile not found' });
        }
    } catch (error) {
        console.error('Get Patient Profile Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete patient profile
// @route   DELETE /api/patients/:id
// @access  Private/Admin
const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (patient) {
            await patient.deleteOne();
            res.json({ message: 'Patient profile removed' });
        } else {
            res.status(404).json({ message: 'Patient profile not found' });
        }
    } catch (error) {
        console.error('Delete Patient Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPatient,
    updatePatient,
    getPatients,
    getPatientById,
    getPatientProfile,
    deletePatient,
};
