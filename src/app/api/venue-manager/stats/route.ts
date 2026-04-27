import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import User from '@/models/User';

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

        // Count coordinators created by this venue manager
        const activeCoordinators = await User.countDocuments({
            role: 'COORDINATOR',
            createdBy: session.user.id
        });

        // Get events created by this venue manager
        const events = await Event.find({
            venueManager: session.user.id
        }).sort({ startDate: 1 });

        const myEvents = events.length;

        // Calculate Revenue and Detailed Stats
        let totalRevenue = 0; // Base
        let totalReceived = 0; // Inclusive of GST
        let totalBookings = 0;

        const eventStats = await Promise.all(events.map(async (event) => {
            const tickets = await Ticket.find({ event: event._id, paymentStatus: 'SUCCESS', amountPaid: { $gt: 1.18 } }).lean();
            const soldCount = tickets.length;
            
            let eventBaseRevenue = 0;
            let eventTotalReceived = 0;

            tickets.forEach((ticket: any) => {
                if (ticket.pricing && ticket.pricing.baseAmount) {
                    eventBaseRevenue += ticket.pricing.baseAmount;
                    eventTotalReceived += ticket.pricing.totalAmount;
                } else {
                    const total = ticket.amountPaid;
                    const base = total / 1.18;
                    eventBaseRevenue += base;
                    eventTotalReceived += total;
                }
            });

            const totalCapacity = event.ticketConfig.quantity || 500;

            totalRevenue += eventBaseRevenue;
            totalReceived += eventTotalReceived;
            totalBookings += soldCount;


            // Daily Breakdown Calculation
            const dailyBreakdown: Record<string, number> = {};
            const startDate = new Date(event.startDate);
            const endDate = new Date(event.endDate);

            // Initialize all days with 0
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                dailyBreakdown[d.toDateString()] = 0;
            }

            // Count usage per day
            tickets.forEach((ticket: any) => {
                if (ticket.selectedDates && Array.isArray(ticket.selectedDates)) {
                    ticket.selectedDates.forEach((date: Date) => {
                        const dateStr = new Date(date).toDateString();
                        if (dailyBreakdown[dateStr] !== undefined) {
                            dailyBreakdown[dateStr]++;
                        }
                    });
                }
            });

            // Peak Day
            const peakDay = Object.entries(dailyBreakdown).reduce((max, [date, count]) => count > max.count ? { date, count } : max, { date: '', count: 0 });

            return {
                id: event._id.toString(),
                title: event.title,
                startDate: event.startDate,
                capacity: totalCapacity,
                sold: soldCount,
                dailyStats: dailyBreakdown,
                peakDay,
                remaining: totalCapacity - peakDay.count,
                percentage: Math.min((peakDay.count / totalCapacity) * 100, 100),
                revenue: Math.round(eventBaseRevenue * 100) / 100,
                totalReceived: Math.round(eventTotalReceived * 100) / 100,
                isActive: event.isActive,
                type: event.type
            };
        }));

        const upcomingEvents = await Event.countDocuments({
            venueManager: session.user.id,
            startDate: { $gte: new Date() }
        });

        return NextResponse.json({
            success: true,
            data: {
                myEvents,
                totalTicketsSold: totalBookings,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalReceived: Math.round(totalReceived * 100) / 100,
                upcomingEvents,
                activeCoordinators,
                eventStats // New Field
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
