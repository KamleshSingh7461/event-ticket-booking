
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Ticket, IndianRupee } from 'lucide-react';
import dbConnect from '@/lib/db';
import TicketModel from '@/models/Ticket';
import EventModel from '@/models/Event';
import UserModel from '@/models/User';
import Link from 'next/link';

async function getStats() {
    await dbConnect();
    const totalUsers = await UserModel.countDocuments();
    const totalEvents = await EventModel.countDocuments();
    const totalTicketsSold = await TicketModel.countDocuments({ paymentStatus: 'SUCCESS' });

    // Calculate Revenue
    const revenueResult = await TicketModel.aggregate([
        { $match: { paymentStatus: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Detailed Event Stats
    const events = await EventModel.find({ isActive: true }).sort({ startDate: 1 });
    const eventStats = await Promise.all(events.map(async (event) => {
        const tickets = await TicketModel.find({ event: event._id, paymentStatus: 'SUCCESS' });
        const soldCount = tickets.length;
        const totalCapacity = event.ticketConfig.quantity || 500; // Use default 500 as per new logic
        const revenue = tickets.reduce((sum: number, t: any) => sum + t.amountPaid, 0);

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

        // Ticket Type Breakdown
        // Inference: If selectedDates.length > 1 (and matches total days roughly), it's likely All Day, but we didn't store explicit type initially.
        // Better to use the logic: If ticket price ~= allDayPrice (approx), or check if dates cover whole range.
        // For simplicity, we can just show "Total Sold" and "High Demand Days".
        // Let's identify the 'Peak Day' stats.
        const peakDay = Object.entries(dailyBreakdown).reduce((max, [date, count]) => count > max.count ? { date, count } : max, { date: '', count: 0 });

        return {
            id: event._id.toString(),
            title: event.title,
            startDate: event.startDate,
            capacity: totalCapacity,
            sold: soldCount,
            dailyStats: dailyBreakdown,
            peakDay,
            remaining: totalCapacity - peakDay.count, // Remaining logic is tricky for whole event, usually implies "Tightest Bottle Neck"
            percentage: Math.min((peakDay.count / totalCapacity) * 100, 100), // Percent based on PEAK day usage vs Capacity
            revenue
        };
    }));

    return { totalUsers, totalEvents, totalTicketsSold, totalRevenue, eventStats };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div className="flex flex-col bg-black min-h-screen">
            <div className="py-2 flex-1 p-6">
                <h1 className="text-3xl font-bold mb-8 text-white border-b border-[#AE8638]/20 pb-4">Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-black border border-[#AE8638]/30 shadow-[0_0_15px_rgba(174,134,56,0.1)]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-[#AE8638]">Total Revenue</CardTitle>
                            <IndianRupee className="h-4 w-4 text-[#AE8638]/60" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-gray-400">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-black border border-[#AE8638]/30 shadow-[0_0_15px_rgba(174,134,56,0.1)]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-[#AE8638]">Tickets Sold</CardTitle>
                            <Ticket className="h-4 w-4 text-[#AE8638]/60" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.totalTicketsSold}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-black border border-[#AE8638]/30 shadow-[0_0_15px_rgba(174,134,56,0.1)]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-[#AE8638]">Active Events</CardTitle>
                            <BarChart3 className="h-4 w-4 text-[#AE8638]/60" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.totalEvents}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-black border border-[#AE8638]/30 shadow-[0_0_15px_rgba(174,134,56,0.1)]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-[#AE8638]">Users</CardTitle>
                            <Users className="h-4 w-4 text-[#AE8638]/60" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity / Sales Tracker */}
                    <Card className="col-span-2 bg-black border border-[#AE8638]/30">
                        <CardHeader>
                            <CardTitle className="text-[#AE8638]">Event Sales Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {stats.eventStats.map((event: any) => (
                                    <div key={event.id} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <Link href={`/admin/events/${event.id}/bookings`} className="font-bold text-white text-lg hover:text-[#AE8638] transition-colors cursor-pointer flex items-center gap-2">
                                                    {event.title}
                                                    <span className="text-[10px] bg-[#AE8638]/20 px-2 py-0.5 rounded text-[#AE8638] font-normal border border-[#AE8638]/30">View Details</span>
                                                </Link>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(event.startDate).toLocaleDateString()} |
                                                    Capacity: <span className="text-white">{event.capacity}</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-[#AE8638]">{event.sold}</p>
                                                <p className="text-xs text-gray-500">Tickets Sold</p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-3 w-full bg-[#AE8638]/10 rounded-full overflow-hidden border border-[#AE8638]/20">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#AE8638] to-yellow-500 transition-all duration-1000"
                                                style={{ width: `${event.percentage}%` }}
                                            />
                                        </div>

                                        <div className="flex justify-between text-xs pt-1">
                                            <div className="flex gap-4">
                                                <span className="text-green-400">Peak Load: {event.percentage.toFixed(1)}% ({event.peakDay?.date?.split(' ')[0]} {event.peakDay?.date?.split(' ')[2]})</span>
                                                <span className="text-gray-400">Daily Cap: <span className="text-white">{event.capacity}</span></span>
                                            </div>
                                            <div className="flex gap-4 text-gray-500">
                                                <span>Rev: ₹{event.revenue.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        {/* Daily Breakdown Mini-Bar */}
                                        <div className="flex gap-1 pt-2 overflow-x-auto pb-2">
                                            {Object.entries(event.dailyStats || {}).map(([date, count]: any) => {
                                                const pct = (count / event.capacity) * 100;
                                                const isHigh = pct > 80;
                                                return (
                                                    <div key={date} className="flex flex-col items-center min-w-[50px]">
                                                        <div className="h-10 w-2 bg-[#AE8638]/10 rounded-full relative">
                                                            <div
                                                                className={`absolute bottom-0 w-full rounded-full ${isHigh ? 'bg-red-500' : 'bg-[#AE8638]'}`}
                                                                style={{ height: `${Math.min(pct, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 mt-1">{date.split(' ')[2]}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                                {stats.eventStats.length === 0 && (
                                    <p className="text-center text-gray-500 py-8">No active events found.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin Actions */}
                    <Card className="col-span-1 bg-black border border-[#AE8638]/30 h-fit">
                        <CardHeader>
                            <CardTitle className="text-[#AE8638]">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4">
                            <Link href="/admin/events/create" className="p-4 border rounded hover:bg-[#AE8638]/10 cursor-pointer transition text-center bg-[#AE8638]/5 border-[#AE8638]/20 text-white font-medium">
                                Create New Event
                            </Link>
                            <Link href="/admin/users" className="p-4 border rounded hover:bg-[#AE8638]/10 cursor-pointer transition text-center bg-[#AE8638]/5 border-[#AE8638]/20 text-white font-medium">
                                Manage Users
                            </Link>
                            <Link href="/verify" className="p-4 border rounded hover:bg-[#AE8638]/10 cursor-pointer transition text-center bg-[#AE8638]/5 border-[#AE8638]/20 text-white font-medium">
                                Verify Tickets
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
