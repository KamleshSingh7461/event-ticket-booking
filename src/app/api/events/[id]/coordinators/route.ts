import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import User from '@/models/User';

// Assign coordinator to event
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'VENUE_MANAGER') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const { coordinatorId } = await req.json();

        await connectDB();

        // Verify the coordinator was created by this venue manager
        const coordinator = await User.findOne({
            _id: coordinatorId,
            role: 'COORDINATOR',
            createdBy: session.user.id
        });

        if (!coordinator) {
            return NextResponse.json(
                { success: false, error: 'Coordinator not found or not owned by you' },
                { status: 404 }
            );
        }

        // Temporarily allow any venue manager to assign coordinators
        // TODO: Re-enable venueManager check once all events have this field set
        const event = await Event.findById(id);

        if (!event) {
            return NextResponse.json(
                { success: false, error: 'Event not found' },
                { status: 404 }
            );
        }

        // Check if already assigned
        if (event.assignedCoordinators?.includes(coordinatorId)) {
            return NextResponse.json(
                { success: false, error: 'Coordinator already assigned to this event' },
                { status: 400 }
            );
        }

        // Assign coordinator
        event.assignedCoordinators = event.assignedCoordinators || [];
        event.assignedCoordinators.push(coordinatorId);
        await event.save();

        return NextResponse.json({
            success: true,
            message: 'Coordinator assigned successfully'
        });
    } catch (error: any) {
        console.error('Assign coordinator error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// Remove coordinator from event
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'VENUE_MANAGER') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const { coordinatorId } = await req.json();

        await connectDB();

        // Temporarily allow any venue manager to remove coordinators
        // TODO: Re-enable venueManager check once all events have this field set
        const event = await Event.findById(id);

        if (!event) {
            return NextResponse.json(
                { success: false, error: 'Event not found' },
                { status: 404 }
            );
        }

        // Remove coordinator
        event.assignedCoordinators = (event.assignedCoordinators || []).filter(
            (id: any) => id.toString() !== coordinatorId
        );
        await event.save();

        return NextResponse.json({
            success: true,
            message: 'Coordinator removed successfully'
        });
    } catch (error: any) {
        console.error('Remove coordinator error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// Get assigned coordinators for an event
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'VENUE_MANAGER') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;
        await connectDB();

        console.log('Looking for event:', id);

        // Temporarily allow any venue manager to view coordinators
        // TODO: Re-enable venueManager check once all events have this field set
        const event = await Event.findById(id).populate('assignedCoordinators', '-password');

        console.log('Found event:', event ? 'Yes' : 'No');

        if (!event) {
            return NextResponse.json(
                { success: false, error: 'Event not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: event.assignedCoordinators || []
        });
    } catch (error: any) {
        console.error('Get assigned coordinators error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
