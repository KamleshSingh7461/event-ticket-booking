import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'VENUE_MANAGER') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Only venue managers can create events' },
                { status: 401 }
            );
        }

        await dbConnect();
        const body = await req.json();

        // Automatically set venueManager to the logged-in user
        const eventData = {
            ...body,
            venueManager: session.user.id
        };

        const event = await Event.create(eventData);
        return NextResponse.json({ success: true, data: event }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const events = await Event.find({ isActive: true }).sort({ startDate: 1 });
        return NextResponse.json({ success: true, data: events });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
