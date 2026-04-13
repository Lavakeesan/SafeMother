const mongoose = require('mongoose');

const midwifeSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        contactNumber: {
            type: String,
            required: true,
        },
        assignedArea: {
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
