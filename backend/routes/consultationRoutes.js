const express = require('express');
const router = express.Router();
const {
    addConsultation,
    updateConsultationStatus,
    getPatientConsultations
} = require('../controllers/consultationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('midwife'), addConsultation);

router.route('/:id')
    .put(protect, authorize('midwife'), updateConsultationStatus);

router.route('/patient/:patientId')
    .get(protect, getPatientConsultations);

module.exports = router;
