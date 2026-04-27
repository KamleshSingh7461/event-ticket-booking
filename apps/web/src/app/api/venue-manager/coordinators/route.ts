import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'VENUE_MANAGER') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const { name, email, password } = await req.json();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'Email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create coordinator with createdBy field
        const coordinator = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'COORDINATOR',
            createdBy: session.user.id // Track which venue manager created this coordinator
        });

        return NextResponse.json({
            success: true,
            data: {
                _id: coordinator._id,
                name: coordinator.name,
                email: coordinator.email,
                role: coordinator.role
            }
        });
    } catch (error: any) {
        console.error('Create coordinator error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// Get coordinators created by this venue manager
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'VENUE_MANAGER') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        // Get only coordinators created by this venue manager
        const coordinators = await User.find({
            role: 'COORDINATOR',
            createdBy: session.user.id
        }).select('-password');

        return NextResponse.json({
            success: true,
            data: coordinators
        });
    } catch (error: any) {
        console.error('Get coordinators error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
// Delete a coordinator (only if created by this VM)
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!session || session.user.role !== 'VENUE_MANAGER') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
        }

        await connectDB();

        const deleted = await User.findOneAndDelete({
            _id: id,
            role: 'COORDINATOR',
            createdBy: session.user.id
        });

        if (!deleted) {
            return NextResponse.json({ success: false, error: 'Coordinator not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Coordinator removed' });

    } catch (error: any) {
        console.error('Delete coordinator error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
