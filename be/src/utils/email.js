const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
    if (transporter) return transporter;
    
    // Check if real SMTP credentials are provided
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        console.log("Using Real SMTP Server for Emails");
        return transporter;
    }

    // Fallback: Create a test account for ethereal email sending
    let testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
    
    console.log("Ethereal Email credentials created:", testAccount.user);
    return transporter;
};

const sendEmail = async (to, subject, text, html) => {
    try {
        const mailTransporter = await getTransporter();
        let info = await mailTransporter.sendMail({
            from: '"Library Management System" <no-reply@library.com>',
            to,
            subject,
            text,
            html,
        });

        console.log("Message sent: %s", info.messageId);
        // Important: this prints the link to view the email in console
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

module.exports = { sendEmail };
