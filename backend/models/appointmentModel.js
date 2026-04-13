const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema(
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
        appointmentDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['Scheduled', 'Completed'],
            default: 'Scheduled',
        },
    },
    {
        timestamps: true,
    }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
