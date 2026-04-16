const mongoose = require('mongoose');

const midwifeSchema = mongoose.Schema(
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
        email: {
            type: String,
            required: true,
        },
        contact_number: {
            type: String,
        },
        assigned_area: {
            type: String,
        },
        qualification: {
            type: String,
        },
        experience_years: {
            type: Number,
        },
        hospital_name: {
            type: String,
        },
        profile_photo: {
            data: Buffer,
            contentType: String,
        },
        password: {
            type: String,
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

const Midwife = mongoose.model('Midwife', midwifeSchema);

module.exports = Midwife;
