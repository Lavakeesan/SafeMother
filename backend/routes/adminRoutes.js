const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getAllMidwifes, 
    getAllPatients,
    updateMidwifeStatus 
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/midwifes', protect, authorize('admin'), getAllMidwifes);
router.put('/midwifes/:id/status', protect, authorize('admin'), updateMidwifeStatus);
router.get('/patients', protect, authorize('admin'), getAllPatients);

module.exports = router;
