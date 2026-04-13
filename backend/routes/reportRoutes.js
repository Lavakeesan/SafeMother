const express = require('express');
const router = express.Router();
const path = require('path');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

const Patient = require('../models/patientModel');

// @desc    Upload a medical report for a patient
// @route   POST /api/reports/upload/:patientId
// @access  Private
router.post('/upload/:patientId', protect, upload.single('report'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const patient = await Patient.findById(req.params.patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const reportData = {
            original_name: req.file.originalname,
            mime_type: req.file.mimetype,
            data: req.file.buffer, // Binary data from memory
            uploaded_at: new Date(),
        };

        patient.medical_reports.push(reportData);
        await patient.save();

        res.status(201).json({
            message: 'Report uploaded and saved to database successfully',
            reportId: patient.medical_reports[patient.medical_reports.length - 1]._id,
        });
    } catch (error) {
        console.error('Error uploading/saving report:', error);
        res.status(500).json({ message: 'Server error during report upload' });
    }
});

// @desc    Get/View a medical report from the database
// @route   GET /api/reports/view/:patientId/:reportId
// @access  Private
router.get('/view/:patientId/:reportId', protect, async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const report = patient.medical_reports.id(req.params.reportId);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Set the correct content type and send the binary data
        res.set('Content-Type', report.mime_type);
        res.set('Content-Disposition', `inline; filename="${report.original_name}"`);
        res.send(report.data);
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ message: 'Error retrieving report from database' });
    }
});

module.exports = router;
