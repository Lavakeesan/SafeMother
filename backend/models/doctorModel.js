const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: true,
        },
        specialization: {
            type: String,
            required: true,
            default: 'Maternal-Fetal Medicine Specialists'
        },
        license_number: {
            type: String,
            required: true,
            unique: true
        },
        hospital_name: {
            type: String,
            required: true
        },
        assigned_patients: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Patient'
            }
        ],
        consultations_count: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ['Active', 'Deactivated'],
            default: 'Active'
        }
    },
    {
        timestamps: true,
    }
);

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
