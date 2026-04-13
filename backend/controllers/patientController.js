const Patient = require('../models/patientModel');
const User = require('../models/userModel');

// @desc    Create a patient profile
// @route   POST /api/patients
// @access  Private/Admin/Midwife
const createPatient = async (req, res) => {
    try {
        console.log('Registering patient with data:', req.body);
        const { user_id, name, age, address, contact_number, medical_history, risk_level, midwife_id, mrn, delivery_date } = req.body;

        // Check if MRN already exists
        const mrnExists = await Patient.findOne({ mrn });
        if (mrnExists) {
            return res.status(400).json({ message: 'A patient with this MRN already exists' });
        }

        const patient = await Patient.create({
            user_id: user_id || null,
            name,
            age,
            address,
            contact_number,
            medical_history,
            delivery_date: delivery_date ? new Date(delivery_date) : null,
            risk_level: risk_level || 'Low',
            midwife_id: midwife_id || (req.user ? req.user._id : null),
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
            filter = { midwife_id: req.user._id };
        }

        const patients = await Patient.find(filter).populate('midwife_id');
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
        const patient = await Patient.findById(req.params.id).populate('midwife_id');
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
    deletePatient,
};
