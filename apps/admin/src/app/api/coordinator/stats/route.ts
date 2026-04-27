import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';

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
        const assignedEvents = await Event.find({
            assignedCoordinators: session.user.id,
            isActive: true
        }).select('_id');

        const eventIds = assignedEvents.map(e => e._id);
        const assignedEventsCount = eventIds.length;

        // Get tickets only for assigned events
        const allBookings = await Ticket.find({
            event: { $in: eventIds }
        });

        const verifiedBookings = allBookings.filter((b: any) => b.isRedeemed);

        // Count today's verifications
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayVerifications = verifiedBookings.filter((b: any) => {
            if (b.redeemedAt) {
                const redeemedDate = new Date(b.redeemedAt);
                return redeemedDate >= today;
            }
            return false;
        });

        // Pending verifications (tickets not yet redeemed for assigned upcoming events)
        const upcomingEventIds = assignedEvents
            .filter((e: any) => new Date(e.startDate) >= new Date())
            .map(e => e._id);

        const pendingVerifications = await Ticket.countDocuments({
            event: { $in: upcomingEventIds },
            isRedeemed: false,
            paymentStatus: 'SUCCESS'
        });

        return NextResponse.json({
            success: true,
            data: {
                assignedEvents: assignedEventsCount,
                ticketsVerifiedToday: todayVerifications.length,
                totalVerifications: verifiedBookings.length,
                pendingVerifications
            }
        });
    } catch (error: any) {
        console.error('Coordinator stats error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
