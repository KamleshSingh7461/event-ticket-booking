import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

export const sendWelcomeEmail = async (email: string, name: string, role: string, password?: string) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_SERVER_USER,
            to: email,
            subject: 'Welcome to EventZone - Account Credentials',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome to EventZone!</h2>
                    <p>Hello ${name},</p>
                    <p>Your account has been created successfully with the role: <strong>${role}</strong>.</p>
                    ${password ? `
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold;">Your Login Credentials:</p>
                        <p style="margin: 5px 0;">Email: ${email}</p>
                        <p style="margin: 5px 0;">Password: ${password}</p>
                    </div>
                    <p>Please login and change your password immediately.</p>
                    ` : ''}
                    <p>Best regards,<br>EventZone Team</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
