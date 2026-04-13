const mongoose = require('mongoose');

const patientSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
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
        contact_number: {
            type: String,
            required: true,
        },
        medical_history: {
            type: String,
        },
        delivery_date: {
            type: Date,
        },
        risk_level: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Low',
        },
        midwife_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Midwife',
        },
        mrn: {
            type: String,
            unique: true,
        },
        medical_reports: [
            {
                original_name: String,
                mime_type: String,
                data: Buffer, // Binary data stored in database
                uploaded_at: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
