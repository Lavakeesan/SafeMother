const express = require('express');
const router = express.Router();
const { registerPatient, getPatients, getPatientById } = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, registerPatient)
    .get(protect, getPatients);

router.route('/:id')
    .get(protect, getPatientById);

module.exports = router;
