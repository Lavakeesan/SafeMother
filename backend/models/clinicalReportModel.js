const mongoose = require('mongoose');

const clinicalReportSchema = mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Patient',
        },
        midwife: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Midwife',
        },
        report_photo: {
            type: String, // Storing as base64 string or a URL
            required: false, 
        },
        weight: {
            type: Number,
            required: true,
        },
        sugar_level: {
            type: String, // e.g. "90 mg/dL"
            required: true,
        },
        blood_pressure: {
            type: String, // e.g. "120/80"
            required: true,
        },
        bmi: {
            type: Number,
            required: true,
        },
        report_date: {
            type: Date,
            default: Date.now,
        }
    },
    {
        timestamps: true,
    }
);

const ClinicalReport = mongoose.model('ClinicalReport', clinicalReportSchema);

module.exports = ClinicalReport;
