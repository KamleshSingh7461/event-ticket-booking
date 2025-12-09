// OTP Generation and Email Utility Functions

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP email to user
 */
export async function sendOTPEmail(params: {
    to: string;
    name: string;
    otp: string;
    eventTitle: string;
    eventDate: string;
    ticketType: string;
    selectedDate?: string;
}) {
    const { to, name, otp, eventTitle, eventDate, ticketType, selectedDate } = params;

    const ticketTypeText = ticketType === 'ALL_DAY_PACKAGE' ? 'All-Day Package (Dec 16-24)' : `Single Day - ${selectedDate}`;

    const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: monospace; }
                .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                .detail-label { font-weight: bold; color: #666; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎫 Ticket Confirmed!</h1>
                </div>
                <div class="content">
                    <h2>Hi ${name},</h2>
                    <p>Your booking has been confirmed! Here are your ticket details:</p>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span class="detail-label">Event:</span>
                            <span>${eventTitle}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Ticket Type:</span>
                            <span>${ticketTypeText}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Event Dates:</span>
                            <span>${eventDate}</span>
                        </div>
                    </div>

                    <div class="otp-box">
                        <p style="margin: 0 0 10px 0; color: #666;">Your Verification Code</p>
                        <div class="otp-code">${otp}</div>
                        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Show this code at the venue entrance</p>
                    </div>

                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>Keep this email safe - you'll need the OTP code to enter the event</li>
                        <li>The OTP code is unique to your ticket</li>
                        <li>Present this code at the venue entrance for verification</li>
                    </ul>

                    <p>We're excited to see you at the event!</p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply.</p>
                    <p>If you have any questions, please contact event support.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const emailText = `
Hi ${name},

Your booking has been confirmed!

Event: ${eventTitle}
Ticket Type: ${ticketTypeText}
Event Dates: ${eventDate}

YOUR VERIFICATION CODE: ${otp}

Show this code at the venue entrance.

Important:
- Keep this email safe
- The OTP code is unique to your ticket
- Present this code at the venue entrance for verification

See you at the event!
    `;

    // TODO: Integrate with your email service (Nodemailer, SendGrid, etc.)
    // For now, log to console
    console.log('📧 Sending OTP Email:');
    console.log('To:', to);
    console.log('OTP:', otp);
    console.log('Event:', eventTitle);

    // Example with Nodemailer (uncomment and configure):
    /*
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: to,
        subject: `Your Ticket - ${eventTitle}`,
        text: emailText,
        html: emailHTML
    });
    */

    return { success: true, otp };
}
