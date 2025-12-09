import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_SERVER_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_SERVER_PASSWORD || 'your-app-password'
    }
});

/**
 * Send venue manager credentials via email
 */
export async function sendVenueManagerCredentials(params: {
    email: string;
    name: string;
    password: string;
}) {
    const { email, name, password } = params;

    const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                .content { background: #f9f9f9; padding: 30px; }
                .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to Event Management System</h1>
                </div>
                <div class="content">
                    <h2>Hi ${name},</h2>
                    <p>You have been assigned as a Venue Manager for the Telangana Pro Basketball League event.</p>
                    
                    <div class="credentials">
                        <h3>Your Login Credentials:</h3>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Password:</strong> ${password}</p>
                        <p><strong>Login URL:</strong> <a href="${process.env.NEXTAUTH_URL}/login">${process.env.NEXTAUTH_URL}/login</a></p>
                    </div>

                    <p><strong>Your Responsibilities:</strong></p>
                    <ul>
                        <li>Manage event coordinators</li>
                        <li>Assign coordinators to the event</li>
                        <li>Monitor ticket sales and verifications</li>
                    </ul>

                    <p>Please login and set up your coordinators for the event.</p>
                    
                    <a href="${process.env.NEXTAUTH_URL}/login" class="button">Login Now</a>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Venue Manager Account - Telangana Pro Basketball League',
            html: emailHTML
        });
        console.log('✅ Venue manager credentials sent to:', email);
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        return { success: false, error };
    }
}

/**
 * Send booking confirmation with OTP
 */
export async function sendBookingConfirmation(params: {
    email: string;
    name: string;
    otp: string;
    eventTitle: string;
    ticketType: string;
    bookingReference: string;
}) {
    const { email, name, otp, eventTitle, ticketType, bookingReference } = params;

    const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                .content { background: #f9f9f9; padding: 30px; }
                .otp-box { background: white; border: 3px dashed #667eea; padding: 30px; text-align: center; margin: 20px 0; border-radius: 10px; }
                .otp-code { font-size: 48px; font-weight: bold; color: #667eea; letter-spacing: 10px; font-family: monospace; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎫 Booking Confirmed!</h1>
                </div>
                <div class="content">
                    <h2>Hi ${name},</h2>
                    <p>Your ticket for <strong>${eventTitle}</strong> has been confirmed!</p>
                    
                    <div class="otp-box">
                        <p style="margin: 0 0 15px 0; color: #666; font-size: 18px;">Your Verification Code</p>
                        <div class="otp-code">${otp}</div>
                        <p style="margin: 15px 0 0 0; color: #666;">Show this code at the venue entrance</p>
                    </div>

                    <p><strong>Booking Details:</strong></p>
                    <ul>
                        <li>Booking Reference: ${bookingReference}</li>
                        <li>Ticket Type: ${ticketType}</li>
                        <li>Event: ${eventTitle}</li>
                        <li>Dates: December 16-24, 2024</li>
                    </ul>

                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>Save this email - you'll need the OTP code to enter</li>
                        <li>Present the OTP at the venue entrance</li>
                        <li>Each OTP can only be used once</li>
                    </ul>

                    <p>See you at the event! 🏀</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Your Ticket - ${eventTitle}`,
            html: emailHTML
        });
        console.log('✅ Booking confirmation sent to:', email);
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        return { success: false, error };
    }
}
