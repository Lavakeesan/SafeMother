const express = require('express');
const router = express.Router();
const {
    createAlert,
    getPatientAlerts,
    updateAlertStatus
} = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('admin', 'midwife'), createAlert);

router.route('/:id')
    .put(protect, authorize('midwife'), updateAlertStatus);

router.route('/patient/:patientId')
    .get(protect, getPatientAlerts);

module.exports = router;
