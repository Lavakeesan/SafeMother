const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("\n=== EMAIL NOT SENT ===");
            console.warn("Nodemailer credentials not found in .env (EMAIL_USER, EMAIL_PASS).");
            console.warn("Message that would have been sent:");
            console.warn(`To: ${options.email}`);
            console.warn(`Subject: ${options.subject}`);
            console.warn(`Body:\n${options.message}`);
            console.warn("======================\n");
            return;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail', // Use 'gmail' as default
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `SafeMother Clinic <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully: %s', info.messageId);
    } catch (error) {
        console.error("Failed to send email:", error);
    }
};

module.exports = sendEmail;
