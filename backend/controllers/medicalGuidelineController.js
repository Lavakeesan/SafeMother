const MedicalGuideline = require('../models/medicalGuidelineModel');

// @desc    Create a guideline
// @route   POST /api/guidelines
// @access  Private/Admin
const createGuideline = async (req, res) => {
    try {
        const { title, description } = req.body;

        const guideline = await MedicalGuideline.create({
            title,
            description,
        });

        res.status(201).json(guideline);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a guideline
// @route   PUT /api/guidelines/:id
// @access  Private/Admin
const updateGuideline = async (req, res) => {
    try {
        const guideline = await MedicalGuideline.findById(req.params.id);

        if (guideline) {
            guideline.title = req.body.title || guideline.title;
            guideline.description = req.body.description || guideline.description;
            const updatedGuideline = await guideline.save();
            res.json(updatedGuideline);
        } else {
            res.status(404).json({ message: 'Guideline not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all guidelines
// @route   GET /api/guidelines
// @access  Private
const getGuidelines = async (req, res) => {
    try {
        const guidelines = await MedicalGuideline.find({});
        res.json(guidelines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createGuideline,
    updateGuideline,
    getGuidelines,
};
