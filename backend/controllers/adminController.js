const User = require('../models/userModel');
const Midwife = require('../models/midwifeModel');
const Patient = require('../models/patientModel');
const Appointment = require('../models/appointmentModel'); // assuming this exists
const Alert = require('../models/alertModel');

// @desc    Get dashboard overview stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalPatients = await Patient.countDocuments();
        const totalMidwives = await Midwife.countDocuments();
        const totalAlerts = await Alert.countDocuments();
        
        // Handling potentially non-existent appointments model
        let totalAppointments = 0;
        try {
            totalAppointments = await Appointment.countDocuments();
        } catch (e) {}

        // Patients by Risk Level
        const lowRisk = await Patient.countDocuments({ risk_level: 'Low' });
        const mediumRisk = await Patient.countDocuments({ risk_level: 'Medium' });
        const highRisk = await Patient.countDocuments({ risk_level: 'High' });

        res.json({
            totalPatients,
            totalMidwives,
            totalAppointments,
            totalAlerts,
            riskBreakdown: {
                low: lowRisk,
                medium: mediumRisk,
                high: highRisk
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

// @desc    Get all midwives with their user data
// @route   GET /api/admin/midwives
// @access  Private/Admin
const getAllMidwives = async (req, res) => {
    try {
        const midwives = await Midwife.find({}).populate('user_id', 'name email').lean();
        
        const sanitizedMidwives = midwives.map(mw => {
            const hasPhoto = !!(mw.profile_photo && mw.profile_photo.data);
            const { profile_photo, ...rest } = mw;
            return {
                ...rest,
                hasProfilePhoto: hasPhoto
            };
        });

        res.json(sanitizedMidwives);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching midwives' });
    }
};

// @desc    Get all patients with their midwife data
// @route   GET /api/admin/patients
// @access  Private/Admin
const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find({}).populate('midwife_id', 'name hospital_name');
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patients' });
    }
};

module.exports = {
    getDashboardStats,
    getAllMidwives,
    getAllPatients
};
