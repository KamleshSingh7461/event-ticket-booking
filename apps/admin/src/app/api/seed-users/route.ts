import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

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

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const results = [];

        for (const userData of demoUsers) {
            const existingUser = await User.findOne({ email: userData.email });

            if (!existingUser) {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                await User.create({
                    ...userData,
                    password: hashedPassword,
                });
                results.push({ email: userData.email, status: 'created' });
            } else {
                results.push({ email: userData.email, status: 'already exists' });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Demo users seeded successfully',
            results,
            credentials: {
                note: 'All demo users have password: password123',
                users: demoUsers.map(u => ({ email: u.email, role: u.role }))
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
