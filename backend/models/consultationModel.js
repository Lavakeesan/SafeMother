const mongoose = require('mongoose');

const consultationSchema = mongoose.Schema(
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
        consultationDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        doctorAdvice: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Completed'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
);

const Consultation = mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;
