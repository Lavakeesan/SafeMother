const mongoose = require('mongoose');

const patientSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        contactNumber: {
            type: String,
            required: true,
        },
        medicalHistory: {
            type: String,
        },
        riskLevel: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Low',
        },
        midwife: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Midwife',
        },
    },
    {
        timestamps: true,
    }
);

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
