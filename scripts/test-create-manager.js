const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer'); // Import nodemailer directly
require('dotenv').config({ path: '.env.local' });

// Inline email function
async function sendVenueManagerCredentials({ email, name, password }) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.EMAIL_SERVER_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_SERVER_PASSWORD || 'your-app-password'
        }
    });

    const emailHTML = `
        <h1>Welcome to Event Management System</h1>
        <p>Hi ${name},</p>
        <p>You have been assigned as a Venue Manager.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_SERVER_USER, // Use SERVER_USER for from as well often
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

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['SUPER_ADMIN', 'VENUE_MANAGER', 'COORDINATOR', 'USER'], default: 'USER' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const MONGODB_URI = process.env.MONGODB_URI;

async function createVenueManager() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected');

        const email = 'drex7461@gmail.com';
        const password = 'VenuePass123';
        const name = 'Venue Manager (Test)';

        // Check if exists
        const existing = await User.findOne({ email });
        if (existing) {
            console.log('⚠️ User already exists, updating role/password...');
            existing.role = 'VENUE_MANAGER';
            existing.password = await bcrypt.hash(password, 10);
            await existing.save();
            console.log('✅ User updated');
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({
                name,
                email,
                password: hashedPassword,
                role: 'VENUE_MANAGER'
            });
            console.log('✅ User created');
        }

        console.log('📧 Sending credentials email...');
        const result = await sendVenueManagerCredentials({
            email,
            name,
            password
        });

        if (result.success) {
            console.log('✅ Email sent successfully!');
        } else {
            console.error('❌ Email failed:', result.error);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

createVenueManager();
