const mongoose = require('mongoose');

const midwifeSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        contact_number: {
            type: String,
            required: true,
        },
        assigned_area: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Midwife = mongoose.model('Midwife', midwifeSchema);

module.exports = Midwife;
