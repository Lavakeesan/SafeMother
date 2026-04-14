const Alert = require('../models/alertModel');
const Patient = require('../models/patientModel');
const Midwife = require('../models/midwifeModel');
const sendEmail = require('../utils/emailService');
const sendSMS = require('../utils/smsService');

// @desc    Create an alert
// @route   POST /api/alerts
// @access  Private/Midwife/Admin
const createAlert = async (req, res) => {
    try {
        const { patientId, message } = req.body;

        const alert = await Alert.create({
            patient: patientId,
            message,
        });

        res.status(201).json(alert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get alerts for a patient
// @route   GET /api/alerts/patient/:patientId
// @access  Private
const getPatientAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({ patient: req.params.patientId });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send emergency message from patient to midwife
// @route   POST /api/alerts/emergency
// @access  Private/Patient
const sendEmergencyAlert = async (req, res) => {
    try {
        const { message } = req.body;
        
        // Find patient profile for the logged in user
        const patient = await Patient.findOne({ user_id: req.user._id }).populate({
            path: 'midwife_id',
            populate: { path: 'user_id', model: 'User' }
        });

        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }

        if (!patient.midwife_id) {
            return res.status(400).json({ message: 'No midwife assigned to this patient' });
        }

        const midwife = patient.midwife_id;
        const midwifeEmail = midwife.email || midwife.user_id.email;
        const midwifePhone = midwife.contact_number;

        // Create alert record in DB
        const alert = await Alert.create({
            patient: patient._id,
            message: `EMERGENCY: ${message}`,
            status: 'Pending'
        });

        // 1. Send Email to Midwife
        try {
            await sendEmail({
                email: midwifeEmail,
                subject: `🚨 EMERGENCY ALERT: Patient ${patient.name}`,
                message: `URGENT: Your patient ${patient.name} (MRN: ${patient.mrn}) has sent an emergency message:\n\n"${message}"\n\nPlease check the SafeMother dashboard immediately and contact the patient at ${patient.contact_number}.`
            });
        } catch (emailErr) {
            console.error('Failed to send emergency email:', emailErr.message);
        }

        // 2. Send SMS to Midwife
        if (midwifePhone) {
            try {
                await sendSMS(
                    midwifePhone,
                    `SafeMother URGENT: Patient ${patient.name} sent an emergency alert! Message: "${message}". Contact: ${patient.contact_number}`
                );
            } catch (smsErr) {
                console.error('Failed to send emergency SMS:', smsErr.message);
            }
        }

        res.status(201).json({ 
            success: true, 
            message: 'Emergency alert dispatched successfully',
            alert 
        });
    } catch (error) {
        console.error('Emergency Alert Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update alert status
// @route   PUT /api/alerts/:id
// @access  Private/Midwife
const updateAlertStatus = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (alert) {
            alert.status = req.body.status || alert.status;
            const updatedAlert = await alert.save();
            res.json(updatedAlert);
        } else {
            res.status(404).json({ message: 'Alert not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAlert,
    getPatientAlerts,
    updateAlertStatus,
    sendEmergencyAlert,
};
