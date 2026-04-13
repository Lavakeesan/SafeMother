const mongoose = require('mongoose');

const alertSchema = mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Patient',
        },
        message: {
            type: String,
            required: true,
        },
        alertDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['Sent', 'Pending'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
);

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
