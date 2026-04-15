const ClinicalReport = require('../models/clinicalReportModel');
const Midwife = require('../models/midwifeModel');
const Patient = require('../models/patientModel');

// @desc    Upload/Create a clinical report
// @route   POST /api/clinical-reports
// @access  Private/Midwife
const createClinicalReport = async (req, res) => {
    try {
        const { patientId, weight, sugar_level, blood_pressure, bmi, report_photo } = req.body;

        const midwife = await Midwife.findOne({ user_id: req.user._id });
        if (!midwife) {
            return res.status(403).json({ message: "Not authorized. Midwife profile required." });
        }

        const report = await ClinicalReport.create({
            patient: patientId,
            midwife: midwife._id,
            weight,
            sugar_level,
            blood_pressure,
            bmi,
            report_photo // expecting base64 string
        });

        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all clinical reports for Midwife's patients
// @route   GET /api/clinical-reports
// @access  Private/Midwife
const getMidwifeClinicalReports = async (req, res) => {
    try {
        const midwife = await Midwife.findOne({ user_id: req.user._id });
        
        let reports = [];
        if (midwife) {
            reports = await ClinicalReport.find({ midwife: midwife._id })
                .populate('patient', 'name mrn')
                .sort({ report_date: -1 });
        } else {
            // Admin sees all
            reports = await ClinicalReport.find({})
                .populate('patient', 'name mrn')
                .sort({ report_date: -1 });
        }
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get clinical reports for the logged in patient
// @route   GET /api/clinical-reports/my-reports
// @access  Private/Patient
const getPatientClinicalReports = async (req, res) => {
    try {
        const patient = await Patient.findOne({ user_id: req.user._id });
        if (!patient) {
            return res.status(404).json({ message: "Patient profile not found" });
        }
        
        const reports = await ClinicalReport.find({ patient: patient._id })
            .populate('midwife', 'name')
            .sort({ report_date: -1 });
            
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createClinicalReport,
    getMidwifeClinicalReports,
    getPatientClinicalReports
};
