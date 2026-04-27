import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Event from '@/models/Event';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        let query: any = {};

        if (session.user.role === 'SUPER_ADMIN') {
            // Fetch all invoices
        } else if (session.user.role === 'VENUE_MANAGER') {
            // Find events managed by this user
            const myEvents = await Event.find({ venueManager: session.user.id }, '_id');
            const eventIds = myEvents.map(e => e._id);
            query.event = { $in: eventIds };
        } else {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const invoices = await Invoice.find(query)
            .sort({ createdAt: -1 })
            .populate('event', 'title')
            .populate('user', 'name email');

        return NextResponse.json({ success: true, data: invoices });

    } catch (error: any) {
        console.error('Invoices API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
