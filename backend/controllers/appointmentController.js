const Appointment = require('../models/appointmentModel');
const Midwife = require('../models/midwifeModel');
const Doctor = require('../models/doctorModel');

// @desc    Schedule an appointment
// @route   POST /api/appointments
// @access  Private/Midwife
const scheduleAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, appointmentDate, purpose } = req.body;

        let midwifeId = null;
        if (req.user.role === 'midwife') {
            const midwife = await Midwife.findOne({ user_id: req.user._id });
            midwifeId = midwife ? midwife._id : null;
        }

        const appointment = await Appointment.create({
            patient: patientId,
            midwife: midwifeId, 
            doctor: doctorId,
            appointmentDate,
            purpose: purpose || 'Clinical Consultation'
        });

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private/Midwife
const updateAppointmentStatus = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (appointment) {
            appointment.status = req.body.status || appointment.status;
            const updatedAppointment = await appointment.save();
            res.json(updatedAppointment);
        } else {
            res.status(404).json({ message: 'Appointment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get appointments for a patient
// @route   GET /api/appointments/patient/:patientId
// @access  Private
const getPatientAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.params.patientId }).populate('midwife', 'name');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private/Admin
const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({})
            .populate('patient', 'name mrn')
            .populate('midwife', 'name hospital_name')
            .populate('doctor', 'name specialization');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    scheduleAppointment,
    updateAppointmentStatus,
    getPatientAppointments,
    getAllAppointments
};
