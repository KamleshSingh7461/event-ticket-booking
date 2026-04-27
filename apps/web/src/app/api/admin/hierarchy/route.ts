import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Event from '@/models/Event';

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

        // Get all venue managers
        const venueManagers = await User.find({ role: 'VENUE_MANAGER' })
            .select('-password')
            .lean();

        // Build hierarchy for each venue manager
        const hierarchy = await Promise.all(
            venueManagers.map(async (vm) => {
                // Get coordinators created by this venue manager
                const coordinators = await User.find({
                    role: 'COORDINATOR',
                    createdBy: vm._id
                }).select('-password').lean();

                // Get events created by this venue manager
                const events = await Event.find({
                    venueManager: vm._id
                })
                    .populate('assignedCoordinators', 'name email')
                    .lean();

                // Calculate stats
                const totalEvents = events.length;
                const totalCoordinators = coordinators.length;
                const eventsWithCoordinators = events.filter(
                    e => e.assignedCoordinators && e.assignedCoordinators.length > 0
                ).length;

                return {
                    venueManager: {
                        _id: vm._id,
                        name: vm.name,
                        email: vm.email,
                        createdAt: vm.createdAt
                    },
                    coordinators: coordinators.map(c => ({
                        _id: c._id,
                        name: c.name,
                        email: c.email,
                        createdAt: c.createdAt,
                        assignedEvents: events.filter(e =>
                            e.assignedCoordinators?.some((ac: any) =>
                                ac._id?.toString() === c._id.toString()
                            )
                        ).map(e => ({
                            _id: e._id,
                            title: e.title,
                            startDate: e.startDate
                        }))
                    })),
                    events: events.map(e => ({
                        _id: e._id,
                        title: e.title,
                        type: e.type,
                        startDate: e.startDate,
                        isActive: e.isActive,
                        assignedCoordinators: e.assignedCoordinators || []
                    })),
                    stats: {
                        totalEvents,
                        totalCoordinators,
                        eventsWithCoordinators,
                        eventsWithoutCoordinators: totalEvents - eventsWithCoordinators
                    }
                };
            })
        );

        // Overall platform stats
        const totalVenueManagers = venueManagers.length;
        const totalCoordinators = hierarchy.reduce((sum, h) => sum + h.stats.totalCoordinators, 0);
        const totalEvents = hierarchy.reduce((sum, h) => sum + h.stats.totalEvents, 0);
        const totalAssignments = hierarchy.reduce(
            (sum, h) => sum + h.coordinators.reduce((s, c) => s + c.assignedEvents.length, 0),
            0
        );

        return NextResponse.json({
            success: true,
            data: {
                hierarchy,
                platformStats: {
                    totalVenueManagers,
                    totalCoordinators,
                    totalEvents,
                    totalAssignments
                }
            }
        });
    } catch (error: any) {
        console.error('Admin hierarchy error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
