import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        let query: any = {};

        if (session.user.role === 'SUPER_ADMIN') {
            // No filter, fetch all
        } else if (session.user.role === 'VENUE_MANAGER') {
            // 1. Find all events managed by this user
            const myEvents = await Event.find({ venueManager: session.user.id }, '_id');
            const eventIds = myEvents.map(e => e._id);

            // 2. Filter tickets by these events
            query.event = { $in: eventIds };
        } else {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        // Fetch tickets
        const tickets = await Ticket.find(query)
            .sort({ createdAt: -1 })
            .populate('event', 'title')
            .populate('user', 'name email');

        return NextResponse.json({ success: true, data: tickets });

    } catch (error: any) {
        console.error('Transactions API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
