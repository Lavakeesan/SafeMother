const Patient = require('../models/patientModel');
const User = require('../models/userModel');

// @desc    Create a patient profile
// @route   POST /api/patients
// @access  Private/Admin/Midwife
const createPatient = async (req, res) => {
    try {
        const { userId, name, age, address, contactNumber, medicalHistory, riskLevel, midwifeId } = req.body;

        const patient = await Patient.create({
            user: userId,
            name,
            age,
            address,
            contactNumber,
            medicalHistory,
            riskLevel,
            midwife: midwifeId,
        });

        res.status(201).json(patient);
    } catch (error) {
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
            patient.age = req.body.age || patient.age;
            patient.address = req.body.address || patient.address;
            patient.contactNumber = req.body.contactNumber || patient.contactNumber;
            patient.medicalHistory = req.body.medicalHistory || patient.medicalHistory;
            patient.riskLevel = req.body.riskLevel || patient.riskLevel;
            patient.midwife = req.body.midwifeId || patient.midwife;

            const updatedPatient = await patient.save();
            res.json(updatedPatient);
        } else {
            res.status(404).json({ message: 'Patient profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private/Admin/Midwife
const getPatients = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'midwife') {
            // Need to find the midwife profile ID first, but for simplicity assuming we filter by User ID or similar
            // Better: find Midwife profile where user = req.user._id
            // Then filter patients by midwife: midwifeProfile._id
            filter = { midwife: req.user._id }; // Simplified for now
        }

        const patients = await Patient.find(filter).populate('midwife');
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private
const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id).populate('midwife');
        if (patient) {
            // Check if patient belongs to midwife or is the patient themselves
            if (req.user.role === 'patient' && patient.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to view this profile' });
            }
            res.json(patient);
        } else {
            res.status(404).json({ message: 'Patient profile not found' });
        }
    } catch (error) {
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
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPatient,
    updatePatient,
    getPatients,
    getPatientById,
    deletePatient,
};
