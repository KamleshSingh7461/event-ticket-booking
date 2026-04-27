import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Event from '@/models/Event';

// Create new event (Super Admin only)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Only super admins can create events' },
                { status: 401 }
            );
        }

        await connectDB();
        const body = await req.json();

        // Validate required fields
        if (!body.title || !body.description || !body.startDate || !body.endDate) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate venue manager if provided
        if (body.venueManager) {
            const User = (await import('@/models/User')).default;
            const venueManager = await User.findById(body.venueManager);

            if (!venueManager || venueManager.role !== 'VENUE_MANAGER') {
                return NextResponse.json(
                    { success: false, error: 'Invalid venue manager' },
                    { status: 400 }
                );
            }
        }

        // Create event with createdBy field
        const eventData = {
            ...body,
            createdBy: session.user.id,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const event = await Event.create(eventData);

        return NextResponse.json({
            success: true,
            data: event,
            message: 'Event created successfully'
        }, { status: 201 });
    } catch (error: any) {
        console.error('Create event error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 400 });
    }
}

// Get all events (Super Admin only)
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

        const events = await Event.find({})
            .populate('venueManager', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: events
        });
    } catch (error: any) {
        console.error('Get events error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
