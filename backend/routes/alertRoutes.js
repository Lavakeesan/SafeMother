const express = require('express');
const router = express.Router();
const {
    createAlert,
    getPatientAlerts,
    updateAlertStatus,
    deleteAlert,
    sendEmergencyAlert,
    getMidwifeAlerts
} = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/emergency', protect, authorize('patient'), sendEmergencyAlert);

router.route('/')
    .get(protect, authorize('admin', 'midwife'), getMidwifeAlerts)
    .post(protect, authorize('admin', 'midwife'), createAlert);

// ⚠️ Specific routes MUST come before /:id to avoid "patient" being parsed as an id
router.route('/patient/:patientId')
    .get(protect, getPatientAlerts);

router.route('/:id')
    .put(protect, authorize('midwife', 'admin'), updateAlertStatus)
    .delete(protect, authorize('admin'), deleteAlert);

module.exports = router;

