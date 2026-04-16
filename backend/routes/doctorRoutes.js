const express = require('express');
const router = express.Router();
const { 
    getDoctorStats, 
    getDoctorPatients, 
    getPatientDetails, 
    addDoctorAdvice,
    getDoctorConsultations
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('doctor'));

router.get('/stats', getDoctorStats);
router.get('/patients', getDoctorPatients);
router.get('/patients/:id', getPatientDetails);
router.get('/consultations', getDoctorConsultations);
router.post('/advice', addDoctorAdvice);

module.exports = router;
