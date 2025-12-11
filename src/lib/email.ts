import nodemailer from 'nodemailer';

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

export const sendWelcomeEmail = async (email: string, name: string, role: string, password?: string) => {
    try {
        const mailOptions = {
            from: '"Wyldcard Stats Private Limited" <noreply@wildcardstat.com>',
            to: email,
            subject: 'Welcome to Wyldcard Stats Private Limited - Account Credentials',
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
                                    
                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="color: #2c3e50; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">
                                                Welcome Aboard, ${name}!
                                            </h2>
                                            
                                            <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                                We're excited to have you join the <strong>Wyldcard Stats Private Limited</strong> family. Your account has been successfully created with the following role:
                                            </p>
                                            
                                            <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
                                                <p style="color: #2c3e50; font-size: 18px; margin: 0; font-weight: 600;">
                                                    Role: <span style="color: #667eea;">${role}</span>
                                                </p>
                                            </div>
                                            
                                            ${password ? `
                                            <div style="background-color: #fff3cd; border: 2px solid #ffc107; padding: 25px; border-radius: 8px; margin: 25px 0;">
                                                <p style="color: #856404; font-size: 14px; margin: 0 0 15px 0; font-weight: 600;">
                                                    🔐 Your Login Credentials
                                                </p>
                                                <table style="width: 100%;">
                                                    <tr>
                                                        <td style="padding: 8px 0; color: #856404; font-size: 14px; font-weight: 600;">Email:</td>
                                                        <td style="padding: 8px 0; color: #856404; font-size: 14px;">${email}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 8px 0; color: #856404; font-size: 14px; font-weight: 600;">Password:</td>
                                                        <td style="padding: 8px 0; color: #856404; font-size: 14px; font-family: 'Courier New', monospace; background-color: #fff; padding: 5px 10px; border-radius: 4px;">${password}</td>
                                                    </tr>
                                                </table>
                                                <p style="color: #856404; font-size: 13px; margin: 15px 0 0 0; font-style: italic;">
                                                    ⚠️ For security reasons, please log in and change your password immediately.
                                                </p>
                                            </div>
                                            ` : ''}
                                            
                                            <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
                                                If you have any questions or need assistance, our support team is here to help.
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
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

export const sendBookingConfirmation = async (params: {
    email: string;
    name: string;
    otp: string;
    eventTitle: string;
    ticketType: string;
    bookingReference: string;
    quantity: number;
}) => {
    try {
        const mailOptions = {
            from: '"Wyldcard Stats Private Limited" <noreply@wildcardstat.com>',
            to: params.email,
            subject: `Booking Confirmed - ${params.eventTitle} | FGSN`,
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
                                                Hello ${params.name},
                                            </p>
                                            
                                            <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                                Thank you for choosing <strong>Wyldcard Stats Private Limited</strong>! Your booking for <strong>${params.eventTitle}</strong> has been successfully confirmed.
                                            </p>
                                            
                                            <!-- Booking Details Card -->
                                            <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 25px; margin: 25px 0;">
                                                <h3 style="color: #667eea; font-size: 18px; margin: 0 0 20px 0; font-weight: 600; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                                                    📋 Booking Details
                                                </h3>
                                                <table style="width: 100%;">
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600; width: 40%;">Booking ID:</td>
                                                        <td style="padding: 10px 0; color: #2c3e50; font-size: 14px; font-family: 'Courier New', monospace;">${params.bookingReference}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600;">Event:</td>
                                                        <td style="padding: 10px 0; color: #2c3e50; font-size: 14px; font-weight: 600;">${params.eventTitle}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600;">Ticket Type:</td>
                                                        <td style="padding: 10px 0; color: #2c3e50; font-size: 14px;">${params.ticketType}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600;">Quantity:</td>
                                                        <td style="padding: 10px 0; color: #2c3e50; font-size: 14px;">${params.quantity} ticket(s)</td>
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
                                                        ${params.otp}
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
        console.log('Confirmation Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        return false;
    }
};

export const sendTicketEmail = async (params: {
    email: string;
    name: string;
    eventTitle: string;
    eventDate: string;
    venue?: string;
    ticketCode: string;
    qrCodeDataUrl: string;
    bookingId: string;
    amountPaid: number;
    ticketLink: string;
}) => {
    try {
        const mailOptions = {
            from: '"Wyldcard Stats Private Limited" <noreply@wildcardstat.com>',
            to: params.email,
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
                                                    ${params.venue ? `
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600;">Venue:</td>
                                                        <td style="padding: 10px 0; color: #2c3e50; font-size: 14px;">${params.venue}</td>
                                                    </tr>
                                                    ` : ''}
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
                    content: params.qrCodeDataUrl.split('base64,')[1],
                    encoding: 'base64',
                    cid: 'qrcode'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Ticket Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending ticket email:', error);
        return false;
    }
};

// Send Invoice Email with PDF attachment
export const sendInvoiceEmail = async (params: {
    email: string;
    name: string;
    invoiceNumber: string;
    eventTitle: string;
    totalAmount: number;
    currency: string;
    pdfBuffer?: Buffer;
}) => {
    try {
        const mailOptions = {
            from: '"Wyldcard Stats Private Limited" <noreply@wildcardstat.com>',
            to: params.email,
            subject: `Invoice ${params.invoiceNumber} - ${params.eventTitle}`,
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
                                                    📄 Invoice Generated
                                                </h2>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    <tr>
                                        <td style="padding: 20px 30px 40px 30px;">
                                            <p style="color: #2c3e50; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">
                                                Dear ${params.name},
                                            </p>
                                            
                                            <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                                Thank you for your purchase! Please find attached your invoice for <strong>${params.eventTitle}</strong>.
                                            </p>
                                            
                                            <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 25px; margin: 25px 0;">
                                                <h3 style="color: #667eea; font-size: 18px; margin: 0 0 20px 0; font-weight: 600; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                                                    📋 Invoice Details
                                                </h3>
                                                <table style="width: 100%;">
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600; width: 40%;">Invoice Number:</td>
                                                        <td style="padding: 10px 0; color: #2c3e50; font-size: 14px; font-family: 'Courier New', monospace;">${params.invoiceNumber}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600;">Event:</td>
                                                        <td style="padding: 10px 0; color: #2c3e50; font-size: 14px; font-weight: 600;">${params.eventTitle}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600;">Total Amount:</td>
                                                        <td style="padding: 10px 0; color: #2c3e50; font-size: 18px; font-weight: 700;">${params.currency} ${params.totalAmount.toFixed(2)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0; color: #6c757d; font-size: 14px; font-weight: 600;">Status:</td>
                                                        <td style="padding: 10px 0; color: #10b981; font-size: 14px; font-weight: 700;">✓ PAID</td>
                                                    </tr>
                                                </table>
                                            </div>
                                            
                                            <div style="background-color: #e7f3ff; border-left: 4px solid #0066cc; padding: 15px; border-radius: 4px; margin: 25px 0;">
                                                <p style="color: #004085; font-size: 14px; margin: 0; line-height: 1.6;">
                                                    <strong>💡 Note:</strong> Your invoice is attached to this email as a PDF. Please keep it for your records.
                                                </p>
                                            </div>
                                            
                                            <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
                                                If you have any questions about this invoice, please don't hesitate to contact our support team.
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
            attachments: params.pdfBuffer ? [
                {
                    filename: `Invoice-${params.invoiceNumber}.pdf`,
                    content: params.pdfBuffer,
                    contentType: 'application/pdf'
                }
            ] : []
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Invoice Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending invoice email:', error);
        return false;
    }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
    try {
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        const mailOptions = {
            from: '"Wyldcard Stats Private Limited" <noreply@wildcardstat.com>',
            to: email,
            subject: 'Password Reset Request | FGSN',
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
                                        <td style="padding: 40px 30px;">
                                            <h2 style="color: #2c3e50; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">
                                                Password Reset Request
                                            </h2>
                                            
                                            <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                                You requested a password reset for your Wyldcard Stats Private Limited account. Click the button below to set a new password.
                                            </p>
                                            
                                            <div style="text-align: center; margin: 30px 0;">
                                                <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #ae8638 0%, #d4af37 100%); color: #000000; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                                    Reset Password
                                                </a>
                                            </div>
                                            
                                            <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0;">
                                                If you didn't request this, you can safely ignore this email. Your password will not change.
                                            </p>
                                            <p style="color: #999; font-size: 12px; margin-top: 10px;">
                                                This link expires in 1 hour.
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
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password Reset Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
};
