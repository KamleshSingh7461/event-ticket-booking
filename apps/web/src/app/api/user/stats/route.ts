import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Ticket from '@/models/Ticket';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        // Get user's bookings
        // Using 'user' field as per Ticket schema, not 'userId'
        const userBookings = await Ticket.find({
            user: session.user.id,
            paymentStatus: 'SUCCESS'
        })
            .populate('event', 'startDate')
            .lean();

        const totalBookings = userBookings.length;

        // Count upcoming events (not redeemed and event date is in future)
        const upcomingEvents = userBookings.filter((b: any) => {
            if (b.isRedeemed) return false;
            if (b.event && b.event.startDate) {
                return new Date(b.event.startDate) > new Date();
            }
            return false;
        }).length;

        // Calculate total spent
        const totalSpent = userBookings.reduce((sum: number, b: any) => sum + (b.amountPaid || 0), 0);

        return NextResponse.json({
            success: true,
            data: {
                totalBookings,
                upcomingEvents,
                totalSpent
            }
        });
    } catch (error: any) {
        console.error('User stats error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
