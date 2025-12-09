const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['SUPER_ADMIN', 'VENUE_MANAGER', 'COORDINATOR', 'USER'] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function forceResetAdmin() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@fgsnlive.com';
        const password = '@#Admin123';
        const role = 'SUPER_ADMIN';

        // Delete existing user if any
        await User.deleteOne({ email });
        console.log(`Deleted existing user with email: ${email}`);

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name: 'Super Admin',
            email,
            password: hashedPassword,
            role,
        });

        console.log(`\n✅ Successfully created Super Admin!`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Role: ${role}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error resetting admin:', error);
        process.exit(1);
    }
}

forceResetAdmin();
