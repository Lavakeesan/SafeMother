const mongoose = require('mongoose');

const patientSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        gestationWeeks: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['normal', 'high-risk', 'emergency'],
            default: 'normal',
        },
        nextVisit: {
            type: String,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        midwife: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        mrn: {
            type: String,
            required: true,
            unique: true,
        }
    },
    {
        timestamps: true,
    }
);

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
