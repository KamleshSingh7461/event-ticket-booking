import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'VENUE_MANAGER') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // 1. Get all events managed by this venue manager
        const events = await Event.find({ venueManager: session.user.id });
        const eventIds = events.map(e => e._id);

        if (eventIds.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    totalRevenue: 0,
                    ticketsSold: 0,
                    averageTicketPrice: 0,
                    topEvent: { title: 'No Events', sales: 0 },
                    eventPerformance: [],
                    salesTrend: []
                }
            });
        }

        // 2. Aggregate Ticket Data
        const tickets = await Ticket.find({
            event: { $in: eventIds },
            paymentStatus: 'SUCCESS'
        });

        // Metrics
        const totalRevenue = tickets.reduce((acc, t) => acc + (t.amountPaid || 0), 0);
        const ticketsSold = tickets.length;
        const averageTicketPrice = ticketsSold > 0 ? Math.round(totalRevenue / ticketsSold) : 0;

        // Top Event & Event Performance
        const eventStats: Record<string, { title: string; sold: number; revenue: number; total: number }> = {};

        // Initialize with 0s for all events
        events.forEach(e => {
            eventStats[e._id.toString()] = {
                title: e.title,
                sold: 0,
                revenue: 0,
                total: e.ticketConfig.quantity || 100 // Default total if not set
            };
        });

        tickets.forEach(t => {
            const eid = t.event.toString();
            if (eventStats[eid]) {
                eventStats[eid].sold += 1;
                eventStats[eid].revenue += (t.amountPaid || 0);
            }
        });

        const eventPerformance = Object.values(eventStats);

        // Find Top Event
        let topEvent = { title: 'None', sales: 0 };
        if (eventPerformance.length > 0) {
            const top = eventPerformance.reduce((prev, current) => (prev.sold > current.sold) ? prev : current);
            topEvent = { title: top.title, sales: top.sold };
        }

        // Sales Trend (Last 30 Days)
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const trendMap: Record<string, number> = {};
        // Initialize last 30 days with 0
        for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
            trendMap[d.toISOString().split('T')[0]] = 0;
        }

        tickets.forEach(t => {
            const dateStr = new Date(t.createdAt).toISOString().split('T')[0];
            if (trendMap[dateStr] !== undefined) {
                trendMap[dateStr] += 1;
            }
        });

        const salesTrend = Object.values(trendMap);

        return NextResponse.json({
            success: true,
            data: {
                totalRevenue,
                ticketsSold,
                averageTicketPrice,
                topEvent,
                eventPerformance,
                salesTrend
            }
        });

    } catch (error: any) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
