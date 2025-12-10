
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || session.user.role !== 'VENUE_MANAGER') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Fetch Event
        const event = await Event.findOne({
            _id: id,
            venueManager: session.user.id
        })
            .populate('assignedCoordinators', 'name email')
            .lean();

        if (!event) {
            return NextResponse.json({ success: false, error: 'Event not found or unauthorized' }, { status: 404 });
        }

        // Fetch Tickets - Only Confirmed/Successful Bookings
        const tickets = await Ticket.find({
            event: id,
            paymentStatus: 'SUCCESS'
        }).sort({ createdAt: -1 }).lean();

        // Calculate Stats
        const soldCount = tickets.length;
        const totalRevenue = tickets.reduce((sum: number, t: any) => sum + t.amountPaid, 0);
        const totalCapacity = event.ticketConfig.quantity || 500;

        // Daily Breakdown
        const dailyBreakdown: Record<string, number> = {};
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);

        // Initialize days
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dailyBreakdown[d.toDateString()] = 0;
        }

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

        const peakDay = Object.entries(dailyBreakdown).reduce((max, [date, count]) => count > max.count ? { date, count } : max, { date: '', count: 0 });
        const percentage = Math.min((peakDay.count / totalCapacity) * 100, 100);

        return NextResponse.json({
            success: true,
            data: {
                event: {
                    ...event,
                    _id: event._id.toString(),
                    venueManager: event.venueManager?.toString()
                },
                tickets: tickets.map((t: any) => ({
                    ...t,
                    _id: t._id.toString(),
                    event: t.event.toString(),
                    buyerDetails: {
                        ...t.buyerDetails,
                        userId: t.buyerDetails.userId?.toString()
                    }
                })),
                stats: {
                    totalSold: soldCount,
                    totalRevenue,
                    capacity: totalCapacity,
                    dailyBreakdown,
                    peakDay,
                    percentage
                }
            }
        });

    } catch (error: any) {
        console.error('Error fetching event details:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || session.user.role !== 'VENUE_MANAGER') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const body = await req.json();
        const { ticketConfig, assignedCoordinators } = body;

        if (!ticketConfig) {
            return NextResponse.json({ success: false, error: 'No ticket configuration provided' }, { status: 400 });
        }

        // Verify ownership
        const event = await Event.findOne({ _id: id, venueManager: session.user.id });
        if (!event) {
            return NextResponse.json({ success: false, error: 'Event not found or unauthorized' }, { status: 404 });
        }

        // Validate basic rules (optional: check if new quantity < sold quantity)
        // For now, we trust the Venue Manager but we could add safety checks here.

        const updateData: any = {
            'ticketConfig.price': ticketConfig.price,
            'ticketConfig.quantity': ticketConfig.quantity,
            'ticketConfig.dateSpecificCapacities': ticketConfig.dateSpecificCapacities || {}
        };

        // Add assignedCoordinators if provided
        if (assignedCoordinators !== undefined) {
            updateData.assignedCoordinators = assignedCoordinators;
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        return NextResponse.json({ success: true, data: updatedEvent });

    } catch (error: any) {
        console.error('Error updating event:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
