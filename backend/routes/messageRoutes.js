const express = require('express');
const router = express.Router();
const { sendSMSToMidwife, sendSMSToPatient } = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/send-to-midwife', protect, authorize('patient'), sendSMSToMidwife);
router.post('/send-to-patient', protect, authorize('midwife', 'admin'), sendSMSToPatient);

module.exports = router;
