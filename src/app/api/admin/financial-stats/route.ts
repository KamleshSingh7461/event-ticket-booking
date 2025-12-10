import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        // Get query parameters for filtering
        const { searchParams } = new URL(req.url);
        const eventId = searchParams.get('eventId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build query
        const query: any = { paymentStatus: 'SUCCESS' };

        if (eventId) {
            query.event = eventId;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Fetch all successful tickets
        const tickets = await Ticket.find(query).populate('event', 'title').lean();

        // Calculate financial stats
        let totalRevenue = 0;
        let totalGST = 0;
        let totalReceived = 0;
        let ticketsWithPricing = 0;
        let ticketsWithoutPricing = 0;

        const eventBreakdown: Record<string, any> = {};

        tickets.forEach((ticket: any) => {
            if (ticket.pricing && ticket.pricing.baseAmount) {
                // New tickets with pricing breakdown
                totalRevenue += ticket.pricing.baseAmount;
                totalGST += ticket.pricing.gstAmount;
                totalReceived += ticket.pricing.totalAmount;
                ticketsWithPricing++;

                // Event-wise breakdown
                const eventId = ticket.event._id.toString();
                const eventTitle = ticket.event.title;

                if (!eventBreakdown[eventId]) {
                    eventBreakdown[eventId] = {
                        eventId,
                        eventTitle,
                        revenue: 0,
                        gst: 0,
                        total: 0,
                        ticketCount: 0
                    };
                }

                eventBreakdown[eventId].revenue += ticket.pricing.baseAmount;
                eventBreakdown[eventId].gst += ticket.pricing.gstAmount;
                eventBreakdown[eventId].total += ticket.pricing.totalAmount;
                eventBreakdown[eventId].ticketCount++;
            } else {
                // Old tickets without pricing breakdown - calculate from amountPaid
                const totalAmount = ticket.amountPaid;
                const baseAmount = totalAmount / 1.18; // Reverse calculate base
                const gstAmount = totalAmount - baseAmount;

                totalRevenue += baseAmount;
                totalGST += gstAmount;
                totalReceived += totalAmount;
                ticketsWithoutPricing++;

                // Event-wise breakdown
                const eventId = ticket.event._id.toString();
                const eventTitle = ticket.event.title;

                if (!eventBreakdown[eventId]) {
                    eventBreakdown[eventId] = {
                        eventId,
                        eventTitle,
                        revenue: 0,
                        gst: 0,
                        total: 0,
                        ticketCount: 0
                    };
                }

                eventBreakdown[eventId].revenue += baseAmount;
                eventBreakdown[eventId].gst += gstAmount;
                eventBreakdown[eventId].total += totalAmount;
                eventBreakdown[eventId].ticketCount++;
            }
        });

        // Calculate additional metrics
        const totalTickets = tickets.length;
        const averageTransactionValue = totalTickets > 0 ? totalReceived / totalTickets : 0;
        const gstPercentage = totalRevenue > 0 ? (totalGST / totalRevenue) * 100 : 0;

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalRevenue: Math.round(totalRevenue * 100) / 100,
                    totalGST: Math.round(totalGST * 100) / 100,
                    totalReceived: Math.round(totalReceived * 100) / 100,
                    totalTickets,
                    averageTransactionValue: Math.round(averageTransactionValue * 100) / 100,
                    gstPercentage: Math.round(gstPercentage * 100) / 100,
                    ticketsWithPricing,
                    ticketsWithoutPricing
                },
                eventBreakdown: Object.values(eventBreakdown).map((event: any) => ({
                    ...event,
                    revenue: Math.round(event.revenue * 100) / 100,
                    gst: Math.round(event.gst * 100) / 100,
                    total: Math.round(event.total * 100) / 100
                }))
            }
        });

    } catch (error: any) {
        console.error('Financial stats error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
