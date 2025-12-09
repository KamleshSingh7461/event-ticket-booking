
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

    return { totalUsers, totalEvents, totalTicketsSold, totalRevenue };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div className="flex flex-col">
            <div className="py-2 flex-1">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalTicketsSold}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalEvents}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Recent bookings will appear here.</p>
                            {/* Can fetch recent tickets here */}
                        </CardContent>
                    </Card>

                    {/* Admin Actions */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <Link href="/admin/events/create" className="p-4 border rounded hover:bg-muted cursor-pointer transition text-center bg-primary/5 border-primary/20">
                                Create New Event
                            </Link>
                            <Link href="/admin/users" className="p-4 border rounded hover:bg-muted cursor-pointer transition text-center">
                                Manage Users
                            </Link>
                            <Link href="/verify" className="p-4 border rounded hover:bg-muted cursor-pointer transition text-center">
                                Verify Tickets
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
