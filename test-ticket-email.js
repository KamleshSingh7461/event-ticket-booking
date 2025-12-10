require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

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

async function sendTestTicketEmail() {
    try {
        // Generate QR code
        const ticketCode = 'TKT-2024-ABC123';
        const qrCodeDataUrl = await QRCode.toDataURL(ticketCode);

        const params = {
            name: 'Test User',
            eventTitle: 'FGSN Championship 2024',
            eventDate: 'December 15, 2024 at 6:00 PM IST',
            venue: 'Jawaharlal Nehru Stadium, New Delhi',
            ticketCode: ticketCode,
            bookingId: 'BKG123456789',
            amountPaid: 2500,
            ticketLink: 'http://localhost:3000/user/tickets/test123'
        };

        const mailOptions = {
            from: '"Wyldcard Stats Private Limited" <noreply@wildcardstat.com>',
            to: 'drex7461@gmail.com',
            subject: `Your Ticket for ${params.eventTitle} | FGSN`,
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
                                    <tr>
                                        <td style="padding: 0;">
                                            ${getEmailHeader()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 30px 30px 0 30px; text-align: center;">
                                            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                                                <h2 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">
                                                    🎟️ Your Ticket is Ready!
                                                </h2>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 20px 30px 40px 30px;">
                                            <p style="color: #2c3e50; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">
                                                Hello ${params.name},
                                            </p>
                                            <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                                Thank you for booking with <strong>Wyldcard Stats Private Limited</strong>! Your ticket for <strong>${params.eventTitle}</strong> is confirmed and ready.
                                            </p>
                                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 8px; text-align: center; margin: 25px 0;">
                                                <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                                    Your Entry Ticket
                                                </p>
                                                <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; display: inline-block; margin: 10px 0;">
                                                    <img src="cid:qrcode" alt="Ticket QR Code" style="width: 200px; height: 200px; display: block;" />
                                                </div>
                                                <p style="color: #ffffff; font-size: 14px; margin: 15px 0 5px 0; font-weight: 600;">
                                                    Ticket Code
                                                </p>
                                                <p style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 2px;">
                                                    ${params.ticketCode}
                                                </p>
                                            </div>
                                            <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 25px; margin: 25px 0;">
                                                <h3 style="color: #667eea; font-size: 18px; margin: 0 0 20px 0; font-weight: 600; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                                                    📋 Event & Booking Details
                                                </h3>
                                                <table style="width: 100%;">
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600; width: 40%;">Event:</td>
                                                        <td style="padding: 10px 0; color: #2c3e50; font-size: 14px; font-weight: 600;">${params.eventTitle}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600;">Date & Time:</td>
                                                        <td style="padding: 10px 0; color: #2c3e50; font-size: 14px;">${params.eventDate}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600;">Venue:</td>
                                                        <td style="padding: 10px 0; color: #2c3e50; font-size: 14px;">${params.venue}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600;">Booking ID:</td>
                                                        <td style="padding: 10px 0; color: #2c3e50; font-size: 14px; font-family: 'Courier New', monospace;">${params.bookingId}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600;">Amount Paid:</td>
                                                        <td style="padding: 10px 0; color: #2c3e50; font-size: 16px; font-weight: 700;">₹${params.amountPaid.toLocaleString()}</td>
                                                    </tr>
                                                </table>
                                            </div>
                                            <div style="text-align: center; margin: 30px 0;">
                                                <a href="${params.ticketLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                                    View Full Ticket
                                                </a>
                                            </div>
                                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 25px 0;">
                                                <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
                                                    <strong>⚠️ Important:</strong> Please present this QR code at the venue entrance for verification. Save this email or take a screenshot for easy access.
                                                </p>
                                            </div>
                                            <div style="background-color: #e7f3ff; border-left: 4px solid #0066cc; padding: 15px; border-radius: 4px; margin: 25px 0;">
                                                <p style="color: #004085; font-size: 14px; margin: 0; line-height: 1.6;">
                                                    <strong>💡 Pro Tip:</strong> Arrive at least 30 minutes before the event starts to avoid queues at the entrance.
                                                </p>
                                            </div>
                                            <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
                                                We look forward to seeing you at the event! If you have any questions, feel free to reach out to our support team.
                                            </p>
                                        </td>
                                    </tr>
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
            attachments: [
                {
                    filename: 'qrcode.png',
                    content: qrCodeDataUrl.split('base64,')[1],
                    encoding: 'base64',
                    cid: 'qrcode'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Test ticket email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Error sending test ticket email:', error);
    }
}

sendTestTicketEmail();
