
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Check if event exists
        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
        }

        // Fetch ALL tickets (Success, Pending, Failed)
        const tickets = await Ticket.find({ event: id })
            .sort({ createdAt: -1 })
            .lean();

        // Calculate Stats (Based on SUCCESS only for revenue/sold count)
        const successfulTickets = tickets.filter((t: any) => t.paymentStatus === 'SUCCESS');
        const totalRevenue = successfulTickets.reduce((sum: number, t: any) => sum + (t.amountPaid || 0), 0);
        const totalSold = successfulTickets.length;
        const totalCapacity = event.ticketConfig.quantity || 500;

        // Daily Breakdown (Success only)
        const dailyBreakdown: Record<string, number> = {};
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dailyBreakdown[d.toDateString()] = 0;
        }

        successfulTickets.forEach((ticket: any) => {
            if (ticket.selectedDates && Array.isArray(ticket.selectedDates)) {
                ticket.selectedDates.forEach((date: Date) => {
                    const dateStr = new Date(date).toDateString();
                    if (dailyBreakdown[dateStr] !== undefined) {
                        dailyBreakdown[dateStr]++;
                    }
                });
            }
        });

        const peakDay = Object.entries(dailyBreakdown).reduce((max, [date, count]) => count > max.count ? { date, count } : max, { date: '', count: 0 });
        const percentage = Math.min((peakDay.count / totalCapacity) * 100, 100);

        return NextResponse.json({
            success: true,
            data: tickets, // Returns ALL tickets
            stats: {
                totalRevenue,
                totalSold, // Only Success count
                totalAttempts: tickets.length, // Total attempts count
                capacity: totalCapacity,
                percentage,
                dailyBreakdown
            }
        });

    } catch (error: any) {
        console.error('Admin Tickets API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
