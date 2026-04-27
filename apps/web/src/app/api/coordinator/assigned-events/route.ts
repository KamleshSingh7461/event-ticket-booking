import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Event from '@/models/Event';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'COORDINATOR') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        // Get only events where this coordinator is assigned
        const events = await Event.find({
            assignedCoordinators: session.user.id,
            isActive: true
        })
            .sort({ startDate: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: events.map(e => ({
                _id: e._id,
                title: e.title,
                date: e.startDate,
                venue: e.venue || 'Online',
                status: new Date(e.startDate) > new Date() ? 'Upcoming' : 'Active'
            }))
        });
    } catch (error: any) {
        console.error('Coordinator events error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
