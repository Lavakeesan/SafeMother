const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllMidwives, getAllPatients } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/midwives', protect, authorize('admin'), getAllMidwives);
router.get('/patients', protect, authorize('admin'), getAllPatients);

module.exports = router;
