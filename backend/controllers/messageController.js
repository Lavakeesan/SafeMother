const Patient = require('../models/patientModel');
const Midwife = require('../models/midwifeModel');
const { sendSMS } = require('../utils/smsSender');

// @desc    Send SMS to midwife
// @route   POST /api/sms/send-to-midwife
// @access  Private (Patient only)
const sendSMSToMidwife = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // Find patient based on user_id
        const patient = await Patient.findOne({ user_id: req.user._id }).populate('midwife_id');

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        if (!patient.midwife_id) {
            return res.status(400).json({ message: 'No midwife assigned to this patient' });
        }

        const midwife = patient.midwife_id;
        let midwifePhoneNumber = midwife.contact_number;

        if (!midwifePhoneNumber) {
            return res.status(400).json({ message: 'Midwife contact number not found' });
        }

        // Format phone number (ensure it starts with 94 and remove any leading 0)
        // This is standard for Sri Lankan SMS gateways
        let formattedNumber = midwifePhoneNumber.replace(/\D/g, ''); // Remove non-digits
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '94' + formattedNumber.substring(1);
        } else if (!formattedNumber.startsWith('94')) {
            formattedNumber = '94' + formattedNumber;
        }
        
        // Final length check (SL numbers are 11 digits with 94)
        if (formattedNumber.length !== 11) {
            console.warn(`Potential invalid phone number length: ${formattedNumber}`);
        }

        // Format message to include patient name for identity
        const fullMessage = `From Patient ${patient.name}: ${message}`;

        // Send SMS (not saving to DB as requested)
        await sendSMS(formattedNumber, fullMessage);

        res.status(200).json({ success: true, message: 'SMS sent to midwife successfully' });
    } catch (error) {
        console.error('Send SMS Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Send SMS to patient
// @route   POST /api/sms/send-to-patient
// @access  Private (Midwife only)
const sendSMSToPatient = async (req, res) => {
    try {
        const { patientId, message } = req.body;

        if (!patientId || !message) {
            return res.status(400).json({ message: 'Patient ID and message are required' });
        }

        // Find patient
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        let patientPhoneNumber = patient.contact_number;

        if (!patientPhoneNumber) {
            return res.status(400).json({ message: 'Patient contact number not found' });
        }

        // Format phone number
        let formattedNumber = patientPhoneNumber.replace(/\D/g, ''); 
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '94' + formattedNumber.substring(1);
        } else if (!formattedNumber.startsWith('94')) {
            formattedNumber = '94' + formattedNumber;
        }

        // Format message
        const fullMessage = `URGENT (from SafeMother Midwife): ${message}`;

        // Send SMS (not saving to DB as requested)
        await sendSMS(formattedNumber, fullMessage);

        res.status(200).json({ success: true, message: 'SMS sent to patient successfully' });
    } catch (error) {
        console.error('Send SMS to Patient Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

module.exports = {
    sendSMSToMidwife,
    sendSMSToPatient,
};
