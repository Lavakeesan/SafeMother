const express = require('express');
const router = express.Router();
const { 
    getDoctorStats, 
    getDoctorPatients, 
    getPatientDetails, 
    addDoctorAdvice,
    getDoctorConsultations,
    getDoctors
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Clinical staff can see doctor list
router.get('/', authorize('doctor', 'midwife', 'admin'), getDoctors);

// Physician specific actions
router.get('/stats', authorize('doctor'), getDoctorStats);
router.get('/patients', authorize('doctor'), getDoctorPatients);
router.get('/patients/:id', authorize('doctor'), getPatientDetails);
router.get('/consultations', authorize('doctor'), getDoctorConsultations);
router.post('/advice', authorize('doctor'), addDoctorAdvice);

module.exports = router;
