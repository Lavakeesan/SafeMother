const mongoose = require('mongoose');

const medicalGuidelineSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const MedicalGuideline = mongoose.model('MedicalGuideline', medicalGuidelineSchema);

module.exports = MedicalGuideline;
