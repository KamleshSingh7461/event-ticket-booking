import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Create new venue manager (Super Admin only)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();
        const { name, email, password } = await req.json();

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'Email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create venue manager
        const venueManager = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'VENUE_MANAGER'
        });

        // Remove password from response
        const { password: _, ...venueManagerData } = venueManager.toObject();

        return NextResponse.json({
            success: true,
            data: venueManagerData,
            message: 'Venue manager created successfully'
        }, { status: 201 });
    } catch (error: any) {
        console.error('Create venue manager error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 400 });
    }
}

// Get all venue managers (Super Admin only)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const venueManagers = await User.find({ role: 'VENUE_MANAGER' })
            .select('-password')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: venueManagers
        });
    } catch (error: any) {
        console.error('Get venue managers error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
