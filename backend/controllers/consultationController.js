const Consultation = require('../models/consultationModel');

// @desc    Add a consultation
// @route   POST /api/consultations
// @access  Private/Midwife
const addConsultation = async (req, res) => {
    try {
        const { patientId, midwifeId, consultationDate, doctorAdvice } = req.body;

        const consultation = await Consultation.create({
            patient: patientId,
            midwife: midwifeId,
            consultationDate,
            doctorAdvice,
        });

        res.status(201).json(consultation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update consultation status
// @route   PUT /api/consultations/:id
// @access  Private/Midwife
const updateConsultationStatus = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);

        if (consultation) {
            consultation.status = req.body.status || consultation.status;
            const updatedConsultation = await consultation.save();
            res.json(updatedConsultation);
        } else {
            res.status(404).json({ message: 'Consultation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get consultations for a patient
// @route   GET /api/consultations/patient/:patientId
// @access  Private
const getPatientConsultations = async (req, res) => {
    try {
        const consultations = await Consultation.find({ patient: req.params.patientId }).populate('midwife', 'name');
        res.json(consultations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addConsultation,
    updateConsultationStatus,
    getPatientConsultations,
};
