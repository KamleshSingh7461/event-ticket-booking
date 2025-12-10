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
                FREEDOM GLOBAL SPORTS NETWORK
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
            <strong>Freedom Global Sports Network (FGSN)</strong>
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

async function sendTestCredentialsEmail() {
    try {
        const name = 'John Doe';
        const email = 'drex7461@gmail.com';
        const role = 'EVENT_MANAGER';
        const password = 'TempPass@123';

        const mailOptions = {
            from: '"Freedom Global Sports Network" <noreply@wildcardstat.com>',
            to: email,
            subject: 'Welcome to Freedom Global Sports Network - Account Credentials',
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
                                                We're excited to have you join the <strong>Freedom Global Sports Network</strong> family. Your account has been successfully created with the following role:
                                            </p>
                                            
                                            <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
                                                <p style="color: #2c3e50; font-size: 18px; margin: 0; font-weight: 600;">
                                                    Role: <span style="color: #667eea;">${role}</span>
                                                </p>
                                            </div>
                                            
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
                                            
                                            <div style="text-align: center; margin: 30px 0;">
                                                <a href="http://localhost:3000/login" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                                    Login to Dashboard
                                                </a>
                                            </div>
                                            
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
        console.log('✅ Test credentials email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Error sending test credentials email:', error);
    }
}

sendTestCredentialsEmail();
