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
            required: false,
            ref: 'Midwife',
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Doctor',
        },
        purpose: {
            type: String,
            default: 'Routine Checkup'
        },
        advice: {
            type: String,
        },
        appointmentDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['Scheduled', 'Completed', 'Consulting Finished'],
            default: 'Scheduled',
        },
    },
    {
        timestamps: true,
    }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
