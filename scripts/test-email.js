const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
    console.log('Testing Email Service...');
    console.log('User:', process.env.EMAIL_SERVER_USER);
    console.log('Pass:', process.env.EMAIL_SERVER_PASSWORD ? '********' : 'Not Set');

    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
        console.error('❌ EMAIL_SERVER_USER or EMAIL_SERVER_PASSWORD is missing in .env.local');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_SERVER_USER,
            to: process.env.EMAIL_SERVER_USER, // Send to self
            subject: 'Test Email from EventZone',
            text: 'If you see this, email configuration is working!',
        });
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
}

testEmail();
