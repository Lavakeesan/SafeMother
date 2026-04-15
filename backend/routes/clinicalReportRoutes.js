const express = require('express');
const router = express.Router();
const {
    createClinicalReport,
    getMidwifeClinicalReports,
    getPatientClinicalReports
} = require('../controllers/clinicalReportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('admin', 'midwife'), getMidwifeClinicalReports)
    .post(protect, authorize('admin', 'midwife'), createClinicalReport);

router.get('/my-reports', protect, authorize('patient'), getPatientClinicalReports);

module.exports = router;
