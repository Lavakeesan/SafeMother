const express = require('express');
const router = express.Router();
const {
    scheduleAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    getPatientAppointments,
    getAllAppointments
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('admin', 'midwife'), getAllAppointments)
    .post(protect, authorize('midwife'), scheduleAppointment);

router.route('/patient/:patientId')
    .get(protect, getPatientAppointments);

router.route('/:id')
    .put(protect, authorize('midwife', 'admin'), updateAppointmentStatus)
    .delete(protect, authorize('admin'), deleteAppointment);

module.exports = router;

