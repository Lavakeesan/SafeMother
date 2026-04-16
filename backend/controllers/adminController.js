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
        
        // Use User table for role distribution
        const userCounts = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        
        // Monthy registration trends from User table
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const registrationTrends = await User.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const formattedTrends = registrationTrends.map(item => ({
            month: monthNames[item._id - 1],
            count: item.count
        }));

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
            userDistribution: userCounts,
            registrationTrends: formattedTrends,
            riskBreakdown: {
                low: lowRisk,
                medium: mediumRisk,
                high: highRisk
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

// @desc    Get all midwifes with their user data
// @route   GET /api/admin/midwifes
// @access  Private/Admin
const getAllMidwifes = async (req, res) => {
    try {
        const midwifes = await Midwife.find({}).populate('user_id', 'name email').lean();
        
        const sanitizedMidwifes = midwifes.map(mw => {
            const hasPhoto = !!(mw.profile_photo && mw.profile_photo.data);
            const { profile_photo, ...rest } = mw;
            return {
                ...rest,
                hasProfilePhoto: hasPhoto
            };
        });

        res.json(sanitizedMidwifes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching midwifes' });
    }
};

// @desc    Update midwife status
// @route   PUT /api/admin/midwifes/:id/status
// @access  Private/Admin
const updateMidwifeStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const midwife = await Midwife.findById(req.params.id);
        
        if (!midwife) {
            return res.status(404).json({ message: 'Midwife not found' });
        }

        midwife.status = status;
        await midwife.save();
        
        res.json(midwife);
    } catch (error) {
        res.status(500).json({ message: 'Error updating midwife status' });
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
    getAllMidwifes,
    getAllPatients,
    updateMidwifeStatus
};
