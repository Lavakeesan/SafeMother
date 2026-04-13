const Appointment = require('../models/appointmentModel');

// @desc    Schedule an appointment
// @route   POST /api/appointments
// @access  Private/Midwife
const scheduleAppointment = async (req, res) => {
    try {
        const { patientId, midwifeId, appointmentDate } = req.body;

        const appointment = await Appointment.create({
            patient: patientId,
            midwife: midwifeId,
            appointmentDate,
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

module.exports = {
    scheduleAppointment,
    updateAppointmentStatus,
    getPatientAppointments,
};
