const Doctor = require('../models/doctorModel');
const Patient = require('../models/patientModel');
const Appointment = require('../models/appointmentModel');
const Message = require('../models/messageModel');

// @desc    Get doctor dashboard stats
// @route   GET /api/doctor/stats
// @access  Private/Doctor
const getDoctorStats = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user_id: req.user._id });
        if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

        const totalPatients = doctor.assigned_patients.length;
        const consultations = await Appointment.find({ doctor: doctor._id });
        
        const pendingValue = consultations.filter(c => c.status === 'Scheduled').length;
        const completedValue = consultations.filter(c => c.status === 'Completed').length;

        // Alerts (High-risk patients)
        const highRiskCount = await Patient.countDocuments({
            _id: { $in: doctor.assigned_patients },
            risk_level: 'High'
        });

        res.json({
            totalConsultations: consultations.length,
            pendingConsultations: pendingValue,
            completedConsultations: completedValue,
            highRiskAlerts: highRiskCount,
            totalPatients
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assigned patients
// @route   GET /api/doctor/patients
// @access  Private/Doctor
const getDoctorPatients = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user_id: req.user._id }).populate('assigned_patients');
        if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

        res.json(doctor.assigned_patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get patient details with reports
// @route   GET /api/doctor/patients/:id
// @access  Private/Doctor
const getPatientDetails = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        // Verify if doctor is assigned to this patient
        const doctor = await Doctor.findOne({ user_id: req.user._id });
        if (!doctor.assigned_patients.includes(patient._id)) {
            return res.status(403).json({ message: 'Not authorized to view this patient' });
        }

        const consultations = await Appointment.find({ patient: patient._id, doctor: doctor._id });

        res.json({
            patient,
            consultations
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add medical advice
// @route   POST /api/doctor/advice
// @access  Private/Doctor
const addDoctorAdvice = async (req, res) => {
    try {
        const { appointmentId, advice } = req.body;
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return res.status(404).json({ message: 'Consultation not found' });

        appointment.advice = advice;
        appointment.status = 'Completed';
        await appointment.save();

        res.json({ message: 'Medical advice recorded and consultation completed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get consultations
// @route   GET /api/doctor/consultations
// @access  Private/Doctor
const getDoctorConsultations = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user_id: req.user._id });
        const consultations = await Appointment.find({ doctor: doctor._id }).populate('patient');
        res.json(consultations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDoctorStats,
    getDoctorPatients,
    getPatientDetails,
    addDoctorAdvice,
    getDoctorConsultations
};
