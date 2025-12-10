require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

const getEmailHeader = () => `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 10px 0; letter-spacing: 1px;">
                WYLDCARD STATS PRIVATE LIMITED
            </h1>
            <p style="color: #ffffff; font-size: 14px; margin: 0; opacity: 0.95; letter-spacing: 0.5px;">
                WYLDCARD STATS PRIVATE LIMITED
            </p>
        </div>
    </div>
`;

const getEmailFooter = () => `
    <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 3px solid #667eea;">
        <p style="color: #6c757d; font-size: 14px; margin: 0 0 10px 0;">
            <strong>Wyldcard Stats Private Limited</strong>
        </p>
        <p style="color: #6c757d; font-size: 12px; margin: 0 0 5px 0;">
            Operated by WYLDCARD STATS PRIVATE LIMITED
        </p>
        <p style="color: #6c757d; font-size: 12px; margin: 0 0 15px 0;">
            For support, contact us at <a href="mailto:supports@wildcardstat.com" style="color: #667eea; text-decoration: none;">supports@wildcardstat.com</a>
        </p>
        <div style="border-top: 1px solid #dee2e6; padding-top: 15px; margin-top: 15px;">
            <p style="color: #adb5bd; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} WYLDCARD STATS PRIVATE LIMITED. All rights reserved.
            </p>
        </div>
    </div>
`;

async function sendTestEmail() {
    try {
        const mailOptions = {
            from: `"Wyldcard Stats Private Limited" <${process.env.EMAIL_SERVER_USER}>`,
            to: 'drex7461@gmail.com',
            subject: 'Booking Confirmed - Test Event | FGSN',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 0;">
                                <table role="presentation" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="padding: 0;">
                                            ${getEmailHeader()}
                                        </td>
                                    </tr>
                                    
                                    <!-- Success Banner -->
                                    <tr>
                                        <td style="padding: 30px 30px 0 30px; text-align: center;">
                                            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                                                <h2 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">
                                                    ✓ Booking Confirmed!
                                                </h2>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 20px 30px 40px 30px;">
                                            <p style="color: #2c3e50; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">
                                                Hello Test User,
                                            </p>
                                            
                                            <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                                Thank you for choosing <strong>Wyldcard Stats Private Limited</strong>! Your booking for <strong>Test Event - Email Template Demo</strong> has been successfully confirmed.
                                            </p>
                                            
                                            <!-- Booking Details Card -->
                                            <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 25px; margin: 25px 0;">
                                                <h3 style="color: #667eea; font-size: 18px; margin: 0 0 20px 0; font-weight: 600; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                                                    📋 Booking Details
                                                </h3>
                                                <table style="width: 100%;">
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600; width: 40%;">Booking ID:</td>
                                                        <td style="padding: 10px 0; color: #2c3e50; font-size: 14px; font-family: 'Courier New', monospace;">TEST123456789</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600;">Event:</td>
                                                        <td style="padding: 10px 0; color: #2c3e50; font-size: 14px; font-weight: 600;">Test Event - Email Template Demo</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600;">Ticket Type:</td>
                                                        <td style="padding: 10px 0; color: #2c3e50; font-size: 14px;">VIP Pass</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600;">Quantity:</td>
                                                        <td style="padding: 10px 0; color: #2c3e50; font-size: 14px;">2 ticket(s)</td>
                                                    </tr>
                                                </table>
                                            </div>
                                            
                                            <!-- OTP Card -->
                                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 8px; text-align: center; margin: 25px 0;">
                                                <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0; opacity: 0.95; text-transform: uppercase; letter-spacing: 1px;">
                                                    Your Entry OTP
                                                </p>
                                                <div style="background-color: #ffffff; padding: 15px 25px; border-radius: 6px; display: inline-block; margin: 10px 0;">
                                                    <p style="color: #667eea; font-size: 32px; font-weight: 700; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 4px;">
                                                        123456
                                                    </p>
                                                </div>
                                                <p style="color: #ffffff; font-size: 13px; margin: 10px 0 0 0; opacity: 0.9;">
                                                    Present this OTP at the venue for entry verification
                                                </p>
                                            </div>
                                            
                                            <div style="background-color: #e7f3ff; border-left: 4px solid #0066cc; padding: 15px; border-radius: 4px; margin: 25px 0;">
                                                <p style="color: #004085; font-size: 14px; margin: 0; line-height: 1.6;">
                                                    <strong>💡 Pro Tip:</strong> Save this email or take a screenshot of your OTP for quick access at the venue.
                                                </p>
                                            </div>
                                            
                                            <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
                                                We look forward to seeing you at the event! If you have any questions, feel free to reach out to our support team.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 0;">
                                            ${getEmailFooter()}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
    } catch (error) {
        console.error('❌ Error sending test email:', error);
    }
}

sendTestEmail();
