import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';

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

        // Get events created by this venue manager
        const myEvents = await Event.countDocuments({
            venueManager: session.user.id
        });

        // Get all events for this venue manager
        const events = await Event.find({
            venueManager: session.user.id
        }).select('_id');
        const eventIds = events.map(e => e._id);

        // Get tickets for these events
        const totalBookings = await Ticket.countDocuments({
            event: { $in: eventIds },
            paymentStatus: 'SUCCESS'
        });

        // Calculate revenue
        const revenueData = await Ticket.aggregate([
            {
                $match: {
                    event: { $in: eventIds },
                    paymentStatus: 'SUCCESS'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amountPaid' }
                }
            }
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // Count upcoming events
        const upcomingEvents = await Event.countDocuments({
            venueManager: session.user.id,
            startDate: { $gte: new Date() }
        });

        // Count coordinators created by this venue manager
        const User = (await import('@/models/User')).default;
        const activeCoordinators = await User.countDocuments({
            role: 'COORDINATOR',
            createdBy: session.user.id
        });

        return NextResponse.json({
            success: true,
            data: {
                myEvents,
                totalTicketsSold: totalBookings,
                totalRevenue,
                upcomingEvents,
                activeCoordinators
            }
        });
    } catch (error: any) {
        console.error('Venue manager stats error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
