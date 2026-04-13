const express = require('express');
const router = express.Router();
const {
    createGuideline,
    updateGuideline,
    getGuidelines
} = require('../controllers/medicalGuidelineController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getGuidelines)
    .post(protect, authorize('admin'), createGuideline);

router.route('/:id')
    .put(protect, authorize('admin'), updateGuideline);

module.exports = router;
