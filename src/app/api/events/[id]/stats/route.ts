import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event'; // Ensure Event model is imported to validate event existence

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== 'COORDINATOR' && session.user.role !== 'VENUE_MANAGER' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Optional: Check if event exists
        // const event = await Event.findById(id);
        // if (!event) return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });

        // Calculate Stats
        const totalTickets = await Ticket.countDocuments({ event: id, paymentStatus: 'SUCCESS' });
        const verifiedTickets = await Ticket.countDocuments({ event: id, paymentStatus: 'SUCCESS', verified: true });

        const stats = {
            totalTickets,
            verified: verifiedTickets,
            pending: totalTickets - verifiedTickets
        };

        return NextResponse.json({ success: true, data: stats });

    } catch (error: any) {
        console.error('Failed to fetch event stats:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
