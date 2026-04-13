const express = require('express');
const router = express.Router();
const {
    scheduleAppointment,
    updateAppointmentStatus,
    getPatientAppointments
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('midwife'), scheduleAppointment);

router.route('/:id')
    .put(protect, authorize('midwife'), updateAppointmentStatus);

router.route('/patient/:patientId')
    .get(protect, getPatientAppointments);

module.exports = router;
