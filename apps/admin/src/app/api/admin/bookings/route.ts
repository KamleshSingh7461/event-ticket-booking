import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        
        // Ensure models are registered
        if (!Event) console.log('Event model loaded');
        if (!User) console.log('User model loaded');

        // Fetch all successful tickets, populated with event info
        const tickets = await Ticket.find({ paymentStatus: 'SUCCESS' })
            .populate('event', 'title startDate endDate type venue')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, data: tickets });
    } catch (error: any) {
        console.error('Error fetching admin bookings:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
