const Patient = require('../models/patientModel');

// @desc    Register a new patient
// @route   POST /api/patients
// @access  Private/Midwife
const registerPatient = async (req, res) => {
    try {
        const { name, age, gestationWeeks, status, nextVisit, phoneNumber, mrn } = req.body;

        if (!name || !age || !gestationWeeks || !phoneNumber || !mrn) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        const patientExists = await Patient.findOne({ mrn });

        if (patientExists) {
            return res.status(400).json({ message: 'Patient with this MRN already exists' });
        }

        const patient = await Patient.create({
            name,
            age,
            gestationWeeks,
            status,
            nextVisit,
            phoneNumber,
            mrn,
            midwife: req.user._id, // Assumes auth middleware attaches user
        });

        if (patient) {
            res.status(201).json(patient);
        } else {
            res.status(400).json({ message: 'Invalid patient data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all patients for a midwife
// @route   GET /api/patients
// @access  Private/Midwife
const getPatients = async (req, res) => {
    try {
        const patients = await Patient.find({ midwife: req.user._id });
        res.json(patients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private/Midwife
const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findOne({ _id: req.params.id, midwife: req.user._id });
        if (patient) {
            res.json(patient);
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerPatient,
    getPatients,
    getPatientById,
};
