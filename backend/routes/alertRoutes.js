const express = require('express');
const router = express.Router();
const {
    createAlert,
    getPatientAlerts,
    updateAlertStatus,
    sendEmergencyAlert,
    getMidwifeAlerts
} = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/emergency', protect, authorize('patient'), sendEmergencyAlert);

router.route('/')
    .get(protect, authorize('admin', 'midwife'), getMidwifeAlerts)
    .post(protect, authorize('admin', 'midwife'), createAlert);

router.route('/:id')
    .put(protect, authorize('midwife'), updateAlertStatus);

router.route('/patient/:patientId')
    .get(protect, getPatientAlerts);

module.exports = router;
