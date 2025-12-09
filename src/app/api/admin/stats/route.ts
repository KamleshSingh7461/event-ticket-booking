import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        // Get total counts
        const totalUsers = await User.countDocuments();
        const totalEvents = await Event.countDocuments();
        const totalBookings = await Ticket.countDocuments();

        // Get users by role
        const usersByRole = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        const roleCount = usersByRole.reduce((acc: any, curr: any) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        // Calculate total revenue
        const revenueData = await Ticket.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amountPaid' }
                }
            }
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // Get recent bookings
        const recentBookings = await Ticket.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('event', 'title')
            .populate('userId', 'name email')
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                totalUsers,
                totalEvents,
                totalBookings,
                totalRevenue,
                usersByRole: {
                    USER: roleCount.USER || 0,
                    COORDINATOR: roleCount.COORDINATOR || 0,
                    VENUE_MANAGER: roleCount.VENUE_MANAGER || 0,
                    SUPER_ADMIN: roleCount.SUPER_ADMIN || 0
                },
                recentBookings: recentBookings.map((b: any) => ({
                    id: b._id,
                    event: b.event?.title || 'Unknown',
                    user: b.userId?.name || b.buyerDetails?.name || 'Unknown',
                    amount: b.amountPaid,
                    date: b.createdAt
                }))
            }
        });
    } catch (error: any) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
