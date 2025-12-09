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

const demoUsers = [
    {
        name: 'Super Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'SUPER_ADMIN',
    },
    {
        name: 'Venue Manager',
        email: 'manager@test.com',
        password: 'password123',
        role: 'VENUE_MANAGER',
    },
    {
        name: 'Event Coordinator',
        email: 'coord@test.com',
        password: 'password123',
        role: 'COORDINATOR',
    },
    {
        name: 'Regular User',
        email: 'user@test.com',
        password: 'password123',
        role: 'USER',
    },
];

async function seedUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        for (const userData of demoUsers) {
            const existingUser = await User.findOne({ email: userData.email });

            if (!existingUser) {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                await User.create({
                    ...userData,
                    password: hashedPassword,
                });
                console.log(`✓ Created user: ${userData.email} (${userData.role})`);
            } else {
                console.log(`- User already exists: ${userData.email}`);
            }
        }

        console.log('\n✅ Demo users seeded successfully!');
        console.log('\nLogin credentials:');
        console.log('==================');
        demoUsers.forEach(u => {
            console.log(`${u.role}: ${u.email} / password123`);
        });

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
}

seedUsers();
