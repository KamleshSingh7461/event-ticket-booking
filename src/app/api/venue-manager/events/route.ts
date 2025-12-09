import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Event from '@/models/Event';

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

        // Get events for this venue manager
        // For now, get all events (in production, filter by venueManager field)
        const events = await Event.find()
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: events
        });
    } catch (error: any) {
        console.error('Venue manager events error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
