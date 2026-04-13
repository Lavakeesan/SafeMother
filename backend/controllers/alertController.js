const Alert = require('../models/alertModel');

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
};
