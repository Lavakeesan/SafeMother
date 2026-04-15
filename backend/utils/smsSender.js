const axios = require('axios');

const sendSMS = async (phoneNumber, message) => {
    try {
        const SMS_API_TOKEN = process.env.SMS_API_TOKEN;
        const SMS_API_ENDPOINT = process.env.SMS_API_ENDPOINT;

        // text.lk API v3 uses a POST request with the token in the header
        // Alternatively, it can be passed as a query param depending on their setup
        // The user provided SMS_API_ENDPOINT=https://app.text.lk/api/v3/
        // Typical text.lk v3 endpoint for sending is https://app.text.lk/api/v3/sms/send
        
        console.log(`Attempting to send SMS to ${phoneNumber} with message: ${message}`);
        
        const response = await axios.post(`${SMS_API_ENDPOINT}sms/send`, {
            recipient: phoneNumber,
            sender_id: 'TextLKDemo', // Using the demo sender ID from documentation
            type: 'plain',       // REQUIRED as per text.lk documentation
            message: message,
        }, {
            headers: {
                'Authorization': `Bearer ${SMS_API_TOKEN}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log('SMS sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending SMS:', error.response ? error.response.data : error.message);
        throw new Error('Failed to send SMS');
    }
};

module.exports = { sendSMS };
