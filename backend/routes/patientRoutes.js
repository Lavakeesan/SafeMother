const express = require('express');
const router = express.Router();
const {
    createPatient,
    getPatients,
    getPatientById,
    getPatientProfile,
    updatePatientProfile,
    updatePatient,
    deletePatient
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('admin', 'midwife'), getPatients)
    .post(protect, authorize('admin', 'midwife'), createPatient);

router.route('/profile')
    .get(protect, authorize('patient'), getPatientProfile)
    .put(protect, authorize('patient'), updatePatientProfile);

router.route('/:id')
    .get(protect, getPatientById)
    .put(protect, authorize('admin', 'midwife'), updatePatient)
    .delete(protect, authorize('admin'), deletePatient);

module.exports = router;
